const { SUCCESS, FAIL } = require("../utils/httpStatusText");

const asyncWrapper = require("../middleware/asyncWrapper");

const appError = require("../utils/appError");

const sequelize = require("../config/sequelizeConnection");

const { QueryTypes, where } = require("sequelize");


const deletedController = {
    getAllRows: asyncWrapper(
        async (req, res) => {
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const rows = await sequelize.query(`select * from ${query.tableName} limit ${limit} offset ${skip} `, { type: QueryTypes.SELECT });

            res.json({ status: SUCCESS, data: { rows } });
        }
    ),

    getAllDeletedRows: asyncWrapper(
        async (req, res) => {
            const query = req.query;
            const limit = + query.limit || 10;
            const page = + query.page || 1;
            const skip = (page - 1) * limit;

            const rows = await sequelize.query(`select * from ${query.tableName} where deletedAt is not null limit ${limit} offset ${skip}`, { type: QueryTypes.SELECT });

            res.json({ status: SUCCESS, data: { rows } });
        }
    ),

    getDeletedRowById: asyncWrapper(
        async (req, res, next) => {
            const row = await sequelize.query(`select * from ${req.query.tableName} where id = ${req.params.id} and deletedAt is not null `, { type: QueryTypes.SELECT });

            if (row.length === 0) {
                const error = appError.create("row not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: row });
        }
    ),

    rowRestory: asyncWrapper(
        async (req, res, next) => {
            const Model = require(`../models/${req.query.modelName}.model`);
            const row = await sequelize.query(`select * from ${req.query.tableName} where id = ${req.params.id} and deletedAt is not null `, { type: QueryTypes.SELECT });

            if (row.length === 0) {
                const error = appError.create("row not found", 404, FAIL);
                return next(error);
            }

            await Model.restore({ where: { id: req.params.id } })

            return res.json({ status: SUCCESS, data: row });
        }
    ),

    getDeletedRowByCompositeKey: asyncWrapper(
        async (req, res, next) => {
            const Model = require(`../models/${req.query.modelName}.model`);
            const primaryKey = Model.primaryKeyAttributes;
            const col1_id = req.params.ids.split(',')[0];
            const col2_id = req.params.ids.split(',')[1];

            const row = await sequelize.query(`select * from ${req.query.tableName} where  ${primaryKey[0]} = ${col1_id}  and ${primaryKey[1]} = ${col2_id} and deletedAt is not null `, { type: QueryTypes.SELECT });

            if (row.length === 0) {
                const error = appError.create("row not found", 404, FAIL);
                return next(error);
            }

            return res.json({ status: SUCCESS, data: row });
        }
    ),

    rowRestoryByCompositeKey: asyncWrapper(
        async (req, res, next) => {
            const Model = require(`../models/${req.query.modelName}.model`);
            const primaryKey1 = Model.primaryKeyAttributes[0];
            const primaryKey2 = Model.primaryKeyAttributes[1];
            const col1_id = req.params.ids.split(',')[0];
            const col2_id = req.params.ids.split(',')[1];

            const row = await sequelize.query(`select * from ${req.query.tableName} where ${primaryKey1} = ${col1_id}  and ${primaryKey2} = ${col2_id} and deletedAt is not null `, { type: QueryTypes.SELECT });

            if (row.length === 0) {
                const error = appError.create("row not found", 404, FAIL);
                return next(error);
            }

            const restore = {
                where: {
                }
            };

            restore.where[primaryKey1] = col1_id;
            restore.where[primaryKey2] = col2_id;

            await Model.restore(restore);

            return res.json({ status: SUCCESS, data: row });
        }
    )
}


module.exports = deletedController;