const race = require("../src/race");
const chai = require("chai");
const { inspect } = require("util");
const chaiAsPromised= require("chai-as-promised");

chai.use(chaiAsPromised);

const should = chai.should();
const { expect } = chai;

const makeControllablePromise = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  })

  return {
    resolve,
    reject,
    promise,
  }
}

describe("race", () => {

  it("should resolve as soon as first promise resolved", (done) => {
    const promise1 = makeControllablePromise();
    const promise2 = makeControllablePromise();
    const promise3 = makeControllablePromise();

    const resultPromise = race([promise1.promise, promise2.promise, promise3.promise]);

    expect(inspect(resultPromise)).to.include("pending");

    promise2.resolve();

    resultPromise.should.be.fulfilled.notify(done);
  })

  it("should resolve with the value of the first resolved promise", (done) => {

    const promise1 = makeControllablePromise();
    const promise2 = makeControllablePromise();
    const promise3 = makeControllablePromise();

    const resultPromise = race([promise1.promise, promise2.promise, promise3.promise]);

    expect(inspect(resultPromise)).to.include("pending");

    const result = { type: "promise" };

    promise3.resolve(result);

    resultPromise.should.eventually.deep.equal(result).notify(done);
  });

  it("should reject if any of the promises rejects", (done) => {
    const promise1 = makeControllablePromise();
    const promise2 = makeControllablePromise();
    const promise3 = makeControllablePromise();

    const resultPromise = race([promise1.promise, promise2.promise, promise3.promise]);

    expect(inspect(resultPromise)).to.include("pending");

    const error = new Error("Error: Failed....");
    promise3.reject(error);

    resultPromise.should.be.rejectedWith(error).notify(done);
  })

})
