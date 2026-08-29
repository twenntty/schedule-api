const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

const ACCESS_TTL = '15m';
const ACCESS_MAX_AGE = 15 * 60 * 1000;            // 15 minutes
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// httpOnly cookies so tokens are never exposed to JavaScript (XSS-safe).
const baseCookie = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
};

// One shared signer for the short-lived access token.
const signAccess = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });

// Issue a short access cookie + a rotating refresh token stored server-side.
const issueTokens = async (res, user) => {
    const access = signAccess(user);
    const refresh = crypto.randomBytes(40).toString('hex');
    await RefreshToken.create({
        token: refresh,
        user: user._id,
        expiresAt: new Date(Date.now() + REFRESH_MAX_AGE),
    });
    res.cookie('token', access, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
    res.cookie('refreshToken', refresh, { ...baseCookie, path: '/auth', maxAge: REFRESH_MAX_AGE });
};

const clearAuthCookies = (res) => {
    res.clearCookie('token', baseCookie);
    res.clearCookie('refreshToken', { ...baseCookie, path: '/auth' });
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
], async (req, res, next) => {
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

        await issueTokens(res, user);

        const userData = user.toObject();
        delete userData.password;

        res.status(201).json({
            message: 'Користувач зареєстрований',
            user: userData
        });

    } catch (error) {
        next(error);
    }
});

// Вход в систему
router.post('/login', [
    check('email', 'Введіть правильний Email').isEmail().normalizeEmail(),
    check('password', 'Введіть пароль').exists()
], async (req, res, next) => {
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

        await issueTokens(res, user);

        const userData = user.toObject();
        delete userData.password;
        res.json({ user: userData });
    } catch (error) {
        next(error);
    }
});

// Обновление access-токена по refresh-токену (с ротацией)
router.post('/refresh', async (req, res, next) => {
    try {
        const rt = req.cookies?.refreshToken;
        if (!rt) return res.status(401).json({ message: 'Немає доступу' });

        const stored = await RefreshToken.findOne({ token: rt });
        if (!stored || stored.revoked || stored.expiresAt < new Date()) {
            clearAuthCookies(res);
            return res.status(401).json({ message: 'Сесія недійсна' });
        }

        const user = await User.findById(stored.user);
        if (!user) {
            clearAuthCookies(res);
            return res.status(401).json({ message: 'Сесія недійсна' });
        }

        stored.revoked = true; // rotate: old refresh token is single-use
        await stored.save();
        await issueTokens(res, user);
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
});

// Выход — отзыв refresh-токена и очистка cookie
router.post('/logout', async (req, res, next) => {
    try {
        const rt = req.cookies?.refreshToken;
        if (rt) await RefreshToken.updateOne({ token: rt }, { revoked: true });
        clearAuthCookies(res);
        res.json({ message: 'Вихід виконано' });
    } catch (error) {
        next(error);
    }
});

// Проверка токена
router.get('/me', async (req, res) => {
    const token = req.cookies?.token || req.header('Authorization')?.split(' ')[1];
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
