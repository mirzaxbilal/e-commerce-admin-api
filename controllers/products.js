const pool = require('../config/db');

exports.addProduct = async (req, res) => {
    const { name, category_id, price } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, category_id, price) VALUES ($1, $2, $3) RETURNING *',
            [name, category_id, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await pool.query(`
            SELECT p.id, p.name, c.name AS category, p.price 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        res.json({ data: result.rows, limit, offset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
