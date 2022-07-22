const Models = require('../models/index');
const bcrypt = require('bcrypt');

class UserService {
    constructor(sequelize) {
        Models(sequelize);
        this.client = sequelize;
        this.models = sequelize.models;
    }

    async create(email, password) {
        try {
            const hashPassword = await bcrypt.hash(password, 12);
            return await this.models.User.create({
                email, password: hashPassword
            });
        } catch ({original: {code}}) {
            return code;
        }
    }

    async comparePassword(password, candidate) {
        return bcrypt.compare(candidate, password)
    }
}

module.exports = UserService;