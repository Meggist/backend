const fs = require("fs");
const util = require("util");
const {error} = require("protractor");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = () => {
    return class TasksService {

        constructor(dataFile) {
            this.dataFile = dataFile;
        }

        async getTasks() {
            try {
                const data = await readFile(this.dataFile);
                return JSON.parse(data);
            } catch {
                return []
            }
        }

        async addTask(name) {
            const data = (await this.getTasks()) || [];
            data.unshift({name, isDone: false});
            return writeFile(this.dataFile, JSON.stringify(data));
        }

        async makeTaskDone(name) {
            const data = await this.getTasks();
            data.find(task => task.name === name).isDone = true;
            return writeFile(this.dataFile, JSON.stringify(data));
        }

    }
}