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
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
});

app.get("/groups/:courseId", async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId); 
        const groups = await Group.find({ course: courseId }).populate("specialty course");
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
});

app.get("/schedule/:groupId", async (req, res) => {
    try {
        const schedule = await Schedule.find({ group: req.params.groupId })
            .populate("group") 
            .populate("period")
            .populate("teacher")
            .populate("room", "name") 
            .populate("dayOfWeek");

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
});



app.use("/api/rooms", authMiddleware, require("./routes/roomsRoutes"));
app.use("/users",authMiddleware, usersRoutes)
app.use('/api/schedule', scheduleRoutes);
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/specialties', authMiddleware, specialtyRoutes);
app.use('/api/periods', authMiddleware, periodRoutes);
app.use('/auth', authRoutes);
app.use("/courses", authMiddleware, courseRoutes);
app.use('/api', weekdayRoute);
app.use("/api/requests", authMiddleware, requestRoutes);
app.use('/teachers', authMiddleware, teacherRoutes);

connectDB();

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер відкрито на порту: ${PORT}`);
});