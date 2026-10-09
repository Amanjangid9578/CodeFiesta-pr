import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Building2,
  Users,
  UserCheck,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function ExamDayPage() {
  const navigate = useNavigate();
  const {
    halls,
    invigilators,
    students,
    incidents,
    validationResult,
    emergencyMode,
    setEmergencyMode,
  } = useExamStore();

  const [simulatedTime, setSimulatedTime] = useState('10:00 AM');
  const [presentCount, setPresentCount] = useState(382);
  const [lateCount, setLateCount] = useState(6);
  const [absentCount, setAbsentCount] = useState(2);

  const activeHallsCount = halls.filter(h => h.status === 'ACTIVE').length;
  const activeInvigilatorsCount = invigilators.filter(i => i.status === 'AVAILABLE').length;

  const milestones = [
    { time: '08:00 AM', label: 'Proctor Briefing & Question Paper Delivery', status: 'COMPLETED' },
    { time: '08:30 AM', label: 'Hall Gates Open & Biometric / QR Check-in', status: 'COMPLETED' },
    { time: '09:00 AM', label: 'Morning Examination Session Commences', status: 'ACTIVE' },
    { time: '10:30 AM', label: 'Attendance Sheet Audit & Incident Verification', status: 'IN_PROGRESS' },
    { time: '12:00 PM', label: 'Session Conclusion & Script Sealing', status: 'UPCOMING' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Mission Control Status Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl relative">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest">
              EXAM DAY MODE • LIVE OPERATIONS
            </span>
            <span className="text-slate-500 text-xs">| Slot 1 (Morning Session)</span>
          </div>
          <h1 className="text-2xl font-mono font-extrabold tracking-tight">
            DAY 1 — {simulatedTime}
          </h1>
          <p className="text-xs text-slate-400">
            Real-time examination telemetry, candidate check-ins, and proctor field dispatch
          </p>
        </div>

        {/* Emergency Mode Protocol Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setEmergencyMode(!emergencyMode)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
              emergencyMode
                ? 'bg-red-600 text-white ring-4 ring-red-500/30 animate-pulse'
                : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{emergencyMode ? 'EMERGENCY PROTOCOL ACTIVE' : 'TRIGGER EMERGENCY MODE'}</span>
          </button>
        </div>
      </div>

      {/* 5 Primary Operational Telemetry KPI Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Active Halls */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Halls</span>
            <Building2 className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            {activeHallsCount} / {halls.length}
          </div>
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium mt-1">
            100% Operational
          </div>
        </div>

        {/* Active Invigilators */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Proctors</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            {activeInvigilatorsCount} / {invigilators.length}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            All rooms covered
          </div>
        </div>

        {/* Student Attendance */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Students</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            {presentCount} / {students.length}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {lateCount} late • {absentCount} absent
          </div>
        </div>

        {/* Conflicts */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Conflicts</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            {validationResult?.hardViolations || 0}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Zero clashes
          </div>
        </div>

        {/* Incidents */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Incidents</span>
            <AlertOctagon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400">
            {incidents.filter(i => i.status === 'OPEN').length} Open
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {incidents.length} total logged
          </div>
        </div>
      </div>

      {/* Operational Timeline & Quick Check-in Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Operational Milestones Timeline */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>EXAM DAY TIMELINE & PROTOCOLS</span>
            </h3>
            <span className="text-xs font-mono text-slate-400 font-medium">Session: 09:00 AM - 12:00 PM</span>
          </div>

          <div className="space-y-3 pt-2">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
              >
                <div className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                  m.status === 'COMPLETED'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : m.status === 'ACTIVE' || m.status === 'IN_PROGRESS'
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {m.time}
                </div>
                <div className="flex-1 font-semibold text-slate-800 dark:text-slate-200">
                  {m.label}
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  m.status === 'COMPLETED'
                    ? 'text-emerald-600 bg-emerald-500/10'
                    : m.status === 'ACTIVE'
                    ? 'text-indigo-600 bg-indigo-500/10 animate-pulse'
                    : 'text-slate-400'
                }`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Rapid Action Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Field Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Supervisors can report real-time seating anomalies, verify candidate admit credentials, or trigger recovery.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate('/verify')}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all text-center block"
              >
                Open QR Seat Scanner
              </button>

              <button
                onClick={() => navigate('/incidents')}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-all text-center block"
              >
                Log Exam Day Incident
              </button>

              <button
                onClick={() => navigate('/invigilator-portal')}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all text-center block"
              >
                Invigilator Duty View
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 italic">
            Continuous telemetry polling active • Latency: 4ms
          </div>
        </div>
      </div>
    </div>
  );
}
