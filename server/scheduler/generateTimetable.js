// function totalAvailableSlots(faculty) {
//   let count = 0;
//   for (const day of faculty.availableDays) {
//     if (faculty.availableSlots.has(day)) {
//       count += faculty.availableSlots.get(day).length;
//     }
//   }
//   return count;
// }

// function generateTimetable(subjects, facultyMap, rooms) {
//   const timetable = [];
//   const warnings = [];

//   const facultyBooked = {};    // { facultyId: { day: Set(slots) } }
//   const yearBooked = {};       // { year: { day: Set(slots) } }
//   const roomBooked = {};       // { roomName: { day: Set(slots) } }  ← ADD THIS
//   const subjectDayCount = {};

//   const sorted = subjects.sort((a, b) => {
//     const aFaculty = facultyMap[a.facultyId.toString()];
//     const bFaculty = facultyMap[b.facultyId.toString()];
//     const aSlots = aFaculty ? totalAvailableSlots(aFaculty) : 0;
//     const bSlots = bFaculty ? totalAvailableSlots(bFaculty) : 0;
//     return aSlots - bSlots;
//   });

//   for (const subject of sorted) {
//     const faculty = facultyMap[subject.facultyId.toString()];
    
//     if (!faculty) {
//       warnings.push(`⚠ Cannot schedule "${subject.name}" — Assigned faculty not found.`);
//       continue;
//     }
    
//     let scheduled = 0;
//     const needed = subject.hoursPerWeek;

//     for (const day of faculty.availableDays) {
//       if (scheduled >= needed) break;
//       if ((subjectDayCount[subject._id]?.[day] || 0) >= 2) continue;

//       const slots = faculty.availableSlots.get(day) || [];

//       for (const slot of slots) {
//         if (slot === '1PM') continue;

//         // Check faculty is free
//         if (facultyBooked[faculty._id]?.[day]?.has(slot)) continue;

//         // Check year group is free
//         if (yearBooked[subject.year]?.[day]?.has(slot)) continue;

//         // Find a FREE room at this day+slot  ← THE FIX
//         const freeRoom = rooms.find(room => {
//           return !roomBooked[room.name]?.[day]?.has(slot);
//         });

//         // If no room is free at this slot, skip
//         if (!freeRoom) continue;

//         // Assign the free room
//         timetable.push({
//           subjectId: subject._id,
//           facultyId: faculty._id,
//           year: subject.year,
//           day,
//           timeSlot: slot,
//           room: freeRoom.name,
//           hasConflict: false
//         });

//         // Mark faculty as booked
//         if (!facultyBooked[faculty._id]) facultyBooked[faculty._id] = {};
//         if (!facultyBooked[faculty._id][day]) facultyBooked[faculty._id][day] = new Set();
//         facultyBooked[faculty._id][day].add(slot);

//         // Mark year as booked
//         if (!yearBooked[subject.year]) yearBooked[subject.year] = {};
//         if (!yearBooked[subject.year][day]) yearBooked[subject.year][day] = new Set();
//         yearBooked[subject.year][day].add(slot);

//         // Mark room as booked  ← ADD THIS
//         if (!roomBooked[freeRoom.name]) roomBooked[freeRoom.name] = {};
//         if (!roomBooked[freeRoom.name][day]) roomBooked[freeRoom.name][day] = new Set();
//         roomBooked[freeRoom.name][day].add(slot);

//         // Track subject-day count
//         if (!subjectDayCount[subject._id]) subjectDayCount[subject._id] = {};
//         subjectDayCount[subject._id][day] = (subjectDayCount[subject._id][day] || 0) + 1;

//         scheduled++;
//         break;
//       }
//     }

//     if (scheduled < needed) {
//       warnings.push(
//         `⚠ "${subject.name}" — only ${scheduled}/${needed} sessions scheduled. ` +
//         `Faculty has insufficient free slots or no room available.`
//       );
//     }
//   }

//   return { timetable, warnings };
// }

// module.exports = { generateTimetable, totalAvailableSlots };

function totalAvailableSlots(faculty) {
  let count = 0;
  for (const day of faculty.availableDays) {
    const slots = faculty.availableSlots.get(day) || [];
    count += slots.filter(s => s !== '1PM').length;
  }
  return count;
}

function generateTimetable(subjects, facultyMap, rooms) {
  const timetable = [];
  const warnings = [];

  // Booking trackers
  const facultyBooked = {};  // { facultyId: { day: Set(slots) } }
  const yearBooked    = {};  // { year:      { day: Set(slots) } }
  const roomBooked    = {};  // { roomName:  { day: Set(slots) } }
  const subjectDayCount = {}; // { subjectId: { day: count } }

  // Helper: mark a room as booked
  function bookRoom(roomName, day, slot) {
    if (!roomBooked[roomName]) roomBooked[roomName] = {};
    if (!roomBooked[roomName][day]) roomBooked[roomName][day] = new Set();
    roomBooked[roomName][day].add(slot);
  }

  // Helper: find first free room at a given day+slot
  function findFreeRoom(day, slot) {
    return rooms.find(room => !roomBooked[room.name]?.[day]?.has(slot)) || null;
  }

  // Helper: check if faculty is free
  function isFacultyFree(facultyId, day, slot) {
    return !facultyBooked[facultyId]?.[day]?.has(slot);
  }

  // Helper: check if year group is free
  function isYearFree(year, day, slot) {
    return !yearBooked[year]?.[day]?.has(slot);
  }

  // Helper: book a faculty slot
  function bookFaculty(facultyId, day, slot) {
    if (!facultyBooked[facultyId]) facultyBooked[facultyId] = {};
    if (!facultyBooked[facultyId][day]) facultyBooked[facultyId][day] = new Set();
    facultyBooked[facultyId][day].add(slot);
  }

  // Helper: book a year slot
  function bookYear(year, day, slot) {
    if (!yearBooked[year]) yearBooked[year] = {};
    if (!yearBooked[year][day]) yearBooked[year][day] = new Set();
    yearBooked[year][day].add(slot);
  }

  // Sort subjects: most constrained faculty first
  const sorted = [...subjects].sort((a, b) => {
    const aSlots = totalAvailableSlots(facultyMap[a.facultyId.toString()]);
    const bSlots = totalAvailableSlots(facultyMap[b.facultyId.toString()]);
    return aSlots - bSlots;
  });

  for (const subject of sorted) {
    const faculty = facultyMap[subject.facultyId.toString()];
    if (!faculty) {
      warnings.push(`⚠ Faculty not found for subject "${subject.name}"`);
      continue;
    }

    let scheduled = 0;
    const needed = subject.hoursPerWeek; // 5

    // KEY FIX: No hard cap per day — keep trying until 5 sessions scheduled
    // Try each day multiple times if needed (loop days repeatedly)
    const daySlotPairs = [];

    // Build full list of all available day+slot combinations for this faculty
    for (const day of faculty.availableDays) {
      const slots = (faculty.availableSlots.get(day) || []).filter(s => s !== '1PM');
      for (const slot of slots) {
        daySlotPairs.push({ day, slot });
      }
    }

    // Try each day+slot pair until we hit 5
    for (const { day, slot } of daySlotPairs) {
      if (scheduled >= needed) break;

      // Check faculty is free at this slot
      if (!isFacultyFree(faculty._id, day, slot)) continue;

      // Check year group is free at this slot
      if (!isYearFree(subject.year, day, slot)) continue;

      // KEY FIX: Find ANY free room — not just rooms[0]
      const freeRoom = findFreeRoom(day, slot);
      if (!freeRoom) {
        // No room free at this slot — skip this slot
        continue;
      }

      // All constraints satisfied — schedule it
      timetable.push({
        subjectId: subject._id,
        facultyId: faculty._id,
        year: subject.year,
        day,
        timeSlot: slot,
        room: freeRoom.name,
        hasConflict: false
      });

      // Book everything
      bookFaculty(faculty._id, day, slot);
      bookYear(subject.year, day, slot);
      bookRoom(freeRoom.name, day, slot);

      // Track per-day count (for display only, no longer a hard cap)
      if (!subjectDayCount[subject._id]) subjectDayCount[subject._id] = {};
      subjectDayCount[subject._id][day] = (subjectDayCount[subject._id][day] || 0) + 1;

      scheduled++;
    }

    if (scheduled < needed) {
      warnings.push(
        `⚠ "${subject.name}" (${faculty.name}) — only ${scheduled}/${needed} sessions scheduled. ` +
        `Reason: Faculty only has ${daySlotPairs.length} total available slots. ` +
        `Add more available days or time slots for ${faculty.name}.`
      );
    }
  }

  return { timetable, warnings };
}

module.exports = { generateTimetable };