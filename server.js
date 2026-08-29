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

// Secure HTTP headers (CSP, HSTS, X-Content-Type-Options, frameguard, etc.)
const helmet = require("helmet");
app.use(helmet());

// Attach a request id used in logs and returned to clients on errors.
const crypto = require("crypto");
app.use((req, res, next) => { req.id = crypto.randomUUID(); next(); });

app.use(express.json({ limit: "100kb" }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cors = require("cors");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// Strip MongoDB operators ($, .) from body/query/params — blocks NoSQL injection.
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());

// Rate limiting: a general cap for the whole API, stricter for auth.
const rateLimit = require("express-rate-limit");
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Забагато спроб. Спробуйте пізніше." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

app.get("/specialties", async (req, res) => {
    const specialties = await Specialty.find();
    res.json(specialties);
});

app.get("/courses/:specialtyId", async (req, res) => {
    try {
        const courses = await Course.find({ specialty: req.params.specialtyId });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера" });
    }
});

app.get("/groups/:courseId", async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId); 
        const groups = await Group.find({ course: courseId }).populate("specialty course");
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера" });
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
        res.status(500).json({ message: "Помилка сервера" });
    }
});



app.use("/api/rooms", authMiddleware, require("./routes/roomsRoutes"));
app.use("/users",authMiddleware, usersRoutes)
app.use('/api/schedule', scheduleRoutes);
app.use('/api/groups', groupRoutes);
app.use('/specialties', specialtyRoutes);
app.use('/api/periods', authMiddleware, periodRoutes);
app.use('/auth', authRoutes);
app.use("/courses", courseRoutes);
app.use('/api', weekdayRoute);
app.use("/api/requests", requestRoutes);
app.use('/teachers', teacherRoutes);

// Health probe — reports DB connectivity without leaking details.
app.get("/health", (req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const state = states[mongoose.connection.readyState] || "unknown";
    res.status(state === "connected" ? 200 : 503).json({ status: "ok", db: state });
});

// Central error handler — log full detail server-side, return a generic
// message + request id to the client (never internal error text).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(`[${req.id}]`, err);
    res.status(err.status || 500).json({ message: "Помилка сервера", requestId: req.id });
});

connectDB();

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер відкрито на порту: ${PORT}`);
});