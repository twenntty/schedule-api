const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
    name: String,
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true }
});

module.exports = mongoose.model('Specialty', specialtySchema);