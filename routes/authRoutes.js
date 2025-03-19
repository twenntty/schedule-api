const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/register', [
    check('firstName', 'Імʼя обовʼязково').notEmpty().trim().escape(),
    check('lastName', 'Прізвище обовʼязково').notEmpty().trim().escape(),
    check('patronymic', 'По-батькові обовʼязково').optional().trim().escape(),
    check('position', 'Посада обовʼязково').notEmpty().trim().escape(),
    check('educationalInstitution', 'Навчальний заклад обовʼязково').notEmpty().trim().escape(),
    check('phoneNumber', 'Неправильний формат номеру телефона').matches(/^\+380\d{9}$/),
    check('email', 'Введіть правильний Email').isEmail().normalizeEmail(),
    check('password', 'Пароль повинен бути не меньше 6 символів.').isLength({ min: 6 }),
    check('role', 'Оберіть роль').isIn(['admin', 'institution', 'user'])
], async (req, res) => {
    try {
        // Валидация данных
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Деструктуризация с учетом новых полей
        const { 
            firstName,
            lastName,
            patronymic,
            position,
            educationalInstitution,
            phoneNumber,
            email,
            password,
            role 
        } = req.body;

        // Проверка уникальности email и телефона
        const existingUser = await User.findOne({ 
            $or: [{ email }, { phoneNumber }] 
        });
        
        if (existingUser) {
            const conflictField = existingUser.email === email ? 'Email' : 'Телефон';
            return res.status(409).json({ 
                message: `${conflictField} вже зареєстрований  в системі.`
            });
        }

        // Создание нового пользователя
        const user = new User({
            firstName,
            lastName,
            patronymic,
            position,
            educationalInstitution,
            phoneNumber,
            email,
            password,
            role
        });

        // Сохранение в базе данных
        await user.save();

        // Генерация токена
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Убираем пароль из ответа
        const userData = user.toObject();
        delete userData.password;

        res.status(201).json({
            message: 'Користувач зареєстрований',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Помилка реєстрації:', error);
        res.status(500).json({ 
            message: 'Помилка сервера',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Вход в систему
router.post('/login', [
    check('email', 'Введіть правильний Email').isEmail(),
    check('password', 'Введіть пароль').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Неправильні дані облікового запису' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Неправильні дані облікового запису' });

        res.json({ token: generateToken(user), user });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// Проверка токена
router.get('/me', async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Немає доступу' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Токен вже не дійсний' });
    }
});

module.exports = router;
