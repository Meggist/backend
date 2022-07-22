const express = require("express");
const makeStoppable = require("stoppable")
const http = require("http");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');

const TaskService = require('./service/TaskService');
const {passport, verifyToken} = require("./auth/auth");
const sequalize = require('./sequalize');
const {where} = require("sequelize");

const secretKey = 'TOP_SECRET';

const app = express();

const server = makeStoppable(http.createServer(app));

app.use(express.json());

const router = express.Router();

app.use('/', router);

const taskService = new TaskService(sequalize)

router.post('/api/auth/register',
    body('email').isLength({min: 6}).isEmail().exists(),
    body('password').isLength({min: 6}).exists(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ error: errors.array() })
      }
      passport.authenticate('register', {session: false},
          (err, code) => {
          err ? res.sendStatus(505) : res.status(code).send('')
          })(req, res);
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
                      console.log(user)
                    const body = { userId: user.id };
                    const token = jwt.sign({ user: body }, secretKey);
                    return res.json({ user: {email:user.email}, token });
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
    (req, res) => {
      jwt.verify(req.token, secretKey, async (err, authData) => {
        if(err || !authData) {
          return res.sendStatus(401);
        }
        else {
          const errors = validationResult(req)
          if (!errors.isEmpty()) {
            return res.status(400).send({error: errors.array()})
          } else {
            const {title, description} = req.body;
            const allUserTasks = await taskService.models.Task.findAll({where:{userId: authData.user.userId}});
            if (allUserTasks && allUserTasks.find(({dataValues}) => dataValues.title === title)) {
                return res.sendStatus(400);
            }
            await taskService.create({userId: authData.user.userId, title, description});
            return res.sendStatus(201);
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
            const result = await taskService.models.Task.update({done: true}, {where: {userId: authData.user.userId, title}})
              result[0] ? res.sendStatus(200) : res.sendStatus(404);
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
            const allUserTasks = await taskService.models.Task.findAll({where:{userId: authData.user.userId}});
            if(!allUserTasks) {
                res.sendStatus(404);
                return;
            }
            const existedTask = allUserTasks.find(({dataValues: {title}}) => title === req.params.taskTitle);
            if (!existedTask) {
                res.sendStatus(404);
                return;
            }
            if (allUserTasks.find(({dataValues}) => dataValues.id !== existedTask.dataValues.id && dataValues.title === title)) {
                res.sendStatus(400);
                return;
            }
              const result = await taskService.models.Task.update({title, description}, {where: {userId: authData.user.userId, title: req.params.taskTitle}})
              result[0] ? res.sendStatus(201) : res.sendStatus(404);
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
            const obj = {title, userId: authData.user.userId};
            await taskService.models.Task.destroy({where: obj});
            res.sendStatus(200)
          }
        }});
    }
);

router.get('/', (req, res) => {
    res.send('HI');
})

getRequest('/api/tasks', false);
getRequest('/api/tasks/done', true);

function getRequest(path, done) {
  router.get(path,verifyToken,(req,res)=>{
    jwt.verify(req.token, secretKey,async (err, authData)=>{
      if(err || !authData)
        res.sendStatus(401);
      else {
        const tasks = (await taskService.models.Task.findAll({where:{userId: authData.user.userId, done}}))
            .map(({done, title, description}) => ({done, title, description}));
        return res.json(tasks);
      }
    })
  });
}

module.exports = async () => {
  const sequalize = require('./sequalize');
    sequalize.authenticate().then(() => {
        console.log('Connected to DB');
    })
        .catch(err => {
            console.log(err);
            process.exit(1);
        })
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
