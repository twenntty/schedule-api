const express = require('express');
const Specialty = require('../models/Specialty');
const authMiddleware = require('../middleware/auth');
const { requireRole, scopeInstitution } = authMiddleware;
const canManage = [authMiddleware, requireRole('admin', 'institution')];
const router = express.Router();

router.get('/', async (req, res) => {
    const inst = scopeInstitution(req);
    const specialties = await Specialty.find(inst ? { institution: inst } : {});
    res.json(specialties);
});

router.post('/', canManage, async (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Вкажіть назву спеціальності' });
    }
    const newSpecialty = new Specialty({ name: name.trim(), institution: req.user.institution });
    await newSpecialty.save();
    res.json({ message: 'Спеціальність додано', specialty: newSpecialty });
});

module.exports = router;
