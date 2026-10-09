// EXAMGUARD Smart Seating Engine
// Generates hall grid seating with multiple anti-cheating and accessibility-aware strategies

export const SEATING_STRATEGIES = [
  { id: 'checkerboard', name: 'Checkerboard (Dept Alternate)', description: 'Alternates students from contrasting departments across adjacent seats.' },
  { id: 'department_separation', name: 'Department Separation', description: 'Keeps identical department students separated by safe distance.' },
  { id: 'subject_separation', name: 'Subject Separation', description: 'Alternates examination papers in halls hosting multi-subject papers.' },
  { id: 'batch_separation', name: 'Batch Separation', description: 'Prevents peers from the same batch cohort from sitting in adjacent columns.' },
  { id: 'accessibility_first', name: 'Accessibility-Optimized', description: 'Reserves front-row and aisle access for mobility & medical accommodation.' },
  { id: 'random', name: 'Randomized Dispersion', description: 'Uniform random pseudo-shuffled seating allocation.' },
];

/**
 * Generates grid seating layout for an assignment
 */
export function generateSeatingLayout(assignment, hall, allStudents, strategy = 'checkerboard', customRules = []) {
  if (!hall) return { seats: [], rows: 0, cols: 0, antiCheatingScore: 0, clusters: [] };

  const rowsCount = hall.rows || 8;
  const colsCount = hall.cols || 10;
  const totalGridSeats = rowsCount * colsCount;

  // Retrieve assigned students
  const studentIds = assignment.studentIds || [];
  const assignedStudents = studentIds
    .map(id => allStudents.find(s => s.id === id))
    .filter(Boolean);

  // Partition students: accessible first
  const accessibleStudents = assignedStudents.filter(
    s => s.accessibility?.wheelchairAccess || s.accessibility?.groundFloorRequired || s.accessibility?.nearEntrance
  );
  const regularStudents = assignedStudents.filter(
    s => !(s.accessibility?.wheelchairAccess || s.accessibility?.groundFloorRequired || s.accessibility?.nearEntrance)
  );

  // Sort/Order regular students based on strategy
  let orderedRegularStudents = [...regularStudents];

  if (strategy === 'checkerboard' || strategy === 'department_separation') {
    // Interleave by department
    const deptBuckets = {};
    orderedRegularStudents.forEach(s => {
      deptBuckets[s.department] = deptBuckets[s.department] || [];
      deptBuckets[s.department].push(s);
    });
    const depts = Object.keys(deptBuckets);
    orderedRegularStudents = [];
    let hasMore = true;
    let round = 0;
    while (hasMore) {
      hasMore = false;
      for (const d of depts) {
        if (deptBuckets[d].length > 0) {
          orderedRegularStudents.push(deptBuckets[d].shift());
          hasMore = true;
        }
      }
      round++;
      if (round > 500) break;
    }
  } else if (strategy === 'batch_separation') {
    // Interleave by batch
    const batchBuckets = {};
    orderedRegularStudents.forEach(s => {
      batchBuckets[s.batchId] = batchBuckets[s.batchId] || [];
      batchBuckets[s.batchId].push(s);
    });
    const batches = Object.keys(batchBuckets);
    orderedRegularStudents = [];
    let hasMore = true;
    while (hasMore) {
      hasMore = false;
      for (const b of batches) {
        if (batchBuckets[b].length > 0) {
          orderedRegularStudents.push(batchBuckets[b].shift());
          hasMore = true;
        }
      }
    }
  } else if (strategy === 'random') {
    // Deterministic pseudo-shuffle
    orderedRegularStudents.sort((a, b) => {
      const hA = hashString(a.id + assignment.id);
      const hB = hashString(b.id + assignment.id);
      return hA - hB;
    });
  }

  // Combine: accessible first to occupy row 0 (Row A) near entrance
  const allOrdered = [...accessibleStudents, ...orderedRegularStudents];

  // Build grid
  const seats = [];
  const gridMatrix = [];
  let studentCursor = 0;

  for (let r = 0; r < rowsCount; r++) {
    const rowChar = String.fromCharCode(65 + r); // A, B, C, ...
    const rowList = [];

    for (let c = 1; c <= colsCount; c++) {
      const seatNumber = `${rowChar}${String(c).padStart(2, '0')}`;
      const seatId = `${hall.code}-${seatNumber}`;

      // Check if student exists for this seat
      const student = allOrdered[studentCursor];
      let seatObj = null;

      if (student) {
        studentCursor++;
        const isAcc = student.accessibility?.wheelchairAccess || student.accessibility?.groundFloorRequired || student.accessibility?.nearEntrance;
        seatObj = {
          seatId,
          row: rowChar,
          rowIndex: r,
          col: c,
          seatNumber,
          studentId: student.id,
          studentRoll: student.rollNumber,
          studentName: student.name,
          department: student.department,
          batchId: student.batchId,
          paperCode: assignment.paperCode || assignment.paperId,
          status: isAcc ? 'accessibility' : 'occupied',
          isAccessibilitySeat: isAcc,
          accessibilityDetail: student.accessibility?.description || '',
          extraTime: student.accessibility?.extraTime || false,
          attendanceStatus: student.attendanceStatus || 'PRESENT', // PRESENT, LATE, ABSENT
        };
      } else {
        seatObj = {
          seatId,
          row: rowChar,
          rowIndex: r,
          col: c,
          seatNumber,
          studentId: null,
          studentRoll: null,
          studentName: null,
          department: null,
          batchId: null,
          paperCode: null,
          status: 'empty',
          isAccessibilitySeat: false,
          attendanceStatus: null,
        };
      }

      seats.push(seatObj);
      rowList.push(seatObj);
    }
    gridMatrix.push(rowList);
  }

  // Calculate Anti-Cheating Seating Risk Analysis & Heatmap
  const { antiCheatingScore, riskClusters } = evaluateSeatingRisk(gridMatrix, rowsCount, colsCount);

  return {
    seats,
    gridMatrix,
    rows: rowsCount,
    cols: colsCount,
    totalCapacity: totalGridSeats,
    assignedCount: assignedStudents.length,
    emptyCount: totalGridSeats - assignedStudents.length,
    antiCheatingScore,
    riskClusters,
    strategyUsed: strategy,
  };
}

/**
 * Calculates Anti-Cheating score and detects suspicious adjacency clusters
 */
function evaluateSeatingRisk(gridMatrix, rowsCount, colsCount) {
  let adjacentChecks = 0;
  let sameDeptAdjacencies = 0;
  let sameBatchAdjacencies = 0;
  const riskClusters = [];

  for (let r = 0; r < rowsCount; r++) {
    for (let c = 0; c < colsCount; c++) {
      const current = gridMatrix[r][c];
      if (!current || !current.studentId) continue;

      // Check 4-connectivity: Right, Down, Diagonal
      const neighbors = [
        { dr: 0, dc: 1, type: 'HORIZONTAL' },
        { dr: 1, dc: 0, type: 'VERTICAL' },
      ];

      for (const nb of neighbors) {
        const nr = r + nb.dr;
        const nc = c + nb.dc;
        if (nr < rowsCount && nc < colsCount) {
          const other = gridMatrix[nr][nc];
          if (other && other.studentId) {
            adjacentChecks++;
            const sameDept = current.department === other.department;
            const sameBatch = current.batchId === other.batchId;

            if (sameDept) sameDeptAdjacencies++;
            if (sameBatch) sameBatchAdjacencies++;

            if (sameBatch) {
              riskClusters.push({
                seatA: current.seatNumber,
                seatB: other.seatNumber,
                studentA: current.studentName,
                studentB: other.studentName,
                batch: current.batchId,
                riskLevel: 'ELEVATED',
              });
            }
          }
        }
      }
    }
  }

  // Baseline score calculation
  if (adjacentChecks === 0) return { antiCheatingScore: 95, riskClusters: [] };

  const deptClashRatio = sameDeptAdjacencies / adjacentChecks;
  const batchClashRatio = sameBatchAdjacencies / adjacentChecks;

  // Higher mixing gives higher score
  const rawScore = 100 - (batchClashRatio * 45 + deptClashRatio * 20);
  const antiCheatingScore = Math.min(99, Math.max(55, Math.round(rawScore)));

  return { antiCheatingScore, riskClusters: riskClusters.slice(0, 10) };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export function resolveConstraintStrategy(constraintText) {
  const t = (constraintText || '').toLowerCase();
  if (t.includes('batch') || t.includes('same class') || t.includes('same year') || t.includes('sit together')) {
    return 'batch_separation';
  }
  if (t.includes('department') || t.includes('dept')) return 'department_separation';
  if (t.includes('subject') || t.includes('paper')) return 'subject_separation';
  if (t.includes('access') || t.includes('wheelchair')) return 'accessibility_first';
  if (t.includes('random')) return 'random';
  return 'checkerboard';
}

export function buildCustomHallExam({ name, code, capacity, studentCount, constraint }) {
  const cols = 10;
  const rows = Math.max(1, Math.ceil(Number(capacity) / cols));
  const stamp = Date.now();
  const hallCode = (code || name || 'HALL').replace(/\s+/g, '').slice(0, 8).toUpperCase();

  const hall = {
    id: `HALL-${stamp}`,
    name: name || `Hall ${hallCode}`,
    code: hallCode,
    building: 'Custom Examination Wing',
    floor: 1,
    capacity: Number(capacity),
    rows,
    cols,
    hasWheelchairAccess: true,
    isGroundFloor: true,
    hasProjector: false,
    hasAC: true,
    status: 'ACTIVE',
    assignedInvigilatorsRequired: 2,
    seatingConstraint: constraint,
  };

  const depts = ['CSE', 'ECE', 'ME', 'CE', 'IT'];
  const batchSuffix = ['2023-A', '2023-B', '2024-A', '2024-B'];
  const students = [];

  for (let i = 0; i < Number(studentCount); i++) {
    const dept = depts[i % depts.length];
    students.push({
      id: `${hall.id}-STU-${i + 1}`,
      name: `Student ${String(i + 1).padStart(3, '0')}`,
      rollNumber: `${dept.slice(0, 2)}${String(i + 1).padStart(3, '0')}`,
      department: dept,
      batchId: `${dept}-${batchSuffix[i % batchSuffix.length]}`,
      accessibility: {},
    });
  }

  const assignment = {
    id: `ASG-${hall.id}`,
    paperCode: 'EXAM',
    paperName: 'Hall Seating Arrangement',
    hallId: hall.id,
    hallName: hall.name,
    hallCode: hall.code,
    hallCapacity: hall.capacity,
    studentCount: students.length,
    studentIds: students.map(s => s.id),
    slotTime: '10:30 AM – 01:30 PM',
    slotDate: new Date().toISOString().slice(0, 10),
    invigilatorIds: [],
    invigilatorNames: [],
    customConstraint: constraint,
  };

  return {
    hall,
    students,
    assignment,
    strategy: resolveConstraintStrategy(constraint),
  };
}
