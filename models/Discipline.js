const mongoose = require('mongoose');

const disciplineSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    // On which courses (years 1..4) the discipline is taught, and hours per semester on each.
    courses: [{
        year: { type: Number, min: 1, max: 4, required: true },   // курс 1..4
        hours: { type: Number, min: 0, default: 0 },              // годин на семестр
    }],
}, { timestamps: true });

module.exports = mongoose.model('Discipline', disciplineSchema);
