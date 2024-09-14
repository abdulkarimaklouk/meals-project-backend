const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizeConnection');
const Ingredient = require('./ingredient.model');

const MealIngredient = sequelize.define('MealIngredient', {
    meal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'Meals',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    ingredient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'Ingredients',
            key: 'id'
        },
        onUpdate: 'CASCADE',
    },
    quantity: {
        type: DataTypes.DECIMAL(9, 3),
        allowNull: false
    }
}, {
    tableName: 'mealingredients',
    createdAt: 'date_of_create',
    updatedAt: 'latest_mealIngredient_update',
    timestamps: true,
    paranoid: true
})


Ingredient.hasMany(MealIngredient, { foreignKey: 'ingredient_id' });
MealIngredient.belongsTo(Ingredient, { foreignKey: 'ingredient_id' });

module.exports = MealIngredient;