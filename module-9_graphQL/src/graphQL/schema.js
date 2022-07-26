const { makeExecutableSchema } = require('graphql-tools');

const resolvers = require('./resolvers');

const typeDefs =`
   type Task { 
  id: ID! 
  title: String! 
  description: String! 
  tags: [String]! 
  done: Boolean! 
} 
 
type Query { 
  getTodoTasks: [Task]! 
  getDoneTasks: [Task]! 
  getTask(id:ID!): Task 
  findTasks(tags: [String]!): [Task]! 
} 
 
input CreateTaskInput { 
  title: String! 
  description: String! 
  tags: [String]! 
} 
 
input UpdateTaskInput { 
  title: String! 
  description: String! 
  tags: [String]! 
  done: Boolean! 
} 
 
type Mutation { 
  createTask(task: CreateTaskInput!): Task! 
  updateTask(id: ID!, task: UpdateTaskInput!): Task! 
  deleteTask(id: ID!): Boolean 
} 
`;

const schema = makeExecutableSchema({typeDefs, resolvers})
module.exports = schema;