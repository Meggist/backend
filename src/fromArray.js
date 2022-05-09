/**
 * @desc Makes a stream from an array of data.
 * @param array (any[]) - Array of data.
 * @return Readable - that emits every element of the array from left to right. Emits null when all elements
 * were pushed.
 */
const { Readable } = require('stream')
const fs = require("fs");
fs.createReadStream();
class StreamFromArray extends Readable {
    constructor(array) {
        super({objectMode: true});
        this.array = array;
        this.index = 0;
    }
    _read() {
        if (this.index <= this.array.length) {
            this.push(this.array[this.index])
            ++this.index
            if(this.index === this.array.length) {
                this.push(null)
            }
        } else {
            this.push(null)
        }
    }
}
module.exports = (array) => {
    return new StreamFromArray(array)
}
