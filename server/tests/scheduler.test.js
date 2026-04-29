const { generateTimetable } = require('../scheduler/generateTimetable');

const rooms = [
  { name: 'C508', capacity: 60 },
  { name: 'C608', capacity: 60 }
];

function makeSubject(id, name, facultyId, dept, prog, year, section, hours = 5) {
  return {
    _id: id,
    name,
    facultyId,
    departmentId: dept,
    programId: prog,
    year,
    sectionId: section,
    hoursPerWeek: hours
  };
}

function makeFaculty(id, name, availability) {
  return { _id: id, name, availability };
}

test('TC01 - Perfect: all sessions scheduled at Priority 1', () => {
  const faculty = makeFaculty('F1', 'Sarvani', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);
  const subject = makeSubject('S1', 'AI', 'F1', 'D1', 'P1', 3, 'SEC_A');
  const { timetable, warnings } = generateTimetable([subject], { F1: faculty }, rooms);

  expect(timetable.length).toBe(5);
  expect(timetable.every(e => e.priority === 1)).toBe(true);
  expect(timetable.every(e => e.isFallback === false)).toBe(true);
  expect(warnings.filter(w => w.startsWith('⚠') || w.startsWith('🚨')).length).toBe(0);
});

test('TC02 - Fallback: P1 fully clashed, sessions move to P2', () => {
  const sarvani = makeFaculty('F1', 'Sarvani', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);

  const sambit = makeFaculty('F2', 'Sambit', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '11AM', priority: 2 },
    { day: 'Tuesday', timeSlot: '11AM', priority: 2 },
    { day: 'Wednesday', timeSlot: '10AM', priority: 2 },
    { day: 'Wednesday', timeSlot: '11AM', priority: 2 },
    { day: 'Thursday', timeSlot: '9AM', priority: 2 }
  ]);

  const s1 = makeSubject('S1', 'AI', 'F1', 'D1', 'P1', 3, 'SEC_C');
  const s2 = makeSubject('S2', 'ACD', 'F2', 'D1', 'P1', 3, 'SEC_C');

  const { timetable } = generateTimetable([s1, s2], { F1: sarvani, F2: sambit }, rooms);

  const aiSessions = timetable.filter(e => e.subjectId === 'S1');
  const acdSessions = timetable.filter(e => e.subjectId === 'S2');

  expect(aiSessions.length).toBe(5);
  expect(acdSessions.length).toBe(5);
  expect(acdSessions.every(e => e.priority === 2)).toBe(true);

  const aiSlots = aiSessions.map(e => `${e.day}-${e.timeSlot}`);
  const acdSlots = acdSessions.map(e => `${e.day}-${e.timeSlot}`);
  const overlap = aiSlots.filter(s => acdSlots.includes(s));
  expect(overlap.length).toBe(0);
});

test('TC03 - Fallback: P1 and P2 clashed, sessions move to P3', () => {
  const sarvani = makeFaculty('F1', 'Sarvani', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '11AM', priority: 2 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);

  const sambit = makeFaculty('F2', 'Sambit', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '11AM', priority: 2 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 },
    { day: 'Thursday', timeSlot: '9AM', priority: 3 },
    { day: 'Thursday', timeSlot: '10AM', priority: 3 },
    { day: 'Thursday', timeSlot: '11AM', priority: 3 },
    { day: 'Friday', timeSlot: '9AM', priority: 3 },
    { day: 'Friday', timeSlot: '10AM', priority: 3 }
  ]);

  const s1 = makeSubject('S1', 'AI', 'F1', 'D1', 'P1', 3, 'SEC_C', 6);
  const s2 = makeSubject('S2', 'ACD', 'F2', 'D1', 'P1', 3, 'SEC_C');

  const { timetable } = generateTimetable([s1, s2], { F1: sarvani, F2: sambit }, rooms);

  const acdSessions = timetable.filter(e => e.subjectId === 'S2');
  expect(acdSessions.length).toBe(5);
  expect(acdSessions.every(e => e.priority === 3)).toBe(true);
});

test('TC04 - Best-effort: all priority slots clashed, uses any free slot', () => {
  const sarvani = makeFaculty('F1', 'Sarvani', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);

  const sambit = makeFaculty('F2', 'Sambit', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);

  const s1 = makeSubject('S1', 'AI', 'F1', 'D1', 'P1', 3, 'SEC_C');
  const s2 = makeSubject('S2', 'ACD', 'F2', 'D1', 'P1', 3, 'SEC_C');

  const { timetable, warnings } = generateTimetable([s1, s2], { F1: sarvani, F2: sambit }, rooms);

  const acdSessions = timetable.filter(e => e.subjectId === 'S2');

  expect(acdSessions.length).toBe(5);
  expect(acdSessions.every(e => e.isFallback === true)).toBe(true);
  expect(warnings.some(w => w.includes('best-effort'))).toBe(true);
});

test('TC05 - Room: two subjects at same time use different rooms', () => {
  const sarvani = makeFaculty('F1', 'Sarvani', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);
  const sambit = makeFaculty('F2', 'Sambit', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);

  const s1 = makeSubject('S1', 'AI', 'F1', 'D1', 'P1', 3, 'SEC_A');
  const s2 = makeSubject('S2', 'ACD', 'F2', 'D1', 'P1', 3, 'SEC_B');

  const { timetable } = generateTimetable([s1, s2], { F1: sarvani, F2: sambit }, rooms);

  expect(timetable.length).toBe(10);

  const slotRoomMap = {};
  for (const entry of timetable) {
    const key = `${entry.day}-${entry.timeSlot}-${entry.room}`;
    expect(slotRoomMap[key]).toBeUndefined();
    slotRoomMap[key] = true;
  }
});

test('TC06 - Room shortage: 3 subjects same slot, only 2 rooms', () => {
  const makeF = (id, name) => makeFaculty(id, name, [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);

  const f1 = makeF('F1', 'Faculty1');
  const f2 = makeF('F2', 'Faculty2');
  const f3 = makeF('F3', 'Faculty3');

  const s1 = makeSubject('S1', 'Sub1', 'F1', 'D1', 'P1', 3, 'SEC_A');
  const s2 = makeSubject('S2', 'Sub2', 'F2', 'D1', 'P1', 3, 'SEC_B');
  const s3 = makeSubject('S3', 'Sub3', 'F3', 'D1', 'P1', 3, 'SEC_C');

  const twoRooms = [{ name: 'C508', capacity: 60 }, { name: 'C608', capacity: 60 }];

  const { timetable } = generateTimetable([s1, s2, s3], { F1: f1, F2: f2, F3: f3 }, twoRooms);

  const s3Sessions = timetable.filter(e => e.subjectId === 'S3');
  expect(s3Sessions.length).toBe(5);
});

test('TC07 - Single room: subjects scheduled sequentially not simultaneously', () => {
  const sarvani = makeFaculty('F1', 'Sarvani', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);
  const sambit = makeFaculty('F2', 'Sambit', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 }
  ]);

  const s1 = makeSubject('S1', 'AI', 'F1', 'D1', 'P1', 3, 'SEC_A');
  const s2 = makeSubject('S2', 'ACD', 'F2', 'D1', 'P1', 3, 'SEC_B');
  const oneRoom = [{ name: 'C508', capacity: 60 }];

  const { timetable } = generateTimetable([s1, s2], { F1: sarvani, F2: sambit }, oneRoom);

  expect(timetable.length).toBe(10);

  const seen = new Set();
  for (const e of timetable) {
    const key = `${e.day}-${e.timeSlot}`;
    expect(seen.has(key)).toBe(false);
    seen.add(key);
  }
});

test('TC08 - Faculty: same faculty cannot teach two subjects simultaneously', () => {
  const sarvani = makeFaculty('F1', 'Sarvani', [
    { day: 'Monday', timeSlot: '9AM', priority: 1 },
    { day: 'Monday', timeSlot: '10AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '9AM', priority: 1 },
    { day: 'Tuesday', timeSlot: '10AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '9AM', priority: 1 },
    { day: 'Wednesday', timeSlot: '10AM', priority: 2 },
    { day: 'Thursday', timeSlot: '9AM', priority: 2 },
    { day: 'Thursday', timeSlot: '10AM', priority: 2 },
    { day: 'Friday', timeSlot: '9AM', priority: 3 },
    { day: 'Friday', timeSlot: '10AM', priority: 3 }
  ]);

  const s1 = makeSubject('S1', 'AI', 'F1', 'D1', 'P1', 3, 'SEC_A');
  const s2 = makeSubject('S2', 'Math', 'F1', 'D1', 'P1', 3, 'SEC_B');

  const { timetable } = generateTimetable([s1, s2], { F1: sarvani }, rooms);

  expect(timetable.length).toBe(10);

  const facultySlots = {};
  for (const e of timetable) {
    const key = `${e.day}-${e.timeSlot}`;
    expect(facultySlots[key]).toBeUndefined();
    facultySlots[key] = true;
  }
});
