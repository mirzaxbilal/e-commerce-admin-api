const pool = require('../config/db');

exports.addCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllCategories = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await pool.query(
            'SELECT * FROM categories ORDER BY id ASC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        res.json({ data: result.rows, limit, offset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

