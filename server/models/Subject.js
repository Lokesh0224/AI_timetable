const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  year: { type: Number, required: true, enum: [1, 2, 3, 4] },
  hoursPerWeek: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
