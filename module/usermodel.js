const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Make sure the name field is required
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure the email is unique across all users
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] // Validate email format
    },
    password: {
        type: String,
        required: true,
        minlength: 8, // Minimum length of 8 characters
    },
    hisab: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hisab',
    }]
});

const ValidateUserModel = (data)=>{
    const Schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(), // Note:.unique() might not work as expected in Joi alone; you may need to handle uniqueness at the application level or through database constraints.
    password: Joi.string().min(8).required(),
    });

    const vaildateResult = Schema.validate(data);
    return vaildateResult;

}


const userModel = mongoose.model('user',userSchema);

module.exports = {userModel,ValidateUserModel};