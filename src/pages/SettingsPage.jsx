import React from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  RefreshCw,
  Download,
  Upload,
  ShieldCheck,
  Cpu,
  Flame,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function SettingsPage() {
  const {
    darkMode,
    toggleDarkMode,
    resetToDemo,
    schedule,
    emergencyMode,
    setEmergencyMode,
  } = useExamStore();

  const handleExportFullState = () => {
    const state = localStorage.getItem('EXAMGUARD_STATE_V1');
    if (!state) return;
    const blob = new Blob([state], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EXAMGUARD_System_State_Backup.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Platform & Optimization Settings
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
              Config
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            System preferences, optimization heuristic tuning, local storage management, and demo backups
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Mode Settings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            Interface Theme & Operational Modes
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <strong className="block text-slate-900 dark:text-white">Dark / Light Mission Control</strong>
                <span className="text-slate-500 text-[11px]">Current theme: {darkMode ? 'Dark Navy Mode' : 'Light Pro Mode'}</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center space-x-1.5"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                <span>Toggle Theme</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <strong className="block text-slate-900 dark:text-white">Emergency Incident Mode</strong>
                <span className="text-slate-500 text-[11px]">High-visibility alert banner & rapid action triggers</span>
              </div>
              <button
                onClick={() => setEmergencyMode(!emergencyMode)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 ${
                  emergencyMode ? 'bg-red-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{emergencyMode ? 'Active' : 'Enable'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Database & Demo Reset */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            Demo Management & Data Persistence
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <strong className="block text-slate-900 dark:text-white">Reset Benchmark Scenario</strong>
                <span className="text-slate-500 text-[11px]">Restore pristine 390-student demo data with 0 conflicts</span>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Reset all operational data back to the clean benchmark scenario?')) {
                    resetToDemo();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <strong className="block text-slate-900 dark:text-white">Export Master State Backup</strong>
                <span className="text-slate-500 text-[11px]">Download complete database as JSON</span>
              </div>
              <button
                onClick={handleExportFullState}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
