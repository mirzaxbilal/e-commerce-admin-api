const pool = require('../config/db');

exports.getAllInventory = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await pool.query(`
            SELECT 
                p.name AS product_name,
                i.product_id,
                i.quantity_in_stock,
                i.updated_at
            FROM inventory i
            JOIN products p ON p.id = i.product_id
            ORDER BY i.product_id
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getInventoryByProductId = async (req, res) => {
    const { productId } = req.params;

    try {
        const result = await pool.query(`
            SELECT 
                p.name AS product_name,
                i.product_id,
                i.quantity_in_stock,
                i.updated_at
            FROM inventory i
            JOIN products p ON p.id = i.product_id
            WHERE i.product_id = $1
        `, [productId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Inventory not found for the given product ID' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLowStockInventory = async (req, res) => {
    const threshold = parseInt(req.query.threshold) || 5;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await pool.query(`
            SELECT 
                p.name AS product_name,
                i.product_id,
                i.quantity_in_stock,
                i.updated_at,
                TRUE AS low_stock
            FROM inventory i
            JOIN products p ON p.id = i.product_id
            WHERE i.quantity_in_stock < $1
            ORDER BY i.quantity_in_stock ASC
            LIMIT $2 OFFSET $3
        `, [threshold, limit, offset]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateInventory = async (req, res) => {
    const { productId } = req.params;
    const { quantity_in_stock } = req.body;

    try {
        const result = await pool.query(
            `UPDATE inventory 
             SET quantity_in_stock = $1, updated_at = NOW() 
             WHERE product_id = $2 
             RETURNING *`,
            [quantity_in_stock, productId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Product not found in inventory' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
