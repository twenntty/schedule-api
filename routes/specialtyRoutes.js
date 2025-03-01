const express = require('express');
const Specialty = require('../models/Specialty');
const router = express.Router();

router.get('/', async (req, res) => {
    const specialties = await Specialty.find();
    res.json(specialties);
});

router.post('/', async (req, res) => {
    const newSpecialty = new Specialty(req.body);
    await newSpecialty.save();
    res.json({ message: 'Специальность добавлена', specialty: newSpecialty });
});

module.exports = router;