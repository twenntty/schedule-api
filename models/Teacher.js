const { Schema, model } = require('mongoose');

const teacherSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String, required: true },
  institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  userAccount: { type: Schema.Types.ObjectId, ref: 'User' },
  // Disciplines the teacher can teach and can substitute (replace) for.
  subjectsCanTeach: [{ type: Schema.Types.ObjectId, ref: 'Discipline' }],
  subjectsCanReplace: [{ type: Schema.Types.ObjectId, ref: 'Discipline' }],
});

teacherSchema.virtual('fullName').get(function() {
  return `${this.lastName} ${this.firstName} ${this.middleName}`;
});

teacherSchema.set('toJSON', {
  virtuals: true
});

module.exports = model('Teacher', teacherSchema);