const Department = require('../models/Department');
const Program = require('../models/Program');

exports.getAll = async (req, res, next) => {
  try {
    const deps = await Department.find().sort({ createdAt: -1 });
    res.json(deps);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const dep = new Department(req.body);
    await dep.save();
    res.status(201).json(dep);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const dep = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(dep);
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const relatedPrograms = await Program.countDocuments({ departmentId: req.params.id });
    if (relatedPrograms > 0) {
      return res.status(400).json({ message: "Remove all programs under this department first" });
    }
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) { next(err); }
};
