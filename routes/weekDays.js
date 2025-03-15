const express = require("express");
const moment = require("moment");
const router = express.Router();

// Локальная база данных, где дни недели сопоставляются с их ID
const weekDaysDb = {
  "Monday": "1", // Понеділок
  "Tuesday": "2", // Вівторок
  "Wednesday": "3", // Середа
  "Thursday": "4", // Четвер
  "Friday": "5", // Пʼятниця
  "Saturday": "6", // Субота
  "Sunday": "7" // Неділя
};

// API для получения дня недели по дате
router.get("/weekday", (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Не указана дата." });
  }

  try {
    // Преобразуем строку в дату и получаем день недели на английском
    const dayOfWeek = moment(date).format('dddd'); // Пример: "Monday"
    
    // Получаем ID дня недели из базы
    const weekDayId = weekDaysDb[dayOfWeek];

    // Если ID найден, отправляем его, иначе возвращаем ошибку
    if (weekDayId) {
      res.json({ weekDayId, dayOfWeek }); // Отправляем ID и день недели
    } else {
      res.status(500).json({ error: "Не удалось найти ID для дня недели." });
    }
  } catch (err) {
    res.status(500).json({ error: "Ошибка обработки даты." });
  }
});

module.exports = router;
