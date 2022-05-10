exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'mocha',
  specs: [
    '../test/*.js'
  ],
  capabilities: {
    browserName: 'chrome'
  },
  mochaOpts: {
    reporter: 'mocha-junit-reporter',
    timeout: 30000
  },
  onPrepare () {
    const chai = require('chai'); // chai
    const chaiAsPromised = require("chai-as-promised"); // deal with promises from protractor
    chai.use(chaiAsPromised); // add promise candy to the candy of chai
    global.chai = chai; // expose chai globally

    browser.waitForAngularEnabled(false);
  }
};
