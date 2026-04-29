function totalAvailableSlots(faculty) {
  return (faculty?.availability || []).filter(a => a.timeSlot !== '1PM').length;
}

function getSectionKey(subject) {
  const dept = subject.departmentId?.toString() || 'NODEPT';
  const prog = subject.programId?.toString() || 'NOPROG';
  const year = subject.year || 0;
  const section = subject.sectionId?.toString() || 'NOSEC';
  return `${dept}|${prog}|${year}|${section}`;
}

const ALL_SLOTS = ['9AM', '10AM', '11AM', '12PM', '2PM', '3PM', '4PM', '5PM'];
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function generateTimetable(subjects, facultyMap, rooms) {
  const timetable = [];
  const warnings = [];
  const priorityReport = [];
  const facultyBooked = {};
  const sectionBooked = {};
  const roomBooked = {};

  function isFacultyFree(facultyId, day, slot) {
    return !facultyBooked[facultyId.toString()]?.[day]?.has(slot);
  }

  function isSectionFree(subject, day, slot) {
    return !sectionBooked[getSectionKey(subject)]?.[day]?.has(slot);
  }

  function findFreeRoom(day, slot) {
    return rooms.find(r => !roomBooked[r.name]?.[day]?.has(slot)) || null;
  }

  function bookAll(subject, facultyId, roomName, day, slot) {
    const fid = facultyId.toString();
    const key = getSectionKey(subject);

    if (!facultyBooked[fid]) facultyBooked[fid] = {};
    if (!facultyBooked[fid][day]) facultyBooked[fid][day] = new Set();
    facultyBooked[fid][day].add(slot);

    if (!sectionBooked[key]) sectionBooked[key] = {};
    if (!sectionBooked[key][day]) sectionBooked[key][day] = new Set();
    sectionBooked[key][day].add(slot);

    if (!roomBooked[roomName]) roomBooked[roomName] = {};
    if (!roomBooked[roomName][day]) roomBooked[roomName][day] = new Set();
    roomBooked[roomName][day].add(slot);
  }

  function trySchedule(subject, faculty, day, slot, priorityUsed, isFallback) {
    if (slot === '1PM') return null;
    if (!isFacultyFree(faculty._id, day, slot)) return null;
    if (!isSectionFree(subject, day, slot)) return null;

    const room = findFreeRoom(day, slot);
    if (!room) return null;

    const entry = {
      subjectId: subject._id,
      facultyId: faculty._id,
      departmentId: subject.departmentId,
      programId: subject.programId,
      year: subject.year,
      sectionId: subject.sectionId,
      day,
      timeSlot: slot,
      room: room.name,
      priority: priorityUsed,
      isFallback,
      hasConflict: false
    };

    bookAll(subject, faculty._id, room.name, day, slot);
    return entry;
  }

  const sorted = [...subjects].sort((a, b) => {
    const af = facultyMap[a.facultyId.toString()];
    const bf = facultyMap[b.facultyId.toString()];
    return totalAvailableSlots(af) - totalAvailableSlots(bf);
  });

  for (const subject of sorted) {
    const faculty = facultyMap[subject.facultyId.toString()];
    if (!faculty) {
      warnings.push(`⚠ Faculty not found for "${subject.name}"`);
      continue;
    }

    let scheduled = 0;
    const needed = subject.hoursPerWeek || 5;
    const usedPriorities = { 1: 0, 2: 0, 3: 0, fallback: 0 };

    for (const priorityLevel of [1, 2, 3]) {
      if (scheduled >= needed) break;

      const slots = (faculty.availability || [])
        .filter(a => a.priority === priorityLevel && a.timeSlot !== '1PM')
        .map(a => ({ day: a.day, slot: a.timeSlot }));

      for (const { day, slot } of slots) {
        if (scheduled >= needed) break;

        const entry = trySchedule(subject, faculty, day, slot, priorityLevel, false);
        if (entry) {
          timetable.push(entry);
          usedPriorities[priorityLevel]++;
          scheduled++;
        }
      }
    }

    if (scheduled < needed) {
      const facultyDays = [...new Set((faculty.availability || []).map(a => a.day))];
      const searchDays = facultyDays.length > 0 ? facultyDays : ALL_DAYS;

      outerLoop:
      for (const day of searchDays) {
        for (const slot of ALL_SLOTS) {
          if (scheduled >= needed) break outerLoop;

          const entry = trySchedule(subject, faculty, day, slot, 0, true);
          if (entry) {
            timetable.push(entry);
            usedPriorities.fallback++;
            scheduled++;
          }
        }
      }
    }

    if (scheduled < needed) {
      outerLoop:
      for (const day of ALL_DAYS) {
        for (const slot of ALL_SLOTS) {
          if (scheduled >= needed) break outerLoop;

          const entry = trySchedule(subject, faculty, day, slot, 0, true);
          if (entry) {
            timetable.push(entry);
            usedPriorities.fallback++;
            scheduled++;
          }
        }
      }
    }

    const parts = [];
    if (usedPriorities[1] > 0) parts.push(`P1×${usedPriorities[1]}`);
    if (usedPriorities[2] > 0) parts.push(`P2×${usedPriorities[2]}`);
    if (usedPriorities[3] > 0) parts.push(`P3×${usedPriorities[3]}`);
    if (usedPriorities.fallback > 0) parts.push(`Fallback×${usedPriorities.fallback}`);
    const summary = parts.join(', ') || 'none';

    priorityReport.push({
      subjectName: subject.name,
      facultyName: faculty.name,
      p1: usedPriorities[1],
      p2: usedPriorities[2],
      p3: usedPriorities[3],
      fallback: usedPriorities.fallback,
      total: scheduled
    });

    if (scheduled >= needed) {
      if (usedPriorities.fallback > 0) {
        warnings.push(
          `🔄 "${subject.name}" (${faculty.name}) — fully scheduled using best-effort fallback. ` +
          `Priorities used: ${summary}. ` +
          `${usedPriorities.fallback} session(s) placed outside stated priority slots because all priority slots were clashed. ` +
          `Consider adding more priority slots for ${faculty.name}.`
        );
      } else if (usedPriorities[2] > 0 || usedPriorities[3] > 0) {
        warnings.push(
          `ℹ "${subject.name}" (${faculty.name}) — scheduled with fallback priorities: ${summary}. ` +
          'Some P1 slots were clashed.'
        );
      }
    } else {
      warnings.push(
        `🚨 "${subject.name}" (${faculty.name}) — only ${scheduled}/${needed} sessions scheduled. ` +
        'This means the faculty has zero free slots anywhere in the week. ' +
        'Please add more available days or check for conflicting constraints.'
      );
    }
  }

  return { timetable, warnings, priorityReport };
}

module.exports = { generateTimetable };
