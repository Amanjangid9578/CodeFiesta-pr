import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  UserCheck,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { invigilatorPhoto, initialsFromName } from '../utils/avatars';

export default function AnalyticsPage() {
  const {
    resilienceScore,
    halls,
    invigilators,
    students,
    papers,
    schedule,
  } = useExamStore();

  // Multi-day resilience trend data
  const resilienceTrend = [
    { day: 'Day 1 (Morning)', score: 94, benchmark: 90 },
    { day: 'Day 1 (Afternoon)', score: 91, benchmark: 90 },
    { day: 'Day 1 (Evening)', score: 95, benchmark: 90 },
    { day: 'Day 2 (Morning)', score: 96, benchmark: 90 },
  ];

  // Department distribution
  const deptCounts = {};
  students.forEach(s => {
    deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
  });
  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

  const workloadCards = invigilators.map(inv => {
    const assigned = (schedule?.assignments || []).filter(asg =>
      (asg.invigilatorIds || []).includes(inv.id)
    );
    return {
      inv,
      duties: assigned.length,
      contracted: inv.maxDuties,
      assignments: assigned,
    };
  });

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Operations & Resilience Analytics
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical distribution of capacity buffers, proctor equity, and cross-session fault tolerances
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Resilience Index
          </div>
          <div className="text-2xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
            {resilienceScore?.score || 94}/100
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-1">Grade: A+ Optimal</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Avg Utilization
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            87.4%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Across 6 active halls</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Proctor Fairness
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            96.2%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Variance &lt; 0.4 shifts</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Avg Recovery Time
          </div>
          <div className="text-2xl font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
            18ms
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Deterministic speed</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Accessibility Cov.
          </div>
          <div className="text-2xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
            100%
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-1">Zero ramp violations</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Health Graph (Timeline across sessions) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>SCHEDULE HEALTH ACROSS SESSIONS</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Resilience score tracking over examination time windows
              </p>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resilienceTrend}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[70, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} name="Resilience" />
                <Line type="monotone" dataKey="benchmark" stroke="#10b981" strokeDasharray="5 5" name="Benchmark" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-[#6a994e]" />
              <span>Invigilator workload fairness</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Hover a card to see assigned halls and shift times
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-visible">
            {workloadCards.map(card => (
              <div
                key={card.inv.id}
                className="group relative p-3 rounded-3xl bg-[#f2e8cf]/70 dark:bg-slate-800/50 border border-[#386641]/10 hover:border-[#6a994e] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <div className="w-12 h-12 rounded-2xl bg-[#386641] text-[#f2e8cf] flex items-center justify-center text-xs font-bold">
                      {initialsFromName(card.inv.name)}
                    </div>
                    <img
                      src={invigilatorPhoto(card.inv)}
                      alt={card.inv.name}
                      className="absolute inset-0 w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-[#386641] dark:text-[#f2e8cf] truncate">{card.inv.name}</p>
                    <p className="text-[11px] text-slate-500">{card.inv.department}</p>
                    <p className="text-[11px] font-mono mt-0.5 text-[#386641] dark:text-[#a7c957]">
                      {card.duties} assigned / {card.contracted} max
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none absolute left-2 right-2 bottom-[calc(100%+8px)] z-30 hidden group-hover:block">
                  <div className="rounded-2xl bg-[#386641] text-[#f2e8cf] p-3 text-[11px] shadow-xl">
                    {card.assignments.length === 0 ? (
                      <p>No halls assigned</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {card.assignments.map(asg => (
                          <li key={asg.id}>
                            <strong>{asg.hallName}</strong>
                            <span className="block opacity-80">{asg.slotDate} • {asg.slotTime}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Examinee Breakdown Pie */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
          Departmental Candidate Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {deptData.map((d, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{d.name} Dept</span>
              <div className="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {d.value}
              </div>
              <span className="text-[10px] text-slate-400">Examinees</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
