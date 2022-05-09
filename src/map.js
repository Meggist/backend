/**
 * @param modify (Function) - Callback function that is applied to every element of received data.
 * @return Transform stream that emits a data it receives with modify callback applied to the data.
 */
const { Writable } = require('stream')
class StreamMap extends Writable {
    constructor(modify) {
        super({objectMode: true});
        this.modify = modify;
    }
    _write(chunk, encoding, next) {
        next(this.modify(chunk));
    }
}
module.exports = (modify) => {
    return new StreamMap(modify);
}


