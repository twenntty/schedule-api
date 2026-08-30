const express = require('express');
const Institution = require('../models/Institution');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Публичный список заведений (для выбора на странице расписания).
router.get('/', async (req, res) => {
  try {
    const list = await Institution.find().select('name slug').sort({ name: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Данные закладу текущего пользователя (для посилання-приглашення викладачів).
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const inst = await Institution.findById(req.user.institution)
      .select('name slug timezone registrationToken');
    if (!inst) return res.status(404).json({ message: 'Заклад не знайдено' });
    res.json(inst);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

module.exports = router;
