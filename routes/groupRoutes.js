const express = require('express');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/auth');
const { requireRole, scopeInstitution } = authMiddleware;
const canManage = [authMiddleware, requireRole('admin', 'institution')];
const router = express.Router();


router.get('/count', async (req, res) => {
  try {
    const inst = scopeInstitution(req);
    const count = await Group.countDocuments(inst ? { institution: inst } : {});
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Получить все группы с курсом и специальностью
router.get('/', async (req, res) => {
    try {
        const inst = scopeInstitution(req);
        const groups = await Group.find(inst ? { institution: inst } : {}).populate('specialty').populate('course');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Помилка при створенні групи' });
    }
});

// Создать новую группу
router.post('/', canManage, async (req, res) => {
    try {
        const { name, course, specialty } = req.body;
        if (!name || !course || !specialty) {
            return res.status(400).json({ message: 'Заповніть назву, курс і спеціальність' });
        }
        const newGroup = new Group({ name, course, specialty, institution: req.user.institution });
        await newGroup.save();
        res.json({ message: 'Групу створенно', group: newGroup });
    } catch (error) {
        res.status(500).json({ message: 'Помилка при створенні групи' });
    }
});


// Удалить группу по ID
router.delete('/:id', canManage, async (req, res) => {
    try {
        const deletedGroup = await Group.findOneAndDelete({ _id: req.params.id, institution: req.user.institution });
        if (!deletedGroup) {
            return res.status(404).json({ message: 'Групу не знайдено' });
        }
        res.json({ message: 'Групу видалено', group: deletedGroup });
    } catch (error) {
        res.status(500).json({ message: 'Помилка пр видаленні пари' });
    }
});

module.exports = router;
