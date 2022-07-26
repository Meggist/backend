const startServer = require("../src/main");
const chai = require("chai");
const chaiDeepMatch = require("chai-deep-match");
const { request, gql } = require("graphql-request");

chai.use(chaiDeepMatch);

const expect = chai.expect;

const url = "http://localhost:3000/graphql";

describe("ToDo Application API",  async function () {
  let stopServer;
  let taskId1;

  before(async () => {
    stopServer = await startServer();
  });

  after(async () => {
    await stopServer();
  });

  it("getTodoTasks query should return empty array on init", async function() {
    const { getTodoTasks } = await request(url, gql`
        {
            getTodoTasks {
                id
            }
        }
    `);

    expect(getTodoTasks).to.be.an.instanceOf(Array, "It should return an array");
    expect(getTodoTasks.length).to.be.eq(0, "It should return an empty array on init");
  })

  it("getDoneTasks query should return empty array on init", async function() {
    const { getDoneTasks } = await request(url, gql`
        {
            getDoneTasks {
                id
            }
        }
    `);

    expect(getDoneTasks).to.be.an.instanceOf(Array, "It should return an array");
    expect(getDoneTasks.length).to.be.eq(0, "It should return an empty array on init");
  })

  it("createTask mutation should create a task", async function() {
    const { createTask } = await request(url, gql`
        mutation createTask($task: CreateTaskInput!){
            createTask(task: $task) {
                id,
                title,
                description,
                tags,
                done
            }
        }
    `, {
      task: {
        title: "Task 1",
        description: "Some description",
        tags: ["sport", "health"],
      }
    });

    expect(createTask).to.be.deep.match({
      title: "Task 1",
      description: "Some description",
      tags: ["sport", "health"],
      done: false,
    }, "It should return created task, and by default task should have done: false");

    taskId1 = createTask.id;

    const { createTask: createTask2 } = await request(url, gql`
          mutation createTask($task: CreateTaskInput!){
              createTask(task: $task) {
                  id,
                  title,
                  description,
                  tags,
                  done
              }
          }
    `, {
      task: {
        title: "Task 2",
        description: "Some description",
        tags: ["sport"],
      }
    });

    expect(createTask2).to.be.deep.match({
      title: "Task 2",
      description: "Some description",
      tags: ["sport"],
      done: false,
    }, "It should return created task, and by default task should have done: false");

    const { createTask: createTask3 } = await request(url, gql`
        mutation createTask($task: CreateTaskInput!){
            createTask(task: $task) {
                id,
                title,
                description,
                tags,
                done
            }
        }
    `, {
      task: {
        title: "Task 3",
        description: "Some description",
        tags: ["health"],
      }
    });

    expect(createTask3).to.be.deep.match({
      title: "Task 3",
      description: "Some description",
      tags: ["health"],
      done: false,
    }, "It should return created task, and by default task should have done: false");
  });

  it("getTodoTasks should return all todo tasks", async function() {
    const { getTodoTasks } = await request(url, gql`
        {
            getTodoTasks {
                id,
                title,
                description,
                tags,
                done,
            }
        }
    `);

    expect(getTodoTasks.length).to.be.eq(3, "It should return created tasks");
    expect(getTodoTasks).to.be.deep.match([
      {
        title: "Task 1",
        description: "Some description",
        tags: ["sport", "health"],
        done: false,
      },
      {
        title: "Task 2",
        description: "Some description",
        tags: ["sport"],
        done: false,
      },
      {
        title: "Task 3",
        description: "Some description",
        tags: ["health"],
        done: false,
      }
    ], "It should return created task, and by default task should have done: false");
  })

  it("findTasks should return tasks that contains specific tags", async function() {
    const { findTasks } = await request(url, gql`
        query findTasks($tags: [String]!) {
            findTasks(tags: $tags) {
                id,
                title,
                description,
                tags,
                done,
            }
        }
    `, {
      tags: ['health']
    });

    expect(findTasks.length).to.be.eq(2, "It should return created tasks");
    expect(findTasks).to.be.deep.match([
      {
        title: "Task 1",
        description: "Some description",
        tags: ["sport", "health"],
        done: false,
      },
      {
        title: "Task 3",
        description: "Some description",
        tags: ["health"],
        done: false,
      }
    ], "It should return tasks with provided tag");


    const { findTasks: findTasks2 } = await request(url, gql`
        query findTasks($tags: [String]!) {
            findTasks(tags: $tags) {
                id,
                title,
                description,
                tags,
                done,
            }
        }
    `, {
      tags: ['health', 'sport']
    });

    expect(findTasks2.length).to.be.eq(1, "It should return created tasks");
    expect(findTasks2).to.be.deep.match([
      {
        title: "Task 1",
        description: "Some description",
        tags: ["sport", "health"],
        done: false,
      },
    ], "It should return tasks with provided tags");
  });

  it("updateTask should update the task with provided ID", async function() {
    const { updateTask } = await request(url, gql`
        mutation updateTask($id: ID!, $task: UpdateTaskInput!) {
            updateTask(id: $id, task: $task) {
                id,
                title,
                description,
                tags,
                done,
            }
        }
    `, {
      id: taskId1,
      task: {
        title: "Updated task1",
        description: "Updated description",
        done: true,
        tags: ["test"],
      }
    });

    expect(updateTask).to.be.deep.match({
      title: "Updated task1",
      description: "Updated description",
      done: true,
      tags: ["test"],
    }, "It should return updated task");
  });

  it("getTask should return correct task by ID", async function() {
    const { getTask } = await request(url, gql`
        query getTask($id: ID!) {
            getTask(id: $id) {
                id,
                title,
                description,
                tags,
                done,
            }
        }
    `, {
      id: taskId1,
    });

    expect(getTask).to.be.deep.match({
      title: "Updated task1",
      description: "Updated description",
      done: true,
      tags: ["test"],
    }, "It should return task by ID");
  });

  it("getTodoTasks should return only todo tasks", async function() {
    const { getTodoTasks } = await request(url, gql`
        {
            getTodoTasks {
                id,
                title,
                description,
                tags,
                done,
            }
        }
    `);

    expect(getTodoTasks.length).to.be.eq(2, "It should return todo tasks");
    expect(getTodoTasks).to.be.deep.match([
      {
        title: "Task 2",
        description: "Some description",
        tags: ["sport"],
        done: false,
      },
      {
        title: "Task 3",
        description: "Some description",
        tags: ["health"],
        done: false,
      }
    ], "It should return todo tasks (done: false)");
  })

  it("getDoneTasks query should return only done tasks", async function() {
    const { getDoneTasks } = await request(url, gql`
        {
            getDoneTasks {
                id,
                title,
                description,
                tags,
                done
            }
        }
    `);

    expect(getDoneTasks.length).to.be.eq(1, "It should return done tasks");
    expect(getDoneTasks).to.be.deep.match([
      {
        title: "Updated task1",
        description: "Updated description",
        done: true,
        tags: ["test"],
      }
    ], "It should return done tasks (done: true)");
  })

  it("deleteTask should delete a task by ID", async function() {
    await request(url, gql`
        mutation deleteTask($id: ID!) {
            deleteTask(id: $id)
        }
    `, {
      id: taskId1,
    });

    const { getTask } = await request(url, gql`
        query getTask($id: ID!) {
            getTask(id: $id) {
                id,
                title,
                description,
                tags,
                done,
            }
        }
    `, {
      id: taskId1,
    });

    expect(getTask).to.be.equal(null, 'getTask should return null if no task with provided id exists');
  });
});
