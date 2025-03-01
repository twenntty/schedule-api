const express = require('express');
const Schedule = require('../models/Schedule');
const router = express.Router();

router.get('/', async (req, res) => {
    const schedules = await Schedule.find()
        .populate({ path: 'group', populate: { path: 'specialty' } })
        .populate('period', 'name startTime endTime'); // Теперь подтягиваются время и название периода
    res.json(schedules);
});

router.get('/group/:groupId', async (req, res) => {
    const { groupId } = req.params;
    const schedules = await Schedule.find({ group: groupId })
        .populate({ path: 'group', populate: { path: 'specialty' } })
        .populate('period', 'name startTime endTime'); // Время теперь отображается
    res.json(schedules);
});

router.post('/', async (req, res) => {
    const newSchedule = new Schedule(req.body);
    await newSchedule.save();
    res.json({ message: 'Запись добавлена', schedule: newSchedule });
});

module.exports = router;