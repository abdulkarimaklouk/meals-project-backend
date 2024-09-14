const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizeConnection');

const Inventory = sequelize.define('Inventory', {
    ingredient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'Ingredients',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'Stores',
            key: 'id'
        },
        onUpdate: 'CASCADE'
    },
    quantity: {
        type: DataTypes.DECIMAL(9, 3),
        allowNull: false
    },
    total_cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: null
    },
    supplier: {
        type: DataTypes.STRING(55),
        allowNull: false
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
}, {
    tableName: 'inventory',
    createdAt: 'date_of_arrival',
    updatedAt: 'latest_inventory_update',
    timestamps: true,
    paranoid: true,
});




module.exports = Inventory;
