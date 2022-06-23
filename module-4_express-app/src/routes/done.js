const express = require("express");

const rounter = express.Router();

module.exports = service => {
    rounter.get('/',async (req, res) => {
        req.session.errorMessage = null;
        const tasks = await service.getTasks();
        const appropriateTasks = tasks.filter(task => task.isDone)
        res.render('layout/layout', {template: 'done', tasks: appropriateTasks});
    });

    return rounter;
}
