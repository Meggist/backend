const fs = require('fs');

function rimraf (path, callback) {
    fs.rm(path, { recursive: true }, callback)
}
module.exports.rimraf = rimraf;
