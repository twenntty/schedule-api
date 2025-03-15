const express = require('express');
const Group = require('../models/Group');
const router = express.Router();

// Получить все группы с курсом и специальностью
router.get('/', async (req, res) => {
    try {
        const groups = await Group.find().populate('specialty').populate('course');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении групп', error: error.message });
    }
});

// Создать новую группу
router.post('/', async (req, res) => {
    try {
        const newGroup = new Group(req.body);
        await newGroup.save();
        res.json({ message: 'Группа добавлена', group: newGroup });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при создании группы', error: error.message });
    }
});

// Удалить группу по ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedGroup = await Group.findByIdAndDelete(req.params.id);
        if (!deletedGroup) {
            return res.status(404).json({ message: 'Группа не найдена' });
        }
        res.json({ message: 'Группа удалена', group: deletedGroup });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении группы', error: error.message });
    }
});

module.exports = router;
