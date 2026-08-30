const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Institution = require('../models/Institution');
const authMiddleware = require('../middleware/auth');
const { requireRole, scopeInstitution } = authMiddleware;
const { translit } = require('../utils/translit');
const canManage = [authMiddleware, requireRole('admin', 'institution')];
const router = express.Router();

const genPassword = () => crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

// Create a teacher + linked login account under an institution.
async function provisionTeacher(inst, { firstName, lastName, middleName }, rawPassword) {
  const surname = translit(lastName);
  const cap = surname.charAt(0).toUpperCase() + surname.slice(1);
  let n = 1;
  let login = `${cap}@${inst.slug}.sched.go`;
  while (await User.findOne({ login })) login = `${cap}${++n}@${inst.slug}.sched.go`;

  const generated = !rawPassword || String(rawPassword).length < 6;
  const password = generated ? genPassword() : rawPassword;

  const account = new User({
    firstName, lastName, patronymic: middleName,
    email: login.toLowerCase(), login, password,
    role: 'user', position: 'Викладач',
    educationalInstitution: inst.name, institution: inst._id,
  });
  await account.save();

  const teacher = new Teacher({ firstName, lastName, middleName, institution: inst._id, userAccount: account._id });
  await teacher.save();

  return { teacher, login, password, generated };
}

// Публичная самостоятельная регистрация викладача по посиланню-приглашению
router.post('/self-register', async (req, res) => {
  try {
    const { slug, token, firstName, lastName, middleName, password } = req.body;
    if (!slug || !token || !firstName || !lastName || !middleName) {
      return res.status(400).json({ message: 'Заповніть усі поля' });
    }
    const inst = await Institution.findOne({ slug, registrationToken: token });
    if (!inst) return res.status(403).json({ message: 'Недійсне посилання реєстрації' });

    const r = await provisionTeacher(inst, { firstName, lastName, middleName }, password);
    res.status(201).json({
      login: r.login,
      generatedPassword: r.generated ? r.password : undefined,
      institution: inst.name,
    });
  } catch (err) {
    res.status(400).json({ message: 'Помилка сервера' });
  }
});

// Список викладачів (scoped by institution)
router.get('/', async (req, res) => {
  try {
    const inst = scopeInstitution(req);
    const teachers = await Teacher.find(inst ? { institution: inst } : {});
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// Добавить викладача + автоматически создать ему аккаунт
router.post('/', canManage, async (req, res) => {
  try {
    const { firstName, lastName, middleName } = req.body;
    if (!firstName || !lastName || !middleName) {
      return res.status(400).json({ message: 'Вкажіть прізвище, імʼя та по батькові' });
    }

    const inst = await Institution.findById(req.user.institution);
    if (!inst) return res.status(400).json({ message: 'Заклад не знайдено' });

    const r = await provisionTeacher(inst, { firstName, lastName, middleName });
    // Password is returned ONCE so the representative can pass it on.
    res.status(201).json({ teacher: r.teacher, account: { login: r.login, password: r.password } });
  } catch (err) {
    res.status(400).json({ message: "Помилка сервера" });
  }
});

// Оновити викладача (ФІО + дисципліни, які може вести/заміняти)
router.put('/:id', canManage, async (req, res) => {
  try {
    const { firstName, lastName, middleName, subjectsCanTeach, subjectsCanReplace } = req.body;
    const update = {};
    if (firstName) update.firstName = firstName;
    if (lastName) update.lastName = lastName;
    if (middleName) update.middleName = middleName;
    if (Array.isArray(subjectsCanTeach)) update.subjectsCanTeach = subjectsCanTeach;
    if (Array.isArray(subjectsCanReplace)) update.subjectsCanReplace = subjectsCanReplace;

    const teacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, institution: req.user.institution },
      update,
      { new: true }
    );
    if (!teacher) return res.status(404).json({ message: 'Викладача не знайдено' });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ message: 'Помилка сервера' });
  }
});

// Удалить викладача (+ его аккаунт)
router.delete('/:id', canManage, async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndDelete({ _id: req.params.id, institution: req.user.institution });
    if (!teacher) return res.status(404).json({ message: 'Викладача не знайдено' });
    if (teacher.userAccount) await User.findByIdAndDelete(teacher.userAccount);
    res.status(200).json({ message: 'Викладач видалений' });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

router.get('/with-hours', async (req, res) => {
  try {
    const inst = scopeInstitution(req);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const pipeline = [];
    if (inst) pipeline.push({ $match: { institution: new mongoose.Types.ObjectId(inst) } });
    pipeline.push(
      {
        $lookup: {
          from: "schedules",
          let: { teacherId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$teacher", "$$teacherId"] },
                    { $gte: ["$date", firstDayOfMonth] },
                    { $lt: ["$date", firstDayOfNextMonth] }
                  ]
                }
              }
            }
          ],
          as: "schedules"
        }
      },
      { $addFields: { monthlyHours: { $size: "$schedules" } } },
      { $project: { schedules: 0 } }
    );

    const teachersWithMonthlyHours = await Teacher.aggregate(pipeline);
    res.json(teachersWithMonthlyHours);
  } catch (error) {
    console.error('Ошибка агрегации:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

module.exports = router;
