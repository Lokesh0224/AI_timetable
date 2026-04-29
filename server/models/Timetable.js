const mongoose = require('mongoose');

const TimetableEntrySchema = new mongoose.Schema({
  subjectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  facultyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  programId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  year:         { type: Number, enum: [1, 2, 3, 4, 5] },
  sectionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  day:          { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
  timeSlot:     { type: String },
  room:         { type: String },
  priority:     { type: Number, enum: [1, 2, 3], default: 1 },
  hasConflict:  { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('TimetableEntry', TimetableEntrySchema);
