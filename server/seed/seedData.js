const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('../models/Department');
const Program = require('../models/Program');
const Section = require('../models/Section');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Room = require('../models/Room');
const TimetableEntry = require('../models/Timetable');

dotenv.config({ path: `${__dirname}/../.env` });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => { console.error('Connection error:', err); process.exit(1); });

const departmentsData = [
  { name: "Computer Science Engineering", code: "CSE" },
  { name: "Information Technology",       code: "IT"  },
  { name: "Mechanical Engineering",       code: "MECH"}
];

const programsData = [
  { name: "B.Tech", department: "CSE",  durationYears: 4 },
  { name: "B.Sc",   department: "CSE",  durationYears: 3 },
  { name: "M.Tech", department: "CSE",  durationYears: 2 },
  { name: "B.Tech", department: "IT",   durationYears: 4 },
  { name: "B.Tech", department: "MECH", durationYears: 4 }
];

const sectionsData = [
  // CSE B.Tech Year 3 — 4 sections
  { dept: "CSE", program: "B.Tech", year: 3, section: "A", students: 65 },
  { dept: "CSE", program: "B.Tech", year: 3, section: "B", students: 60 },
  { dept: "CSE", program: "B.Tech", year: 3, section: "C", students: 58 },
  { dept: "CSE", program: "B.Tech", year: 3, section: "D", students: 55 },

  // CSE B.Tech Year 2 — 3 sections
  { dept: "CSE", program: "B.Tech", year: 2, section: "A", students: 70 },
  { dept: "CSE", program: "B.Tech", year: 2, section: "B", students: 68 },
  { dept: "CSE", program: "B.Tech", year: 2, section: "C", students: 65 },

  // IT B.Tech Year 3 — 2 sections
  { dept: "IT", program: "B.Tech", year: 3, section: "A", students: 60 },
  { dept: "IT", program: "B.Tech", year: 3, section: "B", students: 55 }
];

const facultyData = [
  { name: "Dr. Priya Sharma",  email: "priya@college.edu",  dept: "CSE",
    availability: [
      { day: "Monday",    timeSlot: "9AM",  priority: 1 },
      { day: "Monday",    timeSlot: "10AM", priority: 1 },
      { day: "Wednesday", timeSlot: "2PM",  priority: 2 },
      { day: "Wednesday", timeSlot: "3PM",  priority: 2 },
      { day: "Friday",    timeSlot: "9AM",  priority: 3 },
      { day: "Friday",    timeSlot: "10AM", priority: 3 },
    ]
  },
  { name: "Prof. Ravi Kumar",  email: "ravi@college.edu",   dept: "CSE",
    availability: [
      { day: "Tuesday",   timeSlot: "9AM",  priority: 1 },
      { day: "Tuesday",   timeSlot: "10AM", priority: 1 },
      { day: "Tuesday",   timeSlot: "2PM",  priority: 1 },
      { day: "Thursday",  timeSlot: "9AM",  priority: 2 },
      { day: "Thursday",  timeSlot: "10AM", priority: 2 },
      { day: "Thursday",  timeSlot: "2PM",  priority: 2 },
    ]
  },
  { name: "Dr. Meena Nair",   email: "meena@college.edu",  dept: "IT",
    availability: [
      { day: "Monday",    timeSlot: "2PM",  priority: 1 },
      { day: "Monday",    timeSlot: "3PM",  priority: 1 },
      { day: "Tuesday",   timeSlot: "9AM",  priority: 2 },
      { day: "Tuesday",   timeSlot: "10AM", priority: 2 },
      { day: "Wednesday", timeSlot: "9AM",  priority: 3 },
      { day: "Wednesday", timeSlot: "10AM", priority: 3 },
    ]
  },
  { name: "Prof. Suresh Babu", email: "suresh@college.edu", dept: "CSE",
    availability: [
       { day: "Wednesday", timeSlot: "9AM",  priority: 1 },
       { day: "Wednesday", timeSlot: "10AM", priority: 1 },
       { day: "Thursday",  timeSlot: "2PM",  priority: 2 },
       { day: "Thursday",  timeSlot: "3PM",  priority: 2 },
       { day: "Friday",    timeSlot: "9AM",  priority: 3 },
       { day: "Friday",    timeSlot: "10AM", priority: 3 },
    ]
  },
  { name: "Sarvani",           email: "sarvani@college.edu", dept: "CSE",
    availability: [
      { day: 'Monday',    timeSlot: '9AM',  priority: 1 },
      { day: 'Monday',    timeSlot: '10AM', priority: 1 },
      { day: 'Tuesday',   timeSlot: '9AM',  priority: 1 },
      { day: 'Tuesday',   timeSlot: '10AM', priority: 1 },
      { day: 'Wednesday', timeSlot: '9AM',  priority: 2 },
      { day: 'Wednesday', timeSlot: '10AM', priority: 2 },
      { day: 'Thursday',  timeSlot: '9AM',  priority: 3 },
    ]
  },
  { name: "Sambit",            email: "sambit@college.edu",  dept: "CSE",
    availability: [
      { day: 'Monday',    timeSlot: '9AM',  priority: 1 },
      { day: 'Monday',    timeSlot: '10AM', priority: 1 },
      { day: 'Tuesday',   timeSlot: '9AM',  priority: 1 },
      { day: 'Tuesday',   timeSlot: '10AM', priority: 1 },
      { day: 'Wednesday', timeSlot: '9AM',  priority: 2 },
      { day: 'Wednesday', timeSlot: '10AM', priority: 2 },
      { day: 'Thursday',  timeSlot: '9AM',  priority: 3 },
    ]
  }
];

const subjectsData = [
  { name: "Data Structures", code: "DS101", faculty: "Dr. Priya Sharma", dept: "CSE", program: "B.Tech", year: 2, section: "A" },
  { name: "Algorithms",      code: "AL201", faculty: "Prof. Ravi Kumar", dept: "CSE", program: "B.Tech", year: 2, section: "B" },
  { name: "DBMS",            code: "DB301", faculty: "Dr. Meena Nair", dept: "IT",  program: "B.Tech", year: 3, section: "A" },
  { name: "Machine Learning",code: "ML401", faculty: "Prof. Suresh Babu", dept: "CSE", program: "B.Tech", year: 3, section: "A" },
  { name: "AI",              code: "AI501", faculty: "Sarvani", dept: "CSE", program: "B.Tech", year: 3, section: "A" },
  { name: "ACD",             code: "ACD501",faculty: "Sambit", dept: "CSE", program: "B.Tech", year: 3, section: "B" }
];

const roomsData = [
  { name: "C508", capacity: 65 },
  { name: "C608", capacity: 65 },
  { name: "C708", capacity: 60 },
  { name: "Lab-101", capacity: 40 },
  { name: "Hall-A",  capacity: 120 }
];

const seedDB = async () => {
  try {
    await Department.deleteMany({});
    await Program.deleteMany({});
    await Section.deleteMany({});
    await Faculty.deleteMany({});
    await Subject.deleteMany({});
    await Room.deleteMany({});
    await TimetableEntry.deleteMany({});

    console.log('Cleared DB');

    // Insert Departments
    const savedDeps = await Department.insertMany(departmentsData);
    const depMap = {};
    savedDeps.forEach(d => depMap[d.code] = d._id);

    // Insert Programs
    const progsToSave = programsData.map(p => ({
      name: p.name,
      departmentId: depMap[p.department],
      durationYears: p.durationYears
    }));
    const savedProgs = await Program.insertMany(progsToSave);
    const progMap = {}; // "CSE-B.Tech" -> id
    savedProgs.forEach(p => {
      const dCode = savedDeps.find(d => d._id.equals(p.departmentId)).code;
      progMap[`${dCode}-${p.name}`] = p._id;
    });

    // Insert Sections
    const secsToSave = sectionsData.map(s => ({
      name: s.section,
      programId: progMap[`${s.dept}-${s.program}`],
      departmentId: depMap[s.dept],
      year: s.year,
      studentCount: s.students
    }));
    const savedSecs = await Section.insertMany(secsToSave);
    const secMap = {}; // "CSE-B.Tech-3-A" -> id
    savedSecs.forEach(s => {
      const dCode = savedDeps.find(d => d._id.equals(s.departmentId)).code;
      const pName = savedProgs.find(p => p._id.equals(s.programId)).name;
      secMap[`${dCode}-${pName}-${s.year}-${s.name}`] = s._id;
    });

    // Insert Faculty
    const facsToSave = facultyData.map(f => ({
      name: f.name,
      email: f.email,
      departmentId: depMap[f.dept],
      availability: f.availability
    }));
    const savedFacs = await Faculty.insertMany(facsToSave);
    const facMap = {};
    savedFacs.forEach(f => facMap[f.name] = f._id);

    // Insert Subjects
    const subsToSave = subjectsData.map(s => ({
      name: s.name,
      code: s.code,
      facultyId: facMap[s.faculty],
      departmentId: depMap[s.dept],
      programId: progMap[`${s.dept}-${s.program}`],
      year: s.year,
      sectionId: secMap[`${s.dept}-${s.program}-${s.year}-${s.section}`],
      hoursPerWeek: 5
    }));
    await Subject.insertMany(subsToSave);

    // Insert Rooms
    await Room.insertMany(roomsData);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding blocked by error: ', error);
    process.exit(1);
  }
};

seedDB();
