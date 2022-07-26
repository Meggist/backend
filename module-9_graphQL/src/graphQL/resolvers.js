const TaskModel = require('../models/TaskModel');
const {ObjectId} = require("mongodb");

const resolvers = {
    Mutation: {
        createTask:(obj, {task}) => {
            const newTask = new TaskModel(task)
            return new Promise((resolve, reject) => {
                newTask.save((err => {
                    if(err) reject(err);
                    else resolve(newTask);
                }))
            })
        },

        deleteTask: async (obj, {id}) => {
            try {
                return (await TaskModel.deleteOne({"_id": ObjectId(id)})).deletedCount;
            } catch (e) {
                return e;
            }
        },

        updateTask: async (obj, {id,task}) => {
            try {
                await TaskModel.updateOne({"_id": ObjectId(id)}, task);
                return {
                    id, ...task
                }
            } catch (e) {
                return e;
            }
        }
    },

    Query: {
        getTodoTasks: () => getTasks(false),
        getDoneTasks: () => getTasks(true),

        getTask: async (obj, {id}) => {
            try {
                const {tags, done, title, description} = await TaskModel.findOne({"_id": ObjectId(id)});
                return {tags, done, title, description, id}
            } catch (e) {
                return null;
            }
        },
        findTasks: async (obj, {tags}) => {
            return (await TaskModel.find({tags: {$in: tags}}))
                .map(({done, title, description, _id, tags}) => ({id: _id, tags, done, title, description}));
        }
    }
}

const getTasks = async done => {
    try {
        return (await TaskModel.find({done}))
            .map(({done, title, description, _id, tags}) => ({id: _id, tags, done, title, description}));
    } catch (err) {
        return err;
    }
}

module.exports = resolvers;