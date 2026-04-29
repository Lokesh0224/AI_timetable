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
  const warnings  = [];

  const facultyBooked = {};  // { facultyId: { day: Set(slots) } }
  const sectionBooked = {};  // { "deptId-progId-year-sectionId": { day: Set(slots) } }
  const roomBooked    = {};  // { roomName: { day: Set(slots) } }

  function getSectionKey(subject) {
    return `${subject.departmentId}-${subject.programId}-${subject.year}-${subject.sectionId}`;
  }

  function isFacultyFree(facultyId, day, slot) {
    return !facultyBooked[facultyId]?.[day]?.has(slot);
  }

  function isSectionFree(subject, day, slot) {
    const key = getSectionKey(subject);
    return !sectionBooked[key]?.[day]?.has(slot);
  }

  function isRoomFree(roomName, day, slot) {
    return !roomBooked[roomName]?.[day]?.has(slot);
  }

  function findFreeRoom(day, slot) {
    return rooms.find(r => isRoomFree(r.name, day, slot)) || null;
  }

  function bookAll(subject, facultyId, roomName, day, slot) {
    // Book faculty
    if (!facultyBooked[facultyId]) facultyBooked[facultyId] = {};
    if (!facultyBooked[facultyId][day]) facultyBooked[facultyId][day] = new Set();
    facultyBooked[facultyId][day].add(slot);

    // Book section
    const key = getSectionKey(subject);
    if (!sectionBooked[key]) sectionBooked[key] = {};
    if (!sectionBooked[key][day]) sectionBooked[key][day] = new Set();
    sectionBooked[key][day].add(slot);

    // Book room
    if (!roomBooked[roomName]) roomBooked[roomName] = {};
    if (!roomBooked[roomName][day]) roomBooked[roomName][day] = new Set();
    roomBooked[roomName][day].add(slot);
  }

  // Sort: most constrained faculty first
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

    // Build all day+slot pairs for this faculty
    const daySlotPairs = [];
    for (const day of faculty.availableDays) {
      const slots = (faculty.availableSlots.get(day) || []).filter(s => s !== '1PM');
      for (const slot of slots) {
        daySlotPairs.push({ day, slot });
      }
    }

    for (const { day, slot } of daySlotPairs) {
      if (scheduled >= needed) break;

      if (!isFacultyFree(faculty._id, day, slot)) continue;
      if (!isSectionFree(subject, day, slot)) continue;

      const freeRoom = findFreeRoom(day, slot);
      if (!freeRoom) continue;

      timetable.push({
        subjectId:    subject._id,
        facultyId:    faculty._id,
        departmentId: subject.departmentId,
        programId:    subject.programId,
        year:         subject.year,
        sectionId:    subject.sectionId,
        day,
        timeSlot:     slot,
        room:         freeRoom.name,
        hasConflict:  false
      });

      bookAll(subject, faculty._id, freeRoom.name, day, slot);
      scheduled++;
    }

    if (scheduled < needed) {
      warnings.push(
        `⚠ "${subject.name}" (${faculty.name}) — only ${scheduled}/${needed} sessions scheduled. ` +
        `Faculty has ${daySlotPairs.length} available slots but constraints reduced bookable slots. ` +
        `Add more available days/slots for ${faculty.name} or add more rooms.`
      );
    }
  }

  return { timetable, warnings };
}

module.exports = { generateTimetable };