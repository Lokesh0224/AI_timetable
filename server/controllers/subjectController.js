const Subject = require('../models/Subject');

exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find()
      .populate('facultyId', 'name email departmentId')
      .populate('departmentId', 'name code')
      .populate('programId', 'name')
      .populate('sectionId', 'name year')
      .sort({ createdAt: -1 });
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
    const populated = await Subject.findById(subject._id).populate(['facultyId', 'departmentId', 'programId', 'sectionId']);
    res.status(201).json(populated);
  } catch (error) { next(error); }
};

exports.addSubjectBulk = async (req, res, next) => {
  try {
    const { sectionIds, code, name, facultyId, departmentId, programId, year, hoursPerWeek } = req.body;
    
    // Fetch sections to get names for appending to code
    const Section = require('../models/Section');
    const sections = await Section.find({ _id: { $in: sectionIds } });
    
    const subjects = [];
    for (const sec of sections) {
      subjects.push({
        name,
        code: `${code}-${sec.name}`,
        facultyId,
        departmentId,
        programId,
        year,
        sectionId: sec._id,
        hoursPerWeek
      });
    }

    const created = await Subject.insertMany(subjects);
    res.status(201).json(created);
  } catch (error) { next(error); }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const existing = await Subject.findOne({ code: req.body.code, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ message: 'Subject code already in use' });
    
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(['facultyId', 'departmentId', 'programId', 'sectionId']);
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
