const mongoose = require('mongoose');

const TimetableEntrySchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  year: { type: Number, enum: [1, 2, 3, 4] },
  day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
  timeSlot: { type: String },
  room: { type: String },
  hasConflict: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('TimetableEntry', TimetableEntrySchema);
