const express = require('express');
const Teacher = require('../models/Teacher');
const Schedule = require('../models/Schedule');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save(); 
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Teacher.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Викладача не знайдено' }); 
    }
    res.status(200).json({ message: 'Викладач видалений' }); 
  } catch (err) {
    res.status(500).json({ error: err.message }); 
  }
});

router.get('/with-hours', async (req, res) => {
  try {
    const teachersWithHours = await Teacher.aggregate([
      {
        $lookup: {
          from: "schedules",
          localField: "_id",
          foreignField: "teacher",
          as: "schedules"
        }
      },
      {
        $addFields: {
          hours: { $size: "$schedules" }
        }
      },
      {
        $project: {
          schedules: 0
        }
      }
    ]);

    res.json(teachersWithHours);
  } catch (error) {
    console.error('Ошибка агрегации:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
