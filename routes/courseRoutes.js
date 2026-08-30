const express = require("express");
const Course = require("../models/Course"); // Импорт модели курса
const authMiddleware = require("../middleware/auth");
const { requireRole, scopeInstitution } = authMiddleware;
const canManage = [authMiddleware, requireRole("admin", "institution")];

const router = express.Router();

// Получить все курсы
router.get("/", async (req, res) => {
    try {
        const inst = scopeInstitution(req);
        const courses = await Course.find(inst ? { institution: inst } : {});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// Получить курсы по ID специальности
router.get("/:specialtyId", async (req, res) => {
    try {
        const filter = { specialty: req.params.specialtyId };
        const inst = scopeInstitution(req);
        if (inst) filter.institution = inst;
        const courses = await Course.find(filter);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// Создать курс
router.post("/", canManage, async (req, res) => {
    try {
        const { name, specialty } = req.body;
        if (!name || !specialty) return res.status(400).json({ message: "Вкажіть назву і спеціальність" });
        const newCourse = new Course({ name, specialty, institution: req.user.institution });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: "Помилка при створенні курсу" });
    }
});

router.delete("/:id", canManage, async (req, res) => {
    try {
        const result = await Course.findOneAndDelete({ _id: req.params.id, institution: req.user.institution });
        if (!result) {
            return res.status(404).json({ message: "Курс не знайдено" });
        }
        res.status(200).json({ message: "Курс видалений" });
    } catch (error) {
        res.status(500).json({ message: "Помилка при видалені курсу" });
    }
});

module.exports = router;