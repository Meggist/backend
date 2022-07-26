const express = require("express");
const bodyParser = require("body-parser");
const makeStoppable = require("stoppable")
const http = require("http");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const schema = require('./graphQL/schema')

const app = express();

app.use(bodyParser.json());

const root = {
  createTask: ({input}) => {
    console.log('123');
    return null
  }
}

// TODO: Implement server.
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

const server = makeStoppable(http.createServer(app));

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
