const getDay = require('./index.js')
const {expect} = require('chai');
const {describe, it} = require('mocha');

describe('Function testing', function() {
    it('should return current day', async function() {
        const currentDay = getDay(Date.now())
        expect(currentDay).to.eql(new Date().getDay());
    });
});