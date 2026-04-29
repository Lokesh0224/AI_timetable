function totalAvailableSlots(faculty) {
  let count = 0;
  for (const day of faculty.availableDays) {
    if (faculty.availableSlots.has(day)) {
      count += faculty.availableSlots.get(day).length;
    }
  }
  return count;
}

function generateTimetable(subjects, facultyMap, rooms) {
  const timetable = [];
  const warnings = [];

  const facultyBooked = {};    // { facultyId: { day: Set(slots) } }
  const yearBooked = {};       // { year: { day: Set(slots) } }
  const roomBooked = {};       // { roomName: { day: Set(slots) } }  ← ADD THIS
  const subjectDayCount = {};

  const sorted = subjects.sort((a, b) => {
    const aFaculty = facultyMap[a.facultyId.toString()];
    const bFaculty = facultyMap[b.facultyId.toString()];
    const aSlots = aFaculty ? totalAvailableSlots(aFaculty) : 0;
    const bSlots = bFaculty ? totalAvailableSlots(bFaculty) : 0;
    return aSlots - bSlots;
  });

  for (const subject of sorted) {
    const faculty = facultyMap[subject.facultyId.toString()];
    
    if (!faculty) {
      warnings.push(`⚠ Cannot schedule "${subject.name}" — Assigned faculty not found.`);
      continue;
    }
    
    let scheduled = 0;
    const needed = subject.hoursPerWeek;

    for (const day of faculty.availableDays) {
      if (scheduled >= needed) break;
      if ((subjectDayCount[subject._id]?.[day] || 0) >= 2) continue;

      const slots = faculty.availableSlots.get(day) || [];

      for (const slot of slots) {
        if (slot === '1PM') continue;

        // Check faculty is free
        if (facultyBooked[faculty._id]?.[day]?.has(slot)) continue;

        // Check year group is free
        if (yearBooked[subject.year]?.[day]?.has(slot)) continue;

        // Find a FREE room at this day+slot  ← THE FIX
        const freeRoom = rooms.find(room => {
          return !roomBooked[room.name]?.[day]?.has(slot);
        });

        // If no room is free at this slot, skip
        if (!freeRoom) continue;

        // Assign the free room
        timetable.push({
          subjectId: subject._id,
          facultyId: faculty._id,
          year: subject.year,
          day,
          timeSlot: slot,
          room: freeRoom.name,
          hasConflict: false
        });

        // Mark faculty as booked
        if (!facultyBooked[faculty._id]) facultyBooked[faculty._id] = {};
        if (!facultyBooked[faculty._id][day]) facultyBooked[faculty._id][day] = new Set();
        facultyBooked[faculty._id][day].add(slot);

        // Mark year as booked
        if (!yearBooked[subject.year]) yearBooked[subject.year] = {};
        if (!yearBooked[subject.year][day]) yearBooked[subject.year][day] = new Set();
        yearBooked[subject.year][day].add(slot);

        // Mark room as booked  ← ADD THIS
        if (!roomBooked[freeRoom.name]) roomBooked[freeRoom.name] = {};
        if (!roomBooked[freeRoom.name][day]) roomBooked[freeRoom.name][day] = new Set();
        roomBooked[freeRoom.name][day].add(slot);

        // Track subject-day count
        if (!subjectDayCount[subject._id]) subjectDayCount[subject._id] = {};
        subjectDayCount[subject._id][day] = (subjectDayCount[subject._id][day] || 0) + 1;

        scheduled++;
        break;
      }
    }

    if (scheduled < needed) {
      warnings.push(
        `⚠ "${subject.name}" — only ${scheduled}/${needed} sessions scheduled. ` +
        `Faculty has insufficient free slots or no room available.`
      );
    }
  }

  return { timetable, warnings };
}

module.exports = { generateTimetable, totalAvailableSlots };
