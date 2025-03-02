const express = require("express");
const User = require("../models/User"); // Импортируем модель пользователя
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const users = await User.find({}, "firstName lastName position role"); // Получаем только нужные поля
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

module.exports = router;
