const MealIngredients = require("../models/mealIngredient.model");
const Meal = require("../models/meal.model");
const Ingredient = require("../models/ingredient.model");

const { SUCCESS, FAIL } = require("../utils/httpStatusText");

const asyncWrapper = require("../middleware/asyncWrapper");

const appError = require("../utils/appError");

const { validationResult } = require("express-validator");

const { literal } = require('sequelize');

const attributes = [
    'meal_id',
    'ingredient_id',
    [literal(`Meal.meal_name`), `meal_name`],
    [literal(`Ingredient.ingredient_name`), `ingredient_name`],
    'quantity',
    'date_of_create',
    'latest_mealINgredient_update',
    [literal('(SELECT COUNT(*) FROM `mealIngredients` WHERE deletedAt IS NULL)'), 'rowCount']
];

const include = [
    {
        model: Meal,
        attributes: [],
    },
    {
        model: Ingredient,
        attributes: [],
    },
];


const mealIngredientsController = {
    getAllMealIngredients: asyncWrapper(
        async (req, res) => {
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const mealIngredients = await MealIngredients.findAll({
                attributes,
                include,
                limit,
                offset: skip
            })

            res.json({ status: SUCCESS, data: mealIngredients });
        }
    ),

    getMealIngredientsByMealIdAndIngredientId: asyncWrapper(
        async (req, res, next) => {
            const meal_id = req.params.ids.split(',')[0];
            const ingredient_id = req.params.ids.split(',')[1];

            const mealIngredients = await MealIngredients.findOne({
                attributes,
                include,
                where: {
                    meal_id,
                    ingredient_id
                }
            })
            if (!mealIngredients) {
                const error = appError.create("mealIngredients not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: mealIngredients });
        }
    ),

    getMealIngredientsByMealId: asyncWrapper(
        async (req, res, next) => {
            const meal_id = req.params.meal_id;
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const mealIngredients = await MealIngredients.findAll({
                attributes: [
                    'meal_id',
                    'ingredient_id',
                    [literal(`Meal.meal_name`), `meal_name`],
                    [literal(`Ingredient.ingredient_name`), `ingredient_name`],
                    'quantity',
                    'date_of_create',
                    'latest_mealINgredient_update',
                    [literal(`(SELECT COUNT(*) FROM MealIngredients WHERE meal_id = ${meal_id} and deletedAt IS NULL)`), 'rowCount']
                ],
                include,
                limit,
                offset: skip,
                where: {
                    meal_id
                }
            })

            if (!mealIngredients) {
                const error = appError.create("meal Ingredients not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: mealIngredients });
        }
    ),

    getMealIngredientsByIngredientId: asyncWrapper(
        async (req, res, next) => {
            const ingredient_id = req.params.ingredient_id;
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const Meals = await MealIngredients.findAll({
                attributes: [
                    'meal_id',
                    'ingredient_id',
                    [literal(`Meal.meal_name`), `meal_name`],
                    [literal(`Ingredient.ingredient_name`), `ingredient_name`],
                    'quantity',
                    'date_of_create',
                    'latest_mealINgredient_update',
                    [literal(`(SELECT COUNT(*) FROM MealINgredients WHERE ingredient_id = ${ingredient_id} and deletedAt IS NULL)`), 'rowCount']
                ],
                include,
                limit,
                offset: skip,
                where: {
                    ingredient_id,
                },
            })

            if (!Meals) {
                const error = appError.create("meals not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: Meals });
        }
    ),

    createMealIngredient: asyncWrapper(
        async (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const error = appError.create(errors.array(), 400, FAIL);
                return next(error);
            }

            const { meal_id, ingredient_id, quantity } = req.body;

            const oldMealIngredient = await MealIngredients.findOne({
                where: {
                    meal_id,
                    ingredient_id,
                }
            });

            if (oldMealIngredient) {
                const error = appError.create("This MealIngredient already exists", 422, FAIL);
                return next(error);
            };

            const insertedMealIngredient = (await MealIngredients.create({ meal_id, ingredient_id, quantity }));

            res.status(201).json(({ status: SUCCESS, data: insertedMealIngredient }));
        }
    ),

    updateMealIngredient: asyncWrapper(
        async (req, res, next) => {
            const meal_id = req.params.ids.split(',')[0];
            const ingredient_id = req.params.ids.split(',')[1];

            await MealIngredients.update({ ...req.body }, {
                where: {
                    meal_id,
                    ingredient_id,
                }
            });

            const mealIngredient = await MealIngredients.findOne({
                where: {
                    meal_id,
                    ingredient_id
                }
            });

            if (mealIngredient) {
                res.status(200).json(({ status: SUCCESS, data: mealIngredient }));
            } else {
                const error = appError.create("meal Ingredient not found", 404, FAIL);
                return next(error);
            }
        }
    ),

    deleteMealIngredient: asyncWrapper(
        async (req, res, next) => {
            const meal_id = req.params.ids.split(',')[0];
            const ingredient_id = req.params.ids.split(',')[1];

            const mealIngredient = await MealIngredients.findOne({
                where: {
                    meal_id,
                    ingredient_id
                }
            });

            if (!mealIngredient) {
                const error = appError.create("meal ingredient not found", 404, FAIL);
                return next(error);
            }

            await MealIngredients.destroy({
                where: {
                    meal_id,
                    ingredient_id,
                }
            });

            res.status(200).json({ status: SUCCESS, data: null });

        }
    )
};





module.exports = mealIngredientsController;











// const { MealIngredient, Inventory, Order } = require('../models'); // استيراد النماذج الخاصة بالوجبات والمخزون والطلبات

// async function createOrder(req, res, next) {
//     const { meal_id, quantity } = req.body;

//     try {
//         // الحصول على مكونات الوجبة وكميتها المطلوبة
//         const mealIngredients = await MealIngredient.findAll({
//             where: { meal_id },
//             attributes: ['ingredient_id', 'quantity']
//         });

//         // التحقق من توافر الكمية في المخزون لكل مكون
//         const availabilityPromises = mealIngredients.map(async (ingredient) => {
//             const { ingredient_id, quantity: requiredQuantity } = ingredient;

//             // الحصول على كمية المكون المتاحة في المخزون
//             const inventoryItem = await Inventory.findOne({
//                 where: { ingredient_id }
//             });

//             if (!inventoryItem) {
//                 throw new Error(`Ingredient with ID ${ingredient_id} not found in inventory.`);
//             }

//             const availableQuantity = inventoryItem.quantity;

//             // التحقق من كمية المكون المتاحة
//             if (availableQuantity < requiredQuantity * quantity) {
//                 throw new Error(`Insufficient quantity for ingredient with ID ${ingredient_id} in inventory.`);
//             }
//         });

//         // انتظار اكتمال جميع الاستعلامات
//         await Promise.all(availabilityPromises);

//         // إنشاء الطلب إذا كانت جميع المكونات متاحة بكميات كافية
//         const order = await Order.create({ meal_id, quantity });

//         res.status(201).json({ message: 'Order created successfully.', order });
//     } catch (error) {
//         // إدارة الأخطاء
//         res.status(400).json({ error: error.message });
//     }
// }

// module.exports = { createOrder };
