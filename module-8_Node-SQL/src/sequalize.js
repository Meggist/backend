const Sequelize = require("sequelize");

const sequalize = new Sequelize({
    host: 'localhost',
    port: 3306,
    database: 'app',
    dialect: 'mysql',
    username: 'root',
    password: 'test123'
});

module.exports = sequalize;

