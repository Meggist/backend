const fromArray = require("../src/fromArray");
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);

const { expect } = chai;

describe("fromArray", () => {
  it(
    "should emit every element of an array from left to right and end event where all elements were pushed",
    (done) => {
      const element1 = {};
      const element2 = {};
      const element3 = {};

      const stream = fromArray([element1, element2, element3]);

      const stub = sinon.stub();

      stream.on("data", stub);

      stream.on("end", () => {
        expect(stub).to.have.been.calledThrice;

        expect(stub.getCall(0).args[0]).to.be.equal(element1);
        expect(stub.getCall(1).args[0]).to.be.equal(element2);
        expect(stub.getCall(2).args[0]).to.be.equal(element3);
        done();
      })
  });
});
