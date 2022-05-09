const {Readable} = require("stream");
const fs = require("fs");

const chunkSize = 64000000;
const buffer = Buffer.alloc(chunkSize);

class CreateReadableStream extends Readable {
    constructor(filePath) {
        super({objectMode: true});
        this.filePath = filePath;
    }

    _read() {

    }
}

function createReadableStream(filePath) {
    return new CreateReadableStream(filePath);
}

module.exports = createReadableStream;
