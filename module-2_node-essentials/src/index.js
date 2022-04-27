const { rimraf } = require('./rimraf.js');
const { rename } = require('./rename.js')
const process = require('process');
let callbackArg;
const grab = flag => {
    let indexAfterFlag = process.argv.indexOf(flag) + 1;
    return indexAfterFlag ? process.argv[indexAfterFlag] : undefined;
}

const callback = err => new Error(err);

const funcName = process.argv.find(element => element === 'rimraf' || element === 'rename');

switch (funcName) {
    case 'rimraf':
        const pathArg = grab('--path');
        callbackArg = grab('--callback')
        rimraf(pathArg, callback || callbackArg);
        break;
    case 'rename':
        const from = grab('--from');
        const to = grab('--to');
        callbackArg = grab('--callback')
        rename(from, to, callback || callbackArg);
        break;
    default: throw new Error();
}

