const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
