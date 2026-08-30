const express = require('express');
const Discipline = require('../models/Discipline');
const authMiddleware = require('../middleware/auth');
const { requireRole, scopeInstitution } = authMiddleware;
const canManage = [authMiddleware, requireRole('admin', 'institution')];
const router = express.Router();

// Список дисциплін (scoped by institution)
router.get('/', async (req, res) => {
    try {
        const inst = scopeInstitution(req);
        const list = await Discipline.find(inst ? { institution: inst } : {}).sort({ name: 1 });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// Додати дисципліну
router.post('/', canManage, async (req, res) => {
    try {
        const { name, courses } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Вкажіть назву дисципліни' });

        // Sanitize courses: keep only years 1..4 with non-negative hours.
        const clean = Array.isArray(courses)
            ? courses
                .filter((c) => c && c.year >= 1 && c.year <= 4)
                .map((c) => ({ year: Number(c.year), hours: Math.max(0, Number(c.hours) || 0) }))
            : [];

        const discipline = await Discipline.create({
            name: name.trim(),
            courses: clean,
            institution: req.user.institution,
        });
        res.status(201).json(discipline);
    } catch (error) {
        res.status(400).json({ message: 'Помилка сервера' });
    }
});

// Видалити дисципліну
router.delete('/:id', canManage, async (req, res) => {
    try {
        const removed = await Discipline.findOneAndDelete({ _id: req.params.id, institution: req.user.institution });
        if (!removed) return res.status(404).json({ message: 'Дисципліну не знайдено' });
        res.json({ message: 'Дисципліну видалено' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;
