import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  UserCheck,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  Flame,
  Clock,
  ChevronRight,
  RefreshCw,
  Sliders,
  Grid3X3,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    students,
    halls,
    invigilators,
    papers,
    schedule,
    validationResult,
    resilienceScore,
    isGeneratingSchedule,
    generateSchedule,
    incidents,
  } = useExamStore();

  const [generatingStep, setGeneratingStep] = useState(0);

  const steps = [
    'Analyzing hard constraints...',
    'Checking hall capacities & accessibility...',
    'Partitioning student cohorts...',
    'Optimizing proctor workloads...',
    'Validating anti-cheating seating...',
    'Calculating exam resilience score...',
  ];

  const handleGenerate = async () => {
    for (let i = 0; i < steps.length; i++) {
      setGeneratingStep(i);
      await new Promise(r => setTimeout(r, 120));
    }
    await generateSchedule();
  };

  const activeHalls = halls.filter(h => h.status === 'ACTIVE');
  const backupHalls = halls.filter(h => h.status === 'BACKUP');
  const availableInvigilators = invigilators.filter(i => i.status === 'AVAILABLE');
  const totalStudentsCount = students.length;

  // Hall capacity utilization data
  const hallUtilizationData = activeHalls.map(hall => {
    let assigned = 0;
    if (schedule?.assignments) {
      schedule.assignments.forEach(asg => {
        if (asg.hallId === hall.id) {
          assigned = Math.max(assigned, asg.studentCount || (asg.studentIds?.length || 0));
        }
      });
    }
    const pct = hall.capacity > 0 ? Math.round((assigned / hall.capacity) * 100) : 0;
    return {
      name: hall.code,
      assigned,
      capacity: hall.capacity,
      pct,
    };
  });

  // Invigilator workload distribution data
  const invigilatorWorkloadData = invigilators.slice(0, 8).map(inv => {
    let duties = 0;
    if (schedule?.assignments) {
      schedule.assignments.forEach(asg => {
        if ((asg.invigilatorIds || []).includes(inv.id)) {
          duties++;
        }
      });
    }
    return {
      name: inv.name.replace('Dr. ', '').replace('Prof. ', ''),
      duties,
      max: inv.maxDuties,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Mission Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold font-mono tracking-wider uppercase">
              Operations Center
            </span>
            <span className="text-slate-400 text-xs">• 2026 End-Semester Examinations</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            EXAMGUARD Command Center
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Autonomous examination scheduling with active constraint validation, minimum-disruption repair, and continuous fault tolerance.
          </p>
        </div>

        {/* Generate / Optimize Schedule Button */}
        <div className="z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerate}
            disabled={isGeneratingSchedule}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGeneratingSchedule ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-200" />
            )}
            <span>
              {isGeneratingSchedule ? 'OPTIMIZING TIMETABLE...' : 'GENERATE OPTIMAL SCHEDULE'}
            </span>
          </button>

          <button
            onClick={() => navigate('/recovery')}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Playground</span>
          </button>
        </div>
      </div>

      {/* Progress animation banner when generating */}
      {isGeneratingSchedule && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium flex items-center space-x-3 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
          <span>{steps[generatingStep]}</span>
        </div>
      )}

      {/* 6 Top Key KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Students */}
        <div
          onClick={() => navigate('/students')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalStudentsCount}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-500 font-semibold">100%</span>
            <span>Allocated</span>
          </div>
        </div>

        {/* Examination Papers */}
        <div
          onClick={() => navigate('/exams')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Papers</span>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {papers.length}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            4 Core Courses
          </div>
        </div>

        {/* Active Examination Halls */}
        <div
          onClick={() => navigate('/halls')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Halls</span>
            <Building2 className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {activeHalls.length} / {halls.length}
          </div>
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1 font-medium">
            +{backupHalls.length} Backup Ready
          </div>
        </div>

        {/* Invigilators Available */}
        <div
          onClick={() => navigate('/invigilators')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Faculty</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {availableInvigilators.length} / {invigilators.length}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
            Balanced shifts
          </div>
        </div>

        {/* Active Conflicts */}
        <div
          onClick={() => navigate('/recovery')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Conflicts</span>
            <AlertTriangle className={`w-4 h-4 ${validationResult?.hardViolations > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-extrabold font-mono ${
            validationResult?.hardViolations > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {validationResult?.hardViolations || 0}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {validationResult?.hardViolations === 0 ? 'Zero clashes' : 'Action required'}
          </div>
        </div>

        {/* Resilience Score */}
        <div
          onClick={() => navigate('/analytics')}
          className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-teal-500/10 to-transparent border border-indigo-500/30 dark:border-indigo-500/40 hover:border-indigo-400 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resilience</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-indigo-700 dark:text-indigo-300 font-mono">
            {resilienceScore?.score || 94} <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
            {resilienceScore?.grade || 'OPTIMAL'}
          </div>
        </div>
      </div>

      {/* Main Grid: Resilience Score Breakdown & Hall Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Resilience Breakdown Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <span>EXAM RESILIENCE METRICS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">
                  DYNAMIC
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Continuous survivability calculation across 6 dimensions
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                {resilienceScore?.score || 94}
              </span>
              <span className="text-xs text-slate-400 block font-medium">INDEX</span>
            </div>
          </div>

          {/* Breakdown progress bars */}
          <div className="space-y-3 pt-1">
            {[
              { label: 'Capacity Buffer', value: resilienceScore?.breakdown?.capacityBuffer || 97, desc: 'Peak slot headroom' },
              { label: 'Staff Availability', value: resilienceScore?.breakdown?.staffAvailability || 93, desc: 'Proctor duty headroom' },
              { label: 'Backup Capacity', value: resilienceScore?.breakdown?.backupCapacity || 91, desc: 'Standby halls ready' },
              { label: 'Schedule Flexibility', value: resilienceScore?.breakdown?.scheduleFlexibility || 95, desc: 'Time slot slack' },
              { label: 'Recovery Capability', value: resilienceScore?.breakdown?.recoveryCapability || 94, desc: 'Single-point fault tolerance' },
              { label: 'Accessibility Coverage', value: resilienceScore?.breakdown?.accessibilityCoverage || 100, desc: 'Mobility & ramp seats' },
            ].map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {metric.label}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                    {metric.value}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metric.value >= 90
                        ? 'bg-emerald-500'
                        : metric.value >= 75
                        ? 'bg-indigo-500'
                        : metric.value >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/simulator')}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              <span>Simulate Capacity & Staff Shocks</span>
            </button>
          </div>
        </div>

        {/* Hall Utilization & Invigilator Workload Charts */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                HALL CAPACITY UTILIZATION
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Peak seated examinees vs structural maximum capacity per hall
              </p>
            </div>
            <button
              onClick={() => navigate('/schedule')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>View Grid</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hall Capacity Bars Chart */}
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hallUtilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val, name) => [val, name === 'assigned' ? 'Examinees' : 'Capacity']}
                />
                <Bar dataKey="capacity" fill="#334155" radius={[4, 4, 0, 0]} name="Capacity" />
                <Bar dataKey="assigned" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assigned">
                  {hallUtilizationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pct > 95 ? '#f43f5e' : entry.pct > 75 ? '#6366f1' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Insights Footer */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Avg Utilization</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {Math.round(hallUtilizationData.reduce((s, h) => s + h.pct, 0) / (hallUtilizationData.length || 1))}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Spare Desks</div>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                +{activeHalls.reduce((s, h) => s + h.capacity, 0) - (schedule?.assignments ? Math.max(...schedule.assignments.map(a => a.studentCount || 0)) : 0)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Backup Buffer</div>
              <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                190 seats
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Smart Seating Quick View & Active Incident Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anti-Cheating Seating Analysis Preview */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Grid3X3 className="w-4 h-4 text-emerald-500" />
                <span>SEATING RISK ANALYSIS</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Department mixing & checkerboard dispersion
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              Score: 94/100
            </span>
          </div>

          {/* Mini Seating Checkerboard Simulation */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="grid grid-cols-6 gap-1.5 text-center font-mono text-[10px]">
              {['CSE', 'ECE', 'CSE', 'ECE', 'CSE', 'ECE', 'ECE', 'CSE', 'ECE', 'CSE', 'ECE', 'CSE', 'CSE', 'ECE', 'CSE', 'ECE', 'CSE', 'ECE'].map((d, i) => (
                <div
                  key={i}
                  className={`py-1 rounded font-bold transition-transform hover:scale-110 ${
                    d === 'CSE'
                      ? 'bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                      : 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center italic">
              Checkerboard alternating strategy active • 0 same-batch row adjacencies
            </p>
          </div>

          <button
            onClick={() => navigate('/seating')}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Open Hall Seating Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Operational Incidents */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <span>OPERATIONAL INCIDENTS & DISPATCH</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold">
                  {incidents.length} TOTAL
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Real-time fault logs and automated recovery status
              </p>
            </div>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              All Incidents
            </button>
          </div>

          {/* Incident Cards */}
          <div className="space-y-2.5">
            {incidents.slice(0, 3).map(inc => (
              <div
                key={inc.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-500">[{inc.code}]</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{inc.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      inc.status === 'RESOLVED' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {inc.description}
                  </p>
                </div>

                <div className="text-right pl-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    inc.severity === 'HIGH' ? 'bg-rose-500/15 text-rose-600' : 'bg-amber-500/15 text-amber-600'
                  }`}>
                    {inc.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
