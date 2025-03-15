require('dotenv').config();
const mongoose = require("mongoose");
const express = require('express');
const connectDB = require('./config/db');
const scheduleRoutes = require('./routes/scheduleRoutes');
const groupRoutes = require('./routes/groupRoutes');
const specialtyRoutes = require('./routes/specialtyRoutes');
const periodRoutes = require('./routes/periodRoutes');
const authRoutes = require('./routes/authRoutes');
const Specialty = require("./models/Specialty");
const Group = require("./models/Group");
const Course = require("./models/Course");
const courseRoutes = require("./routes/courseRoutes");
const Schedule = require("./models/Schedule"); 
const usersRoutes = require("./routes/usersRoutes");
const authMiddleware = require("./middleware/auth");
const weekdayRoute = require('./routes/weekDays');
const requestRoutes = require("./routes/requestRoutes");
const teacherRoutes = require('./routes/teacherRoutes');

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

app.get("/specialties", async (req, res) => {
    const specialties = await Specialty.find();
    res.json(specialties);
});

app.get("/courses/:specialtyId", async (req, res) => {
    try {
        const courses = await Course.find({ specialty: req.params.specialtyId });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

app.get("/groups/:courseId", async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId); // Приводим к ObjectId
        const groups = await Group.find({ course: courseId }).populate("specialty course");
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});

app.get("/schedule/:groupId", async (req, res) => {
    try {
        const schedule = await Schedule.find({ group: req.params.groupId })
            .populate("group") // Подтягиваем инфо о группе
            .populate("period") // Подтягиваем время
            .populate("teacher")
            .populate("room", "name")  // Подтягиваем информацию о кабинете (только имя)
            .populate("dayOfWeek"); // Подтягиваем преподавателя

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});



app.use("/api/rooms", authMiddleware, require("./routes/roomsRoutes"));
app.use("/users", usersRoutes)
app.use('/api/schedule', scheduleRoutes);
app.use('/api/groups', groupRoutes);
app.use('/specialties', specialtyRoutes);
app.use('/api/periods', periodRoutes);
app.use('/auth', authRoutes);
app.use("/courses", courseRoutes);
app.use('/api', weekdayRoute);
app.use("/api/requests", requestRoutes);
app.use('/teachers', teacherRoutes);

// Подключение к базе данных
connectDB();

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});