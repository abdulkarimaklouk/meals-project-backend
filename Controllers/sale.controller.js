const Order = require("../models/order.model");
const Meal = require("../models/meal.model");

const { SUCCESS, FAIL } = require("../utils/httpStatusText");

const asyncWrapper = require("../middleware/asyncWrapper");

const appError = require("../utils/appError");


const Sequelize = require("sequelize");

const { literal } = require('sequelize');


const attributes = [
    'meal_id',
    'store_id',
    [literal('Meal.meal_name'), 'meal_name'],
    [literal('COUNT(*)'), 'order_count'],
    'unit_cost',
    'meal_price',
    [literal('SUM(quantity)'), 'meals_quantity'],
    [literal('SUM(total_cost)'), 'total_cost'],
    [literal('SUM(total_price)'), 'total_price'],
    [literal('SUM(total_price - total_cost)'), 'profit'],
    [literal('AVG(total_price - total_cost)'), 'average_profit_per_order'],
    [literal('(SELECT COUNT(distinct meal_id, store_id) FROM Orders WHERE deletedAt IS NULL)'), 'rowCount'],
]

const include = [
    {
        model: Meal,
        attributes: []
    },
];

const saleController = {
    getAllSales: asyncWrapper(
        async (req, res) => {
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const sales = await Order.findAll({
                attributes,
                include,
                where: { deletedAt: null },
                group: ['meal_id', 'store_id', 'unit_cost', 'meal_price'],
                limit,
                offset: skip
            });

            res.json({ status: SUCCESS, data: sales });
        }
    ),

    getAllSalesByMeal: asyncWrapper(
        async (req, res) => {
            const mealId = req.params.mealId
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const sales = await Order.findAll({
                attributes: [
                    'meal_id',
                    'store_id',
                    [literal('Meal.meal_name'), 'meal_name'],
                    [literal('COUNT(*)'), 'order_count'],
                    'unit_cost',
                    'meal_price',
                    [literal('SUM(quantity)'), 'meals_quantity'],
                    [literal('SUM(total_cost)'), 'total_cost'],
                    [literal('SUM(total_price)'), 'total_price'],
                    [literal('SUM(total_price - total_cost)'), 'profit'],
                    [literal('AVG(total_price - total_cost)'), 'average_profit_per_order'],
                    [literal(`(SELECT COUNT(distinct meal_id, store_id) FROM Orders WHERE meal_id = ${mealId} and deletedAt IS NULL)`), 'rowCount'],
                ],
                include,
                where: { deletedAt: null, meal_id: mealId },
                group: ['meal_id', 'store_id', 'unit_cost', 'meal_price'],
                limit,
                offset: skip
            });


            res.json({ status: SUCCESS, data: sales });
        }
    ),

    getAllSalesByStore: asyncWrapper(
        async (req, res) => {
            const storeId = req.params.storeId
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const sales = await Order.findAll({
                attributes: [
                    'meal_id',
                    'store_id',
                    [literal('Meal.meal_name'), 'meal_name'],
                    [literal('COUNT(*)'), 'order_count'],
                    'unit_cost',
                    'meal_price',
                    [literal('SUM(quantity)'), 'meals_quantity'],
                    [literal('SUM(total_cost)'), 'total_cost'],
                    [literal('SUM(total_price)'), 'total_price'],
                    [literal('SUM(total_price - total_cost)'), 'profit'],
                    [literal('AVG(total_price - total_cost)'), 'average_profit_per_order'],
                    [literal(`(SELECT COUNT(distinct meal_id, store_id) FROM Orders WHERE store_id = ${storeId} and deletedAt IS NULL)`), 'rowCount'],
                ],
                include,
                where: { deletedAt: null, store_id: storeId },
                group: ['meal_id', 'store_id', 'unit_cost', 'meal_price'],
                limit,
                offset: skip
            });

            res.json({ status: SUCCESS, data: sales });
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
};



module.exports = saleController;