const TimetableEntry = require('../models/Timetable');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Room = require('../models/Room');
const { generateTimetable } = require('../scheduler/generateTimetable');
const { Parser } = require('json2csv');

exports.getTimetable = async (req, res, next) => {
  try {
    const timetable = await TimetableEntry.find()
      .populate('subjectId')
      .populate('facultyId', 'name')
      .sort({ day: 1, timeSlot: 1 });
    res.json(timetable);
  } catch (error) { next(error); }
};

exports.getTimetableByYear = async (req, res, next) => {
  try {
    const timetable = await TimetableEntry.find({ year: req.params.year })
      .populate('subjectId')
      .populate('facultyId', 'name');
    res.json(timetable);
  } catch (error) { next(error); }
};

exports.getTimetableByFaculty = async (req, res, next) => {
  try {
    const timetable = await TimetableEntry.find({ facultyId: req.params.id })
      .populate('subjectId')
      .populate('facultyId', 'name');
    res.json(timetable);
  } catch (error) { next(error); }
};

exports.getTimetableByDay = async (req, res, next) => {
  try {
    const timetable = await TimetableEntry.find({ day: req.params.day })
      .populate('subjectId')
      .populate('facultyId', 'name');
    res.json(timetable);
  } catch (error) { next(error); }
};

exports.generate = async (req, res, next) => {
  try {
    const subjects = await Subject.find();
    const faculties = await Faculty.find();
    const rooms = await Room.find();

    if (rooms.length === 0) return res.status(400).json({ message: 'No rooms available. Please add at least one room.' });
    if (subjects.length === 0) return res.status(400).json({ message: 'No subjects available.' });
    if (faculties.length === 0) return res.status(400).json({ message: 'No faculty available.' });

    let totalAvailableSlotsCount = 0;
    const facultyMap = {};
    for (const f of faculties) {
      facultyMap[f._id.toString()] = f;
      // manual total count
      for (const day of f.availableDays) {
        if (f.availableSlots.has(day)) {
          totalAvailableSlotsCount += f.availableSlots.get(day).length;
        }
      }
    }

    const totalSessionsNeeded = subjects.reduce((acc, sub) => acc + sub.hoursPerWeek, 0);

    if (totalAvailableSlotsCount < totalSessionsNeeded) {
      return res.status(400).json({ 
        message: `Not enough slots. Need ${totalSessionsNeeded} sessions but only ${totalAvailableSlotsCount} slots available across all faculty.` 
      });
    }

    // Run scheduler
    const { timetable, warnings } = generateTimetable(subjects, facultyMap, rooms);

    // Save to DB
    await TimetableEntry.deleteMany({}); // clear old
    await TimetableEntry.insertMany(timetable);

    res.json({ message: 'Timetable generated successfully', scheduled: timetable.length, warnings });
  } catch (error) { next(error); }
};

exports.clearTimetable = async (req, res, next) => {
  try {
    await TimetableEntry.deleteMany({});
    res.json({ message: 'Timetable cleared' });
  } catch (error) { next(error); }
};

function downloadCSV(res, entries, filename) {
  const fields = ['day', 'timeSlot', 'year', 'subject', 'code', 'faculty', 'room'];
  const data = entries.map(e => ({
    day: e.day,
    timeSlot: e.timeSlot,
    year: e.year,
    subject: e.subjectId?.name || '',
    code: e.subjectId?.code || '',
    faculty: e.facultyId?.name || '',
    room: e.room
  }));
  const parser = new Parser({ fields });
  const csv = parser.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment(filename);
  return res.send(csv);
}

exports.exportFullCSV = async (req, res, next) => {
  try {
    const entries = await TimetableEntry.find().populate('subjectId').populate('facultyId');
    downloadCSV(res, entries, 'full_timetable.csv');
  } catch (error) { next(error); }
};

exports.exportYearCSV = async (req, res, next) => {
  try {
    const entries = await TimetableEntry.find({ year: req.params.year }).populate('subjectId').populate('facultyId');
    downloadCSV(res, entries, `timetable_year_${req.params.year}.csv`);
  } catch (error) { next(error); }
};

exports.getStats = async (req, res, next) => {
  try {
    const facultyCount = await Faculty.countDocuments();
    const subjectCount = await Subject.countDocuments();
    const roomCount = await Room.countDocuments();

    const subjects = await Subject.find({}, 'hoursPerWeek');
    const totalSessionsNeeded = subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0);

    const faculties = await Faculty.find({}, 'availableDays availableSlots');
    let totalAvailableSlots = 0;
    for (const f of faculties) {
      for (const day of f.availableDays) {
        if (f.availableSlots.has(day)) {
          totalAvailableSlots += f.availableSlots.get(day).length;
        }
      }
    }

    res.json({
      facultyCount,
      subjectCount,
      roomCount,
      totalSessionsNeeded,
      totalAvailableSlots,
      readyToGenerate: facultyCount > 0 && subjectCount > 0 && roomCount > 0 && (totalAvailableSlots >= totalSessionsNeeded)
    });
  } catch (error) { next(error); }
};
