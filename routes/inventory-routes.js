const express = require('express');
const router = express.Router();
const {
    getAllInventory,
    getInventoryByProductId,
    getLowStockInventory,
    updateInventory
} = require('../controllers/inventory');

router.get('/', getAllInventory);
router.get('/low-stock', getLowStockInventory);
router.get('/:productId', getInventoryByProductId);
router.put('/:productId', updateInventory);

module.exports = router;
