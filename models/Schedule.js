const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    subject: String,
    teacher: String,
    period: { type: mongoose.Schema.Types.ObjectId, ref: 'Period', required: true }, // Добавляем связь с Period
    lessonType: {
        type: String,
        enum: ['Практика', 'Лекция', 'Лабораторная', 'Экзамен', 'Учебная практика', 'Выездная практика']
    },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }
});

module.exports = mongoose.model('Schedule', scheduleSchema);