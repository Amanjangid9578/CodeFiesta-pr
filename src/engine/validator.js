// EXAMGUARD Constraint & Validation Engine

/**
 * Validates a complete examination schedule against Hard and Soft constraints.
 * Returns a detailed list of detected conflicts and summary statistics.
 */
export function validateSchedule(schedule, halls, invigilators, students, papers, slots, rules = []) {
  const conflicts = [];
  const activeHallsMap = new Map(halls.map(h => [h.id, h]));
  const invigilatorsMap = new Map(invigilators.map(i => [i.id, i]));
  const papersMap = new Map(papers.map(p => [p.id, p]));
  const studentsMap = new Map(students.map(s => [s.id, s]));

  if (!schedule || !schedule.assignments || schedule.assignments.length === 0) {
    return {
      isValid: true,
      conflicts: [],
      hardViolations: 0,
      softViolations: 0,
      hallUtilization: 0,
      invigilatorFairness: 100,
    };
  }

  // 1. HARD CONSTRAINT: Hall status & capacity
  // Group assignments by (slotId, hallId)
  const slotHallMap = new Map();
  // Group assignments by (slotId, invigilatorId)
  const slotInvigilatorMap = new Map();
  // Track student assignments by (slotId, studentId)
  const slotStudentMap = new Map();
  // Track invigilator total duty counts
  const invigilatorDutyCounts = new Map();

  schedule.assignments.forEach((assignment, index) => {
    const hall = activeHallsMap.get(assignment.hallId);
    const paper = papersMap.get(assignment.paperId);
    const assignedStudents = assignment.studentIds || [];
    const assignedInvs = assignment.invigilatorIds || [];

    // Check if hall exists and is active
    if (!hall) {
      conflicts.push({
        id: `CONF-H-MISSING-${index}`,
        type: 'INVALID_RESOURCE',
        severity: 'CRITICAL',
        title: 'Unknown Hall Assigned',
        cause: `Assignment references a non-existent hall ID: ${assignment.hallId}`,
        solution: 'Reassign this session to an active examination hall.',
        assignmentId: assignment.id,
        slotId: assignment.slotId,
        hallId: assignment.hallId,
      });
    } else {
      if (hall.status === 'UNAVAILABLE' || hall.status === 'MAINTENANCE') {
        conflicts.push({
          id: `CONF-H-STATUS-${index}`,
          type: 'HALL_UNAVAILABLE',
          severity: 'CRITICAL',
          title: `Hall ${hall.name} is ${hall.status}`,
          cause: `${hall.name} is currently marked as ${hall.status} and cannot host exam sessions.`,
          solution: `Transfer the ${assignedStudents.length} students to backup hall F301 or F302.`,
          assignmentId: assignment.id,
          slotId: assignment.slotId,
          hallId: assignment.hallId,
          suggestedBackupHallId: hall.capacity <= 80 ? 'HALL-F301' : 'HALL-F302',
        });
      }

      // Check hall capacity
      if (assignedStudents.length > hall.capacity) {
        conflicts.push({
          id: `CONF-CAP-${index}`,
          type: 'CAPACITY_VIOLATION',
          severity: 'CRITICAL',
          title: `Capacity Exceeded in ${hall.name}`,
          cause: `Assigned ${assignedStudents.length} students to ${hall.name}, but maximum capacity is ${hall.capacity}. Overflow: ${assignedStudents.length - hall.capacity} students.`,
          solution: `Move overflow students to an adjacent room or swap with a higher-capacity hall.`,
          assignmentId: assignment.id,
          slotId: assignment.slotId,
          hallId: assignment.hallId,
          overflow: assignedStudents.length - hall.capacity,
        });
      }

      // Check accessibility compliance
      assignedStudents.forEach(stuId => {
        const student = studentsMap.get(stuId);
        if (student && student.accessibility) {
          if ((student.accessibility.wheelchairAccess || student.accessibility.groundFloorRequired) && !hall.isGroundFloor) {
            conflicts.push({
              id: `CONF-ACC-${student.id}-${assignment.id}`,
              type: 'ACCESSIBILITY_VIOLATION',
              severity: 'HIGH',
              title: `Accessibility Violation for ${student.name}`,
              cause: `${student.name} requires ground floor / wheelchair access, but ${hall.name} is located on Floor ${hall.floor}.`,
              solution: `Reallocate ${student.name} to ground floor Hall A101, A102, or F301.`,
              studentId: student.id,
              assignmentId: assignment.id,
              hallId: hall.id,
            });
          }
        }
      });
    }

    // Check invigilator ratio
    const requiredInvCount = hall ? (hall.assignedInvigilatorsRequired || 2) : 2;
    if (assignedInvs.length < requiredInvCount) {
      conflicts.push({
        id: `CONF-INV-COVERAGE-${index}`,
        type: 'INSUFFICIENT_INVIGILATION',
        severity: 'HIGH',
        title: `Under-staffed Hall: ${hall ? hall.name : assignment.hallId}`,
        cause: `Hall requires ${requiredInvCount} invigilators for safety compliance, but only ${assignedInvs.length} assigned.`,
        solution: `Assign ${requiredInvCount - assignedInvs.length} additional invigilator(s) from reserve pool.`,
        assignmentId: assignment.id,
        hallId: assignment.hallId,
        slotId: assignment.slotId,
      });
    }

    // Check double-booking of halls
    const slotHallKey = `${assignment.slotId}_${assignment.hallId}`;
    if (slotHallMap.has(slotHallKey)) {
      const prior = slotHallMap.get(slotHallKey);
      conflicts.push({
        id: `CONF-H-DBL-${index}`,
        type: 'HALL_DOUBLE_BOOKING',
        severity: 'CRITICAL',
        title: `Hall Double-Booking: ${hall ? hall.name : assignment.hallId}`,
        cause: `Both exam papers (${paper ? paper.code : assignment.paperId} and ${prior.paperCode}) are scheduled into the same hall during slot ${assignment.slotId}.`,
        solution: `Move one exam paper to an alternative available hall or reschedule slot.`,
        assignmentId: assignment.id,
        conflictingAssignmentId: prior.id,
        hallId: assignment.hallId,
        slotId: assignment.slotId,
      });
    } else {
      slotHallMap.set(slotHallKey, { id: assignment.id, paperCode: paper ? paper.code : assignment.paperId });
    }

    // Check invigilators
    assignedInvs.forEach(invId => {
      const inv = invigilatorsMap.get(invId);
      if (!inv) return;

      // Track duty count
      invigilatorDutyCounts.set(invId, (invigilatorDutyCounts.get(invId) || 0) + 1);

      // Check status
      if (inv.status === 'LEAVE' || inv.status === 'UNAVAILABLE') {
        conflicts.push({
          id: `CONF-INV-UNAVAIL-${invId}-${assignment.id}`,
          type: 'INVIGILATOR_UNAVAILABLE',
          severity: 'CRITICAL',
          title: `Invigilator Unavailable: ${inv.name}`,
          cause: `${inv.name} is on ${inv.status} status but assigned to ${hall ? hall.name : assignment.hallId}.`,
          solution: `Substitute ${inv.name} with an available invigilator from the standby pool.`,
          invigilatorId: invId,
          assignmentId: assignment.id,
          slotId: assignment.slotId,
        });
      }

      // Check double-booking
      const slotInvKey = `${assignment.slotId}_${invId}`;
      if (slotInvInv(slotInvKey, slotInvigilatorMap)) {
        const priorInvAssignment = slotInvigilatorMap.get(slotInvKey);
        conflicts.push({
          id: `CONF-INV-DBL-${invId}-${assignment.id}`,
          type: 'INVIGILATOR_DOUBLE_BOOKING',
          severity: 'CRITICAL',
          title: `Invigilator Double Booking: ${inv.name}`,
          cause: `${inv.name} is assigned to two separate halls during the same time slot (${priorInvAssignment.hallName} and ${hall ? hall.name : assignment.hallId}).`,
          solution: `Reassign ${inv.name} from one hall and substitute with a standby staff member.`,
          invigilatorId: invId,
          assignmentId: assignment.id,
          slotId: assignment.slotId,
        });
      } else {
        slotInvigilatorMap.set(slotInvKey, {
          assignmentId: assignment.id,
          hallName: hall ? hall.name : assignment.hallId,
        });
      }
    });

    // Check student clashes in same slot
    assignedStudents.forEach(stuId => {
      const slotStudentKey = `${assignment.slotId}_${stuId}`;
      if (slotStudentMap.has(slotStudentKey)) {
        const priorStu = slotStudentMap.get(slotStudentKey);
        const student = studentsMap.get(stuId);
        conflicts.push({
          id: `CONF-STU-CLASH-${stuId}-${assignment.slotId}`,
          type: 'STUDENT_EXAM_CLASH',
          severity: 'CRITICAL',
          title: `Student Timetable Clash: ${student ? student.name : stuId}`,
          cause: `${student ? student.name : stuId} is simultaneously assigned to ${paper ? paper.code : assignment.paperId} and ${priorStu.paperCode} in slot ${assignment.slotId}.`,
          solution: `Reschedule one of the conflicting examinations to an alternative time slot.`,
          studentId: stuId,
          slotId: assignment.slotId,
        });
      } else {
        slotStudentMap.set(slotStudentKey, {
          paperCode: paper ? paper.code : assignment.paperId,
          assignmentId: assignment.id,
        });
      }
    });
  });

  // Check invigilator max duties
  invigilators.forEach(inv => {
    const assignedCount = invigilatorDutyCounts.get(inv.id) || 0;
    if (assignedCount > inv.maxDuties) {
      conflicts.push({
        id: `CONF-INV-OVERLOAD-${inv.id}`,
        type: 'INVIGILATOR_OVERLOAD',
        severity: 'MEDIUM',
        title: `Workload Exceeded: ${inv.name}`,
        cause: `${inv.name} assigned ${assignedCount} duties (Contracted max: ${inv.maxDuties}).`,
        solution: `Rebalance duties to colleagues with lower shift counts.`,
        invigilatorId: inv.id,
        excessDuties: assignedCount - inv.maxDuties,
      });
    }
  });

  // Calculate stats
  const hardViolations = conflicts.filter(c => c.severity === 'CRITICAL').length;
  const softViolations = conflicts.filter(c => c.severity !== 'CRITICAL').length;

  return {
    isValid: hardViolations === 0,
    conflicts,
    hardViolations,
    softViolations,
    totalAssignments: schedule.assignments.length,
    dutyCounts: Object.fromEntries(invigilatorDutyCounts),
  };
}

function slotInvInv(key, map) {
  return map.has(key);
}
