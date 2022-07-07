const express = require("express");
const makeStoppable = require("stoppable")
const http = require("http");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const {passport, verifyToken} = require("./auth/auth");
const TaskModel = require('./models/TaskModel');

const secretKey = 'TOP_SECRET';

const app = express();

const server = makeStoppable(http.createServer(app));

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

                    const body = { userId: user._id };
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
            const allUserTasks = await TaskModel.find({userId: authData.user.userId});
            if (allUserTasks.find(task => task.title === title)) {
                return res.sendStatus(400);
            }
            const task = new TaskModel({userId: authData.user.userId, title, description})
            await task.save();
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
            const {nModified} = await TaskModel.updateOne({userId: authData.user.userId, title}, {done: true})
              nModified ?  res.sendStatus(200) : res.sendStatus(404);
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
            const allUserTasks = await TaskModel.find({userId: authData.user.userId});
            const existedTask = allUserTasks.find(({title}) => title === req.params.taskTitle);
            if (!existedTask) {
                res.sendStatus(404);
                return;
            }
            if (allUserTasks.find(task => task._id !== existedTask._id && task.title === title)) {
                res.sendStatus(400);
                return;
            }
            const {nModified} = await TaskModel.updateOne(
                {userId: authData.user.userId, title: req.params.taskTitle},
                {title, description});

            nModified ? res.sendStatus(200) : res.sendStatus(404);
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
            await TaskModel.deleteOne(obj);
            res.sendStatus(200)
          }
        }});
    }
);

getRequest('/api/tasks', false);
getRequest('/api/tasks/done', true);

function getRequest(path, done) {
  router.get(path,verifyToken,(req,res)=>{
    jwt.verify(req.token, secretKey,async (err, authData)=>{
      if(err || !authData)
        res.sendStatus(401);
      else {
        const tasks = (await TaskModel.find({userId: authData.user.userId, done}))
            .map(({done, title, description}) => ({done, title, description}));
        return res.json(tasks);
      }
    })
  });
}

module.exports = async () => {
  mongoose.connect('mongodb://localhost:27017/cluster0', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }, err => {
      if(err) {
          console.log(err);
          return;
      }
      console.log('DB connected');
  });


  const stopServer = () => {
    return new Promise((resolve) => {
      mongoose.disconnect();
      server.stop(resolve);
    })
  };

  await new Promise((resolve, reject) => {
    mongoose.connection.on('error', reject);
    mongoose.connection.on('open', resolve);
  });

  return new Promise((resolve) => {
    server.listen(3000, () => {
      console.log('Express server is listening on http://localhost:3000');
      resolve(stopServer);
    });
  });
}
