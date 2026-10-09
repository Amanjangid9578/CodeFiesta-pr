// EXAMGUARD Seed Data
// Realistic university examination scenario

export const INITIAL_SLOTS = [
  { id: 'SLOT-1', name: 'Morning Session', day: 1, date: '2026-10-15', startTime: '09:00 AM', endTime: '12:00 PM', period: 'Morning' },
  { id: 'SLOT-2', name: 'Afternoon Session', day: 1, date: '2026-10-15', startTime: '01:00 PM', endTime: '04:00 PM', period: 'Afternoon' },
  { id: 'SLOT-3', name: 'Evening Session', day: 1, date: '2026-10-15', startTime: '04:30 PM', endTime: '07:30 PM', period: 'Evening' },
  { id: 'SLOT-4', name: 'Day 2 Morning', day: 2, date: '2026-10-16', startTime: '09:00 AM', endTime: '12:00 PM', period: 'Morning' },
];

export const INITIAL_HALLS = [
  {
    id: 'HALL-A101',
    name: 'Hall A101',
    code: 'A101',
    building: 'Block A (Science & Tech)',
    floor: 1,
    capacity: 60,
    rows: 6,
    cols: 10,
    hasWheelchairAccess: true,
    isGroundFloor: true,
    hasProjector: true,
    hasAC: true,
    status: 'ACTIVE', // ACTIVE, UNAVAILABLE, MAINTENANCE, BACKUP
    assignedInvigilatorsRequired: 2,
  },
  {
    id: 'HALL-A102',
    name: 'Hall A102',
    code: 'A102',
    building: 'Block A (Science & Tech)',
    floor: 1,
    capacity: 70,
    rows: 7,
    cols: 10,
    hasWheelchairAccess: true,
    isGroundFloor: true,
    hasProjector: false,
    hasAC: true,
    status: 'ACTIVE',
    assignedInvigilatorsRequired: 2,
  },
  {
    id: 'HALL-A103',
    name: 'Hall A103',
    code: 'A103',
    building: 'Block A (Science & Tech)',
    floor: 2,
    capacity: 80,
    rows: 8,
    cols: 10,
    hasWheelchairAccess: false,
    isGroundFloor: false,
    hasProjector: true,
    hasAC: false,
    status: 'ACTIVE',
    assignedInvigilatorsRequired: 3,
  },
  {
    id: 'HALL-B201',
    name: 'Hall B201',
    code: 'B201',
    building: 'Block B (Computing Annex)',
    floor: 2,
    capacity: 60,
    rows: 6,
    cols: 10,
    hasWheelchairAccess: false,
    isGroundFloor: false,
    hasProjector: true,
    hasAC: true,
    status: 'ACTIVE',
    assignedInvigilatorsRequired: 2,
  },
  {
    id: 'HALL-B202',
    name: 'Hall B202',
    code: 'B202',
    building: 'Block B (Computing Annex)',
    floor: 2,
    capacity: 80,
    rows: 8,
    cols: 10,
    hasWheelchairAccess: false,
    isGroundFloor: false,
    hasProjector: false,
    hasAC: true,
    status: 'ACTIVE',
    assignedInvigilatorsRequired: 3,
  },
  {
    id: 'HALL-B203',
    name: 'Hall B203',
    code: 'B203',
    building: 'Block B (Computing Annex)',
    floor: 3,
    capacity: 100,
    rows: 10,
    cols: 10,
    hasWheelchairAccess: false,
    isGroundFloor: false,
    hasProjector: true,
    hasAC: true,
    status: 'ACTIVE',
    assignedInvigilatorsRequired: 3,
  },
  // Backup Halls
  {
    id: 'HALL-F301',
    name: 'Hall F301 (Backup)',
    code: 'F301',
    building: 'Block F (Multipurpose Wing)',
    floor: 1,
    capacity: 80,
    rows: 8,
    cols: 10,
    hasWheelchairAccess: true,
    isGroundFloor: true,
    hasProjector: true,
    hasAC: true,
    status: 'BACKUP',
    assignedInvigilatorsRequired: 3,
  },
  {
    id: 'HALL-F302',
    name: 'Hall F302 (Backup)',
    code: 'F302',
    building: 'Block F (Multipurpose Wing)',
    floor: 1,
    capacity: 110,
    rows: 11,
    cols: 10,
    hasWheelchairAccess: true,
    isGroundFloor: true,
    hasProjector: true,
    hasAC: true,
    status: 'BACKUP',
    assignedInvigilatorsRequired: 4,
  },
];

export const INITIAL_INVIGILATORS = [
  { id: 'INV-1', name: 'Dr. Ramesh Sharma', department: 'CSE', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 'r.sharma@univ.edu', phone: '+91 98765 43210' },
  { id: 'INV-2', name: 'Dr. Priya Mehta', department: 'CSE', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 'p.mehta@univ.edu', phone: '+91 98765 43211' },
  { id: 'INV-3', name: 'Prof. Anand Rao', department: 'ECE', maxDuties: 4, currentDuties: 0, status: 'AVAILABLE', email: 'a.rao@univ.edu', phone: '+91 98765 43212' },
  { id: 'INV-4', name: 'Dr. Sunita Verma', department: 'ECE', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 's.verma@univ.edu', phone: '+91 98765 43213' },
  { id: 'INV-5', name: 'Prof. Rajesh Nair', department: 'ME', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 'r.nair@univ.edu', phone: '+91 98765 43214' },
  { id: 'INV-6', name: 'Dr. Kavita Iyer', department: 'ME', maxDuties: 4, currentDuties: 0, status: 'AVAILABLE', email: 'k.iyer@univ.edu', phone: '+91 98765 43215' },
  { id: 'INV-7', name: 'Prof. Vikram Patel', department: 'CE', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 'v.patel@univ.edu', phone: '+91 98765 43216' },
  { id: 'INV-8', name: 'Dr. Amit Sen', department: 'CE', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 'a.sen@univ.edu', phone: '+91 98765 43217' },
  { id: 'INV-9', name: 'Prof. Neha Gupta', department: 'IT', maxDuties: 4, currentDuties: 0, status: 'AVAILABLE', email: 'n.gupta@univ.edu', phone: '+91 98765 43218' },
  { id: 'INV-10', name: 'Dr. Suresh Reddy', department: 'IT', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 's.reddy@univ.edu', phone: '+91 98765 43219' },
  { id: 'INV-11', name: 'Prof. Pooja Deshmukh', department: 'CSE', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 'p.deshmukh@univ.edu', phone: '+91 98765 43220' },
  { id: 'INV-12', name: 'Dr. Arvind Menon', department: 'ECE', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 'a.menon@univ.edu', phone: '+91 98765 43221' },
  { id: 'INV-13', name: 'Prof. Sneha Kulkarni', department: 'ME', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 's.kulkarni@univ.edu', phone: '+91 98765 43222' },
  { id: 'INV-14', name: 'Dr. Manoj Bhat', department: 'IT', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 'm.bhat@univ.edu', phone: '+91 98765 43223' },
  { id: 'INV-15', name: 'Prof. Divya Joshi', department: 'CE', maxDuties: 3, currentDuties: 0, status: 'AVAILABLE', email: 'd.joshi@univ.edu', phone: '+91 98765 43224' },
];

export const INITIAL_PAPERS = [
  {
    id: 'PAPER-MAT101',
    code: 'MAT101',
    name: 'Engineering Mathematics III',
    departments: ['CSE', 'ECE', 'ME', 'CE', 'IT'],
    durationMinutes: 180,
    preferredSlotId: 'SLOT-1',
    priority: 'HIGH',
    batches: ['CSE-2023-A', 'CSE-2023-B', 'ECE-2023-A', 'ECE-2023-B', 'ME-2023-A', 'ME-2023-B', 'CE-2023-A', 'CE-2023-B', 'IT-2023-A', 'IT-2023-B'],
    totalStudents: 330,
  },
  {
    id: 'PAPER-CS201',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    departments: ['CSE', 'IT'],
    durationMinutes: 180,
    preferredSlotId: 'SLOT-2',
    priority: 'HIGH',
    batches: ['CSE-2023-A', 'CSE-2023-B', 'CSE-2024-A', 'IT-2023-A', 'IT-2023-B'],
    totalStudents: 168,
  },
  {
    id: 'PAPER-CS202',
    code: 'CS202',
    name: 'Database Management Systems',
    departments: ['CSE', 'IT'],
    durationMinutes: 180,
    preferredSlotId: 'SLOT-3',
    priority: 'MEDIUM',
    batches: ['CSE-2023-A', 'CSE-2023-B', 'IT-2023-A', 'IT-2023-B'],
    totalStudents: 138,
  },
  {
    id: 'PAPER-CS203',
    code: 'CS203',
    name: 'Operating Systems & Architecture',
    departments: ['CSE', 'ECE', 'IT'],
    durationMinutes: 180,
    preferredSlotId: 'SLOT-1',
    priority: 'MEDIUM',
    batches: ['CSE-2024-A', 'ECE-2024-A', 'ECE-2023-A'],
    totalStudents: 95,
  },
];

export const BATCH_DEFINITIONS = [
  { id: 'CSE-2023-A', name: 'B.Tech CSE 2023 - Div A', department: 'CSE', count: 35, semester: 5 },
  { id: 'CSE-2023-B', name: 'B.Tech CSE 2023 - Div B', department: 'CSE', count: 35, semester: 5 },
  { id: 'CSE-2024-A', name: 'B.Tech CSE 2024 - Div A', department: 'CSE', count: 32, semester: 3 },
  { id: 'ECE-2023-A', name: 'B.Tech ECE 2023 - Div A', department: 'ECE', count: 33, semester: 5 },
  { id: 'ECE-2023-B', name: 'B.Tech ECE 2023 - Div B', department: 'ECE', count: 33, semester: 5 },
  { id: 'ECE-2024-A', name: 'B.Tech ECE 2024 - Div A', department: 'ECE', count: 30, semester: 3 },
  { id: 'ME-2023-A', name: 'B.Tech ME 2023 - Div A', department: 'ME', count: 32, semester: 5 },
  { id: 'ME-2023-B', name: 'B.Tech ME 2023 - Div B', department: 'ME', count: 30, semester: 5 },
  { id: 'CE-2023-A', name: 'B.Tech CE 2023 - Div A', department: 'CE', count: 32, semester: 5 },
  { id: 'CE-2023-B', name: 'B.Tech CE 2023 - Div B', department: 'CE', count: 32, semester: 5 },
  { id: 'IT-2023-A', name: 'B.Tech IT 2023 - Div A', department: 'IT', count: 36, semester: 5 },
  { id: 'IT-2023-B', name: 'B.Tech IT 2023 - Div B', department: 'IT', count: 34, semester: 5 },
];

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharva', 'Advik', 'Pranav', 'Advaith', 'Aayush', 'Dhruv', 'Kabir', 'Rohan', 'Kunal',
  'Ananya', 'Diya', 'Gauri', 'Isha', 'Kavya', 'Khushi', 'Myra', 'Navya', 'Pari', 'Prisha',
  'Riya', 'Saanvi', 'Tanvi', 'Vanya', 'Zoya', 'Sneha', 'Meera', 'Pooja', 'Shruti', 'Anika',
  'Aman', 'Rahul', 'Nikhil', 'Simran', 'Kiran', 'Siddharth', 'Tanmay', 'Varun', 'Tarun', 'Harsh'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Mehta', 'Rao', 'Nair', 'Iyer', 'Sen', 'Gupta', 'Reddy',
  'Deshmukh', 'Menon', 'Kulkarni', 'Bhat', 'Joshi', 'Chauhan', 'Kumar', 'Singh', 'Kapoor', 'Malhotra',
  'Agarwal', 'Chatterjee', 'Banerjee', 'Ghosh', 'Pandey', 'Mishra', 'Saxena', 'Trivedi', 'Bose', 'Nambiar'
];

// Generate 390 realistic students deterministically
export function generateSeedStudents() {
  const students = [];
  let studentIndex = 1;

  BATCH_DEFINITIONS.forEach((batch) => {
    const deptPrefix = batch.department.substring(0, 3).toUpperCase();
    const yearPrefix = batch.id.includes('2023') ? '23' : '24';

    for (let i = 1; i <= batch.count; i++) {
      const fnIdx = (studentIndex * 7 + i * 3) % FIRST_NAMES.length;
      const lnIdx = (studentIndex * 11 + i * 5) % LAST_NAMES.length;
      const firstName = FIRST_NAMES[fnIdx];
      const lastName = LAST_NAMES[lnIdx];
      const rollNumber = `${yearPrefix}${deptPrefix}${String(i).padStart(3, '0')}`;

      // Assign realistic accessibility needs (around 4-5% of student population)
      const isWheelchair = studentIndex === 14 || studentIndex === 88 || studentIndex === 215;
      const isGroundFloor = isWheelchair || studentIndex === 42 || studentIndex === 170;
      const nearEntrance = isWheelchair || studentIndex === 99 || studentIndex === 285;
      const extraTime = studentIndex === 42 || studentIndex === 150 || studentIndex === 312;
      const medicalReq = studentIndex === 215 || studentIndex === 340;

      // Determine papers based on batch
      const studentPapers = [];
      if (batch.department === 'CSE') {
        if (batch.semester === 5) studentPapers.push('MAT101', 'CS201', 'CS202');
        else studentPapers.push('CS201', 'CS203');
      } else if (batch.department === 'IT') {
        studentPapers.push('MAT101', 'CS201', 'CS202');
      } else if (batch.department === 'ECE') {
        if (batch.semester === 5) studentPapers.push('MAT101');
        else studentPapers.push('CS203');
      } else {
        studentPapers.push('MAT101');
      }

      students.push({
        id: `STU-${String(studentIndex).padStart(4, '0')}`,
        rollNumber,
        name: `${firstName} ${lastName}`,
        department: batch.department,
        batchId: batch.id,
        papers: studentPapers,
        accessibility: {
          wheelchairAccess: isWheelchair,
          groundFloorRequired: isGroundFloor,
          nearEntrance: nearEntrance,
          extraTime: extraTime,
          medicalRequirement: medicalReq,
          description: isWheelchair
            ? 'Wheelchair user - Requires ramp access & ground floor'
            : isGroundFloor
            ? 'Mobility constraint (recent knee surgery)'
            : extraTime
            ? 'Dyslexia accommodation (+30 mins extra time)'
            : medicalReq
            ? 'Type 1 Diabetic - Requires snack access'
            : '',
        },
        status: 'CONFIRMED',
      });

      studentIndex++;
    }
  });

  return students;
}

export const INITIAL_RULES = [
  {
    id: 'RULE-1',
    name: 'Department Separation',
    type: 'DEPARTMENT_SEPARATION',
    departmentA: 'CSE',
    departmentB: 'ECE',
    minDistance: 1,
    priority: 'HIGH',
    rawText: 'CSE and ECE students should not sit next to each other.',
    active: true,
  },
  {
    id: 'RULE-2',
    name: 'Subject Anti-Cheating Dispersion',
    type: 'SUBJECT_SEPARATION',
    minDistance: 1,
    priority: 'HIGH',
    rawText: 'Students appearing for the same paper must not sit directly adjacent.',
    active: true,
  },
  {
    id: 'RULE-3',
    name: 'Ground Floor Accessibility Strictness',
    type: 'ACCESSIBILITY_GROUND_FLOOR',
    priority: 'CRITICAL',
    rawText: 'Students with wheelchair or mobility needs must only be assigned ground floor accessible halls.',
    active: true,
  },
  {
    id: 'RULE-4',
    name: 'Invigilator Department Neutrality',
    type: 'INVIGILATOR_NEUTRALITY',
    priority: 'MEDIUM',
    rawText: 'Invigilators should not invigilate their own home department exams when feasible.',
    active: true,
  },
];

export const INITIAL_INCIDENTS = [
  {
    id: 'INC-001',
    code: 'INC-001',
    type: 'HALL_UNAVAILABLE',
    title: 'AC Failure in Hall B203',
    severity: 'MEDIUM',
    hallId: 'HALL-B203',
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    description: 'Central air conditioning failed during pre-exam check. Ambient temperature reached 36°C.',
    resolution: 'Backup fans deployed and technicians restored cooling prior to session start.',
  },
  {
    id: 'INC-002',
    code: 'INC-002',
    type: 'MEDICAL_EMERGENCY',
    title: 'Hypoglycemic Alert - Hall A101',
    severity: 'LOW',
    hallId: 'HALL-A101',
    studentId: 'STU-0215',
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    description: 'Student requested glucose drink according to medical plan. Administered by health desk.',
    resolution: 'Student resumed exam without delay. Invigilator logged timestamp.',
  },
];
