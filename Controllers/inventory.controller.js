const Inventory = require("../models/inventory.model");
const Store = require("../models/store.model");
const Ingredient = require("../models/ingredient.model");

const { SUCCESS, FAIL } = require("../utils/httpStatusText");

const asyncWrapper = require("../middleware/asyncWrapper");

const appError = require("../utils/appError");

const { validationResult } = require("express-validator");

const { literal } = require('sequelize');

const attributes = [
    'ingredient_id',
    'store_id',
    [literal(`Ingredient.ingredient_name`), `ingredient_name`],
    [literal(`Store.store_name`), `store_name`],
    [literal(`Ingredient.cost`), `unit_cost`],
    'quantity',
    'total_cost',
    'supplier',
    'expiry_date',
    'date_of_arrival',
    'latest_inventory_update',
    [literal('(SELECT COUNT(*) FROM `Inventory` WHERE deletedAt IS NULL)'), 'rowCount']
];

const include = [
    {
        model: Ingredient,
        attributes: [],
    },
    {
        model: Store,
        attributes: [],
    }
];



const inventoryController = {
    getAllInventory: asyncWrapper(
        async (req, res) => {
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;
            const inventory = await Inventory.findAll({
                attributes,
                include,
                limit,
                offset: skip
            })

            res.json({ status: SUCCESS, data: inventory });
        }
    ),

    getInventoryByIngredientIdAndStoreId: asyncWrapper(
        async (req, res, next) => {
            const ingredient_id = req.params.ids.split(',')[0];
            const store_id = req.params.ids.split(',')[1];

            const inventory = await Inventory.findOne({
                attributes,
                include,
                where: {
                    ingredient_id,
                    store_id
                }
            })

            if (!inventory) {
                const error = appError.create("inventory not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: inventory });
        }
    ),

    getInventoryByIngredientId: asyncWrapper(
        async (req, res, next) => {
            const ingredient_id = req.params.ingredient_id;
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const inventory = await Inventory.findAll({
                attributes: [
                    'ingredient_id',
                    'store_id',
                    [literal(`Ingredient.ingredient_name`), `ingredient_name`],
                    [literal(`Store.store_name`), `store_name`],
                    [literal(`Ingredient.cost`), `unit_cost`],
                    'quantity',
                    'total_cost',
                    'supplier',
                    'expiry_date',
                    'date_of_arrival',
                    'latest_inventory_update',
                    [literal(`(SELECT COUNT(*) FROM Inventory WHERE ingredient_id = ${ingredient_id} and deletedAt IS NULL)`), 'rowCount']
                ],
                include,
                where: {
                    ingredient_id,
                },
                limit,
                offset: skip
            })


            if (!inventory) {
                const error = appError.create("inventory not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: inventory });
        }
    ),

    getInventoryByStoreId: asyncWrapper(
        async (req, res, next) => {
            const store_id = req.params.store_id;
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const inventory = await Inventory.findAll({
                attributes: [
                    'ingredient_id',
                    'store_id',
                    [literal(`Ingredient.ingredient_name`), `ingredient_name`],
                    [literal(`Store.store_name`), `store_name`],
                    [literal(`Ingredient.cost`), `unit_cost`],
                    'quantity',
                    'total_cost',
                    'supplier',
                    'expiry_date',
                    'date_of_arrival',
                    'latest_inventory_update',
                    [literal(`(SELECT COUNT(*) FROM Inventory where store_id = ${store_id} and deletedAt IS NULL)`), 'rowCount']
                ],
                include,
                where: {
                    store_id,
                },
                limit,
                offset: skip
            })

            if (!inventory) {
                const error = appError.create("inventory not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: inventory });
        }
    ),

    createInventory: asyncWrapper(
        async (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const error = appError.create(errors.array(), 400, FAIL);
                return next(error);
            }

            const { ingredient_id, store_id, quantity, supplier, expiry_date } = req.body;

            const oldInventory = await Inventory.findOne({
                where: {
                    ingredient_id,
                    store_id
                }
            });

            if (oldInventory) {
                const error = appError.create("This inventory already exists", 422, FAIL);
                return next(error);
            };

            const insertedInventory = (await Inventory.create({ ingredient_id, store_id, quantity, supplier, expiry_date }));
            res.status(201).json(({ status: SUCCESS, data: insertedInventory }));
        }
    ),

    updateInventory: asyncWrapper(
        async (req, res, next) => {
            const ingredient_id = req.params.ids.split(',')[0];
            const store_id = req.params.ids.split(',')[1];

            await Inventory.update({ ...req.body }, {
                where: {
                    ingredient_id, store_id
                }
            });

            const inventory = await Inventory.findOne({
                where: {
                    ingredient_id, store_id
                }
            });

            if (inventory) {
                res.status(200).json(({ status: SUCCESS, data: inventory }));
            } else {
                const error = appError.create("inventory not found", 404, FAIL);
                return next(error);
            }
        }
    ),

    deleteInventory: asyncWrapper(
        async (req, res, next) => {
            const ingredient_id = req.params.ids.split(',')[0];
            const store_id = req.params.ids.split(',')[1];

            const inventory = await Inventory.findOne({
                where: {
                    ingredient_id, store_id
                }
            });

            if (!inventory) {
                const error = appError.create("inventory not found", 404, FAIL);
                return next(error);
            }

            await Inventory.destroy({
                where: {
                    ingredient_id,
                    store_id
                }
            });

            res.status(200).json({ status: SUCCESS, data: null });

        }
    )
};





module.exports = inventoryController;