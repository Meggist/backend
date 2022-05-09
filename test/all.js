const all = require("../src/all");
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

describe("all", () => {

  it("should wait for all promises to resolve", (done) => {
    const promise1 = makeControllablePromise();
    const promise2 = makeControllablePromise();
    const promise3 = makeControllablePromise();

    const resultPromise = all([promise1.promise, promise2.promise, promise3.promise]);

    expect(inspect(resultPromise)).to.include("pending");

    promise2.resolve();

    expect(inspect(resultPromise)).to.include("pending");

    promise3.resolve();

    expect(inspect(resultPromise)).to.include("pending");

    promise1.resolve();

    resultPromise.should.be.fulfilled.notify(done);
  })

  it("should resolve with an array that contains results of each promise", (done) => {
    const promise1 = makeControllablePromise();
    const promise2 = makeControllablePromise();
    const promise3 = makeControllablePromise();

    const resultPromise = all([promise1.promise, promise2.promise, promise3.promise]);

    expect(inspect(resultPromise)).to.include("pending");

    const result2 = 214332;
    promise2.resolve(result2);

    expect(inspect(resultPromise)).to.include("pending");

    const result3 = "asdfasdf";
    promise3.resolve(result3);

    expect(inspect(resultPromise)).to.include("pending");

    const result1 = { name: 'nazar' };
    promise1.resolve(result1);

    resultPromise.should.eventually.deep.equal([result1, result2, result3]).notify(done);
  })

  it("should reject if any of the promises rejects", (done) => {
    const promise1 = makeControllablePromise();
    const promise2 = makeControllablePromise();
    const promise3 = makeControllablePromise();

    const resultPromise = all([promise1.promise, promise2.promise, promise3.promise]);

    expect(inspect(resultPromise)).to.include("pending");

    promise2.resolve();

    expect(inspect(resultPromise)).to.include("pending");

    const error = new Error("Error: Failed....");
    promise3.reject(error);


    resultPromise.should.be.rejectedWith(error).notify(done);
  })

})
