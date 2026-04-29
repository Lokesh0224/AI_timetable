const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  availability: [
    {
      day:      { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
      timeSlot: { type: String },
      priority: { type: Number, enum: [1, 2, 3], required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
