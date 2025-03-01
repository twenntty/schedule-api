const express = require('express');
const Period = require('../models/Period');
const router = express.Router();

router.get('/', async (req, res) => {
    const periods = await Period.find();
    res.json(periods);
});

router.post('/', async (req, res) => {
    try {
        const newPeriod = new Period(req.body);
        await newPeriod.save();
        res.json({ message: 'Период добавлен', period: newPeriod });
    } catch (error) {
        res.status(400).json({ message: 'Ошибка при добавлении периода', error: error.message });
    }
});

module.exports = router;
