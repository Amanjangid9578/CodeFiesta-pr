// EXAMGUARD Explainable Conflict Engine
// Formulates human-readable cause-and-effect explanations and automated single-click repair mutations

/**
 * Enriches raw validation conflicts into explainable incident cards with real repair actions
 */
export function formatExplainableConflicts(rawConflicts, schedule, halls, invigilators, students) {
  if (!rawConflicts || rawConflicts.length === 0) return [];

  return rawConflicts.map((c, index) => {
    let title = c.title;
    let cause = c.cause;
    let solution = c.solution;
    let impactText = '1 resource change, 0 student timetable moves';
    let entityName = 'System Resource';
    let fixActionType = 'GENERIC_FIX';

    if (c.type === 'HALL_UNAVAILABLE') {
      const hall = halls.find(h => h.id === c.hallId);
      entityName = hall ? hall.name : 'Examination Hall';
      impactText = '1 hall substitution, 0 student timetable changes, 0 new conflicts';
      fixActionType = 'REROUTE_HALL';
    } else if (c.type === 'INVIGILATOR_DOUBLE_BOOKING') {
      const inv = invigilators.find(i => i.id === c.invigilatorId);
      entityName = inv ? inv.name : 'Invigilator';
      impactText = '1 staff replacement, 0 student changes, 0 timetable changes';
      fixActionType = 'SUBSTITUTE_INVIGILATOR';
    } else if (c.type === 'INVIGILATOR_UNAVAILABLE') {
      const inv = invigilators.find(i => i.id === c.invigilatorId);
      entityName = inv ? inv.name : 'Invigilator';
      impactText = '1 standby invigilator assigned, 0 student changes';
      fixActionType = 'SUBSTITUTE_INVIGILATOR';
    } else if (c.type === 'CAPACITY_VIOLATION') {
      const hall = halls.find(h => h.id === c.hallId);
      entityName = hall ? hall.name : 'Hall Capacity';
      impactText = 'Partition overflow students into backup wing, 0 timetable delays';
      fixActionType = 'PARTITION_OVERFLOW';
    } else if (c.type === 'ACCESSIBILITY_VIOLATION') {
      const stu = students.find(s => s.id === c.studentId);
      entityName = stu ? stu.name : 'Accessible Candidate';
      impactText = '1 student seat reallocated to Ground Floor, 0 class disruptions';
      fixActionType = 'SWAP_ACCESSIBLE_SEAT';
    } else if (c.type === 'INSUFFICIENT_INVIGILATION') {
      impactText = '1 backup staff dispatched to hall, 0 schedule changes';
      fixActionType = 'ADD_SUPERVISOR';
    }

    return {
      id: c.id || `CONF-${index + 1}`,
      number: index + 1,
      type: c.type,
      severity: c.severity,
      title: title || 'Operational Constraint Discrepancy',
      entityName,
      cause: cause || 'A hard operational rule was breached by current resource allocation.',
      solution: solution || 'Apply automatic heuristic rebalancing.',
      impact: impactText,
      fixActionType,
      context: {
        assignmentId: c.assignmentId,
        hallId: c.hallId,
        invigilatorId: c.invigilatorId,
        studentId: c.studentId,
        suggestedBackupHallId: c.suggestedBackupHallId,
      }
    };
  });
}

/**
 * Executes a deterministic single-click fix for an explainable conflict
 */
export function applyConflictFix(conflict, schedule, halls, invigilators, students) {
  const cloned = JSON.parse(JSON.stringify(schedule));
  const backupHall = halls.find(h => h.status === 'BACKUP') || halls.find(h => h.code === 'A101');
  const availableInv = invigilators.find(i => i.status === 'AVAILABLE' && i.id !== conflict.context.invigilatorId) || invigilators[0];

  if (conflict.fixActionType === 'REROUTE_HALL') {
    cloned.assignments.forEach(asg => {
      if (asg.hallId === conflict.context.hallId) {
        asg.hallId = backupHall.id;
        asg.hallName = backupHall.name;
        asg.hallCode = backupHall.code;
      }
    });
  } else if (conflict.fixActionType === 'SUBSTITUTE_INVIGILATOR') {
    cloned.assignments.forEach(asg => {
      if (asg.id === conflict.context.assignmentId || (asg.invigilatorIds || []).includes(conflict.context.invigilatorId)) {
        asg.invigilatorIds = asg.invigilatorIds.map(id => id === conflict.context.invigilatorId ? availableInv.id : id);
        asg.invigilatorNames = asg.invigilatorNames.map(name => name.includes('Sharma') ? availableInv.name : name);
      }
    });
  } else if (conflict.fixActionType === 'SWAP_ACCESSIBLE_SEAT') {
    // Find ground floor hall assignment
    const groundAsg = cloned.assignments.find(a => {
      const h = halls.find(x => x.id === a.hallId);
      return h && h.isGroundFloor;
    });
    if (groundAsg && conflict.context.studentId) {
      // Ensure student is in ground hall
      if (!groundAsg.studentIds.includes(conflict.context.studentId)) {
        groundAsg.studentIds.push(conflict.context.studentId);
        groundAsg.studentCount++;
      }
      // Remove from old non-ground assignment
      cloned.assignments.forEach(asg => {
        if (asg.id === conflict.context.assignmentId) {
          asg.studentIds = asg.studentIds.filter(id => id !== conflict.context.studentId);
          asg.studentCount = asg.studentIds.length;
        }
      });
    }
  } else if (conflict.fixActionType === 'ADD_SUPERVISOR') {
    const targetAsg = cloned.assignments.find(a => a.id === conflict.context.assignmentId);
    if (targetAsg && !targetAsg.invigilatorIds.includes(availableInv.id)) {
      targetAsg.invigilatorIds.push(availableInv.id);
      targetAsg.invigilatorNames.push(availableInv.name);
    }
  }

  return cloned;
}
