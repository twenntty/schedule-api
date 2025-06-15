const express = require('express');
const Group = require('../models/Group');
const router = express.Router();


const getGroupsCount = async (req, res) => {
  try {
    const count = await Group.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при подсчёте групп' });
  }
};

router.get('/count', async (req, res) => {
  try {
    const count = await Group.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// Получить все группы с курсом и специальностью
router.get('/', async (req, res) => {
    try {
        const groups = await Group.find().populate('specialty').populate('course');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Помилка при створенні групи', error: error.message });
    }
});

// Создать новую группу
router.post('/', async (req, res) => {
    try {
        const newGroup = new Group(req.body);
        await newGroup.save();
        res.json({ message: 'Групу створенно', group: newGroup });
    } catch (error) {
        res.status(500).json({ message: 'Помилка при створенні групи', error: error.message });
    }
});


// Удалить группу по ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedGroup = await Group.findByIdAndDelete(req.params.id);
        if (!deletedGroup) {
            return res.status(404).json({ message: 'Групу не знайдено' });
        }
        res.json({ message: 'Групу видалено', group: deletedGroup });
    } catch (error) {
        res.status(500).json({ message: 'Помилка пр видаленні пари', error: error.message });
    }
});

module.exports = router;
