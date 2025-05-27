const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales');

router.get('/', salesController.getSales);
router.get('/revenue', salesController.getRevenue);
router.get('/comparison', salesController.getRevenueComparison);
router.get('/summary', salesController.getSalesSummary);

module.exports = router;
