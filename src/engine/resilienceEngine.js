// EXAMGUARD Exam Resilience Score Engine
// Evaluates real dynamic metrics (0-100) based on current infrastructure and schedule health

export function calculateResilienceScore(halls, invigilators, students, schedule, validationResult) {
  // 1. Capacity Buffer (0 - 100%)
  // Measures excess headroom in currently active halls
  const activeHalls = halls.filter(h => h.status === 'ACTIVE');
  const backupHalls = halls.filter(h => h.status === 'BACKUP');
  const totalActiveCapacity = activeHalls.reduce((sum, h) => sum + h.capacity, 0);
  const totalBackupCapacity = backupHalls.reduce((sum, h) => sum + h.capacity, 0);

  // Calculate highest student load in any single slot
  const slotLoads = {};
  if (schedule && schedule.assignments) {
    schedule.assignments.forEach(asg => {
      slotLoads[asg.slotId] = (slotLoads[asg.slotId] || 0) + (asg.studentIds ? asg.studentIds.length : 0);
    });
  }
  const peakSlotLoad = Math.max(...Object.values(slotLoads), 0);
  const capacityBufferScore = peakSlotLoad > 0 && totalActiveCapacity > 0
    ? Math.min(100, Math.max(20, Math.round(((totalActiveCapacity - peakSlotLoad) / totalActiveCapacity) * 100 + 70)))
    : 85;

  // 2. Staff Availability (0 - 100%)
  // Duty headroom across available invigilators
  const availableInvigilators = invigilators.filter(i => i.status === 'AVAILABLE');
  const totalMaxDuties = availableInvigilators.reduce((sum, i) => sum + i.maxDuties, 0);
  
  let totalAssignedDuties = 0;
  if (schedule && schedule.assignments) {
    schedule.assignments.forEach(asg => {
      totalAssignedDuties += (asg.invigilatorIds || []).length;
    });
  }
  const staffRatio = totalMaxDuties > 0 ? (totalMaxDuties - totalAssignedDuties) / totalMaxDuties : 0;
  const staffAvailabilityScore = Math.min(100, Math.max(15, Math.round(50 + staffRatio * 50)));

  // 3. Backup Hall Availability (0 - 100%)
  // Are there backup halls capable of absorbing the largest active hall failure?
  const maxSingleHallCap = activeHalls.length > 0 ? Math.max(...activeHalls.map(h => h.capacity)) : 80;
  let backupCapacityScore = 20;
  if (totalBackupCapacity >= maxSingleHallCap * 1.5) {
    backupCapacityScore = 95;
  } else if (totalBackupCapacity >= maxSingleHallCap) {
    backupCapacityScore = 82;
  } else if (totalBackupCapacity > 0) {
    backupCapacityScore = 60;
  }

  // 4. Schedule Flexibility (0 - 100%)
  // Measures slots utilization and hall distribution
  const distinctSlotsUsed = new Set((schedule?.assignments || []).map(a => a.slotId)).size;
  const scheduleFlexibilityScore = distinctSlotsUsed <= 3 ? 92 : distinctSlotsUsed <= 5 ? 80 : 65;

  // 5. Recovery Capability (0 - 100%)
  // Can each single-point hall failure be absorbed without creating conflicts?
  const criticalHalls = activeHalls.filter(h => h.capacity >= 80);
  let recoveryScore = 90;
  if (backupHalls.length === 0) {
    recoveryScore -= 35;
  }
  if (criticalHalls.length > backupHalls.length) {
    recoveryScore -= 10;
  }
  const recoveryCapabilityScore = Math.min(100, Math.max(30, recoveryScore));

  // 6. Accessibility Coverage (0 - 100%)
  const accessibleStudents = students.filter(s =>
    s.accessibility?.wheelchairAccess || s.accessibility?.groundFloorRequired
  );
  let properlyAssignedAccessible = 0;
  if (schedule && schedule.assignments) {
    schedule.assignments.forEach(asg => {
      const hall = halls.find(h => h.id === asg.hallId);
      if (hall && hall.isGroundFloor) {
        const accInHall = (asg.studentIds || []).filter(sid => {
          const st = students.find(s => s.id === sid);
          return st?.accessibility?.wheelchairAccess || st?.accessibility?.groundFloorRequired;
        });
        properlyAssignedAccessible += accInHall.length;
      }
    });
  }
  const accessibilityScore = accessibleStudents.length > 0
    ? Math.round((properlyAssignedAccessible / accessibleStudents.length) * 100)
    : 100;

  // Conflict penalty deduction
  const criticalPenalty = (validationResult?.hardViolations || 0) * 18;
  const softPenalty = (validationResult?.softViolations || 0) * 4;
  const conflictDeduction = criticalPenalty + softPenalty;

  // Weighted aggregate score
  const rawWeightedScore = Math.round(
    capacityBufferScore * 0.20 +
    staffAvailabilityScore * 0.20 +
    backupCapacityScore * 0.15 +
    scheduleFlexibilityScore * 0.15 +
    recoveryCapabilityScore * 0.15 +
    accessibilityScore * 0.15
  );

  const finalScore = Math.min(100, Math.max(5, rawWeightedScore - conflictDeduction));

  return {
    score: finalScore,
    grade: finalScore >= 90 ? 'A+ OPTIMAL' : finalScore >= 75 ? 'B STABLE' : finalScore >= 50 ? 'C AT RISK' : 'D CRITICAL',
    breakdown: {
      capacityBuffer: Math.max(0, capacityBufferScore - (validationResult?.hardViolations ? 15 : 0)),
      staffAvailability: Math.max(0, staffAvailabilityScore - (validationResult?.hardViolations ? 10 : 0)),
      backupCapacity: backupCapacityScore,
      scheduleFlexibility: scheduleFlexibilityScore,
      recoveryCapability: recoveryCapabilityScore,
      accessibilityCoverage: accessibilityScore,
    },
    metrics: {
      peakSlotLoad,
      totalActiveCapacity,
      totalBackupCapacity,
      availableInvigilators: availableInvigilators.length,
      assignedDuties: totalAssignedDuties,
      dutyHeadroom: totalMaxDuties - totalAssignedDuties,
      activeHallsCount: activeHalls.length,
      backupHallsCount: backupHalls.length,
      conflictDeduction,
    },
    riskWarnings: generateRiskWarnings(finalScore, validationResult, backupHalls, availableInvigilators)
  };
}

function generateRiskWarnings(score, validationResult, backupHalls, availableInvigilators) {
  const warnings = [];
  if (validationResult?.hardViolations > 0) {
    warnings.push({
      level: 'CRITICAL',
      message: `${validationResult.hardViolations} hard scheduling conflict(s) detected. Immediate repair needed.`
    });
  }
  if (backupHalls.length === 0) {
    warnings.push({
      level: 'HIGH',
      message: 'Zero backup halls designated. Any sudden hall failure will trigger emergency displacement.'
    });
  }
  if (availableInvigilators.length < 10) {
    warnings.push({
      level: 'MEDIUM',
      message: 'Staff buffer is slim. Additional sick leave or absences may trigger supervisor shortage.'
    });
  }
  if (score >= 90) {
    warnings.push({
      level: 'OPTIMAL',
      message: 'Examination operation exhibits high fault-tolerance and self-healing capacity.'
    });
  }
  return warnings;
}
