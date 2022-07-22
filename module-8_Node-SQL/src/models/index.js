const { DataTypes } = require("sequelize");

module.exports = sequelize => {
    const User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING
    });
    sequelize.sync();
}