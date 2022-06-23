const express = require("express");

const rounter = express.Router();

const {check, validationResult} = require('express-validator');

const doneRoute = require("./done");

module.exports = service => {
    rounter.get('/',async (req, res) => {
        const tasks = await service.getTasks();
        const appropriateTasks = tasks.filter(task => !task.isDone)
        res.render('layout/layout', {template: 'index', tasks: appropriateTasks, error: req.session.errorMessage})
    });

    rounter.post('/',
        [
            check('task')
                .trim()
                .isLength({min: 3})
                .escape()
                .withMessage('Minimal length for task name is 3 letter!'),
            check('task').custom(name => {
                return service.getTasks().then(data => {
                    if (data.some(task => task.name === name)) {
                       return Promise.reject(`Task ${name} already exists!`);
                    }
                    return true;
                })
            })
        ],
        async (req, res) => {
        const errors = validationResult(req);

        if(errors.isEmpty()){
            await service.addTask(req.body.task)
            req.session.errorMessage = null;
            return res.redirect('/');
        }
        req.session.errorMessage = errors.array()[0].msg;
        return res.redirect('/');
    })

    rounter.post('/api/tasks/:taskName/done', async (req, res) => {
        await service.makeTaskDone(req.params.taskName);
        return res.redirect('/');
    })

    rounter.use('/done', doneRoute(service));

    return rounter;
}
