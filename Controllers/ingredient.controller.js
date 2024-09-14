const Ingredient = require("../models/ingredient.model");

const { SUCCESS, FAIL, ERROR } = require("../utils/httpStatusText");

const asyncWrapper = require("../middleware/asyncWrapper");

const appError = require("../utils/appError");

const { validationResult } = require("express-validator");

const { literal } = require('sequelize');

const attributes = [
    'id',
    'ingredient_name',
    'cost',
    'date_of_create',
    'latest_ingredient_update',
    [literal('(SELECT COUNT(*) FROM `Ingredients` WHERE deletedAt IS NULL)'), 'rowCount']
];


const ingredientController = {
    getAllIngredients: asyncWrapper(
        async (req, res) => {
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const ingredients = await Ingredient.findAll({
                attributes,
                limit: limit,
                offset: skip
            });

            res.json({ status: SUCCESS, data: ingredients });
        }
    ),

    getIngredientById: asyncWrapper(
        async (req, res, next) => {
            const ingredient = await Ingredient.findByPk(req.params.ingredientId, {
                attributes
            });

            if (!ingredient) {
                const error = appError.create("ingredient not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: ingredient });
        }
    ),

    createIngredient: asyncWrapper(
        async (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const error = appError.create(errors.array(), 400, FAIL);
                return next(error);
            }

            const { ingredient_name, cost } = req.body;

            const oldIngredient = await Ingredient.findOne({ where: { ingredient_name } });

            if (oldIngredient) {
                const error = appError.create("This ingredient already exists", 422, FAIL);
                return next(error);
            };

            const insertedIngredient = (await Ingredient.create({ ingredient_name, cost }));
            res.status(201).json(({ status: SUCCESS, data: insertedIngredient }));
        }
    ),

    updateIngredient: asyncWrapper(
        async (req, res, next) => {
            const id = req.params.ingredientId;

            await Ingredient.update({ ...req.body }, { where: { id: id } });

            const ingredient = await Ingredient.findByPk(id);

            if (ingredient) {
                res.status(200).json(({ status: SUCCESS, data: ingredient }));
            } else {
                const error = appError.create("ingredient not found", 404, FAIL);
                return next(error);
            }
        }
    ),

    deleteIngredient: asyncWrapper(
        async (req, res, next) => {
            const id = req.params.ingredientId;

            const ingredient = await Ingredient.findByPk(id);

            if (!ingredient) {
                const error = appError.create("ingredient not found", 404, FAIL);
                return next(error);
            }

            await Ingredient.destroy({ where: { id: id } });

            res.status(200).json({ status: SUCCESS, data: null });

        }
    )
};





module.exports = ingredientController;