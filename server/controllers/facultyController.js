const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const TimetableEntry = require('../models/Timetable');

exports.getFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.find().sort({ createdAt: -1 });
    res.json(faculty);
  } catch (error) { next(error); }
};

exports.getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty);
  } catch (error) { next(error); }
};

exports.addFaculty = async (req, res, next) => {
  try {
    const existing = await Faculty.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: 'A faculty member with this email already exists' });
    const faculty = await Faculty.create(req.body);
    res.status(201).json(faculty);
  } catch (error) { next(error); }
};

exports.updateFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty);
  } catch (error) { next(error); }
};

exports.deleteFaculty = async (req, res, next) => {
  try {
    const subjects = await Subject.countDocuments({ facultyId: req.params.id });
    if (subjects > 0) {
      return res.status(400).json({ message: `Cannot delete. This faculty has ${subjects} subjects assigned. Remove them first.`});
    }
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json({ message: 'Faculty deleted' });
  } catch (error) { next(error); }
};

exports.getFacultyTimetable = async (req, res, next) => {
  try {
    const entries = await TimetableEntry.find({ facultyId: req.params.id }).populate('subjectId');
    res.json(entries);
  } catch (error) { next(error); }
};
