const mongoose = require('mongoose');
const express = require('express');
const Schedule = require('../models/Schedule');
const Group = require('../models/Group');
const Teacher = require('../models/Teacher');
const Period = require('../models/Period');
const Room = require('../models/Room');
const Course = require('../models/Course');
const Specialty = require('../models/Specialty');
const router = express.Router();
const ical = require('ical-generator').default;
const moment = require('moment');
const ExcelJS = require('exceljs');

const populateFields = [
    { path: 'group', populate: { path: 'specialty' } },
    { path: 'teacher', select: 'name' },
    { path: 'period', select: 'name startTime endTime' },
    { path: 'room', select: 'name' },
    { path: 'course', select: 'name' },
    { path: 'specialty', select: 'name' }
];

// ➜ Получить ВСЁ расписание
router.get('/', async (req, res) => {
    try {
        const schedules = await Schedule.find().populate(populateFields);
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
});

// ➜ Получить расписание по ГРУППЕ
router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const schedules = await Schedule.find({ group: groupId }).populate(populateFields);
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
});

router.get('/group/:groupId/export-week.ics', async (req, res) => {
  try {
    const { groupId } = req.params;

    const monday = moment().startOf('isoWeek');
    const sunday = moment().endOf('isoWeek'); 

    const schedules = await Schedule.find({
      group: groupId,
      date: { $gte: monday.toDate(), $lte: sunday.toDate() }
    })
    .populate(populateFields);

    const cal = ical({ name: `ScheduleGroup ${groupId} (${monday.format('DD.MM')}–${sunday.format('DD.MM')})`, timezone: 'Europe/Kyiv' });

    schedules.forEach(item => {
      const startTime = moment(item.date).set({
        hour: moment(item.period.startTime, 'HH:mm').hour(),
        minute: moment(item.period.startTime, 'HH:mm').minute()
      });

      const endTime = moment(item.date).set({
        hour: moment(item.period.endTime, 'HH:mm').hour(),
        minute: moment(item.period.endTime, 'HH:mm').minute()
      });

      cal.createEvent({
        id: item._id.toString(),
        start: startTime.toDate(),
        end: endTime.toDate(),
        summary: `${item.lessonType}: ${item.subject}`,
        description: `Викладач: ${item.teacher.fullName}`,
        location: item.room ? item.room.name : 'Кабінет не вказаний'
      });
    });

        res.setHeader('Content-Disposition', `attachment; filename="schedule_${groupId}_${monday.format('YYYYMMDD')}.ics"`);
        res.setHeader('Content-Type', 'text/calendar');
        return res.send(cal.toString());

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка генерації', error: err.message });
  }
});

// ➜ Получить расписание по ДНЮ НЕДЕЛИ и ГРУППЕ
router.get('/group/:groupId/day/:dayOfWeek', async (req, res) => {
    try {
        const { groupId, dayOfWeek } = req.params;
        const schedules = await Schedule.find({ group: groupId, dayOfWeek }).populate(populateFields);
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
});

router.get('/teacher/:teacherId', async (req, res) => {
    try {
      const { teacherId } = req.params;
      const schedules = await Schedule.find({ teacher: teacherId })
        .populate(populateFields);
      
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
  });

router.get('/group/:groupId/export-week.xlsx', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { weekStart } = req.query;

    const monday = weekStart
      ? moment.utc(weekStart, 'YYYY-MM-DD').startOf('isoWeek')
      : moment.utc().startOf('isoWeek');
    const sunday = moment.utc(monday).endOf('isoWeek');

    const schedules = await Schedule.find({
      group: groupId,
      date: { $gte: monday.toDate(), $lte: sunday.toDate() }
    }).populate([
      { path: 'group', populate: { path: 'specialty' } },
      { path: 'teacher' },
      { path: 'period' },
      { path: 'room' },
      { path: 'course' }
    ]);

    if (!schedules.length) {
      return res.status(404).json({ message: 'Розклад для цієї групи не знайдено.' });
    }

    const periods = await Period.find().sort({ startTime: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Schedule');

    try {
      const imageId = workbook.addImage({
        filename: './public/logo.png',
        extension: 'png'
      });

      worksheet.addImage(imageId, {
        tl: { col: 0.2, row: 0.2 },
        ext: { width: 515, height: 122 }
        });
    } catch (e) {
      console.warn('⚠️ Логотип не найден или не удалось вставить:', e.message);
    }

    worksheet.addRow([]);
    worksheet.addRow([]);
        worksheet.addRow([]);
    worksheet.addRow([]);
        worksheet.addRow([]);
    worksheet.addRow([]);
        worksheet.addRow([]);
    worksheet.addRow([]);

    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    const headerRowData = ['Пара / День'];
    for (let i = 0; i < 7; i++) {
      const date = moment(monday).add(i, 'days');
      headerRowData.push(`${daysOfWeek[i]} ${date.format('DD.MM.YYYY')}`);
    }
    const tableHeaderRow = worksheet.addRow(headerRowData);

    periods.forEach(period => {
      const row = [`${period.name}\n${period.startTime}–${period.endTime}`];

      for (let i = 0; i < 7; i++) {
        const dateStr = moment(monday).add(i, 'days').format('YYYY-MM-DD');

        const pair = schedules.find(s =>
          moment(s.date).format('YYYY-MM-DD') === dateStr &&
          s.period &&
          s.period._id &&
          s.period._id.equals(period._id)
        );

        if (pair) {
          row.push(`${pair.subject} (${pair.lessonType})\n${pair.teacher?.fullName || ''}\n${pair.room?.name || ''}`);
        } else {
          row.push('');
        }
      }

      worksheet.addRow(row);
    });

    worksheet.columns.forEach((col, i) => {
      col.width = i === 0 ? 20 : 25;
    });

    worksheet.eachRow(row => {
      row.height = 40;
      row.alignment = { vertical: 'middle', wrapText: true };
    });

    tableHeaderRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DCE6F1' }
      };
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });

    for (let i = tableHeaderRow.number + 1; i <= worksheet.rowCount; i++) {
      const cell = worksheet.getCell(`A${i}`);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FCE4D6' }
      };
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    }

    worksheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    res.setHeader('Content-Disposition', `attachment; filename="schedule_week_${monday.format('YYYYMMDD')}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('❌ Помилка генерації Excel:', err);
    res.status(500).json({ message: 'Помилка генерації Excel', error: err.message });
  }
});

// ➜ Добавить новую запись в расписание
router.post('/', async (req, res) => {
    try {
        const { subject, teacher, lessonType, period, group, room, dayOfWeek, date, course, specialty } = req.body;

        // Проверяем, что все обязательные поля присутствуют
        if (!subject || !teacher || !lessonType || !period || !group || !room || !dayOfWeek || !date || !course || !specialty) {
            return res.status(400).json({ message: "Будь ласка заповніть всі поля!" });
        }

        // Проверка на валидность ObjectId
        const idsToCheck = { period, group, room, teacher, course, specialty };
        for (const [key, value] of Object.entries(idsToCheck)) {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return res.status(400).json({ message: `Неправильний ідентифікатор для ${key}` });
            }
        }

        // Проверка существования документов
        const existingDocuments = await Promise.all([
            Group.findById(group),
            Teacher.findById(teacher),
            Period.findById(period),
            Room.findById(room),
            Course.findById(course),
            Specialty.findById(specialty),
        ]);

        if (existingDocuments.some(doc => !doc)) {
            return res.status(400).json({ message: "Один або декілька документів не знайдено" });
        }

        const newSchedule = new Schedule({ subject, teacher, lessonType, period, group, room, dayOfWeek, date, course, specialty });

        await newSchedule.save();
        res.json({ message: 'Запис доданий', schedule: newSchedule });
    } catch (error) {
        console.error("Помилка при добавлені пари:", {
            message: error.message,
            stack: error.stack,
            body: req.body,
        });
        res.status(500).json({ message: "Помилка серверу", error: error.message });
    }
});

// ➜ Редактировать запись в расписании
router.put('/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { subject, teacher, lessonType, period, group, room, dayOfWeek, date, course, specialty } = req.body;

        // Проверяем, что все обязательные поля присутствуют
        if (!subject || !teacher || !lessonType || !period || !group || !room || !dayOfWeek || !date || !course || !specialty) {
            return res.status(400).json({ message: "Будь ласка заповніть всі поля!" });
        }

        // Проверка на валидность ObjectId
        const idsToCheck = { period, group, room, teacher, course, specialty };
        for (const [key, value] of Object.entries(idsToCheck)) {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return res.status(400).json({ message: `Неправильний ідентифікатор для ${key}` });
            }
        }

        // Проверка существования документов
        const existingDocuments = await Promise.all([
            Group.findById(group),
            Teacher.findById(teacher),
            Period.findById(period),
            Room.findById(room),
            Course.findById(course),
            Specialty.findById(specialty),
        ]);

        if (existingDocuments.some(doc => !doc)) {
            return res.status(400).json({ message: "Один або декілька документів не знайдено" });
        }

        // Обновляем расписание
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            { subject, teacher, lessonType, period, group, room, dayOfWeek, date, course, specialty },
            { new: true } // Возвращает обновленный документ
        ).populate(populateFields);

        if (!updatedSchedule) {
            return res.status(404).json({ message: "Запис розкладу не знайдено" });
        }

        res.json({ message: "Пару оновлено", schedule: updatedSchedule });
    } catch (error) {
        console.error("Помилка при редагуванні пари:", {
            message: error.message,
            stack: error.stack,
            body: req.body,
        });
        res.status(500).json({ message: "Помилка серверу", error: error.message });
    }
});

// ➜ Удалить запись из расписания
router.delete('/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;

        // Удаляем расписание
        const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);

        if (!deletedSchedule) {
            return res.status(404).json({ message: "Запис розкалду не знайдено" });
        }

        res.json({ message: "Запис видалено" });
    } catch (error) {
        console.error("Помилка при видалені пари:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ message: "Помилка серверу", error: error.message });
    }
});


module.exports = router;