const Program = require('../models/Program');
const Section = require('../models/Section');

exports.getAll = async (req, res, next) => {
  try {
    const progs = await Program.find().populate('departmentId').sort({ createdAt: -1 });
    res.json(progs);
  } catch (err) { next(err); }
};

exports.getByDepartment = async (req, res, next) => {
  try {
    const progs = await Program.find({ departmentId: req.params.deptId }).sort({ name: 1 });
    res.json(progs);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const prog = new Program(req.body);
    await prog.save();
    const populated = await prog.populate('departmentId');
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const prog = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('departmentId');
    res.json(prog);
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const relatedSections = await Section.countDocuments({ programId: req.params.id });
    if (relatedSections > 0) {
      return res.status(400).json({ message: "Remove all sections under this program first" });
    }
    await Program.findByIdAndDelete(req.params.id);
    res.json({ message: "Program deleted" });
  } catch (err) { next(err); }
};
