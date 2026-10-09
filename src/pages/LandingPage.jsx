import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Activity,
  Grid3X3,
  Network,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Flame,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-900 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider">EXAMGUARD</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Self-Healing Scheduling Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors"
          >
            Admin Sign In
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
          >
            <span>ENTER DEMO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8 my-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Major Technology Hackathon Edition • Autonomous Operations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Don't just schedule exams. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
            Make them resilient.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The next-generation examination operations platform with real algorithmic self-healing. When halls fail or proctors call in sick, EXAMGUARD automatically recalculates the minimum-disruption repair in milliseconds.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center space-x-2.5 transition-all active:scale-95"
          >
            <span>LAUNCH MISSION CONTROL DEMO</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/recovery')}
            className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm flex items-center space-x-2 transition-all"
          >
            <Zap className="w-4 h-4 text-rose-500" />
            <span>BREAK THE SCHEDULE PLAYGROUND</span>
          </button>
        </div>

        {/* 4 Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-12 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Self-Healing Scheduler</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically resolves unexpected hall outages and proctor absences without timetable clashes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">What-If Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stress-test hypothetical building failures and candidate surges in an isolated sandbox.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Grid3X3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Anti-Cheating Seating</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Checkerboard matrix dispersion, cohort isolation, and wheelchair ramp accommodations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Schedule Digital Twin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive topological node graph tracing dependencies across halls, exams, and proctors.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-900 px-6 flex items-center justify-between text-xs text-slate-400 max-w-7xl mx-auto w-full">
        <span>EXAMGUARD &copy; 2026 • Enterprise Resilience Architecture</span>
        <span className="font-mono text-[11px] text-slate-400">Offline-Ready • Deterministic Engine</span>
      </footer>
    </div>
  );
}
