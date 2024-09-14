const { Sequelize } = require('sequelize');
const { database } = require('./config');


const sequelize = new Sequelize({
    host: database.host,
    username: database.user,
    password: database.password,
    database: database.database,
    dialect: 'mysql',
});


sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
