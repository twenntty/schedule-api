const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    period: { type: mongoose.Schema.Types.ObjectId, ref: 'Period', required: true },
    lessonType: {
        type: String,
        enum: ['Практика', 'Лекція', 'Лабораторна', 'Іспит', 'Навчальна практика', 'Виїзна практика'],
        required: true
    },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    dayOfWeek: { type: Number, required: true },
    date: { type: Date, required: true }, 
    specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true }
});

module.exports = mongoose.model('Schedule', scheduleSchema);