const express = require("express");

const router = express.Router();

const orderController = require("../Controllers/order.controller");

const { validationSChema } = require("../middleware/validation");





router.route('/')
    .get(orderController.getAllOrders)
    .post(validationSChema(["meal_id", "store_id", "quantity"]), orderController.createOrder)

router.route('/:orderId')
    .get(orderController.getOrderById)
    .patch(orderController.updateOrder)
    .delete(orderController.deleteOrder)


router.route('/meal/:meal_id')
    .get(orderController.getOrderByMealId)

router.route('/store/:store_id')
    .get(orderController.getOrderByStoreId)



module.exports = router;