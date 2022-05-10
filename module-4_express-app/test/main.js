const startServer = require("../src/main");

const expect = chai.expect;

const wait = (ms) => new Promise(resolve => {
  setTimeout(resolve, ms);
});


describe("ToDo Application",  async function () {
  let stopServer;

  before(async (done) => {
    stopServer = await startServer();
    done();
  });

  after(async (done) => {
    await stopServer();

    done();
  });

  it("/ the page title should be equal 'Simple TODO Application'", function () {
    browser.get("http://localhost:3000");

    expect(browser.getTitle()).to.eventually.equal("Simple TODO Application");
  })

  it("/ should render correctly render header with 'There is no tasks' text when task list is empty on init", function () {
    browser.get("http://localhost:3000");

    const noTasksTitle = $$(".no-tasks");

    expect(noTasksTitle.count()).to.eventually.equal(1);
    expect(noTasksTitle.first().getTagName()).to.eventually.be.equal("h3");
    expect(noTasksTitle.first().getText()).to.eventually.be.equal("There is no tasks.");
  })

  it("/ should contain links to / and /done", function () {
    browser.get("http://localhost:3000");

    const menuLinks = $$(".menu > .menu__item > .link");

    expect(
      menuLinks.count(),
      "Menu should contain two links",
    ).to.eventually.be.equal(2);
    expect(
      menuLinks.getText(),
      "Menu should contain the following links TODO, DONE",
    ).to.eventually.be.deep.equal(['TODO', 'DONE']);
    expect(
      menuLinks.first().getAttribute('href'),
      "First link should be TODO and should point to / page",
    ).to.eventually.be.equal('http://localhost:3000/');
    expect(
      menuLinks.last().getAttribute('href'),
      "Second link should be DONE and should point to /done page",
    ).to.eventually.be.equal('http://localhost:3000/done');
  })

  it("/ form should validate input. min length is 3.", async function () {
    await browser.get("http://localhost:3000");

    const alertsOnInit = $$(".main .alert.alert--error");

    expect(await alertsOnInit.count(), "It should not render alerts on blank page render").to.equal(0);

    const formInput = $(".task-form .input");
    const formButton = $(".task-form .task-form__button");

    expect(formInput.isPresent(), "Form input should exists.").to.be.eventually.true;
    expect(formButton.isPresent(), "Form button should exists.").to.be.eventually.true;

    await formInput.sendKeys("as");
    await formButton.click();
    await wait(1000);

    const alertsAfterSubmission = $$(".main .alert.alert--error");

    expect(
      await alertsAfterSubmission.count(),
      "It should render alerts when length is less than 3",
    ).to.equal(1);
    expect(
      await alertsAfterSubmission.first().getText(),
      "It should render correct alert message.",
    ).to.be.equal("Minimal length for task name is 3 letter!");

    await browser.get("http://localhost:3000");
    const alertsAfterReload = $$(".main .alert.alert--error");

    expect(await alertsAfterReload.count(), "It should not render alerts on page reload").to.equal(0);
  });

  it("/ form should correctly add task and show success message", async function () {
    await browser.get("http://localhost:3000");

    const formInput = $(".task-form .input");
    const formButton = $(".task-form .task-form__button");

    expect(await formInput.isPresent(), "Form input should exists.").to.be.true;
    expect(await formButton.isPresent(), "Form button should exists.").to.be.true;

    await formInput.sendKeys("Task One");
    await formButton.click();
    await wait(1000);

    await browser.wait(async () => {
      return (await $$(".list .list__item").count()) !== 0;
    }, 10000, "An success alert was not rendered in 10000 seconds. Test timed out!")

    const tasks = $$(".list .list__item");

    expect(await tasks.count(), "It should render 1 task after 1 form submission").to.be.equal(1);
    expect(await tasks.getText(), "It should render correct task content").to.be.deep.equal(["Task One"]);

    const checkboxClass = await tasks.first().$('.checkbox').getAttribute('class');

    expect(
      checkboxClass,
      "The checkbox in inside task should not be checked",
    ).to.not.include("checkbox--checked");

    const alerts = $$(".main .alert.alert--success");

    expect(await alerts.count(), "It should render 1 success alert").to.be.equal(1);
    expect(
      await alerts.getText(),
      "It should render 1 success alert with correct message",
    ).to.be.deep.equal(["Task was added!"]);
  });

  it("/ form should correctly add multiple tasks and validate that task does not exists.", async function () {
    await browser.get("http://localhost:3000");

    const formInput = $(".task-form .input");
    const formButton = $(".task-form .task-form__button");

    await formInput.sendKeys("Task Two");
    await formButton.click();
    await wait(1000);

    const alerts = $$(".main .alert.alert--success");

    await browser.wait(async () => {
      return (await alerts.count()) !== 0;
    }, 10000, "An success alert was not rendered in 10000 seconds. Test timed out!")

    expect(await alerts.count(), "It should render 1 success alert").to.be.equal(1);

    let tasks = $$(".list .list__item");

    await browser.wait(async () => {
      return (await tasks.count()) === 2;
    }, 10000, "Two tasks was not rendered in 10000 seconds. Test timed out!")

    expect(
      await tasks.count(),
      "It should render 2 tasks after second form submission",
    ).to.be.equal(2);
    expect(
      await tasks.getText(),
      "It should render correct task content",
    ).to.be.deep.equal(["Task One", "Task Two"]);

    await formInput.sendKeys("Task Two");
    await formButton.click();
    await wait(1000);

    await browser.wait(async () => {
      return (await  $$(".main .alert.alert--error").count()) !== 0;
    }, 10000, "An error alert was not rendered in 10000 seconds. Test timed out!")

    const errorAlerts = $$(".main .alert.alert--error");

    expect(
      await errorAlerts.count(),
      "It should render alerts when there is a task duplication",
    ).to.equal(1);
    expect(
      await errorAlerts.first().getText(),
      "It should render correct alert message.",
    ).to.be.equal("Task Task Two already exists!");
  });

  it("/done should render 'There is no tasks' when no task was done", async function () {
    await browser.get("http://localhost:3000/done");

    const noTasksTitle = $$(".no-tasks");

    expect(
      await noTasksTitle.count(),
      "Done page should render 1 .no-tasks element when no task was done"
    ).to.be.equal(1);
    expect(
      await noTasksTitle.first().getTagName(),
      "Title should be h3",
    ).to.be.equal("h3");
    expect(
      await noTasksTitle.first().getText(),
      "The text should be equal 'There is no tasks'",
    ).to.be.equal("There is no tasks.");
  })

  it("/ should remove ticket when clicked on checkbox and move it to DONE page", async function () {
    await browser.get("http://localhost:3000");

    const task = $(".list .list__item:first-child");
    const tasks = $$(".list .list__item");

    expect(
      await task.getText(),
      "It should render correct task content",
    ).to.be.deep.equal("Task One");

    expect(
      await tasks.count(),
      "It should render same number of tasks as created"
    ).to.be.equal(2);

    const taskCheckbox = task.$(".checkbox");

    expect(
      await taskCheckbox.getAttribute("class"),
      "Task checkbox should not be checked when rendered in TODO page",
    ).to.not.include("checkbox--checked");

    await taskCheckbox.click();

    await browser.wait(async () => {
      return (await tasks.count()) === 1;
    }, 10000, "Message was not removed in 10000 seconds. Timeout exceeded!")

    expect(
      await tasks.count(),
      "A task should be removed from page when we click on checkbox",
    ).to.be.equal(1);

    await browser.get("http://localhost:3000");

    expect(
      await tasks.count(),
      "A done task should not be presented on the page after page reload",
    ).to.be.equal(1);
  });

  it("/done should render correct done tasks", async function() {
    await browser.get("http://localhost:3000/done");

    const doneTasks = $$(".list .list__item");

    expect(
      await doneTasks.count(),
      "It should render done tasks"
    ).to.be.equal(1);

    expect(
      await doneTasks.getText(),
      "It should render correct done tasks content. 'Task One' because it was marked as done"
    ).to.be.deep.equal(["Task One"]);

    const checkbox = doneTasks.first().$(".checkbox.checkbox--checked");

    expect(
      await checkbox.isPresent(),
      "The task checkbox should be checked. (It should contains .checkbox--checked class)"
    ).to.be.true;
  });
});
