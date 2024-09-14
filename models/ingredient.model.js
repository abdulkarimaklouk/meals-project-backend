const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizeConnection');
const Inventory = require('./inventory.model');

const Ingredient = sequelize.define('Ingredients', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ingredient_name: {
        type: DataTypes.STRING(55),
        allowNull: false,
        unique: true
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'ingredients',
    createdAt: `date_of_create`,
    updatedAt: `latest_ingredient_update`,
    timestamps: true,
    paranoid: true
});

Ingredient.hasMany(Inventory, { foreignKey: 'ingredient_id' });
Inventory.belongsTo(Ingredient, { foreignKey: 'ingredient_id' });

module.exports = Ingredient;