const Section = require('../models/Section');
const Subject = require('../models/Subject');

exports.getAll = async (req, res, next) => {
  try {
    const secs = await Section.find()
      .populate('departmentId')
      .populate('programId')
      .sort({ departmentId: 1, programId: 1, year: 1, name: 1 });
    res.json(secs);
  } catch (err) { next(err); }
};

exports.getByProgram = async (req, res, next) => {
  try {
    const secs = await Section.find({ programId: req.params.programId }).sort({ year: 1, name: 1 });
    res.json(secs);
  } catch (err) { next(err); }
};

exports.getByProgramAndYear = async (req, res, next) => {
  try {
    const secs = await Section.find({ 
      programId: req.params.programId, 
      year: req.params.year 
    }).sort({ name: 1 });
    res.json(secs);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const sec = new Section(req.body);
    await sec.save();
    const populated = await sec.populate(['departmentId', 'programId']);
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

exports.createBulk = async (req, res, next) => {
  try {
    const { departmentId, programId, year, count } = req.body;
    if (count > 26) return res.status(400).json({ message: "Max 26 sections allowed" });
    
    // Determine the next available character
    const existing = await Section.find({ programId, year });
    let nextChar = 65; // 'A'
    if (existing.length > 0) {
        const charCodes = existing.map(e => e.name.charCodeAt(0));
        nextChar = Math.max(...charCodes) + 1;
    }

    const sections = [];
    for (let i = 0; i < count; i++) {
      const name = String.fromCharCode(nextChar + i);
      sections.push({
        name,
        departmentId,
        programId,
        year,
        studentCount: 60
      });
    }
    
    const created = await Section.insertMany(sections);
    res.status(201).json({ message: "Sections created", count: created.length });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const sec = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['departmentId', 'programId']);
    res.json(sec);
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const relatedSubjects = await Subject.countDocuments({ sectionId: req.params.id });
    if (relatedSubjects > 0) {
      return res.status(400).json({ message: "Remove assigned subjects first" });
    }
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: "Section deleted" });
  } catch (err) { next(err); }
};
