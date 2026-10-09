import React, { useState } from 'react';
import {
  Network,
  Building2,
  BookOpen,
  Users,
  UserCheck,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function DigitalTwinPage() {
  const {
    halls,
    papers,
    invigilators,
    schedule,
    setHallStatus,
    executeRepair,
  } = useExamStore();

  const [selectedHallId, setSelectedHallId] = useState('HALL-B203');
  const [isSimulatingDisruption, setIsSimulatingDisruption] = useState(false);

  const selectedHall = halls.find(h => h.id === selectedHallId) || halls[0];
  const assignments = schedule?.assignments || [];

  // Find all assignments linked to this hall
  const linkedAssignments = assignments.filter(a => a.hallId === selectedHall.id);
  const totalImpactedStudents = linkedAssignments.reduce((s, a) => s + (a.studentCount || 0), 0);
  const linkedInvigilators = Array.from(new Set(linkedAssignments.flatMap(a => a.invigilatorNames || [])));
  const linkedPapers = Array.from(new Set(linkedAssignments.map(a => `${a.paperCode} - ${a.paperName}`)));

  const backupHall = halls.find(h => h.status === 'BACKUP') || halls[6];

  const handleToggleFault = () => {
    if (selectedHall.status === 'UNAVAILABLE') {
      setHallStatus(selectedHall.id, 'ACTIVE');
      setIsSimulatingDisruption(false);
    } else {
      setHallStatus(selectedHall.id, 'UNAVAILABLE');
      setIsSimulatingDisruption(true);
      executeRepair({ type: 'HALL_UNAVAILABLE', entityId: selectedHall.id });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold font-mono tracking-wider uppercase">
              Schedule Digital Twin
            </span>
            <span className="text-slate-400 text-xs">• Real-Time Dependency Graph</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Operational Dependency Graph
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Explore live topological relationships between examination halls, course papers, student cohorts, and proctor faculty.
          </p>
        </div>

        <button
          onClick={handleToggleFault}
          className={`self-start md:self-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg ${
            selectedHall.status === 'UNAVAILABLE'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>
            {selectedHall.status === 'UNAVAILABLE'
              ? `RESTORE ${selectedHall.code} ONLINE`
              : `SIMULATE ${selectedHall.code} OUTAGE`}
          </span>
        </button>
      </div>

      {/* Hall Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">
          Inspect Node:
        </span>
        {halls.map(h => (
          <button
            key={h.id}
            onClick={() => setSelectedHallId(h.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              selectedHallId === h.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              h.status === 'ACTIVE' ? 'bg-emerald-400' : h.status === 'BACKUP' ? 'bg-cyan-400' : 'bg-rose-500'
            }`} />
            <span>{h.name}</span>
          </button>
        ))}
      </div>

      {/* Main Digital Twin Interactive Visualization Graph */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-indigo-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Dependency Tree for {selectedHall.name}
            </h3>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
            selectedHall.status === 'ACTIVE'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          }`}>
            STATUS: {selectedHall.status}
          </span>
        </div>

        {/* Tree Topology Representation */}
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-6 relative">
          {/* Level 1: Examination Hall Root */}
          <div className="flex flex-col items-center space-y-2 text-center z-10">
            <div className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center border-2 transition-all shadow-xl ${
              selectedHall.status === 'UNAVAILABLE'
                ? 'bg-rose-500/10 border-rose-500 text-rose-600 ring-4 ring-rose-500/20'
                : 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
            }`}>
              <Building2 className="w-8 h-8 mb-1" />
              <strong className="text-xs">{selectedHall.name}</strong>
              <span className="text-[10px] opacity-75">{selectedHall.capacity} Seats</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
              Host Resource
            </span>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-400 hidden md:block" />

          {/* Level 2: Dependent Exam Papers */}
          <div className="flex flex-col items-center space-y-3 z-10">
            {linkedPapers.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-400">
                No active exam scheduled in this hall
              </div>
            ) : (
              linkedPapers.map((paperStr, i) => (
                <div
                  key={i}
                  className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center space-x-2 shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span>{paperStr}</span>
                </div>
              ))
            )}
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
              Assigned Paper
            </span>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-400 hidden md:block" />

          {/* Level 3: Students & Proctors */}
          <div className="space-y-4 z-10">
            {/* Student Cohort Node */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-semibold flex items-center space-x-3 shadow-sm">
              <Users className="w-5 h-5 text-cyan-500" />
              <div>
                <span className="block font-bold text-sm font-mono">{totalImpactedStudents} Examinees</span>
                <span className="text-[10px] opacity-75">Dependent on Hall Capacity</span>
              </div>
            </div>

            {/* Proctor Faculty Node */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-3 shadow-sm">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              <div>
                <span className="block font-bold">{linkedInvigilators.join(', ') || 'Standby'}</span>
                <span className="text-[10px] opacity-75">Supervisory Faculty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Self-Healing Live Reroute Flow (When Disrupted) */}
        {selectedHall.status === 'UNAVAILABLE' && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Self-Healing Dynamic Reroute Path</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400">
                <span className="font-bold block">1. Fault Isolated</span>
                <span className="text-[11px] opacity-80">{selectedHall.name} flagged unavailable</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block">2. Backup Activated</span>
                <span className="text-[11px] opacity-80">{backupHall.name} ({backupHall.capacity} cap) primed</span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-400">
                <span className="font-bold block">3. Examinees Rerouted</span>
                <span className="text-[11px] opacity-80">{totalImpactedStudents} candidates assigned with 0 clashes</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
