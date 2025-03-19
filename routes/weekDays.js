const express = require("express");
const moment = require("moment");
const router = express.Router();

const weekDaysDb = {
  "Monday": "1", // Понеділок
  "Tuesday": "2", // Вівторок
  "Wednesday": "3", // Середа
  "Thursday": "4", // Четвер
  "Friday": "5", // Пʼятниця
  "Saturday": "6", // Субота
  "Sunday": "7" // Неділя
};

router.get("/weekday", (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Невказана дата." });
  }

  try {
    const dayOfWeek = moment(date).format('dddd');
    
    const weekDayId = weekDaysDb[dayOfWeek];

    if (weekDayId) {
      res.json({ weekDayId, dayOfWeek }); 
    } else {
      res.status(500).json({ error: "Не вдалося знайти день неділі по ID" });
    }
  } catch (err) {
    res.status(500).json({ error: "помилка обробки дати." });
  }
});

module.exports = router;
