const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const teacherRouter = require('../routes/teacherRoutes');
const usersRouter = require('../routes/usersRoutes');
const specialtyRouter = require('../routes/specialtyRoutes');
const weekdayRouter = require('../routes/weekDays');

const app = express();
app.use(express.json());
app.use('/teachers', teacherRouter);
app.use('/users', usersRouter);
app.use('/specialties', specialtyRouter);
app.use('/api', weekdayRouter);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Teachers API', () => {
  let teacherId;

  it('POST /teachers - створити викладача', async () => {
    const res = await request(app)
      .post('/teachers')
      .send({
        firstName: 'Test',
        lastName: 'Teacher',
        middleName: 'Ivanovych'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.firstName).toBe('Test');
    teacherId = res.body._id;
  });

  it('GET /teachers/with-hours - отримати викладачів з годинами', async () => {
    const res = await request(app).get('/teachers/with-hours');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('DELETE /teachers/:id - видалити викладача', async () => {
    const teacher = new Teacher({
      firstName: 'To',
      lastName: 'Delete',
      middleName: 'Ivanovych'
    });
    await teacher.save();

    const res = await request(app).delete(`/teachers/${teacher._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Викладач видалений');
  });

  it('DELETE /teachers/:id - видалити неіснуючого викладача', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/teachers/${fakeId}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe('Users API', () => {
  it('GET /users - отримати список користувачів', async () => {
    await User.create({
      firstName: 'Test',
      lastName: 'User',
      position: 'Student',
      role: 'admin',
      email: 'test@example.com',
      password: '123456',
      phoneNumber: '+380123456789',
      educationalInstitution: 'KPI'
    });

    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });
});

describe('Specialty API', () => {
  it('GET /specialties - отримати всі спеціальності', async () => {
    await Specialty.create([{ name: 'Spec1' }, { name: 'Spec2' }]);
    const res = await request(app).get('/specialties');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('POST /specialties - додати спеціальність', async () => {
    const res = await request(app)
      .post('/specialties')
      .send({ name: 'Новий напрям' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.specialty.name).toBe('Новий напрям');
  });
});

describe('Weekday API', () => {
  it('GET /api/weekday?date=2025-05-27 - отримати день тижня', async () => {
    const res = await request(app).get('/api/weekday?date=2025-05-27');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('weekDayId');
    expect(res.body).toHaveProperty('dayOfWeek');
  });

  it('GET /api/weekday без дати - повертає помилку', async () => {
    const res = await request(app).get('/api/weekday');
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Невказана дата.');
  });
});
