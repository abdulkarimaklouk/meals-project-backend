const Meal = require("../models/meal.model");

const { SUCCESS, FAIL, ERROR } = require("../utils/httpStatusText");

const asyncWrapper = require("../middleware/asyncWrapper");

const appError = require("../utils/appError");

const { validationResult } = require("express-validator");

const { literal } = require('sequelize');

const attributes = [
    'id',
    'meal_name',
    'meal_cost',
    'meal_price',
    'date_of_create',
    'latest_meal_update',
    [literal('(SELECT COUNT(*) FROM `meals` WHERE deletedAt IS NULL)'), 'rowCount']
];



const mealController = {
    getAllMeals: asyncWrapper(
        async (req, res) => {
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const meals = await Meal.findAll({
                attributes,
                limit,
                offset: skip
            });

            res.json({ status: SUCCESS, data: meals });
        }
    ),

    getMealById: asyncWrapper(
        async (req, res, next) => {
            const meal = await Meal.findByPk(req.params.mealId, {
                attributes
            });

            if (!meal) {
                const error = appError.create("meal not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: meal });
        }
    ),

    createMeal: asyncWrapper(
        async (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const error = appError.create(errors.array(), 400, FAIL);
                return next(error);
            }

            const { meal_name, meal_price } = req.body;

            const oldMeal = await Meal.findOne({ where: { meal_name } });

            if (oldMeal) {
                const error = appError.create("This meal already exists", 422, FAIL);
                return next(error);
            };

            const insertedMeal = (await Meal.create({ meal_name, meal_price }));
            res.status(201).json(({ status: SUCCESS, data: insertedMeal }));
        }
    ),

    updateMeal: asyncWrapper(
        async (req, res, next) => {
            const id = req.params.mealId;

            await Meal.update({ ...req.body }, { where: { id: id } });

            const meal = await Meal.findByPk(id);

            if (meal) {
                res.status(200).json(({ status: SUCCESS, data: meal }));
            } else {
                const error = appError.create("meal not found", 404, FAIL);
                return next(error);
            }
        }
    ),

    deleteMeal: asyncWrapper(
        async (req, res, next) => {
            const id = req.params.mealId;

            const meal = await Meal.findByPk(id);

            if (!meal) {
                const error = appError.create("meal not found", 404, FAIL);
                return next(error);
            }

            await Meal.destroy({ where: { id: id } });

            res.status(200).json({ status: SUCCESS, data: null });

        }
    )
};





module.exports = mealController;