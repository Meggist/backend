const {Schema, model} = require("mongoose");

const TaskSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    done: {
        type: Boolean,
        default: false
    }
});

module.exports = model('Task', TaskSchema);

