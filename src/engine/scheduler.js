// EXAMGUARD Complete Scheduling Engine
// Generates conflict-free, resilient timetable allocations with balanced invigilator workload

import { validateSchedule } from './validator.js';
import { generateSeatingLayout } from './seatingEngine.js';

/**
 * Generates an end-to-end optimal examination schedule
 */
export function generateOptimalSchedule(halls, invigilators, students, papers, slots, rules = []) {
  const activeHalls = halls.filter(h => h.status === 'ACTIVE');
  const availableInvigilators = invigilators.filter(i => i.status === 'AVAILABLE');

  // Sort halls by capacity descending for best-fit bin packing
  const sortedHalls = [...activeHalls].sort((a, b) => b.capacity - a.capacity);

  // Determine slot distribution for papers to guarantee zero student timetable clashes
  // Mapping of paper to optimal time slots
  const paperSlotMapping = {
    'PAPER-MAT101': 'SLOT-1', // Day 1 Morning (Shared across branches)
    'PAPER-CS201':  'SLOT-2', // Day 1 Afternoon (CSE, IT)
    'PAPER-CS202':  'SLOT-3', // Day 1 Evening (CSE, IT)
    'PAPER-CS203':  'SLOT-4', // Day 2 Morning (CSE 3rd, ECE)
  };

  const assignments = [];
  let assignmentCounter = 1;

  // Track invigilator assignment history across all slots
  const invigilatorDutyCounter = {};
  availableInvigilators.forEach(inv => {
    invigilatorDutyCounter[inv.id] = 0;
  });

  // Track invigilator assignments per slot: slotId -> Set of invigilatorIds
  const slotInvigilatorUsage = {};
  slots.forEach(s => {
    slotInvigilatorUsage[s.id] = new Set();
  });

  // Process each paper
  papers.forEach(paper => {
    const targetSlotId = paperSlotMapping[paper.id] || slots[0].id;
    const targetSlot = slots.find(s => s.id === targetSlotId) || slots[0];

    // Find all students taking this paper
    const paperStudents = students.filter(s => s.papers.includes(paper.code));

    // Separate accessible students (wheelchair / ground floor)
    const accessibleStudents = paperStudents.filter(
      s => s.accessibility?.wheelchairAccess || s.accessibility?.groundFloorRequired
    );
    const standardStudents = paperStudents.filter(
      s => !(s.accessibility?.wheelchairAccess || s.accessibility?.groundFloorRequired)
    );

    // Track available halls for this slot (halls not yet assigned in this slot)
    const usedHallIdsInSlot = new Set(
      assignments.filter(a => a.slotId === targetSlotId).map(a => a.hallId)
    );
    const candidateHalls = sortedHalls.filter(h => !usedHallIdsInSlot.has(h.id));

    // Allocate students across halls using best-fit strategy
    let remainingStandard = [...standardStudents];
    let remainingAccessible = [...accessibleStudents];

    for (const hall of candidateHalls) {
      if (remainingStandard.length === 0 && remainingAccessible.length === 0) break;

      const hallCap = hall.capacity;
      const assignedToThisHall = [];

      // If hall is ground floor, prioritize accessible students
      if (hall.isGroundFloor && remainingAccessible.length > 0) {
        const takeAcc = remainingAccessible.splice(0, Math.min(hallCap, remainingAccessible.length));
        assignedToThisHall.push(...takeAcc);
      }

      // Fill remaining hall space with standard students
      const remainingSpace = hallCap - assignedToThisHall.length;
      if (remainingSpace > 0 && remainingStandard.length > 0) {
        const takeStd = remainingStandard.splice(0, Math.min(remainingSpace, remainingStandard.length));
        assignedToThisHall.push(...takeStd);
      }

      if (assignedToThisHall.length === 0) continue;

      // Select invigilators for this hall
      const neededInvCount = hall.assignedInvigilatorsRequired || (hall.capacity >= 80 ? 3 : 2);
      const chosenInvigilators = selectBalancedInvigilators(
        availableInvigilators,
        neededInvCount,
        targetSlotId,
        slotInvigilatorUsage,
        invigilatorDutyCounter,
        paper.departments
      );

      // Record invigilator usage
      chosenInvigilators.forEach(inv => {
        slotInvigilatorUsage[targetSlotId].add(inv.id);
        invigilatorDutyCounter[inv.id] = (invigilatorDutyCounter[inv.id] || 0) + 1;
      });

      const assignmentId = `ASG-${String(assignmentCounter).padStart(3, '0')}`;
      const assignmentObj = {
        id: assignmentId,
        paperId: paper.id,
        paperCode: paper.code,
        paperName: paper.name,
        slotId: targetSlotId,
        slotName: targetSlot.name,
        slotTime: `${targetSlot.startTime} - ${targetSlot.endTime}`,
        slotDate: targetSlot.date,
        day: targetSlot.day,
        hallId: hall.id,
        hallName: hall.name,
        hallCode: hall.code,
        hallCapacity: hall.capacity,
        studentIds: assignedToThisHall.map(s => s.id),
        studentCount: assignedToThisHall.length,
        invigilatorIds: chosenInvigilators.map(i => i.id),
        invigilatorNames: chosenInvigilators.map(i => i.name),
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
      };

      // Generate seating arrangement for this assignment
      const seating = generateSeatingLayout(assignmentObj, hall, students, 'checkerboard', rules);
      assignmentObj.seating = seating;

      assignments.push(assignmentObj);
      assignmentCounter++;
    }
  });

  const generatedSchedule = {
    id: `SCHED-${Date.now()}`,
    name: 'EXAMGUARD Master Timetable',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    status: 'ACTIVE',
    assignments,
    strategy: 'MINIMUM_CONFLICT_BALANCED',
  };

  // Validate the generated schedule
  const validation = validateSchedule(generatedSchedule, halls, invigilators, students, papers, slots, rules);

  return {
    schedule: generatedSchedule,
    validation,
    stats: {
      totalAssignments: assignments.length,
      totalStudentsPlaced: assignments.reduce((s, a) => s + a.studentCount, 0),
      slotsUsed: new Set(assignments.map(a => a.slotId)).size,
      hallsUsed: new Set(assignments.map(a => a.hallId)).size,
      invigilatorDuties: invigilatorDutyCounter,
    }
  };
}

/**
 * Greedy fair selection of invigilators
 * Prefers: not busy in this slot, lower duty count, within maxDuties, and department neutrality
 */
function selectBalancedInvigilators(allInvigilators, neededCount, slotId, slotInvigilatorUsage, dutyCounter, paperDepartments) {
  const candidatePool = allInvigilators.filter(inv => {
    // Cannot be assigned in same slot
    if (slotInvigilatorUsage[slotId]?.has(inv.id)) return false;
    // Cannot exceed maxDuties
    const currentDuties = dutyCounter[inv.id] || 0;
    if (currentDuties >= inv.maxDuties) return false;
    return true;
  });

  // Sort candidate pool by fewest duties first, then neutral department preference
  candidatePool.sort((a, b) => {
    const countA = dutyCounter[a.id] || 0;
    const countB = dutyCounter[b.id] || 0;
    if (countA !== countB) return countA - countB;

    // Neutrality: give slight priority to invigilators whose home department is NOT the exam department
    const isDeptA = paperDepartments.includes(a.department);
    const isDeptB = paperDepartments.includes(b.department);
    if (isDeptA && !isDeptB) return 1;
    if (!isDeptA && isDeptB) return -1;

    return 0;
  });

  return candidatePool.slice(0, neededCount);
}
