const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  availableDays: [{ 
    type: String, 
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday'] 
  }],
  availableSlots: {
    type: Map,
    of: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
