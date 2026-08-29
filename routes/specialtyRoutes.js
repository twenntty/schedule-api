const express = require('express');
const Specialty = require('../models/Specialty');
const authMiddleware = require('../middleware/auth');
const { requireRole } = authMiddleware;
const canManage = [authMiddleware, requireRole('admin', 'institution')];
const router = express.Router();

router.get('/', async (req, res) => {
    const specialties = await Specialty.find();
    res.json(specialties);
});

router.post('/', canManage, async (req, res) => {
    const newSpecialty = new Specialty(req.body);
    await newSpecialty.save();
    res.json({ message: 'Спеціальність додано', specialty: newSpecialty });
});

module.exports = router;
