const {Schema, model} = require("mongoose");

const TaskSchema = Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: { unique: true },
        minLength: 3
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    tags: {
        type: [String],
        required: true,
        trim: true,
    },
    done: {
        type: Boolean,
        default: false
    }
});

module.exports = model('Task', TaskSchema);

