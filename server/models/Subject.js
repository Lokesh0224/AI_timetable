const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  year: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  hoursPerWeek: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
