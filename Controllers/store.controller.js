const Store = require("../models/store.model");

const { SUCCESS, FAIL } = require("../utils/httpStatusText");

const asyncWrapper = require("../middleware/asyncWrapper");

const appError = require("../utils/appError");

const { validationResult, body } = require("express-validator");

const { literal } = require('sequelize');

const attributes = [
    'id',
    'store_name',
    'store_address',
    'phone_number',
    'date_of_create',
    'latest_store_update',
    [literal('(SELECT COUNT(*) FROM `Stores` WHERE deletedAt IS NULL)'), 'rowCount']
];

const storeController = {
    getAllStores: asyncWrapper(
        async (req, res) => {
            console.log(req.session);
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const stores = await Store.findAll({
                attributes,
                limit: limit,
                offset: skip
            });

            res.json({ status: SUCCESS, data: stores });
        }
    ),

    getStoreById: asyncWrapper(
        async (req, res, next) => {
            const store = await Store.findByPk(req.params.storeId, {
                attributes
            });

            if (!store) {
                const error = appError.create("store not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: store });
        }
    ),

    createStore: asyncWrapper(
        async (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const error = appError.create(errors.array(), 400, FAIL);
                return next(error);
            }

            const { store_name, store_address, phone_number } = req.body;

            const oldStore = await Store.findOne({ where: { store_name } });

            if (oldStore) {
                const error = appError.create("This store already exists", 422, FAIL);
                return next(error);
            };

            const insertedStore = await Store.create({ store_name, store_address, phone_number });

            res.status(201).json(({ status: SUCCESS, data: insertedStore }));
        }
    ),

    updateStore: asyncWrapper(
        async (req, res, next) => {
            const id = req.params.storeId;

            await Store.update({ ...req.body }, { where: { id: id } });

            const store = await Store.findByPk(id);

            if (store) {
                res.status(200).json(({ status: SUCCESS, data: store }));
            } else {
                const error = appError.create("store not found", 404, FAIL);
                return next(error);
            }
        }
    ),

    deleteStore: asyncWrapper(
        async (req, res, next) => {
            const id = req.params.storeId;

            const store = await Store.findByPk(id);

            if (!store) {
                const error = appError.create("store not found", 404, FAIL);
                return next(error);
            }

            await Store.destroy({ where: { id: id } });

            res.status(200).json({ status: SUCCESS, data: null });
        }
    ),
};




module.exports = storeController;