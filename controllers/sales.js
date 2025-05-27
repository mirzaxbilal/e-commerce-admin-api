const pool = require('../config/db');

const pad = (n) => n.toString().padStart(2, '0');
const toYMD = (d) => d.toISOString().split('T')[0];

const formatPeriodLabel = (dateStr, period) => {
    const date = new Date(dateStr);

    switch (period) {
        case 'daily':
            return toYMD(date);
        case 'weekly': {
            const start = new Date(date);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return `${toYMD(start)} to ${toYMD(end)}`;
        }
        case 'monthly':
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
        case 'annual':
            return `${date.getFullYear()}`;
        default:
            return toYMD(date);
    }
};

const getDateGroupExpr = (period) => {
    switch (period) {
        case 'daily': return `DATE(s.transaction_date)`;
        case 'weekly': return `DATE_TRUNC('week', s.transaction_date)`;
        case 'monthly': return `DATE_TRUNC('month', s.transaction_date)`;
        case 'annual': return `DATE_TRUNC('year', s.transaction_date)`;
        default: return `DATE(s.transaction_date)`;
    }
};

const buildFilters = ({ startDate, endDate, categoryId, productId }, startIndex = 1) => {
    const filters = [];
    const params = [];
    let idx = startIndex;

    if (startDate) {
        filters.push(`s.transaction_date >= $${idx++}`);
        params.push(startDate);
    }
    if (endDate) {
        filters.push(`s.transaction_date <= $${idx++}`);
        params.push(endDate);
    }
    if (categoryId) {
        filters.push(`c.id = $${idx++}`);
        params.push(categoryId);
    }
    if (productId) {
        filters.push(`p.id = $${idx++}`);
        params.push(productId);
    }

    return { filters, params, nextIndex: idx };
};

exports.getSales = async (req, res) => {
    try {
        const {
            startDate, endDate, productId, categoryId, groupBy,
            limit = 10, offset = 0
        } = req.query;

        const groupExpr = groupBy ? getDateGroupExpr(groupBy) : null;

        let baseQuery = `
            SELECT ${groupExpr ? `${groupExpr} AS raw_period,` : ''}
                   SUM(s.quantity) AS total_units,
                   SUM(s.total_amount) AS total_revenue,
                   p.name AS product_name,
                   c.name AS category_name
            FROM sales s
            JOIN products p ON s.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;

        const { filters, params, nextIndex } = buildFilters({ startDate, endDate, categoryId, productId });
        if (filters.length) baseQuery += ' AND ' + filters.join(' AND ');

        if (groupExpr) {
            baseQuery += ` GROUP BY raw_period, p.name, c.name ORDER BY raw_period ASC`;
        } else {
            baseQuery += ` GROUP BY p.name, c.name`;
        }

        baseQuery += ` LIMIT $${nextIndex} OFFSET $${nextIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));

        const { rows } = await pool.query(baseQuery, params);

        const formatted = rows.map(row => ({
            period: groupBy ? formatPeriodLabel(row.raw_period, groupBy) : null,
            total_units: row.total_units,
            total_revenue: row.total_revenue,
            product_name: row.product_name,
            category_name: row.category_name
        }));

        res.json({ data: formatted, limit: parseInt(limit), offset: parseInt(offset) });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRevenue = async (req, res) => {
    try {
        const {
            period = 'daily',
            startDate,
            endDate,
            categoryId,
            productId,
            limit = 10,
            offset = 0
        } = req.query;

        const groupExpr = getDateGroupExpr(period);

        let query = `
            SELECT ${groupExpr} AS raw_period, SUM(s.total_amount) AS total_revenue
            FROM sales s
            JOIN products p ON s.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;

        const { filters, params, nextIndex } = buildFilters({ startDate, endDate, categoryId, productId });
        if (filters.length) query += ' AND ' + filters.join(' AND ');

        query += ` GROUP BY raw_period ORDER BY raw_period ASC LIMIT $${nextIndex} OFFSET $${nextIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));

        const { rows } = await pool.query(query, params);

        const formatted = rows.map(row => ({
            period: formatPeriodLabel(row.raw_period, period),
            total_revenue: row.total_revenue
        }));

        res.json({ data: formatted, limit: parseInt(limit), offset: parseInt(offset) });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRevenueComparison = async (req, res) => {
    try {
        const { period1Start, period1End, period2Start, period2End, categoryId, productId } = req.query;

        const buildRevenueQuery = (start, end, label) => {
            const filters = [`s.transaction_date >= $1`, `s.transaction_date <= $2`];
            const values = [start, end];
            let idx = 3;

            if (categoryId) {
                filters.push(`c.id = $${idx++}`);
                values.push(categoryId);
            }
            if (productId) {
                filters.push(`p.id = $${idx++}`);
                values.push(productId);
            }

            const query = `
                SELECT '${label}' AS period, SUM(s.total_amount) AS total_revenue
                FROM sales s
                JOIN products p ON s.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE ${filters.join(' AND ')}
            `;

            return { query, values };
        };

        const q1 = buildRevenueQuery(period1Start, period1End, 'period1');
        const q2 = buildRevenueQuery(period2Start, period2End, 'period2');

        const result1 = await pool.query(q1.query, q1.values);
        const result2 = await pool.query(q2.query, q2.values);

        res.json([...result1.rows, ...result2.rows]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSalesSummary = async (req, res) => {
    try {
        const { groupBy = 'category', startDate, endDate, limit = 10, offset = 0 } = req.query;
        const isCategory = groupBy === 'category';

        let query = `
            SELECT ${isCategory ? 'c.name' : 'p.name'} AS label,
                   SUM(s.quantity) AS total_units,
                   SUM(s.total_amount) AS total_revenue
            FROM sales s
            JOIN products p ON s.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;

        const { filters, params, nextIndex } = buildFilters({ startDate, endDate });
        if (filters.length) query += ' AND ' + filters.join(' AND ');

        query += ` GROUP BY label ORDER BY total_revenue DESC LIMIT $${nextIndex} OFFSET $${nextIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));

        const { rows } = await pool.query(query, params);

        res.json({ data: rows, limit: parseInt(limit), offset: parseInt(offset) });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
