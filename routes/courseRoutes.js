const express = require("express");
const Course = require("../models/Course"); // Импорт модели курса

const router = express.Router();

router.get("/:specialtyId", async (req, res) => {
    try {
        const courses = await Course.find({ specialty: req.params.specialtyId });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, specialty } = req.body;
        const newCourse = new Course({ name, specialty });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при создании курса", error: error.message });
    }
});

module.exports = router;
