const mongoose = require('mongoose');
const express = require('express');
const Schedule = require('../models/Schedule');
const router = express.Router();

// ➜ Получить ВСЁ расписание (с кабинетами и днями недели)
router.get('/', async (req, res) => {
    try {
        const schedules = await Schedule.find()
            .populate({ path: 'group', populate: { path: 'specialty' } })
            .populate('period', 'name startTime endTime') // Подтягиваем время пары
            .populate('room', 'name'); // Подтягиваем название кабинета

        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

// ➜ Получить расписание по ГРУППЕ (по `groupId`)
router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const schedules = await Schedule.find({ group: groupId })
            .populate({ path: 'group', populate: { path: 'specialty' } })
            .populate('period', 'name startTime endTime') // Время пары
            .populate('room', 'name'); // Кабинет

        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

// ➜ Получить расписание по ДНЮ НЕДЕЛИ и ГРУППЕ
router.get('/group/:groupId/day/:dayOfWeek', async (req, res) => {
    try {
        const { groupId, dayOfWeek } = req.params;
        const schedules = await Schedule.find({ group: groupId, dayOfWeek })
            .populate({ path: 'group', populate: { path: 'specialty' } })
            .populate('period', 'name startTime endTime') // Время пары
            .populate('room', 'name'); // Кабинет

        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

// ➜ Добавить новую запись в расписание
router.post('/', async (req, res) => {
    try {
        const { subject, teacher, lessonType, period, group, room, dayOfWeek } = req.body;

        // Проверяем, что все обязательные поля присутствуют
        if (!subject || !teacher || !lessonType || !period || !group || !room || !dayOfWeek) {
            return res.status(400).json({ message: "Пожалуйста, заполните все поля!" });
        }

        // Проверка на валидность ObjectId для period, group, room
        if (!mongoose.Types.ObjectId.isValid(period) || 
            !mongoose.Types.ObjectId.isValid(group) || 
            !mongoose.Types.ObjectId.isValid(room)) {
            return res.status(400).json({ message: "Некорректные идентификаторы для period, group или room" });
        }

        const newSchedule = new Schedule({
            subject, teacher, lessonType, period, group, room, dayOfWeek
        });

        await newSchedule.save();

        res.json({ message: 'Запись добавлена', schedule: newSchedule });
    } catch (error) {
        console.error("Ошибка при добавлении пары:", error);  // Логирование ошибки
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});


module.exports = router;
