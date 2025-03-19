const mongoose = require('mongoose');
const express = require('express');
const Schedule = require('../models/Schedule');
const Group = require('../models/Group');
const Teacher = require('../models/Teacher');
const Period = require('../models/Period');
const Room = require('../models/Room');
const Course = require('../models/Course');
const Specialty = require('../models/Specialty');
const router = express.Router();

const populateFields = [
    { path: 'group', populate: { path: 'specialty' } },
    { path: 'teacher', select: 'name' },
    { path: 'period', select: 'name startTime endTime' },
    { path: 'room', select: 'name' },
    { path: 'course', select: 'name' },
    { path: 'specialty', select: 'name' }
];

// ➜ Получить ВСЁ расписание
router.get('/', async (req, res) => {
    try {
        const schedules = await Schedule.find().populate(populateFields);
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

// ➜ Получить расписание по ГРУППЕ
router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const schedules = await Schedule.find({ group: groupId }).populate(populateFields);
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

// ➜ Получить расписание по ДНЮ НЕДЕЛИ и ГРУППЕ
router.get('/group/:groupId/day/:dayOfWeek', async (req, res) => {
    try {
        const { groupId, dayOfWeek } = req.params;
        const schedules = await Schedule.find({ group: groupId, dayOfWeek }).populate(populateFields);
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

router.get('/teacher/:teacherId', async (req, res) => {
    try {
      const { teacherId } = req.params;
      const schedules = await Schedule.find({ teacher: teacherId })
        .populate(populateFields);
      
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
  });

// ➜ Добавить новую запись в расписание
router.post('/', async (req, res) => {
    try {
        const { subject, teacher, lessonType, period, group, room, dayOfWeek, date, course, specialty } = req.body;

        // Проверяем, что все обязательные поля присутствуют
        if (!subject || !teacher || !lessonType || !period || !group || !room || !dayOfWeek || !date || !course || !specialty) {
            return res.status(400).json({ message: "Пожалуйста, заполните все поля!" });
        }

        // Проверка на валидность ObjectId
        const idsToCheck = { period, group, room, teacher, course, specialty };
        for (const [key, value] of Object.entries(idsToCheck)) {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return res.status(400).json({ message: `Некорректный идентификатор для ${key}` });
            }
        }

        // Проверка существования документов
        const existingDocuments = await Promise.all([
            Group.findById(group),
            Teacher.findById(teacher),
            Period.findById(period),
            Room.findById(room),
            Course.findById(course),
            Specialty.findById(specialty),
        ]);

        if (existingDocuments.some(doc => !doc)) {
            return res.status(400).json({ message: "Один или несколько документов не найдены" });
        }

        const newSchedule = new Schedule({ subject, teacher, lessonType, period, group, room, dayOfWeek, date, course, specialty });

        await newSchedule.save();
        res.json({ message: 'Запись добавлена', schedule: newSchedule });
    } catch (error) {
        console.error("Ошибка при добавлении пары:", {
            message: error.message,
            stack: error.stack,
            body: req.body,
        });
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

// ➜ Редактировать запись в расписании
router.put('/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { subject, teacher, lessonType, period, group, room, dayOfWeek, date, course, specialty } = req.body;

        // Проверяем, что все обязательные поля присутствуют
        if (!subject || !teacher || !lessonType || !period || !group || !room || !dayOfWeek || !date || !course || !specialty) {
            return res.status(400).json({ message: "Пожалуйста, заполните все поля!" });
        }

        // Проверка на валидность ObjectId
        const idsToCheck = { period, group, room, teacher, course, specialty };
        for (const [key, value] of Object.entries(idsToCheck)) {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return res.status(400).json({ message: `Некорректный идентификатор для ${key}` });
            }
        }

        // Проверка существования документов
        const existingDocuments = await Promise.all([
            Group.findById(group),
            Teacher.findById(teacher),
            Period.findById(period),
            Room.findById(room),
            Course.findById(course),
            Specialty.findById(specialty),
        ]);

        if (existingDocuments.some(doc => !doc)) {
            return res.status(400).json({ message: "Один или несколько документов не найдены" });
        }

        // Обновляем расписание
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            { subject, teacher, lessonType, period, group, room, dayOfWeek, date, course, specialty },
            { new: true } // Возвращает обновленный документ
        ).populate(populateFields);

        if (!updatedSchedule) {
            return res.status(404).json({ message: "Запись расписания не найдена" });
        }

        res.json({ message: "Запись обновлена", schedule: updatedSchedule });
    } catch (error) {
        console.error("Ошибка при редактировании пары:", {
            message: error.message,
            stack: error.stack,
            body: req.body,
        });
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

// ➜ Удалить запись из расписания
router.delete('/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;

        // Удаляем расписание
        const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);

        if (!deletedSchedule) {
            return res.status(404).json({ message: "Запись расписания не найдена" });
        }

        res.json({ message: "Запись удалена" });
    } catch (error) {
        console.error("Ошибка при удалении пары:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});


module.exports = router;