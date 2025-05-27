const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

const categoryRoutes = require('./routes/category-routes');
const productRoutes = require('./routes/product-routes');
const salesRoutes = require('./routes/sales-routes');
const inventoryRoutes = require('./routes/inventory-routes');

app.use((req, res, next) => {
    console.log("HTTP Method -" + req.method + " , URL - " + req.url);
    next();
});

app.use('/api/category', categoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
