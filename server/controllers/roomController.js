const Room = require('../models/Room');

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) { next(error); }
};

exports.addRoom = async (req, res, next) => {
  try {
    const existing = await Room.findOne({ name: req.body.name });
    if (existing) return res.status(400).json({ message: 'Room name already exists' });
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) { next(error); }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const existing = await Room.findOne({ name: req.body.name, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ message: 'Room name already in use' });
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) { next(error); }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (error) { next(error); }
};
