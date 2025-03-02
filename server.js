require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const scheduleRoutes = require('./routes/scheduleRoutes');
const groupRoutes = require('./routes/groupRoutes');
const specialtyRoutes = require('./routes/specialtyRoutes');
const periodRoutes = require('./routes/periodRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();
app.use(express.json());

// Подключаем маршруты
app.use('/schedule', scheduleRoutes);
app.use('/groups', groupRoutes);
app.use('/specialties', specialtyRoutes);
app.use('/periods', periodRoutes);
app.use('/auth', authRoutes);

// Подключение к базе данных
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});