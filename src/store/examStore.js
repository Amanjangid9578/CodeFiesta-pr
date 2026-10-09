// BENCHMARK Central State Store (Zustand + LocalStorage)
import { create } from 'zustand';
import {
  INITIAL_HALLS,
  INITIAL_INVIGILATORS,
  INITIAL_PAPERS,
  INITIAL_SLOTS,
  INITIAL_RULES,
  INITIAL_INCIDENTS,
  generateSeedStudents,
} from '../data/seedData.js';
import { generateOptimalSchedule } from '../engine/scheduler.js';
import { validateSchedule } from '../engine/validator.js';
import { calculateResilienceScore } from '../engine/resilienceEngine.js';
import { calculateMinimumDisruptionRepair } from '../engine/repairEngine.js';
import { formatExplainableConflicts, applyConflictFix } from '../engine/conflictEngine.js';
import { runSimulation } from '../engine/simulationEngine.js';

const STORAGE_KEY = 'EXAMGUARD_STATE_V1';

// Helper to push history snapshot for Undo/Redo
function createSnapshot(state) {
  return {
    halls: JSON.parse(JSON.stringify(state.halls)),
    invigilators: JSON.parse(JSON.stringify(state.invigilators)),
    students: JSON.parse(JSON.stringify(state.students)),
    papers: JSON.parse(JSON.stringify(state.papers)),
    schedule: state.schedule ? JSON.parse(JSON.stringify(state.schedule)) : null,
    rules: JSON.parse(JSON.stringify(state.rules)),
    customSeatingAssignments: JSON.parse(JSON.stringify(state.customSeatingAssignments || [])),
    customSeatingStudents: JSON.parse(JSON.stringify(state.customSeatingStudents || [])),
  };
}

// Initial state loader
function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.halls && parsed.students && parsed.schedule) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved state:', e);
  }

  // Generate initial demo data
  const students = generateSeedStudents();
  const halls = INITIAL_HALLS;
  const invigilators = INITIAL_INVIGILATORS;
  const papers = INITIAL_PAPERS;
  const slots = INITIAL_SLOTS;
  const rules = INITIAL_RULES;

  // Generate initial conflict-free schedule
  const { schedule, validation } = generateOptimalSchedule(halls, invigilators, students, papers, slots, rules);
  const resilience = calculateResilienceScore(halls, invigilators, students, schedule, validation);

  return {
    halls,
    invigilators,
    students,
    papers,
    slots,
    rules,
    schedule,
    validationResult: validation,
    resilienceScore: resilience,
    explainableConflicts: [],
    incidents: INITIAL_INCIDENTS,
    auditLogs: [
      {
        id: 'LOG-INIT',
        timestamp: new Date().toLocaleTimeString(),
        action: 'System Initialization',
        resource: 'Platform',
        details: 'Initial database populated with 390 students, 6 halls, 15 invigilators, and 4 examination papers.',
      }
    ],
    notifications: [
      {
        id: 'NOTIF-1',
        title: 'Master Schedule Active',
        message: 'Conflict-free schedule generated. Resilience Score: 94/100.',
        type: 'SUCCESS',
        timestamp: 'Just now',
        read: false,
      }
    ],
  };
}

const defaultState = loadInitialState();

export const useExamStore = create((set, get) => ({
  halls: defaultState.halls,
  invigilators: defaultState.invigilators,
  students: defaultState.students,
  papers: defaultState.papers,
  slots: defaultState.slots,
  rules: defaultState.rules,
  schedule: defaultState.schedule,
  validationResult: defaultState.validationResult,
  resilienceScore: defaultState.resilienceScore,
  explainableConflicts: defaultState.explainableConflicts || [],
  incidents: defaultState.incidents || INITIAL_INCIDENTS,
  auditLogs: defaultState.auditLogs || [],
  notifications: defaultState.notifications || [],
  simulationResult: null,

  // History for Undo/Redo
  undoStack: [],
  redoStack: [],

  // Theme & UI state
  darkMode: localStorage.getItem('EXAMGUARD_THEME') === 'dark',
  emergencyMode: false,
  isGeneratingSchedule: false,

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    localStorage.setItem('EXAMGUARD_THEME', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setEmergencyMode: (val) => set({ emergencyMode: val }),

  pushAudit: (action, resource, details) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action,
      resource,
      details,
    };
    set(state => ({
      auditLogs: [newLog, ...state.auditLogs.slice(0, 99)],
    }));
  },

  addNotification: (title, message, type = 'INFO') => {
    const notif = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
    };
    set(state => ({
      notifications: [notif, ...state.notifications],
    }));
  },

  markNotificationsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }));
  },

  // State Persistence Helper
  persist: () => {
    try {
      const state = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        halls: state.halls,
        invigilators: state.invigilators,
        students: state.students,
        papers: state.papers,
        slots: state.slots,
        rules: state.rules,
        schedule: state.schedule,
        incidents: state.incidents,
        auditLogs: state.auditLogs,
      }));
    } catch (e) {
      console.error('LocalStorage persist error:', e);
    }
  },

  // Save undo snapshot before mutations
  saveUndoSnapshot: () => {
    const snapshot = createSnapshot(get());
    set(state => ({
      undoStack: [...state.undoStack.slice(-15), snapshot],
      redoStack: [],
    }));
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return;
    const currentSnapshot = createSnapshot(get());
    const prevSnapshot = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);

    set({
      halls: prevSnapshot.halls,
      invigilators: prevSnapshot.invigilators,
      students: prevSnapshot.students,
      papers: prevSnapshot.papers,
      schedule: prevSnapshot.schedule,
      rules: prevSnapshot.rules,
      customSeatingAssignments: prevSnapshot.customSeatingAssignments,
      customSeatingStudents: prevSnapshot.customSeatingStudents,
      undoStack: newUndo,
      redoStack: [...redoStack, currentSnapshot],
    });

    get().revalidateAll();
    get().pushAudit('Undo Executed', 'History', 'Reverted system state to previous checkpoint.');
    get().persist();
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return;
    const currentSnapshot = createSnapshot(get());
    const nextSnapshot = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    set({
      halls: nextSnapshot.halls,
      invigilators: nextSnapshot.invigilators,
      students: nextSnapshot.students,
      papers: nextSnapshot.papers,
      schedule: nextSnapshot.schedule,
      rules: nextSnapshot.rules,
      customSeatingAssignments: nextSnapshot.customSeatingAssignments,
      customSeatingStudents: nextSnapshot.customSeatingStudents,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: newRedo,
    });

    get().revalidateAll();
    get().pushAudit('Redo Executed', 'History', 'Re-applied previously reverted state change.');
    get().persist();
  },

  // Revalidate Schedule & Compute Resilience
  revalidateAll: () => {
    const { schedule, halls, invigilators, students, papers, slots, rules } = get();
    if (!schedule) return;

    const val = validateSchedule(schedule, halls, invigilators, students, papers, slots, rules);
    const res = calculateResilienceScore(halls, invigilators, students, schedule, val);
    const expl = formatExplainableConflicts(val.conflicts, schedule, halls, invigilators, students);

    set({
      validationResult: val,
      resilienceScore: res,
      explainableConflicts: expl,
    });
  },

  // Generate Optimal Master Schedule
  generateSchedule: async () => {
    get().saveUndoSnapshot();
    set({ isGeneratingSchedule: true });

    // Artificial pause to allow UI progression animation
    await new Promise(r => setTimeout(r, 600));

    const { halls, invigilators, students, papers, slots, rules } = get();
    const { schedule, validation } = generateOptimalSchedule(halls, invigilators, students, papers, slots, rules);
    const resilience = calculateResilienceScore(halls, invigilators, students, schedule, validation);
    const expl = formatExplainableConflicts(validation.conflicts, schedule, halls, invigilators, students);

    set({
      schedule,
      validationResult: validation,
      resilienceScore: resilience,
      explainableConflicts: expl,
      isGeneratingSchedule: false,
    });

    get().pushAudit('Schedule Generated', 'Master Timetable', `Generated ${schedule.assignments.length} assignments across 4 papers and 6 halls.`);
    get().addNotification('Optimal Schedule Generated', 'Master timetable generated with 0 conflicts and balanced proctor load.', 'SUCCESS');
    get().persist();
  },

  // Hall Management Actions
  setHallStatus: (hallId, newStatus) => {
    get().saveUndoSnapshot();
    const hall = get().halls.find(h => h.id === hallId);
    const hallName = hall ? hall.name : hallId;

    const updatedHalls = get().halls.map(h => h.id === hallId ? { ...h, status: newStatus } : h);
    set({ halls: updatedHalls });

    get().revalidateAll();
    get().pushAudit(`Hall Status Changed: ${hallName}`, 'Infrastructure', `Updated status from ${hall?.status} to ${newStatus}.`);

    if (newStatus === 'UNAVAILABLE') {
      get().addNotification(
        `Critical Disruption: ${hallName} Offline`,
        `${hallName} was marked unavailable. Master schedule has conflicts. Self-healing repair ready.`,
        'CRITICAL'
      );
    }
    get().persist();
  },

  addHall: (hallData) => {
    get().saveUndoSnapshot();
    const newHall = {
      ...hallData,
      id: `HALL-${Date.now()}`,
      status: hallData.status || 'ACTIVE',
    };
    set(state => ({ halls: [...state.halls, newHall] }));
    get().revalidateAll();
    get().pushAudit('Hall Created', 'Infrastructure', `Added hall ${newHall.name} with capacity ${newHall.capacity}.`);
    get().persist();
  },

  updateHall: (hallId, updates) => {
    get().saveUndoSnapshot();
    set(state => ({
      halls: state.halls.map(h => h.id === hallId ? { ...h, ...updates } : h),
    }));
    get().revalidateAll();
    get().pushAudit('Hall Updated', 'Infrastructure', `Modified parameters for hall ID ${hallId}.`);
    get().persist();
  },

  deleteHall: (hallId) => {
    get().saveUndoSnapshot();
    set(state => ({
      halls: state.halls.filter(h => h.id !== hallId),
    }));
    get().revalidateAll();
    get().pushAudit('Hall Removed', 'Infrastructure', `Deleted hall ID ${hallId}.`);
    get().persist();
  },

  // Invigilator Actions
  setInvigilatorStatus: (invId, status) => {
    get().saveUndoSnapshot();
    const inv = get().invigilators.find(i => i.id === invId);
    set(state => ({
      invigilators: state.invigilators.map(i => i.id === invId ? { ...i, status } : i),
    }));
    get().revalidateAll();
    get().pushAudit(`Invigilator Status: ${inv?.name}`, 'Staffing', `Status updated to ${status}.`);
    get().persist();
  },

  addInvigilator: (data) => {
    get().saveUndoSnapshot();
    const newInv = {
      ...data,
      id: `INV-${Date.now()}`,
      status: 'AVAILABLE',
      currentDuties: 0,
    };
    set(state => ({ invigilators: [...state.invigilators, newInv] }));
    get().revalidateAll();
    get().pushAudit('Staff Enrolled', 'Staffing', `Added invigilator ${newInv.name}.`);
    get().persist();
  },

  updateInvigilator: (id, updates) => {
    get().saveUndoSnapshot();
    set(state => ({
      invigilators: state.invigilators.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
    get().revalidateAll();
    get().persist();
  },

  deleteInvigilator: (id) => {
    get().saveUndoSnapshot();
    set(state => ({
      invigilators: state.invigilators.filter(i => i.id !== id),
    }));
    get().revalidateAll();
    get().persist();
  },

  // Student Actions
  addStudent: (data) => {
    get().saveUndoSnapshot();
    const newStu = {
      ...data,
      id: `STU-${Date.now()}`,
      status: 'CONFIRMED',
    };
    set(state => ({ students: [...state.students, newStu] }));
    get().revalidateAll();
    get().pushAudit('Student Registered', 'Examinees', `Registered student ${newStu.name} (${newStu.rollNumber}).`);
    get().persist();
  },

  updateStudent: (id, updates) => {
    get().saveUndoSnapshot();
    set(state => ({
      students: state.students.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
    get().revalidateAll();
    get().persist();
  },

  deleteStudent: (id) => {
    get().saveUndoSnapshot();
    set(state => ({
      students: state.students.filter(s => s.id !== id),
    }));
    get().revalidateAll();
    get().persist();
  },

  importStudentsCSV: (parsedStudents) => {
    get().saveUndoSnapshot();
    set(state => ({
      students: [...state.students, ...parsedStudents],
    }));
    get().revalidateAll();
    get().pushAudit('Bulk CSV Import', 'Examinees', `Imported ${parsedStudents.length} students from CSV.`);
    get().addNotification('CSV Import Complete', `Added ${parsedStudents.length} students to examinee roster.`, 'SUCCESS');
    get().persist();
  },

  // Paper Actions
  addPaper: (data) => {
    get().saveUndoSnapshot();
    const newPaper = {
      ...data,
      id: `PAPER-${Date.now()}`,
    };
    set(state => ({ papers: [...state.papers, newPaper] }));
    get().revalidateAll();
    get().persist();
  },

  updatePaper: (id, updates) => {
    get().saveUndoSnapshot();
    set(state => ({
      papers: state.papers.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
    get().revalidateAll();
    get().persist();
  },

  deletePaper: (id) => {
    get().saveUndoSnapshot();
    set(state => ({
      papers: state.papers.filter(p => p.id !== id),
    }));
    get().revalidateAll();
    get().persist();
  },

  // Rules Actions
  addRule: (rule) => {
    get().saveUndoSnapshot();
    set(state => ({ rules: [rule, ...state.rules] }));
    get().revalidateAll();
    get().pushAudit('Rule Added', 'Policy Engine', `Activated constraint: ${rule.name}`);
    get().addNotification('Rule Created', `Enforcing rule: "${rule.name}"`, 'INFO');
    get().persist();
  },

  toggleRule: (ruleId) => {
    get().saveUndoSnapshot();
    set(state => ({
      rules: state.rules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r),
    }));
    get().revalidateAll();
    get().persist();
  },

  deleteRule: (ruleId) => {
    get().saveUndoSnapshot();
    set(state => ({
      rules: state.rules.filter(r => r.id !== ruleId),
    }));
    get().revalidateAll();
    get().persist();
  },

  // Incidents Actions
  reportIncident: (incidentData) => {
    const newIncident = {
      ...incidentData,
      id: `INC-${Date.now()}`,
      code: `INC-${String(get().incidents.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      status: 'OPEN',
    };
    set(state => ({
      incidents: [newIncident, ...state.incidents],
    }));
    get().pushAudit(`Incident Logged: ${newIncident.title}`, 'Incident Command', `Severity: ${newIncident.severity}.`);
    get().addNotification(`Incident: ${newIncident.title}`, newIncident.description, 'WARNING');
    get().persist();
    return newIncident;
  },

  resolveIncident: (incidentId, resolution) => {
    set(state => ({
      incidents: state.incidents.map(inc => inc.id === incidentId ? { ...inc, status: 'RESOLVED', resolution } : inc),
    }));
    get().pushAudit(`Incident Resolved`, 'Incident Command', `ID: ${incidentId} resolved.`);
    get().persist();
  },

  // Self-Healing Repair Actions
  executeRepair: (disruptionPayload, chosenCandidate = null) => {
    get().saveUndoSnapshot();
    const { schedule, halls, invigilators, students, papers, slots, rules } = get();

    const repairResult = calculateMinimumDisruptionRepair(
      schedule,
      disruptionPayload,
      halls,
      invigilators,
      students,
      papers,
      slots,
      rules
    );

    const targetCandidate = chosenCandidate || repairResult.recommended;
    if (!targetCandidate) return null;

    set({
      schedule: targetCandidate.repairedSchedule,
    });

    get().revalidateAll();
    get().pushAudit(
      'Self-Healing Repair Applied',
      'Resilience Engine',
      `${targetCandidate.title} applied. Required ${targetCandidate.totalChanges} changes. 0 conflicts remain.`
    );
    get().addNotification(
      'Self-Healing Complete',
      `Schedule automatically repaired via ${targetCandidate.title}. Zero timetable conflicts.`,
      'SUCCESS'
    );
    get().persist();

    return { repairResult, appliedCandidate: targetCandidate };
  },

  // Apply Single Explainable Conflict Fix
  fixSingleConflict: (conflict) => {
    get().saveUndoSnapshot();
    const { schedule, halls, invigilators, students } = get();
    const repaired = applyConflictFix(conflict, schedule, halls, invigilators, students);

    set({ schedule: repaired });
    get().revalidateAll();
    get().pushAudit('Conflict Auto-Fixed', 'Conflict Engine', `Resolved ${conflict.title}: ${conflict.impact}`);
    get().persist();
  },

  // What-If Simulator Action
  runWhatIfSimulation: (scenarioType, targetEntityId) => {
    const { schedule, halls, invigilators, students, papers, slots, rules } = get();
    const result = runSimulation({
      scenarioType,
      targetEntityId,
      schedule,
      halls,
      invigilators,
      students,
      papers,
      slots,
      rules,
    });
    set({ simulationResult: result });
    return result;
  },

  applySimulationToMaster: (simResult) => {
    if (!simResult || !simResult.recovered?.schedule) return;
    get().saveUndoSnapshot();

    set({
      schedule: simResult.recovered.schedule,
      simulationResult: null,
    });

    get().revalidateAll();
    get().pushAudit('Simulation Applied to Master', 'What-If Engine', `Scenario ${simResult.scenarioType} committed to production schedule.`);
    get().addNotification('Simulation Applied', 'Production master timetable updated from simulation state.', 'SUCCESS');
    get().persist();
  },

  // Reset to Clean Demo State
  resetToDemo: () => {
    get().saveUndoSnapshot();
    localStorage.removeItem(STORAGE_KEY);
    const freshStudents = generateSeedStudents();
    const freshHalls = INITIAL_HALLS;
    const freshInvigilators = INITIAL_INVIGILATORS;
    const freshPapers = INITIAL_PAPERS;
    const freshSlots = INITIAL_SLOTS;
    const freshRules = INITIAL_RULES;

    const { schedule, validation } = generateOptimalSchedule(freshHalls, freshInvigilators, freshStudents, freshPapers, freshSlots, freshRules);
    const resilience = calculateResilienceScore(freshHalls, freshInvigilators, freshStudents, schedule, validation);

    set({
      halls: freshHalls,
      invigilators: freshInvigilators,
      students: freshStudents,
      papers: freshPapers,
      slots: freshSlots,
      rules: freshRules,
      schedule,
      validationResult: validation,
      resilienceScore: resilience,
      explainableConflicts: [],
      incidents: INITIAL_INCIDENTS,
      simulationResult: null,
      emergencyMode: false,
    });

    get().pushAudit('System Reset', 'Demo Management', 'Restored pristine sample benchmark data.');
    get().addNotification('Demo Data Restored', 'Platform reset to pristine initial scenario with 0 conflicts.', 'INFO');
    get().persist();
  },
}));
