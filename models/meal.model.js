const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizeConnection');

const MealIngredient = require('./mealIngredient.model');
const Order = require('./order.model');

const Meal = sequelize.define('Meal', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    meal_name: {
        type: DataTypes.STRING(55),
        allowNull: false,
        unique: true
    },
    meal_cost: {
        type: DataTypes.DECIMAL(10, 2),
    },
    meal_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'meals',
    createdAt: 'date_of_create',
    updatedAt: 'latest_meal_update',
    timestamps: true,
    paranoid: true,
});


Meal.hasMany(Order, { foreignKey: 'meal_id' });
Order.belongsTo(Meal, { foreignKey: 'meal_id' });


Meal.hasMany(MealIngredient, { foreignKey: 'meal_id' });
MealIngredient.belongsTo(Meal, { foreignKey: 'meal_id' });


module.exports = Meal;