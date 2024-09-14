//  config.js

module.exports = {
    database: {
        host: process.env.db_host,
        localhost: process.env.db_localhost,
        user: process.env.db_user,
        password: process.env.db_password,
        database: 'meals',
    }
};
