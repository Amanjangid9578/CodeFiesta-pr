// EXAMGUARD What-If Simulation Engine
// Clones real schedule state into an isolated sandbox to test hypothetical scenarios

import { validateSchedule } from './validator.js';
import { calculateResilienceScore } from './resilienceEngine.js';
import { calculateMinimumDisruptionRepair } from './repairEngine.js';

export const SCENARIO_TYPES = [
  { id: 'HALL_UNAVAILABLE', label: 'Hall Failure / Offline', description: 'Simulate structural, electrical or AC failure in an active examination hall.' },
  { id: 'MULTI_HALL_UNAVAILABLE', label: 'Multiple Halls Offline', description: 'Simulate an entire building wing (e.g. Block B) shutting down simultaneously.' },
  { id: 'INVIGILATOR_ABSENT', label: 'Invigilator Emergency Absence', description: 'Simulate unexpected sickness or emergency absence of chief proctors.' },
  { id: 'STUDENT_SURGE', label: 'Late Student Surge (+50)', description: 'Simulate unexpected arrival of repeater candidates or transferred batches.' },
  { id: 'SLOT_SHIFT', label: 'Time Slot Relocation', description: 'Simulate rescheduling an entire exam paper to an alternative time window.' },
  { id: 'CAPACITY_REDUCED', label: 'Hall Capacity Derating (-30%)', description: 'Simulate enforced social distancing or broken desk capacity reduction.' },
];

/**
 * Runs a What-If simulation against cloned state
 */
export function runSimulation({
  scenarioType,
  targetEntityId,
  schedule,
  halls,
  invigilators,
  students,
  papers,
  slots,
  rules = [],
}) {
  // Deep clone everything
  const simHalls = JSON.parse(JSON.stringify(halls));
  const simInvigilators = JSON.parse(JSON.stringify(invigilators));
  const simStudents = JSON.parse(JSON.stringify(students));
  const simPapers = JSON.parse(JSON.stringify(papers));
  const simSchedule = JSON.parse(JSON.stringify(schedule));

  // Compute baseline metrics
  const originalValidation = validateSchedule(schedule, halls, invigilators, students, papers, slots, rules);
  const originalResilience = calculateResilienceScore(halls, invigilators, students, schedule, originalValidation);

  let affectedStudentsCount = 0;
  let affectedHallsCount = 0;
  let affectedInvigilatorsCount = 0;
  let disruptionPayload = null;

  // Apply scenario mutations in sandbox
  if (scenarioType === 'HALL_UNAVAILABLE') {
    const hallId = targetEntityId || 'HALL-B203';
    const hall = simHalls.find(h => h.id === hallId);
    if (hall) {
      hall.status = 'UNAVAILABLE';
      affectedHallsCount = 1;
    }
    disruptionPayload = { type: 'HALL_UNAVAILABLE', entityId: hallId };

    // Calculate affected
    simSchedule.assignments.forEach(asg => {
      if (asg.hallId === hallId) {
        affectedStudentsCount += asg.studentCount || (asg.studentIds?.length || 0);
        affectedInvigilatorsCount += (asg.invigilatorIds?.length || 0);
      }
    });
  } else if (scenarioType === 'MULTI_HALL_UNAVAILABLE') {
    // Both B202 and B203 offline
    const hallsToClose = ['HALL-B202', 'HALL-B203'];
    hallsToClose.forEach(hid => {
      const h = simHalls.find(x => x.id === hid);
      if (h) h.status = 'UNAVAILABLE';
    });
    affectedHallsCount = 2;
    disruptionPayload = { type: 'HALL_UNAVAILABLE', entityId: 'HALL-B203' };

    simSchedule.assignments.forEach(asg => {
      if (hallsToClose.includes(asg.hallId)) {
        affectedStudentsCount += asg.studentCount || (asg.studentIds?.length || 0);
        affectedInvigilatorsCount += (asg.invigilatorIds?.length || 0);
      }
    });
  } else if (scenarioType === 'INVIGILATOR_ABSENT') {
    const invId = targetEntityId || 'INV-1'; // Dr. Ramesh Sharma
    const inv = simInvigilators.find(i => i.id === invId);
    if (inv) {
      inv.status = 'LEAVE';
      affectedInvigilatorsCount = 1;
    }
    disruptionPayload = { type: 'INVIGILATOR_ABSENT', entityId: invId };

    simSchedule.assignments.forEach(asg => {
      if ((asg.invigilatorIds || []).includes(invId)) {
        affectedStudentsCount += asg.studentCount || 0;
        affectedHallsCount += 1;
      }
    });
  } else if (scenarioType === 'STUDENT_SURGE') {
    // Inject 50 new examinees into first assignment
    const targetAsg = simSchedule.assignments[0];
    if (targetAsg) {
      const extraCount = 50;
      for (let i = 1; i <= extraCount; i++) {
        const extraStu = {
          id: `STU-SURGE-${i}`,
          rollNumber: `23SURGE${String(i).padStart(3, '0')}`,
          name: `Repeater Student ${i}`,
          department: 'CSE',
          batchId: 'CSE-2023-A',
          papers: [targetAsg.paperCode],
          accessibility: {},
        };
        simStudents.push(extraStu);
        targetAsg.studentIds.push(extraStu.id);
      }
      targetAsg.studentCount += extraCount;
      affectedStudentsCount = extraCount;
      affectedHallsCount = 1;
    }
    disruptionPayload = { type: 'STUDENT_SURGE', entityId: targetAsg?.id };
  } else if (scenarioType === 'CAPACITY_REDUCED') {
    const hallId = targetEntityId || 'HALL-B203';
    const h = simHalls.find(x => x.id === hallId);
    if (h) {
      h.capacity = Math.round(h.capacity * 0.7); // 30% reduction
      affectedHallsCount = 1;
    }
    disruptionPayload = { type: 'HALL_UNAVAILABLE', entityId: hallId };
  }

  // Validate simulated state BEFORE repair
  const simulatedDisruptedValidation = validateSchedule(simSchedule, simHalls, simInvigilators, simStudents, simPapers, slots, rules);
  const simulatedDisruptedResilience = calculateResilienceScore(simHalls, simInvigilators, simStudents, simSchedule, simulatedDisruptedValidation);

  // Compute self-healing recovery for simulated disruption
  let recoveryPlan = null;
  if (disruptionPayload) {
    recoveryPlan = calculateMinimumDisruptionRepair(
      simSchedule,
      disruptionPayload,
      simHalls,
      simInvigilators,
      simStudents,
      simPapers,
      slots,
      rules
    );
  }

  // Calculate post-recovery metrics if recommended repair is applied
  let recoveredSchedule = simSchedule;
  let postRecoveryValidation = simulatedDisruptedValidation;
  let postRecoveryResilience = simulatedDisruptedResilience;

  if (recoveryPlan && recoveryPlan.recommended) {
    recoveredSchedule = recoveryPlan.recommended.repairedSchedule;
    postRecoveryValidation = validateSchedule(recoveredSchedule, simHalls, simInvigilators, simStudents, simPapers, slots, rules);
    postRecoveryResilience = calculateResilienceScore(simHalls, simInvigilators, simStudents, recoveredSchedule, postRecoveryValidation);
  }

  return {
    scenarioType,
    targetEntityId,
    timestamp: new Date().toISOString(),
    metrics: {
      affectedStudents: affectedStudentsCount,
      affectedHalls: affectedHallsCount,
      affectedInvigilators: affectedInvigilatorsCount,
      originalConflicts: originalValidation.hardViolations + originalValidation.softViolations,
      disruptedConflicts: simulatedDisruptedValidation.hardViolations + simulatedDisruptedValidation.softViolations,
      recoveredConflicts: postRecoveryValidation.hardViolations + postRecoveryValidation.softViolations,
      originalResilience: originalResilience.score,
      disruptedResilience: simulatedDisruptedResilience.score,
      recoveredResilience: postRecoveryResilience.score,
    },
    original: {
      validation: originalValidation,
      resilience: originalResilience,
      schedule,
    },
    disrupted: {
      validation: simulatedDisruptedValidation,
      resilience: simulatedDisruptedResilience,
      schedule: simSchedule,
      halls: simHalls,
      invigilators: simInvigilators,
    },
    recoveryPlan,
    recovered: {
      schedule: recoveredSchedule,
      validation: postRecoveryValidation,
      resilience: postRecoveryResilience,
    }
  };
}
