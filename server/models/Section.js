const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  year: { type: Number, required: true },
  studentCount: { type: Number, default: 60 }
}, { timestamps: true });

module.exports = mongoose.model('Section', SectionSchema);
