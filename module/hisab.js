const mongoose = require('mongoose');
const Joi = require('joi');

const hisabSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user',
        index: true
    },
    title: {
        type: String,
        required: true,
        minlength: 5, 
        maxlength: 100 
    },
    content: {
        type: String,
        required: true,
        minlength: 10, 
        maxlength: 500 
    },
    encrypt: {
        type: Boolean,
        default: false
    },
    shareable: {
        type: Boolean,
        default: false
    },
    editable: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        minlength: 8, 
        maxlength: 20 
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const ValidateHisabModel = (data) => {
    const Joi = require('joi'); // You only need to require Joi once outside of the function

    const hisabJoiSchema = Joi.object({
        owner: Joi.string().alphanum().length(24),
        title: Joi.string().min(5).max(100).required(),
        content: Joi.string().min(10).max(500).required(),
        password: Joi.string().min(8).max(20),
        date: Joi.date()
    });

    const validationResult = hisabJoiSchema.validate(data);
     return validationResult;
    
};


const hisabModel = mongoose.model('hisab', hisabSchema);

module.exports = {hisabModel,ValidateHisabModel}
