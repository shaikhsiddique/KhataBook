const mongoose = require('mongoose');

const hisabSchema = mongoose.Schema({
    title : String,
    content : String,
    date : {
        type : Date,
        default : Date.now
    }
})
module.exports = mongoose.model('hisab',hisabSchema);