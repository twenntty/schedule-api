const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Генерация JWT токена
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Регистрация пользователя
router.post('/register', [
    check('firstName', 'Имя обязательно').notEmpty(),
    check('lastName', 'Фамилия обязательна').notEmpty(),
    check('position', 'Должность обязательна').notEmpty(),
    check('email', 'Введите правильный email').isEmail(),
    check('password', 'Пароль должен быть минимум 6 символов').isLength({ min: 6 }),
    check('role', 'Выберите роль').isIn(['admin', 'institution', 'user'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, position, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Пользователь уже существует' });

        user = new User({ firstName, lastName, position, email, password, role });
        await user.save();

        res.json({ token: generateToken(user), user });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Вход в систему
router.post('/login', [
    check('email', 'Введите правильный email').isEmail(),
    check('password', 'Введите пароль').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Неверные учетные данные' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Неверные учетные данные' });

        res.json({ token: generateToken(user), user });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Проверка токена
router.get('/me', async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Нет доступа' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Токен недействителен' });
    }
});

module.exports = router;
