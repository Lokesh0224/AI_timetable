const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  durationYears: { type: Number, required: true, default: 4 },
}, { timestamps: true });

module.exports = mongoose.model('Program', ProgramSchema);
