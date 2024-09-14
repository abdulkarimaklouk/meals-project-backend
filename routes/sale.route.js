const express = require("express");

const router = express.Router();

const saleController = require("../Controllers/sale.controller");



router.route('/')
    .get(saleController.getAllSales)

router.route('/meal/:mealId')
    .get(saleController.getAllSalesByMeal)

router.route('/store/:storeId')
    .get(saleController.getAllSalesByStore)




module.exports = router;