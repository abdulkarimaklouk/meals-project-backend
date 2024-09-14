const express = require("express");

const router = express.Router();

const inventoryController = require("../Controllers/inventory.controller");

const { validationSChema } = require("../middleware/validation");





router.route('/')
    .get(inventoryController.getAllInventory)
    .post(validationSChema(["ingredient_id", "store_id", "quantity", "supplier", "expiry_date"]), inventoryController.createInventory)

router.route('/:ids')
    .get(inventoryController.getInventoryByIngredientIdAndStoreId)
    .patch(inventoryController.updateInventory)
    .delete(inventoryController.deleteInventory)

router.route('/ingredient/:ingredient_id')
    .get(inventoryController.getInventoryByIngredientId)

router.route('/store/:store_id')
    .get(inventoryController.getInventoryByStoreId)


module.exports = router;