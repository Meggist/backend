const map = require("../src/map");
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);

const { expect } = chai;

describe("map", () => {
  const modifyStub = sinon.stub();
  const mapStream = map(modifyStub);

  it("should call modify callback every time it receives a data and return modified data",(done) => {
    const data1 = {};
    const resultData1 = {};

    const data2 = {};
    const resultData2 = {};

    modifyStub
      .onFirstCall()
      .returns(resultData1)
      .onSecondCall()
      .returns(resultData2);

    const onDataStub = sinon.stub();

    mapStream.on("data", onDataStub);

    mapStream.write(data1);
    mapStream.write(data2);
    mapStream.end();

    expect(modifyStub).to.have.been.calledTwice;

    mapStream.on("finish", () => {
      expect(onDataStub).to.have.been.calledTwice;

      expect(onDataStub.firstCall.args[0]).to.be.equal(resultData1);
      expect(onDataStub.secondCall.args[0]).to.be.equal(resultData2);

      done();
    });
  });
})
