const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const bcrypt = require('bcrypt');

module.exports = class UsersService {
    constructor(dataFile) {
        this.dataFile = dataFile;
    }

    async getUsers() {
        try {
            const data = await readFile(this.dataFile);
            return JSON.parse(data);
        } catch {
            return []
        }
    }

    async createUser({email, password}) {
        const data = await this.getUsers();

        if(data.find(task => task.email === email)) {
            return 400;
        }

        password = await bcrypt.hash(password, 12);
        data.push({email, password});
        await writeFile(this.dataFile, JSON.stringify(data));
        return 200;
    }

    async findUser(email) {
        const data = await this.getUsers();
        return data.find(user => user.email === email)
    }

    async isValidPassword(userPassword, typedPassword) {
        return await bcrypt.compare(typedPassword,userPassword);
    }
}
