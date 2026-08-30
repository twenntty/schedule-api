const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true }
});

module.exports = mongoose.model('Period', periodSchema);