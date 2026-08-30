const express = require('express');
const Period = require('../models/Period');
const { requireRole } = require('../middleware/auth');
const canManage = requireRole('admin', 'institution');
const router = express.Router();

// Получение всех периодов
router.get('/', async (req, res) => {
    try {
        const periods = await Period.find({ institution: req.user.institution });
        res.json(periods);
    } catch (error) {
        res.status(500).json({ message: 'помилка загрузки' });
    }
});

// Создание нового периода
router.post('/', canManage, async (req, res) => {
    try {
        const { name, startTime, endTime } = req.body;
        if (!name || !startTime || !endTime) {
            return res.status(400).json({ message: 'Заповніть поля' });
        }
        const newPeriod = new Period({ name, startTime, endTime, institution: req.user.institution });
        await newPeriod.save();
        res.json({ message: 'Тривалість додану', period: newPeriod });
    } catch (error) {
        res.status(400).json({ message: 'Помилка при додавані тривалості' });
    }
});

// Удаление периода по ID
router.delete('/:id', canManage, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPeriod = await Period.findOneAndDelete({ _id: id, institution: req.user.institution });
        if (!deletedPeriod) {
            return res.status(404).json({ message: 'Період не знайдено' });
        }
        res.json({ message: 'Період видалений', period: deletedPeriod });
    } catch (error) {
        res.status(500).json({ message: 'Помилка при видаленні тривалості' });
    }
});

module.exports = router;
