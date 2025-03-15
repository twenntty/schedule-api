const { Schema, model } = require('mongoose');

const teacherSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String, required: true },
});

// Виртуальное поле для fullName, которое будет объединять firstName, lastName и middleName
teacherSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName} ${this.middleName}`;
});

// Это нужно, чтобы виртуальные поля работали при сериализации в JSON
teacherSchema.set('toJSON', {
  virtuals: true
});

module.exports = model('Teacher', teacherSchema);