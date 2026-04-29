const Subject = require('../models/Subject');

exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().populate('facultyId', 'name email department').sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) { next(error); }
};

exports.getSubjectsByYear = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ year: req.params.year }).populate('facultyId', 'name email');
    res.json(subjects);
  } catch (error) { next(error); }
};

exports.addSubject = async (req, res, next) => {
  try {
    const existing = await Subject.findOne({ code: req.body.code });
    if (existing) return res.status(400).json({ message: 'Subject code already in use' });
    const subject = await Subject.create(req.body);
    const populated = await Subject.findById(subject._id).populate('facultyId', 'name');
    res.status(201).json(populated);
  } catch (error) { next(error); }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const existing = await Subject.findOne({ code: req.body.code, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ message: 'Subject code already in use' });
    
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('facultyId', 'name email department');
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) { next(error); }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (error) { next(error); }
};
