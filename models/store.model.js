const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizeConnection');
const Inventory = require('./inventory.model');


const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    store_name: {
        type: DataTypes.STRING(55),
        allowNull: false,
        unique: true
    },
    store_address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING(55),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'stores',
    createdAt: `date_of_create`,
    updatedAt: `latest_store_update`,
    timestamps: true,
    paranoid: true
});

Store.hasMany(Inventory, { foreignKey: 'store_id' });
Inventory.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = Store;