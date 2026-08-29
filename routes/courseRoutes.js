const express = require("express");
const Course = require("../models/Course"); // Импорт модели курса
const authMiddleware = require("../middleware/auth");
const { requireRole } = authMiddleware;
const canManage = [authMiddleware, requireRole("admin", "institution")];

const router = express.Router();

// Получить все курсы
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
});

// Получить курсы по ID специальности
router.get("/:specialtyId", async (req, res) => {
    try {
        const courses = await Course.find({ specialty: req.params.specialtyId });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
});

// Создать курс
router.post("/", canManage, async (req, res) => {
    try {
        const { name, specialty } = req.body;
        const newCourse = new Course({ name, specialty });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: "Помилка при створенні курсу", error: error.message });
    }
});

router.delete("/:id", canManage, async (req, res) => {
    try {
        const result = await Course.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Курс не знайдено" });
        }
        res.status(200).json({ message: "Курс видалений" });
    } catch (error) {
        res.status(500).json({ message: "Помилка при видалені курсу", error: error.message });
    }
});

module.exports = router;