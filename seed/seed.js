const pool = require('../config/db');

const seed = async () => {
    const client = await pool.connect();

    try {
        console.log("Seeding demo data...");
        await client.query('BEGIN');

        await client.query(`
            DELETE FROM sales;
            DELETE FROM inventory;
            DELETE FROM products;
            DELETE FROM categories;
            ALTER SEQUENCE products_id_seq RESTART WITH 1;
            ALTER SEQUENCE categories_id_seq RESTART WITH 1;
        `);

        const categories = ['Electronics', 'Fashion', 'Food', 'Furniture'];
        const categoryMap = {};

        for (const name of categories) {
            const res = await client.query(
                `INSERT INTO categories (name) VALUES ($1) RETURNING id`,
                [name]
            );
            categoryMap[name] = res.rows[0].id;
        }

        await client.query(`
            INSERT INTO products (name, category_id, price) VALUES
            -- Electronics
            ('iPhone 15 Pro', ${categoryMap['Electronics']}, 1099.99),
            ('Dell XPS 13', ${categoryMap['Electronics']}, 1299.99),
            ('Sony WH-1000XM6', ${categoryMap['Electronics']}, 399.99),

            -- Fashion
            ('Men''s Leather Jacket', ${categoryMap['Fashion']}, 199.99),
            ('Women''s Summer Dress', ${categoryMap['Fashion']}, 79.99),
            ('Unisex Sneakers', ${categoryMap['Fashion']}, 129.99),

            -- Food
            ('Organic Almonds 1kg', ${categoryMap['Food']}, 15.99),
            ('Chocolate Cake', ${categoryMap['Food']}, 25.00),
            ('Frozen Pizza Pack', ${categoryMap['Food']}, 9.99),

            -- Furniture
            ('Wooden Dining Table', ${categoryMap['Furniture']}, 499.99),
            ('Ergonomic Office Chair', ${categoryMap['Furniture']}, 249.99),
            ('Queen Size Bed', ${categoryMap['Furniture']}, 699.99);
        `);

        await client.query(`
        INSERT INTO sales (product_id, quantity, total_amount, transaction_date) VALUES
            -- Electronics
            (1, 2, 2199.98, '2025-01-10'),
            (1, 1, 1099.99, '2025-01-22'),
            (2, 1, 1299.99, '2025-01-15'),
            (1, 1, 1099.99, '2025-02-05'),
            (2, 2, 2599.98, '2025-02-10'),
            (2, 1, 1299.99, '2025-03-12'),
            (3, 3, 1199.97, '2025-01-20'),
            (3, 2, 799.98, '2025-02-14'),
            (3, 1, 399.99, '2025-03-18'),
            -- Fashion

            (4, 2, 399.98, '2025-02-05'),
            (4, 1, 199.99, '2025-03-10'),
            (4, 3, 599.97, '2025-03-15'),
            (5, 4, 319.96, '2025-02-10'),
            (5, 2, 159.98, '2025-04-05'),
            (6, 3, 389.97, '2025-02-12'),
            (6, 2, 259.98, '2025-03-20'),

            -- Food
            (7, 5, 79.95, '2025-03-01'),
            (7, 3, 47.97, '2025-03-15'),
            (7, 4, 63.96, '2025-04-01'),
            (8, 2, 50.00, '2025-03-03'),
            (8, 3, 75.00, '2025-03-18'),
            (8, 1, 25.00, '2025-04-07'),
            (9, 6, 59.94, '2025-03-05'),
            (9, 5, 49.95, '2025-04-12'),

            -- Furniture
            (10, 1, 499.99, '2025-04-01'),
            (10, 1, 499.99, '2025-04-20'),
            (11, 2, 499.98, '2025-04-03'),
            (11, 1, 249.99, '2025-05-05'),
            (12, 1, 699.99, '2025-04-05'),
            (12, 2, 1399.98, '2025-05-10');
        `);

        await client.query(`
            INSERT INTO inventory (product_id, quantity_in_stock) VALUES
            (1, 5),
            (2, 3),
            (3, 6),
            (4, 10),
            (5, 12),
            (6, 9),
            (7, 15),
            (8, 8),
            (9, 20),
            (10, 2),
            (11, 5),
            (12, 1);
        `);

        await client.query('COMMIT');
        console.log("Demo data seeded successfully.");
        process.exit();
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error seeding data:", err.message);
        process.exit(1);
    } finally {
        client.release();
    }
};

seed();
