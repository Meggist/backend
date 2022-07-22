const { DataTypes } = require("sequelize");

module.exports = sequelize => {
    const Task = sequelize.define('Task', {
        userId: DataTypes.STRING,
        title: {
            type: DataTypes.STRING,
            unique: true
        },
        description: DataTypes.STRING,
        done: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    });
    sequelize.sync();
}