const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class TasksService {

    constructor(dataFile) {
        this.dataFile = dataFile;
    }

    async getTasks() {
        try {
            const data = (await readFile(this.dataFile)) || [];
            return JSON.parse(data);
        } catch {
            return []
        }
    }

    async getUserTasks(email) {
        const data = await this.getTasks();
        return this.filterTasksByUser(data, email)
                .map(({title, description, done}) => ({title, description, done}))
                .filter(({done}) => !done)
            || [];
    }

    async addTask(userEmail, title, description) {
        const data = await this.getTasks();
        data.push({userEmail, title, description, done: false});
        return writeFile(this.dataFile, JSON.stringify(data));
    }

    async checkTaskUnique(newTitle, email) {
        const data = await this.getTasks();
        return this.filterTasksByUser(data, email).every(({title}) => title !== newTitle)
    }

    async markTaskAsDone(changedTitle, changedEmail) {
        const data = await this.getTasks();
        data.find(({title, userEmail}) => title === changedTitle && userEmail === changedEmail).done = true;
        return writeFile(this.dataFile, JSON.stringify(data));
    }

    async changeTaskContent(changedTitle, email, newTitle, newDesc) {
        let data = await this.getTasks();
        const processedTask = data.find(({title, userEmail}) => title === changedTitle && userEmail === email);
        if (this.filterTasksByUser(data, email).find(({title}) => title === newTitle)) {
            return 400
        }

        if(processedTask) {
            processedTask.title = newTitle;
            processedTask.description = newDesc;
            await writeFile(this.dataFile, JSON.stringify(data));
            return 200;
        }

        return 404;
    }

    async getDoneTasks(email) {
        const data = await this.getTasks();
        return this.filterTasksByUser(data, email)
            .filter(({done}) => done)
            .map(({title, description, done}) => ({title, description, done}));
    }

    async deleteTask(changedTitle, email) {
        let data = await this.getTasks();
        data = data.filter(({title, userMail}) => title !== changedTitle && userMail === email);
        await writeFile(this.dataFile, JSON.stringify(data));
        return 200;
    }

    filterTasksByUser(tasks, email) {
        return tasks.filter(({userEmail}) => userEmail === email)
    }
}

module.exports = TasksService;
