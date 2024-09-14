const Order = require("../models/order.model");
const Meal = require("../models/meal.model");
const Store = require("../models/store.model");


const { SUCCESS, FAIL } = require("../utils/httpStatusText");

const asyncWrapper = require("../middleware/asyncWrapper");

const appError = require("../utils/appError");

const { validationResult } = require("express-validator");

const moment = require("moment");

const Sequelize = require("sequelize");

const { literal } = require('sequelize');



const attributes = [
    'id',
    'meal_id',
    'store_id',
    'quantity',
    'unit_cost',
    'total_cost',
    'meal_price',
    'total_price',
    'date_of_create',
    'latest_order_update',
    [literal('(SELECT COUNT(*) FROM `Orders` WHERE deletedAt IS NULL)'), 'rowCount']
];

const orderController = {
    getAllOrders: asyncWrapper(
        async (req, res) => {
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const orders = await Order.findAll({
                attributes,
                limit: limit,
                offset: skip
            });

            res.json({ status: SUCCESS, data: orders });
        }
    ),

    getOrderById: asyncWrapper(
        async (req, res, next) => {
            const order = await Order.findByPk(req.params.orderId, {
                attributes
            });

            if (!order) {
                const error = appError.create("order not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: order });
        }
    ),

    getOrderByMealId: asyncWrapper(
        async (req, res, next) => {
            const meal_id = req.params.meal_id;
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const order = await Order.findAll({
                attributes: [
                    'id',
                    'meal_id',
                    'store_id',
                    'quantity',
                    'unit_cost',
                    'total_cost',
                    'meal_price',
                    'total_price',
                    'date_of_create',
                    'latest_order_update',
                    [literal(`(SELECT COUNT(*) FROM Orders WHERE meal_id = ${meal_id} and deletedAt IS NULL)`), 'rowCount']
                ],
                where: {
                    meal_id,
                },
                limit,
                offset: skip
            })


            if (!order) {
                const error = appError.create("inventory not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: order });
        }
    ),

    getOrderByStoreId: asyncWrapper(
        async (req, res, next) => {
            const store_id = req.params.store_id;
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const order = await Order.findAll({
                attributes: [
                    'id',
                    'meal_id',
                    'store_id',
                    'quantity',
                    'unit_cost',
                    'total_cost',
                    'meal_price',
                    'total_price',
                    'date_of_create',
                    'latest_order_update',
                    [literal(`(SELECT COUNT(*) FROM Orders WHERE store_id = ${store_id} and deletedAt IS NULL)`), 'rowCount']
                ],
                where: {
                    store_id,
                },
                limit,
                offset: skip
            })


            if (!order) {
                const error = appError.create("inventory not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: order });
        }
    ),

    getOrdersOfLastMonth: asyncWrapper(
        async (req, res, next) => {
            const firstDayOfLastMonth = moment().subtract(1, 'months').startOf('month');
            const lastDayOfLastMonth = moment().subtract(1, 'months').endOf('month');

            const orders = await Order.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.between]: [firstDayOfLastMonth, lastDayOfLastMonth]
                    }
                },
                attributes
            });
            return res.json({ status: SUCCESS, data: orders });
        }
    ),

    // important
    createOrder: asyncWrapper(
        async (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const error = appError.create(errors.array(), 400, FAIL);
                return next(error);
            }

            const { meal_id, store_id, quantity } = req.body;

            const insertedOrder = (await Order.create({ meal_id, store_id, quantity }));

            res.status(201).json(({ status: SUCCESS, data: insertedOrder }));
        }
    ),

    updateOrder: asyncWrapper(
        async (req, res, next) => {
            const id = req.params.orderId;
            const reqQuantity = req.body.quantity;
            let REQ = {};

            const oldOrder = await Order.findByPk(id);

            const { quantity } = oldOrder.toJSON();

            await Order.update({ ...req.body }, { where: { id: id }, individualHooks: true, quantity });

            const order = await Order.findByPk(id);

            if (order) {
                res.status(200).json(({ status: SUCCESS, data: order }));
            } else {
                const error = appError.create("order not found", 404, FAIL);
                return next(error);
            }
        }
    ),

    deleteOrder: asyncWrapper(
        async (req, res, next) => {
            const id = req.params.orderId;

            const order = await Order.findByPk(id);

            if (!order) {
                const error = appError.create("order not found", 404, FAIL);
                return next(error);
            }

            await Order.destroy({ where: { id: id }, individualHooks: true });

            res.status(200).json({ status: SUCCESS, data: null });
        }
    )
};





module.exports = orderController;












/*



CREATE TRIGGER after_insert_order_update_inventory
after INSERT 
ON orders 
FOR EACH ROW
BEGIN
    update inventory
    set quantity =  quantity - ( (select quantity from mealingredients where meal_id = new.meal_id and inventory.ingredient_id = mealingredients.ingredient_id) * new.quantity)
    where inventory.ingredient_id in (select ingredient_id from mealingredients where meal_id = new.meal_id)
    and new.store_name = ( select store_name from stores where id = inventory.store_id) ;
END //
drop trigger after_insert_order_update_inventory//
show triggers //


CREATE TRIGGER after_update_order_update_inventory
after update
ON orders 
FOR EACH ROW
BEGIN
    update inventory
    set quantity =  ( quantity + ( old.quantity * (select quantity from mealingredients where meal_id = new.meal_id and inventory.ingredient_id = mealingredients.ingredient_id) )) - 
    ( (select quantity from mealingredients where meal_id = new.meal_id and inventory.ingredient_id = mealingredients.ingredient_id) * new.quantity)
    where inventory.ingredient_id in (select ingredient_id from mealingredients where meal_id = new.meal_id)
    and new.store_name = ( select store_name from stores where id = inventory.store_id) ;
END //
drop trigger after_update_order_update_inventory//
show triggers //



CREATE TRIGGER after_delete_order_update_inventory
after delete
ON orders 
FOR EACH ROW
BEGIN
    update inventory
    set quantity =  ( quantity + ( old.quantity * (select quantity from mealingredients where meal_id = old.meal_id and inventory.ingredient_id = mealingredients.ingredient_id) )) 
    where inventory.ingredient_id in (select ingredient_id from mealingredients where meal_id = old.meal_id)
    and old.store_name = ( select store_name from stores where id = inventory.store_id) ;
END //
drop trigger after_delte_order_update_inventory//
show triggers //*/