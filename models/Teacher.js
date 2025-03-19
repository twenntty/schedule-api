const { Schema, model } = require('mongoose');

const teacherSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String, required: true },
});

teacherSchema.virtual('fullName').get(function() {
  return `${this.lastName} ${this.firstName} ${this.middleName}`;
});

teacherSchema.set('toJSON', {
  virtuals: true
});

module.exports = model('Teacher', teacherSchema);