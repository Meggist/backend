const Models = require('../models/TaskModel');
const bcrypt = require("bcrypt");

class TaskService {
    constructor(sequelize) {
        Models(sequelize);
        this.client = sequelize;
        this.models = sequelize.models;
    }

    async create(data) {
        try {
            return await this.models.Task.create(data);
        } catch ({original: {code}}) {
            return code;
        }
    }
}

module.exports = TaskService;