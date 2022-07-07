const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: { unique: true },
        validate: {
            validator: emailValidator.validate,
            message: props => props.value + 'is not valid'
        }
    },
   password: {
        type: String,
        required: true,
        trim: true,
        index: { unique: true },
        minLength: 7,
    }
});

UserSchema.pre('save', async function(next){
    const user = this;
    if(!user.isModified('password')) return next();
    try {
        user.password = await bcrypt.hash(user.password, 12);
        return next();
    } catch (err) {
        return next(err)
    }
});

UserSchema.methods.comparePassword = function(candidate){
    return bcrypt.compare(candidate, this.password);
}

module.exports = mongoose.model('User', UserSchema);