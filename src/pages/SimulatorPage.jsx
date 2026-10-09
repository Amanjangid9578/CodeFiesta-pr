import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Building2,
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { SCENARIO_TYPES } from '../engine/simulationEngine';

export default function SimulatorPage() {
  const navigate = useNavigate();
  const {
    halls,
    invigilators,
    schedule,
    simulationResult,
    runWhatIfSimulation,
    applySimulationToMaster,
  } = useExamStore();

  const [selectedScenario, setSelectedScenario] = useState('HALL_UNAVAILABLE');
  const [selectedTarget, setSelectedTarget] = useState('HALL-B203');
  const [isRunning, setIsRunning] = useState(false);

  const handleSimulate = async () => {
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 400));
    runWhatIfSimulation(selectedScenario, selectedTarget);
    setIsRunning(false);
  };

  const handleApply = () => {
    if (!simulationResult) return;
    if (window.confirm('Are you sure you want to commit this simulation to the production master schedule? All assignments will be permanently updated.')) {
      applySimulationToMaster(simulationResult);
      alert('Simulation successfully committed to master schedule!');
      navigate('/schedule');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold font-mono tracking-wider uppercase">
              Isolated Sandbox
            </span>
            <span className="text-slate-400 text-xs">• Zero Production Impact</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            What-If Examination Simulator
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Model hypothetical disruptions, capacity deratings, and emergency scenarios without altering live schedules.
          </p>
        </div>

        {simulationResult && (
          <button
            onClick={handleApply}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center space-x-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APPLY SIMULATION TO MASTER</span>
          </button>
        )}
      </div>

      {/* Simulator Control Panel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <span>SIMULATION PARAMETERS</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scenario Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Hypothetical Shock Scenario
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {SCENARIO_TYPES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Resource Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Entity
            </label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <optgroup label="Examination Halls">
                {halls.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.capacity} seats)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Invigilators">
                {invigilators.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.department})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              disabled={isRunning}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              <span>{isRunning ? 'RUNNING SANDBOX...' : 'RUN WHAT-IF SIMULATION'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comparison: ORIGINAL STATE vs SIMULATED STATE */}
      {simulationResult ? (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ORIGINAL STATE */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ORIGINAL STATE (BASELINE)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  LIVE PROD
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <span className="text-slate-500">Resilience Score:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {simulationResult.metrics.originalResilience} / 100
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <span className="text-slate-500">Active Conflicts:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {simulationResult.metrics.originalConflicts}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <span className="text-slate-500">Active Halls:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {halls.filter(h => h.status === 'ACTIVE').length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <span className="text-slate-500">Available Proctors:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {invigilators.filter(i => i.status === 'AVAILABLE').length}
                  </span>
                </div>
              </div>
            </div>

            {/* SIMULATED STATE */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-4 ring-1 ring-indigo-500/20">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  SIMULATED STATE (POST-REPAIR)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  SANDBOX
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Post-Healing Resilience:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {simulationResult.metrics.recoveredResilience} / 100
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Healed Conflicts:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {simulationResult.metrics.recoveredConflicts} (0 Remaining)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Students Reallocated:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {simulationResult.metrics.affectedStudents} Examinees
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Recommended Solution:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {simulationResult.recoveryPlan?.recommended?.title || 'Targeted Backup Activation'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Ready to execute this simulated recovery on the production master schedule?
            </span>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              Commit Simulation to Master
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-slate-400">
          <Activity className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
            No Active Simulation Loaded
          </h4>
          <p className="text-xs max-w-sm mx-auto">
            Select a hypothetical scenario above and click "Run What-If Simulation" to test fault tolerance.
          </p>
        </div>
      )}
    </div>
  );
}
