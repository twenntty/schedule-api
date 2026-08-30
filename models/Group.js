const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true }
});

module.exports = mongoose.model('Group', groupSchema);
