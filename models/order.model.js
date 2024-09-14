const Store = require('./store.model');
const Inventory = require('./inventory.model');
const Ingredient = require('./ingredient.model');
const MealIngredient = require('./mealIngredient.model');


const { DataTypes } = require('sequelize');

const sequelize = require('../config/sequelizeConnection');

const appError = require('../utils/appError');

const { FAIL } = require('../utils/httpStatusText');



const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    meal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'meal',
            key: 'id'
        },
        onUpdate: 'CASCADE'
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        },
        onUpdate: 'CASCADE'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_cost: {
        type: DataTypes.DECIMAL(10, 2),
    },
    total_cost: {
        type: DataTypes.DECIMAL(10, 2),
    },
    meal_price: {
        type: DataTypes.DECIMAL(10, 2),
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
    }
}, {
    tableName: 'orders',
    createdAt: `date_of_create`,
    updatedAt: `latest_order_update`,
    timestamps: true,
    paranoid: true,
});


Store.hasMany(Order, { foreignKey: 'store_id' });
Order.belongsTo(Store, { foreignKey: 'store_id' });



Order.beforeCreate(async (Order) => {
    const { store_id, meal_id, quantity } = Order.dataValues;

    const mealIngredients = await MealIngredient.findAll({
        attributes: [
            'meal_id',
            'ingredient_id',
            'quantity',
        ],

        include: [
            {
                model: sequelize.model('Meal'),
                attributes: ['meal_name', 'meal_cost', 'meal_price'],
            },
            {
                model: Ingredient,
                attributes: ['ingredient_name', ['cost', 'unit_cost']],
            }
        ],

        where: {
            meal_id
        }
    });

    await Promise.all(mealIngredients.map(
        async (mealIngredient) => {

            const { ingredient_id, quantity: ingredientQuantity } = mealIngredient.toJSON();

            if (!mealIngredient.toJSON()) {
                const error = appError.create('ingredient not found', 404, FAIL);
                throw error;
            }

            const inventory = await Inventory.findOne({ where: { store_id, ingredient_id } });

            if (inventory && inventory.quantity >= ingredientQuantity * quantity) {
            } else {
                const error = appError.create('meal is not available at the moment', 404, FAIL);
                throw error;
            }
        }
    ));
})

Order.afterCreate(async (Order) => {
    const { store_id, meal_id, quantity } = Order.toJSON();

    const mealIngredients = await MealIngredient.findAll({
        attributes: [
            'meal_id',
            'ingredient_id',
            'quantity',
        ],

        include: [
            {
                model: sequelize.model('Meal'),
                attributes: ['meal_name', 'meal_cost', 'meal_price'],
            },
            {
                model: Ingredient,
                attributes: ['ingredient_name', ['cost', 'unit_cost']],
            }
        ],

        where: {
            meal_id
        }
    });

    await Promise.all(mealIngredients.map(
        async (mealIngredient) => {

            const { ingredient_id, quantity: ingredientQuantity } = mealIngredient.toJSON();

            if (!mealIngredient.toJSON()) {
                const error = appError.create('ingredient not found', 404, FAIL);
                throw error;
            }

            const inventory = await Inventory.findOne({ where: { store_id, ingredient_id } });

            const newQuantity = (inventory.quantity - ingredientQuantity) * quantity;

            await inventory.update({ quantity: newQuantity }, {
                where: {
                    store_id,
                    ingredient_id
                }
            });

        }
    ));
});

Order.beforeUpdate(async (Order, oldQuantity) => {
    const { store_id, meal_id, quantity } = Order.dataValues;

    const mealIngredients = await MealIngredient.findAll({
        attributes: [
            'meal_id',
            'ingredient_id',
            'quantity',
        ],

        include: [
            {
                model: sequelize.model('Meal'),
                attributes: ['meal_name', 'meal_cost', 'meal_price'],
            },
            {
                model: Ingredient,
                attributes: ['ingredient_name', ['cost', 'unit_cost']],
            }
        ],

        where: {
            meal_id
        }
    });


    await Promise.all(mealIngredients.map(
        async (mealIngredient) => {
            const { ingredient_id, quantity: ingredientQuantity } = mealIngredient.toJSON();

            if (!mealIngredient.toJSON()) {
                const error = appError.create('ingredient not found', 404, FAIL);
                throw error;
            }

            const inventory = await Inventory.findOne({ where: { store_id, ingredient_id } });



            if (inventory && (+ inventory.quantity + (ingredientQuantity * oldQuantity.quantity)) >= ingredientQuantity * quantity) {
            } else {
                const error = appError.create('meal is not available at the moment', 404, FAIL);
                throw error;
            }
        }
    ));
});

Order.afterUpdate(async (Order, oldQuantity) => {
    const { store_id, meal_id, quantity } = Order.toJSON();

    const mealIngredients = await MealIngredient.findAll({
        attributes: [
            'meal_id',
            'ingredient_id',
            'quantity',
        ],

        include: [
            {
                model: sequelize.model('Meal'),
                attributes: ['meal_name', 'meal_cost', 'meal_price'],
            },
            {
                model: Ingredient,
                attributes: ['ingredient_name', ['cost', 'unit_cost']],
            }
        ],

        where: {
            meal_id
        }
    });

    await Promise.all(mealIngredients.map(
        async (mealIngredient) => {

            const { ingredient_id, quantity: ingredientQuantity } = mealIngredient.toJSON();

            if (!mealIngredient.toJSON()) {
                const error = appError.create('ingredient not found', 404, FAIL);
                throw error;
            }

            const inventory = await Inventory.findOne({ where: { store_id, ingredient_id } });

            const newQuantity = (+ inventory.quantity + (ingredientQuantity * oldQuantity.quantity)) - ingredientQuantity * quantity;


            await inventory.update({ quantity: newQuantity }, {
                where: {
                    store_id,
                    ingredient_id
                }
            });

        }
    ));
});

Order.afterDestroy(async (Order) => {
    const { store_id, meal_id, quantity } = Order.toJSON();

    const mealIngredients = await MealIngredient.findAll({
        attributes: [
            'meal_id',
            'ingredient_id',
            'quantity',
        ],

        include: [
            {
                model: sequelize.model('Meal'),
                attributes: ['meal_name', 'meal_cost', 'meal_price'],
            },
            {
                model: Ingredient,
                attributes: ['ingredient_name', ['cost', 'unit_cost']],
            }
        ],

        where: {
            meal_id
        }
    });

    await Promise.all(mealIngredients.map(
        async (mealIngredient) => {

            const { ingredient_id, quantity: ingredientQuantity } = mealIngredient.toJSON();

            if (!mealIngredient.toJSON()) {
                const error = appError.create('ingredient not found', 404, FAIL);
                throw error;
            }

            const inventory = await Inventory.findOne({ where: { store_id, ingredient_id } });

            const newQuantity = + inventory.quantity + (ingredientQuantity * quantity)


            await inventory.update({ quantity: newQuantity }, {
                where: {
                    store_id,
                    ingredient_id
                }
            });

        }
    ));
});




module.exports = Order;


