const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true }, // Связь с преподавателем
    period: { type: mongoose.Schema.Types.ObjectId, ref: 'Period', required: true }, // Связь с временем пары
    lessonType: {
        type: String,
        enum: ['Практика', 'Лекція', 'Лабораторна', 'Іспит', 'Навчальна практика', 'Виїзна практика'],
        required: true
    },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, // Связь с группой
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, // Связь с кабинетом (MongoDB)
    dayOfWeek: { type: Number, required: true }, // День недели (локальный ID)
    date: { type: Date, required: true }, // Дата проведения занятия
    specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true }, // Связь со специальностью через API
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true } // Связь с курсом через API
});

module.exports = mongoose.model('Schedule', scheduleSchema);