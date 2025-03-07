const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    teacher: { type: String, required: true },
    period: { type: mongoose.Schema.Types.ObjectId, ref: 'Period', required: true }, // Связь с временем пары
    lessonType: {
        type: String,
        enum: ['Практика', 'Лекция', 'Лабораторная', 'Экзамен', 'Учебная практика', 'Выездная практика'],
        required: true
    },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, // Связь с группой
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, // Связь с кабинетом (MongoDB)
    dayOfWeek: { type: Number, required: true } // День недели (локальный ID)
});

module.exports = mongoose.model('Schedule', scheduleSchema);
