const startServer = require("../src/main");
const chai = require("chai");
const superagent = require("superagent");

const expect = chai.expect;

let authTokenUser1;
let authTokenUser2;


const makeUrl = (endpoint) => `http://localhost:3000/api${endpoint}`;

const errorToResponse = (err) => err.response;
const testAuthorizationRequired = async (url, method) => {
  let response = await superagent[method](makeUrl(url))
    .auth('asdfsdfkjlsdf', { type: 'bearer' })
    .catch(errorToResponse);

  expect(response.statusCode).to.be.equal(401, 'It should return 401 (Unauthorized)');

  response = await superagent.post(makeUrl(url))
    .catch(errorToResponse);

  expect(response.statusCode).to.be.equal(401, 'It should return 401 (Unauthorized)');

  response = await superagent.post(makeUrl(url))
    .auth('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiaWF0IjoxNjE3NjAzMDU2fQ.JPS8zUGvWZFjpbotV0oUjeWBNp9p0-tx1OI0P_fOETA', { type: 'bearer' })
    .catch(errorToResponse);

  expect(response.statusCode).to.be.equal(401, 'It should return 401 (Unauthorized)');
}

const testTaskBodyValidation = async (url, method) => {
  let response = await superagent[method](makeUrl(url))
    .send({
      title: 'A task title',
    })
    .auth(authTokenUser1, { type: 'bearer' })
    .catch(errorToResponse);

  expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when missing description field');

  response = await superagent[method](makeUrl(url))
    .send({
      title: 'A',
      description: ''
    })
    .auth(authTokenUser1, { type: 'bearer' })
    .catch(errorToResponse);

  expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when task title contains less than 3 symbols');

  response = await superagent[method](makeUrl(url))
    .send({
    })
    .auth(authTokenUser1, { type: 'bearer' })
    .catch(errorToResponse);

  expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when body missing fields title and description');

  response = await superagent[method](makeUrl(url))
    .send({
      title: 124124,
      description: false
    })
    .auth(authTokenUser1, { type: 'bearer' })
    .catch(errorToResponse);

  expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when title or description is not a string');
};

describe("ToDo Application API",  async function () {
  let stopServer;

  before(async () => {
    stopServer = await startServer();
  });

  after(async () => {
    await stopServer();
  });

  it("POST /api/auth/register should validate body input", async function() {
    let response = await superagent.post(makeUrl('/auth/register'))
      .send({
        email: "random@random",
        password: "123456789",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when sent incorrect email!');

    response = await superagent.post(makeUrl('/auth/register'))
      .send({
        password: "123456789",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when email is missing!');

    response = await superagent.post(makeUrl('/auth/register'))
      .send({
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when the body is empty!');

    response = await superagent.post(makeUrl('/auth/register'))
      .send({
        email: "random@random.com",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when password is missing!');

    response = await superagent.post(makeUrl('/auth/register'))
      .send({
        email: "random@random.com",
        password: "123",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when password is less than 6 symbols!');
  });

  it("POST /api/auth/register should register a user", async function () {
    let response = await superagent.post(makeUrl('/auth/register'))
      .send({
        email: "random@random.com",
        password: "123456789",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (OK) status code when created a user');
    expect(response.text).to.be.equal('', 'The body of the response should be empty!');

    response = await superagent.post(makeUrl('/auth/register'))
      .send({
        email: "second@random.com",
        password: "123456789",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (OK) status code when created a user');
    expect(response.text).to.be.equal('', 'The body of the response should be empty!');
  });

  it("POST /api/auth/login should validate body input", async function() {
    let response = await superagent.post(makeUrl('/auth/login'))
      .send({
        email: "random@random",
        password: "123456789",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when sent incorrect email!');

    response = await superagent.post(makeUrl('/auth/login'))
      .send({
        password: "123456789",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when email is missing!');

    response = await superagent.post(makeUrl('/auth/login'))
      .send({
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when the body is empty!');

    response = await superagent.post(makeUrl('/auth/login'))
      .send({
        email: "random@random.com",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when password is missing!');

    response = await superagent.post(makeUrl('/auth/login'))
      .send({
        email: "random@random.com",
        password: "123",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when password is less than 6 symbols!');
  });

  it("POST /api/auth/login should authenticate a registered user", async function () {
    let response = await superagent.post(makeUrl('/auth/login'))
      .send({
        email: "random@random.com",
        password: "123456789",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (OK) when user passed correct credentials!');
    expect(response.body.user).to.be.deep.equal({
      email: 'random@random.com'
    }, 'Response should include user object that contains correct email. Password should be excluded.');
    expect(response.body).to.have.property('token');

    authTokenUser1 = response.body.token;

    response = await superagent.post(makeUrl('/auth/login'))
      .send({
        email: "second@random.com",
        password: "123456789",
      })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (OK) when user passed correct credentials!');
    expect(response.body.user).to.be.deep.equal({
      email: 'second@random.com'
    }, 'Response should include user object that contains correct email. Password should be excluded.');
    expect(response.body).to.have.property('token');

    authTokenUser2 = response.body.token;
  });

  it("POST /apit/auth/login should reject a request for a user with bad credentials or for non-existent user", async function() {
    const response = await superagent.post(makeUrl('/auth/login'))
      .send({
        email: "asdfsd@sdfsd.com",
        password: "123asdfsdf456789",
      })
      .catch(errorToResponse);

      expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when user provided invalid credentials!');
  })

  it("GET /api/tasks should reject unauthorized requests", async function() {
    await testAuthorizationRequired('/tasks', 'get');
  })

  it("GET /api/tasks should return empty list of tasks on user creation", async function() {
    let response = await superagent.get(makeUrl('/tasks'))
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (Ok)');
    expect(response.body).to.be.deep.equal([], 'It should return empty array');

    response = await superagent.get(makeUrl('/tasks'))
      .auth(authTokenUser2, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (Ok)');
    expect(response.body).to.be.deep.equal([], 'It should return empty array');
  })

  it("POST /api/tasks should reject unauthorized requests", async function() {
    await testAuthorizationRequired('/tasks', 'post');
  })

  it("POST /api/tasks should validate user input", async function() {
    await testTaskBodyValidation('/tasks', 'post');
  })

  it("POST /api/tasks should create a task", async function() {
    let response = await superagent.post(makeUrl('/tasks'))
      .send({
        title: 'Task 1',
        description: 'Random desc'
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(201, 'It should return 201 (Created) when creating a task');

    response = await superagent.get(makeUrl('/tasks'))
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([
      {
        title: 'Task 1',
        done: false,
        description: 'Random desc',
      }
    ], 'GET /api/tasks should return created task!');

    response = await superagent.get(makeUrl('/tasks'))
      .auth(authTokenUser2, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([], 'GET /api/tasks should return tasks for each user independently. If user A created a task, user B should not see it when performing GET request.');

    // Create another task.

    response = await superagent.post(makeUrl('/tasks'))
      .send({
        title: 'Task 2',
        description: 'Random desc'
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(201, 'It should return 201 (Created) when creating a task');

    response = await superagent.get(makeUrl('/tasks'))
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([
      {
        title: 'Task 1',
        done: false,
        description: 'Random desc',
      },
      {
        title: 'Task 2',
        done: false,
        description: 'Random desc',
      }
    ], 'GET /api/tasks should return created task!');

    // Create task for second user

    response = await superagent.post(makeUrl('/tasks'))
      .send({
        title: 'Task 1',
        description: 'Random desc'
      })
      .auth(authTokenUser2, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(201, 'It should return 201 (Created) when creating a task');


    response = await superagent.get(makeUrl('/tasks'))
      .auth(authTokenUser2, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([
      {
        title: 'Task 1',
        done: false,
        description: 'Random desc',
      },
    ], 'GET /api/tasks should return created task!');
  })

  it("POST /api/tasks should validate that a user don't have a ticket with the same title", async function () {
    let response = await superagent.post(makeUrl('/tasks'))
      .send({
        title: 'Task 1',
        description: 'Random desc'
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when user tries to create a task with title that already exists!');
  });

  it("GET /api/tasks/done should reject unauthorized requests", async function () {
    await testAuthorizationRequired('/tasks/done', 'get');
  });

  it("GET /api/tasks/done should return empty list if no task is done", async function () {
    let response = await superagent.get(makeUrl('/tasks/done'))
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (Ok)');
    expect(response.body).to.be.deep.equal([], 'It should return empty array');

    response = await superagent.get(makeUrl('/tasks/done'))
      .auth(authTokenUser2, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (Ok)');
    expect(response.body).to.be.deep.equal([], 'It should return empty array');
  });

  it("POST /api/tasks/done should reject unauthorized requests", async function () {
    await testAuthorizationRequired('/tasks/done', 'post');
  });

  it("POST /api/tasks/done should validate user input", async function () {
    let response = await superagent.post(makeUrl('/tasks/done'))
      .send({
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when there is no title!');

    response = await superagent.post(makeUrl('/tasks/done'))
      .send({
        title: 1232
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when title is not a string!');

  });

  it("POST /api/tasks/done should mark task as done", async function () {
    let response = await superagent.post(makeUrl('/tasks/done'))
      .send({
        title: 'Task 2'
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (OK) when done a task!');

    // Verify it does not presented in the todo list

    response = await superagent.get(makeUrl('/tasks'))
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([
      {
        title: 'Task 1',
        done: false,
        description: 'Random desc'
      }
    ], 'The done message should not be presented in todo list of the same user! GET /api/tasks returned unexpected tasks!');

    // Verify it does not affect other users.

    response = await superagent.get(makeUrl('/tasks'))
      .auth(authTokenUser2, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([
      {
        title: 'Task 1',
        done: false,
        description: 'Random desc'
      }
    ], 'GET /api/tasks returned unexpected tasks! When one user marked task as done it should not affect other users task!');

    // Verify it presented in done list

    response = await superagent.get(makeUrl('/tasks/done'))
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([
      {
        title: 'Task 2',
        done: true,
        description: 'Random desc'
      }
    ], 'GET /api/tasks/done returned unexpected tasks! Done tasks should be returned by the endpoint!');

    // Verify done tasks does not affected by other users

    response = await superagent.get(makeUrl('/tasks/done'))
      .auth(authTokenUser2, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([], 'GET /api/tasks/done returned unexpected tasks! When a user marks task as done it should not affect other users done tasks!');
  });

  it("PUT /api/tasks/:taskTitle should return 404 (Not Found) if task with such title does not exists", async function () {
    let response = await superagent.put(makeUrl(`/tasks/${encodeURI('Task 7')}`))
      .send({
        title: 'Task 5',
        description: 'asdfdsfsd'
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(404, 'It should return 404 (Not Found) when task with provided title does not exists!');
  });

  it("PUT /api/tasks/:taskTitle should reject unauthorized requests", async function () {
    await testAuthorizationRequired(`/tasks/${encodeURIComponent('Task 1')}`, 'put');
  });

  it("PUT /api/tasks/:taskTitle should validate user input", async function () {
    await testTaskBodyValidation(`/tasks/${encodeURIComponent('Task 1')}`, 'put');
  });

  it("PUT /api/tasks/:taskTitle should reject a request if a user tries to update a task to have a title that already exists", async function () {
    let response = await superagent.put(makeUrl(`/tasks/${encodeURI('Task 1')}`))
      .send({
        title: 'Task 2',
        description: 'asdfdsfsd'
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request)!');
  });
k
  it("PUT /api/tasks/:taskTitle should update a task", async function () {
    let response = await superagent.put(makeUrl(`/tasks/${encodeURI('Task 1')}`))
      .send({
        title: 'Task 3',
        description: 'asdfdsfsd'
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(200, 'It should return 200 (OK) when updated a task!');

    // Verify that it changed via GET call

    response = await superagent.get(makeUrl(`/tasks`))
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([
      {
        title: 'Task 3',
        done: false,
        description: 'asdfdsfsd',
      }
    ], 'It should update a task! GET /api/tasks returned incorrect response after we updated a task!');

    // Verify it does not affect other user tasks!

    response = await superagent.get(makeUrl(`/tasks`))
      .auth(authTokenUser2, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([
      {
        title: 'Task 1',
        done: false,
        description: 'Random desc',
      }
    ], 'GET /api/tasks returned incorrect response after we updated a task! When a user changes a task it should not affect other users task!');

  });

  it("DELETE /api/tasks should reject unauthorized requests", async function () {
    await testAuthorizationRequired("/tasks", "delete");
  });

  it("DELETE /api/tasks should validate user input", async function () {
    let response = await superagent.delete(makeUrl('/tasks'))
      .send({
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when there is no title!');

    response = await superagent.delete(makeUrl('/tasks'))
      .send({
        title: 1232
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(400, 'It should return 400 (Bad Request) when title is not a string!');
  });

  it("DELETE /api/tasks should delete a user task", async function () {
    let response = await superagent.delete(makeUrl('/tasks'))
      .send({
        title: 'Task 3'
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(204, 'It should return 204 (No Title) when task was deleted!');

    // Verify it always returns 204 (No Content)

    response = await superagent.delete(makeUrl('/tasks'))
      .send({
        title: 'Task523 2423 24 23'
      })
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.statusCode).to.be.equal(204, 'It should return 204 (No Title)! Even if the task with provided title does not exists!');

    // Verify it deleted a task!

    response = await superagent.get(makeUrl('/tasks'))
      .auth(authTokenUser1, { type: 'bearer' })
      .catch(errorToResponse);

    expect(response.body).to.be.deep.equal([], 'GET /api/tasks returned unexpected tasks! When a user deletes a task it should not be presented anymore!');
  })
});
