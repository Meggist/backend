const createReadableStream = require('../src/createReadableStream');
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const path = require("path");
const fs = require("fs");

chai.should();
chai.use(sinonChai);

const { expect } = chai;
const testFilePath = path.resolve(__dirname, "./testfile.txt");

describe("createReadableStream", () => {
  it("should emit content of the file chunk by chunk", async() => {
    const stream = createReadableStream(testFilePath);
    const dataListenerStub = sinon.stub();

    stream.on("data", dataListenerStub);

    await new Promise((resolve) => {
      stream.on("end", () => {
        resolve();
      });
    });

    let resultFileContent = "";

    for (const [chunk] of dataListenerStub.args.slice(0, dataListenerStub.args.length - 1)) {
      expect(chunk).to.be.instanceOf(Buffer, "It should push a buffer every time it emit data!");
      expect(chunk.length).to.be.equal(65536, "The buffer should have a size of 64 kb as original readable stream when the data fits it full!");

      resultFileContent += chunk.toString("utf-8");
    }

    const lastChunk = dataListenerStub.args[dataListenerStub.args.length - 1][0];

    expect(lastChunk.length).to.be.equal(6109, "The last change should have length 6109 because this amount of data can not fill 64kb Buffer!");

    resultFileContent += lastChunk;

    const expectedFileContent = fs.readFileSync(testFilePath, {
      encoding: "utf-8",
    });

    expect(resultFileContent).to.be.equal(expectedFileContent, "The concatenation of all chunks in the order they arrived should match the original file content!");
  });

});

