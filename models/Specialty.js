const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
    name: String
});

module.exports = mongoose.model('Specialty', specialtySchema);