const path = require('path');
const analyze = require('../src/analyze');
const { expect } = require('chai');
const sinon = require('sinon');

const testAssetsPath = path.resolve(__dirname, 'assets')

describe('analyze(folderPath, callback)', () => {
  it('should return an error in case a path to invalid folder was provided', async () => {
    const callbackStub = sinon.stub();
    const promise = new Promise(resolve => {
      callbackStub.callsFake(() => resolve());
    });

    analyze('/unexistedfolderblab-blab', callbackStub);

    await promise;

    expect(callbackStub.calledOnce).to.be.true;

    const callArguments = callbackStub.getCall(0).args;
    expect(callArguments[0]).to.be.instanceOf(Error);
    expect(callArguments[1]).to.be.equal(undefined);
  });

  let result;
  const callbackStub = sinon.stub();

  before(async () => {
    result = await new Promise((resolve) => {
      callbackStub.callsFake(() => {
        resolve();
      })

      analyze(testAssetsPath, callbackStub);
    });
  })

  it('should call callback function once', () => {
    expect(callbackStub.calledOnce).to.be.true;
  })

  it('should pass null as an error in case of a success', () => {
    expect(callbackStub.getCall(0).args[0]).to.be.equal(null);
  });

  it('should pass an object that has totalFiles number property', () => {
    expect(callbackStub.getCall(0).args[1]).to.has.property('totalFiles');
    expect(typeof callbackStub.getCall(0).args[1].totalFiles).to.be.equal('number');
  });

  it('should pass an object that has totalSubFolders number property', () => {
    expect(callbackStub.getCall(0).args[1]).to.has.property('totalSubFolders');
    expect(callbackStub.getCall(0).args[1].totalSubFolders).to.be.an('number');
  });

  it('should pass an object that has fileTypesInformation array property', () => {
    expect(callbackStub.getCall(0).args[1]).to.has.property('fileTypesInformation');
    expect(callbackStub.getCall(0).args[1].fileTypesInformation).to.be.instanceOf(Array);
  });

  it('should pass correct format of objects for fileTypesInformation array', () => {
    for (const fileTypeInfo of callbackStub.getCall(0).args[1].fileTypesInformation) {
      expect(fileTypeInfo).to.has.all.keys('fileExtension', 'fileCount');
      expect(fileTypeInfo.fileExtension).to.be.an('string');
      expect(fileTypeInfo.fileCount).to.be.an('number');
    }
  });

  it('should pass correct totalFiles value', () => {
    expect(callbackStub.getCall(0).args[1].totalFiles).to.be.equal(10);
  });

  it('should pass correct totalSubFolders value', () => {
    expect(callbackStub.getCall(0).args[1].totalSubFolders).to.be.equal(4);
  });

  it('should pass fileTypesInformation array that has correct information about extension', () => {
    expect(callbackStub.getCall(0).args[1].fileTypesInformation).to.have.deep.members([
      {
        fileExtension: '.logs',
        fileCount: 1,
      },
      {
        fileExtension: '.errors',
        fileCount: 1,
      },
      {
        fileExtension: '.html',
        fileCount: 3,
      },
      {
        fileExtension: '.json',
        fileCount: 1,
      },
      {
        fileExtension: '.jpeg',
        fileCount: 2,
      },
      {
        fileExtension: '.css',
        fileCount: 2,
      }
    ],
      'It should has the following information about files: .logs - 1, .errors - 1, .html - 3, .json - 1, .jpeg - 2, .css - 2'
    );
  })
});
