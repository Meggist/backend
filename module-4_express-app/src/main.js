const express = require("express");
const makeStoppable = require("stoppable")
const http = require("http");
const path = require("path");
const cookieSession = require("cookie-session")

const routes = require("./routes");

const app = express();

const server = makeStoppable(http.createServer(app));

const TasksService = require("./services/TasksService")
const bodyParser = require("body-parser");
const tasksService = new (TasksService())(path.join(__dirname, '../data/tasks.json'));

app.set('trust proxy', 1)

app.use(cookieSession({
  name: 'session',
  keys: ['123', '321']
}))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, '../assets')));

app.use('/', routes(tasksService));

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

