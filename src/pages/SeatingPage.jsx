import React, { useMemo, useState } from 'react';
import {
  Printer,
  User,
  HeartPulse,
  X,
  Plus,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import {
  SEATING_STRATEGIES,
  generateSeatingLayout,
  buildCustomHallExam,
} from '../engine/seatingEngine';
import QrCodeImage from '../components/QrCodeImage';
import { buildAdmitPayload } from '../utils/admitCard';

const CONSTRAINT_PRESETS = [
  'Two students from the same batch should not sit together',
  'Students from the same department should not sit in adjacent seats',
  'Alternate departments in a checkerboard pattern',
  'Keep accessibility seats near the entrance',
  'Randomized dispersion across the hall',
];

export default function SeatingPage() {
  const { schedule, halls, students, rules, addHall, persist } = useExamStore();

  const [customRoster, setCustomRoster] = useState([]);
  const [customAssignments, setCustomAssignments] = useState([]);
  const [hallModalOpen, setHallModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [hallForm, setHallForm] = useState({
    name: '',
    code: '',
    capacity: 60,
    studentCount: 48,
    constraint: CONSTRAINT_PRESETS[0],
  });

  const assignments = [...customAssignments, ...(schedule?.assignments || [])];
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || '');
  const [strategy, setStrategy] = useState('checkerboard');
  const [selectedSeat, setSelectedSeat] = useState(null);

  const mergedStudents = useMemo(() => [...customRoster, ...students], [customRoster, students]);
  const mergedHalls = useMemo(() => {
    const extras = customAssignments
      .map(asg => halls.find(h => h.id === asg.hallId))
      .filter(Boolean);
    return extras.length ? halls : halls;
  }, [customAssignments, halls]);

  const activeAssignment = assignments.find(a => a.id === selectedAssignmentId) || assignments[0];
  const activeHall = halls.find(h => h.id === activeAssignment?.hallId) || mergedHalls[0];
  const activeStrategy = activeAssignment?.forcedStrategy || strategy;

  const seatingData = activeAssignment && activeHall
    ? generateSeatingLayout(activeAssignment, activeHall, mergedStudents, activeStrategy, rules)
    : { seats: [], rows: 0, cols: 0, antiCheatingScore: 90, riskClusters: [] };

  const handleAddHall = (e) => {
    e.preventDefault();
    const capacity = Number(hallForm.capacity);
    const studentCount = Number(hallForm.studentCount);
    if (!hallForm.name.trim()) {
      setFormError('Please enter a hall name.');
      return;
    }
    if (studentCount > capacity) {
      setFormError('Number of students cannot exceed hall capacity.');
      return;
    }

    const built = buildCustomHallExam({
      name: hallForm.name.trim(),
      code: hallForm.code.trim(),
      capacity,
      studentCount,
      constraint: hallForm.constraint,
    });

    built.assignment.forcedStrategy = built.strategy;
    addHall(built.hall);
    setCustomRoster(prev => [...prev, ...built.students]);
    setCustomAssignments(prev => [built.assignment, ...prev]);
    setSelectedAssignmentId(built.assignment.id);
    setStrategy(built.strategy);
    setHallModalOpen(false);
    setFormError('');
    setHallForm({
      name: '',
      code: '',
      capacity: 60,
      studentCount: 48,
      constraint: CONSTRAINT_PRESETS[0],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6a994e] font-semibold">Hall map</p>
          <h1 className="text-2xl font-bold text-[#386641] dark:text-[#f2e8cf] mt-1">
            Smart seating
          </h1>
          <p className="text-sm text-[#386641]/70 dark:text-[#f2e8cf]/70 mt-1 max-w-xl">
            Place students with batch, department, and accessibility constraints, then print the chart for the hall.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHallModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-[#386641] hover:bg-[#2d5234] text-[#f2e8cf] text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add a hall</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border border-[#386641]/20 bg-white dark:bg-[#243528] text-[#386641] dark:text-[#f2e8cf] text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print seating chart</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-white dark:bg-[#243528] border border-[#386641]/12 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#386641]/70">Scheduled exam & hall</label>
          <select
            value={activeAssignment?.id || ''}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="w-full py-2 px-3 rounded-2xl border border-[#386641]/15 bg-[#f2e8cf]/50 dark:bg-[#1a2b1e] text-[#386641] dark:text-[#f2e8cf] outline-none"
          >
            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {a.paperCode} • {a.hallName} ({a.studentCount} students)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#386641]/70">Seating constraint</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full py-2 px-3 rounded-2xl border border-[#386641]/15 bg-[#f2e8cf]/50 dark:bg-[#1a2b1e] text-[#386641] dark:text-[#f2e8cf] outline-none"
          >
            {SEATING_STRATEGIES.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-around p-2 rounded-2xl bg-[#f2e8cf]/70 dark:bg-[#1a2b1e] border border-[#386641]/10">
          <div className="text-center">
            <span className="text-[10px] text-[#386641]/50 uppercase font-bold block">Anti-cheating</span>
            <span className="text-base font-bold text-[#386641] dark:text-[#a7c957] font-mono">
              {seatingData.antiCheatingScore} / 100
            </span>
          </div>
          <div className="h-8 w-px bg-[#386641]/15" />
          <div className="text-center">
            <span className="text-[10px] text-[#386641]/50 uppercase font-bold block">Assigned / cap</span>
            <span className="text-base font-bold text-[#6a994e] font-mono">
              {seatingData.assignedCount} / {seatingData.totalCapacity}
            </span>
          </div>
        </div>
      </div>

      {activeAssignment?.customConstraint && (
        <div className="px-4 py-2.5 rounded-2xl bg-[#a7c957]/25 border border-[#6a994e]/30 text-xs text-[#386641]">
          Active constraint: <strong>{activeAssignment.customConstraint}</strong>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#f2e8cf] dark:bg-[#243528] text-xs">
        <span className="font-semibold text-[#386641]/70 text-[11px]">Seat legend</span>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#386641] dark:text-[#f2e8cf]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#6a994e]" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#386641]" />
            <span>Accessibility</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-white border border-[#386641]/20" />
            <span>Empty</span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-[#243528] border border-[#386641]/12 shadow-sm space-y-6 print-seating">
        <div className="w-48 mx-auto py-1.5 px-4 rounded-2xl bg-[#386641] text-center font-bold text-xs text-[#f2e8cf] uppercase tracking-widest">
          Exam podium / entrance
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[650px] space-y-2">
            {(seatingData.gridMatrix || []).map((row, rIdx) => (
              <div key={rIdx} className="flex items-center space-x-2">
                <div className="w-6 text-center font-bold font-mono text-xs text-[#6a994e]">
                  {String.fromCharCode(65 + rIdx)}
                </div>
                <div className="flex-1 grid grid-cols-10 gap-2">
                  {row.map(seat => {
                    const isSelected = selectedSeat?.seatId === seat.seatId;
                    return (
                      <button
                        key={seat.seatId}
                        type="button"
                        onClick={() => seat.studentId && setSelectedSeat(seat)}
                        className={`p-2 rounded-2xl text-center transition-all relative flex flex-col justify-between h-16 border ${
                          seat.status === 'accessibility'
                            ? 'bg-[#386641]/15 text-[#386641] border-[#386641]/40'
                            : seat.status === 'occupied'
                            ? 'bg-[#a7c957]/30 text-[#386641] border-[#6a994e]/40'
                            : 'bg-[#f2e8cf]/60 text-[#386641]/50 border-[#386641]/10 cursor-default'
                        } ${isSelected ? 'ring-2 ring-[#386641] shadow-lg scale-105' : ''}`}
                      >
                        <div className="flex justify-between items-center w-full text-[9px] font-mono font-bold">
                          <span>{seat.seatNumber}</span>
                        </div>
                        {seat.studentRoll ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold font-mono truncate block">{seat.studentRoll}</span>
                            <span className="text-[8px] font-semibold px-1 rounded-md bg-[#386641]/10 block truncate">
                              {seat.department}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] italic">Empty</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24402a]/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#243528] border border-[#386641]/15 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#386641]/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-2xl bg-[#a7c957]/30 text-[#386641]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#386641] dark:text-[#f2e8cf]">{selectedSeat.studentName}</h3>
                  <span className="text-xs font-mono text-[#6a994e]">Roll: {selectedSeat.studentRoll}</span>
                </div>
              </div>
              <button onClick={() => setSelectedSeat(null)} className="text-[#6a994e]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#386641] dark:text-[#f2e8cf]">
              <div className="flex justify-between py-1 border-b border-[#386641]/10">
                <span className="opacity-70">Assigned desk</span>
                <strong className="font-mono">{selectedSeat.seatId}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#386641]/10">
                <span className="opacity-70">Department / batch</span>
                <strong>{selectedSeat.department} • {selectedSeat.batchId}</strong>
              </div>
              {selectedSeat.isAccessibilitySeat && (
                <div className="p-3 rounded-2xl bg-[#386641]/10 text-[#386641] dark:text-[#f2e8cf] space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <HeartPulse className="w-4 h-4" />
                    <span>Accessibility seat</span>
                  </div>
                  <p className="text-[11px]">{selectedSeat.accessibilityDetail || 'Ramp and ground floor seating allocated.'}</p>
                </div>
              )}
            </div>

            <div className="pt-2 text-center border-t border-[#386641]/10 space-y-2">
              <QrCodeImage
                value={buildAdmitPayload(
                  { name: selectedSeat.studentName, rollNumber: selectedSeat.studentRoll, department: selectedSeat.department, batchId: selectedSeat.batchId },
                  { paperCode: selectedSeat.paperCode, paperName: '', hallName: activeHall?.name, seatNumber: selectedSeat.seatNumber }
                )}
                size={112}
                className="mx-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {hallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24402a]/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#243528] border border-[#386641]/15 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#386641]/10 pb-3">
              <h3 className="font-bold text-base text-[#386641] dark:text-[#f2e8cf]">List a new exam hall</h3>
              <button onClick={() => setHallModalOpen(false)} className="text-[#6a994e]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddHall} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-[#386641] dark:text-[#f2e8cf]">Hall name</label>
                  <input
                    required
                    value={hallForm.name}
                    onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                    placeholder="e.g. Hall C204"
                    className="w-full p-2.5 rounded-2xl border border-[#386641]/15 bg-[#f2e8cf]/40 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#386641] dark:text-[#f2e8cf]">Hall code</label>
                  <input
                    value={hallForm.code}
                    onChange={(e) => setHallForm({ ...hallForm, code: e.target.value })}
                    placeholder="C204"
                    className="w-full p-2.5 rounded-2xl border border-[#386641]/15 bg-[#f2e8cf]/40 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#386641] dark:text-[#f2e8cf]">Hall capacity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={hallForm.capacity}
                    onChange={(e) => setHallForm({ ...hallForm, capacity: e.target.value })}
                    className="w-full p-2.5 rounded-2xl border border-[#386641]/15 bg-[#f2e8cf]/40 outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-[#386641] dark:text-[#f2e8cf]">Number of students</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={hallForm.studentCount}
                    onChange={(e) => setHallForm({ ...hallForm, studentCount: e.target.value })}
                    className="w-full p-2.5 rounded-2xl border border-[#386641]/15 bg-[#f2e8cf]/40 outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-[#386641] dark:text-[#f2e8cf]">Seating constraint</label>
                  <select
                    value={hallForm.constraint}
                    onChange={(e) => setHallForm({ ...hallForm, constraint: e.target.value })}
                    className="w-full p-2.5 rounded-2xl border border-[#386641]/15 bg-[#f2e8cf]/40 outline-none"
                  >
                    {CONSTRAINT_PRESETS.map(preset => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>
                  <textarea
                    value={hallForm.constraint}
                    onChange={(e) => setHallForm({ ...hallForm, constraint: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 rounded-2xl border border-[#386641]/15 bg-[#f2e8cf]/40 outline-none mt-2"
                    placeholder="Or type a custom constraint"
                  />
                </div>
              </div>
              {formError && <p className="text-[#bc4749] font-semibold">{formError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setHallModalOpen(false)} className="px-4 py-2 rounded-2xl border border-[#386641]/20 font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-2xl bg-[#386641] text-[#f2e8cf] font-bold">
                  Generate seating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
