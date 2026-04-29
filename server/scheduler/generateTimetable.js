function totalAvailableSlots(faculty) {
  return (faculty.availability || []).filter(a => a.timeSlot !== '1PM').length;
}

function getSlotsByPriority(faculty, priorityLevel) {
  return (faculty.availability || [])
    .filter(a => a.priority === priorityLevel && a.timeSlot !== '1PM')
    .map(a => ({ day: a.day, slot: a.timeSlot }));
}

function generateTimetable(subjects, facultyMap, rooms) {
  const timetable    = [];
  const warnings     = [];
  const priorityReport = []; // NEW: structured report
  
  const facultyBooked = {};
  const sectionBooked = {};
  const roomBooked    = {};

  function getSectionKey(subject) {
    const dept    = subject.departmentId?.toString() || 'NODEPT';
    const prog    = subject.programId?.toString()    || 'NOPROG';
    const year    = subject.year                     || 0;
    const section = subject.sectionId?.toString()    || 'NOSEC';
    return `${dept}|${prog}|${year}|${section}`;
  }

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

    if (!facultyBooked[fid])        facultyBooked[fid]        = {};
    if (!facultyBooked[fid][day])   facultyBooked[fid][day]   = new Set();
    facultyBooked[fid][day].add(slot);

    if (!sectionBooked[key])        sectionBooked[key]        = {};
    if (!sectionBooked[key][day])   sectionBooked[key][day]   = new Set();
    sectionBooked[key][day].add(slot);

    if (!roomBooked[roomName])      roomBooked[roomName]      = {};
    if (!roomBooked[roomName][day]) roomBooked[roomName][day] = new Set();
    roomBooked[roomName][day].add(slot);
  }

  // Sort: most constrained faculty first
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
    const needed  = subject.hoursPerWeek || 5;

    // Track which priority was used for each session (for reporting)
    const usedPriorities = { 1: 0, 2: 0, 3: 0 };
    const skippedReasons = [];

    // KEY LOGIC — try Priority 1 first, then 2, then 3
    for (const priorityLevel of [1, 2, 3]) {
      if (scheduled >= needed) break;

      const slots = getSlotsByPriority(faculty, priorityLevel);

      for (const { day, slot } of slots) {
        if (scheduled >= needed) break;

        const fFree = isFacultyFree(faculty._id, day, slot);
        const sFree = isSectionFree(subject, day, slot);
        const room  = findFreeRoom(day, slot);

        if (!fFree) {
          skippedReasons.push(`P${priorityLevel} ${day} ${slot} — faculty clash`);
          continue;
        }
        if (!sFree) {
          skippedReasons.push(`P${priorityLevel} ${day} ${slot} — section clash`);
          continue;
        }
        if (!room) {
          skippedReasons.push(`P${priorityLevel} ${day} ${slot} — no room free`);
          continue;
        }

        timetable.push({
          subjectId:    subject._id,
          facultyId:    faculty._id,
          departmentId: subject.departmentId,
          programId:    subject.programId,
          year:         subject.year,
          sectionId:    subject.sectionId,
          day,
          timeSlot:     slot,
          room:         room.name,
          priority:     priorityLevel,      // ← store which priority was used
          hasConflict:  false
        });

        bookAll(subject, faculty._id, room.name, day, slot);
        usedPriorities[priorityLevel]++;
        scheduled++;
      }
    }

    // Build human-readable priority usage summary
    const prioritySummary = Object.entries(usedPriorities)
      .filter(([, count]) => count > 0)
      .map(([p, count]) => `P${p}×${count}`)
      .join(', ');

    // Push structured data for the table rendering on frontend
    priorityReport.push({
      subjectName: subject.name,
      facultyName: faculty.name,
      p1: usedPriorities[1],
      p2: usedPriorities[2],
      p3: usedPriorities[3],
      total: scheduled
    });

    if (scheduled >= needed) {
      // Log which priorities were used
      if (usedPriorities[2] > 0 || usedPriorities[3] > 0) {
        warnings.push(
          `ℹ "${subject.name}" (${faculty.name}) — scheduled using fallback priorities: ${prioritySummary}. Priority 1 slots were partially or fully clashed.`
        );
      }
    } else {
      warnings.push(
        `⚠ "${subject.name}" (${faculty.name}) — only ${scheduled}/${needed} sessions scheduled. Priorities used: ${prioritySummary || 'none'}. Skipped slots: ${skippedReasons.slice(0, 3).join('; ')}.`
      );
    }
  }

  return { timetable, warnings, priorityReport };
}

module.exports = { generateTimetable };