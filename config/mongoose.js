const mongoose = require('mongoose');
const debuglog = require('debug')('development:mongooseconfig');

const mongoUrl = "mongodb://127.0.0.1:27017/khatabook";

mongoose.connect(mongoUrl);

const db = mongoose.connection;

db.on('error', (err) => {
    debuglog(err);
});

db.on('open', () => {
    debuglog('Connected to MongoDB');
});

db.on('disconnected', () => {
    debuglog('Disconnected from MongoDB');
});

module.exports = db;
