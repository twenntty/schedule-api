const express = require('express');
const Teacher = require('../models/Teacher'); // Подключаем модель преподавателя
const router = express.Router();

// ➜ Получить всех преподавателей
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find(); // Извлекаем всех преподавателей
    res.status(200).json(teachers); // Отправляем список преподавателей
  } catch (err) {
    res.status(500).json({ error: err.message }); // Ошибка на сервере
  }
});

// ➜ Создать нового преподавателя
router.post('/', async (req, res) => {
  try {
    const teacher = new Teacher(req.body); // Создаем нового преподавателя из данных тела запроса
    await teacher.save(); // Сохраняем нового преподавателя в базе данных
    res.status(201).json(teacher); // Отправляем созданного преподавателя в ответ
  } catch (err) {
    res.status(400).json({ error: err.message }); // Ошибка при создании преподавателя
  }
});

// ➜ Удалить преподавателя по ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Teacher.findByIdAndDelete(req.params.id); // Находим и удаляем преподавателя по ID
    if (!result) {
      return res.status(404).json({ message: 'Викладача не знайдено' }); // Если преподаватель не найден
    }
    res.status(200).json({ message: 'Викладач видалений' }); // Подтверждение об удалении
  } catch (err) {
    res.status(500).json({ error: err.message }); // Ошибка на сервере
  }
});

module.exports = router;
