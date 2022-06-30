const express = require("express");
const makeStoppable = require("stoppable")
const http = require("http");
const path = require("path");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');

const {passport, verifyToken} = require("./auth/auth");
const TasksService = require("./services/TasksService")

const secretKey = 'TOP_SECRET';

const app = express();

const server = makeStoppable(http.createServer(app));
const tasksService = new TasksService(path.join(__dirname, './data/tasks.json'));

app.use(express.json());

const router = express.Router();

app.use('/', router);

router.post('/api/auth/register',
    body('email').isLength({min: 6}).isEmail().exists(),
    body('password').isLength({min: 6}).exists(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ error: errors.array() })
        }
        passport.authenticate('register', {session: false},
            (err, code) => err ? res.sendStatus(505) : res.status(code).send(''))(req, res);
});

router.post('/api/auth/login',
    body('email').isLength({min: 6}).isEmail().exists(),
    body('password').isLength({min: 6}).exists(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.sendStatus(400).send({ error: errors.array() })
        }
        passport.authenticate(
            'login',
            {session: false},
            async (err, user) => {
                try {
                    if (err || !user) {
                        res.sendStatus(400);

                        return next(err);
                    }

                    req.login(
                        user,
                        { session: false },
                        async (error) => {
                            if (error) return next(error);
                            const body = { email: user.email };
                            const token = jwt.sign({ user: body }, secretKey);
                            return res.json({ user: body, token });
                        }
                    );
                } catch (error) {
                    return next(error);
                }
            }
        )(req, res, next);
    }
);

router.post('/api/tasks',
    verifyToken,
    body('title').exists().notEmpty().isString(),
    body('description').exists().notEmpty().isString(),
    (req, res, next) => {
    jwt.verify(req.token, secretKey, async (err, authData) => {
        if(err || !authData) {
            res.sendStatus(401);
        }
        else {
            const errors = validationResult(req)
            const isUnique = await tasksService.checkTaskUnique(req.body.title, authData.user.email)
            if (!errors.isEmpty() || !isUnique) {
                return res.status(400).send({error: errors.array()})
            } else {
                const {title, description} = req.body;
                await tasksService.addTask(authData.user.email, title, description)
                res.sendStatus(201)
            }
        }});
    });

router.post('/api/tasks/done',
    verifyToken,
    body('title').exists().notEmpty().isString(),
    (req, res, next) => {
        jwt.verify(req.token, secretKey, async (err, authData) => {
            if(err || !authData) {
                res.sendStatus(401);
            }
            else {
                const errors = validationResult(req)
                if (!errors.isEmpty()) {
                    return res.sendStatus(400).send({error: errors.array()})
                } else {
                    const {title} = req.body;
                    await tasksService.markTaskAsDone(title, authData.user.email)
                    res.sendStatus(200)
                }
            }});
    });

router.put('/api/tasks/:taskTitle',
    verifyToken,
    body('title').exists().notEmpty().isString().isLength({min:3}),
    body('description').exists().notEmpty().isString(),
    (req, res, next) => {
        jwt.verify(req.token, secretKey, async (err, authData) => {
            if(err || !authData) {
                res.sendStatus(401);
            }
            else {
                const errors = validationResult(req)
                if (!errors.isEmpty()) {
                    return res.sendStatus(400)
                } else {
                    const {title, description} = req.body;
                    const code = await tasksService.changeTaskContent(req.params.taskTitle, authData.user.email, title, description);
                    res.sendStatus(code)
                }
            }});
    });

router.delete('/api/tasks', verifyToken,
    body('title').exists().notEmpty().isString().isLength({min:3}),
    (req, res) => {
        jwt.verify(req.token, secretKey, async (err, authData) => {
            if(err || !authData) {
                res.sendStatus(401);
            }
            else {
                const errors = validationResult(req)
                if (!errors.isEmpty()) {
                    return res.sendStatus(400)
                } else {
                    const {title} = req.body;
                    const code = await tasksService.deleteTask(title, authData.user.email);
                    res.sendStatus(code)
                }
            }});
    }
    );

getRequest('/api/tasks', tasksService.getUserTasks);
getRequest('/api/tasks/done', tasksService.getDoneTasks);

function getRequest(path, method) {
    router.get(path,verifyToken,(req,res)=>{
        jwt.verify(req.token, secretKey,async (err, authData)=>{
            if(err || !authData)
                res.sendStatus(401);
            else {
                const tasks = await method.call(tasksService, authData.user.email);
                res.json(tasks)
            }
        })
    });
}

    module.exports = () => {
        const stopServer = () => {
            return new Promise((resolve) => {
                server.stop(resolve);
            })
        };

        return new Promise((resolve) => {
            server.listen(3000, () => {
                console.log('Express server is listening on http://localhost:3000');
                resolve(stopServer);
            });
        });
    }
