const express = require("express");
const weekDays = require("../data/weekDays");

const router = express.Router();

// ➜ Получить список всех дней недели
router.get("/", (req, res) => {
    res.json(weekDays);
});

module.exports = router;