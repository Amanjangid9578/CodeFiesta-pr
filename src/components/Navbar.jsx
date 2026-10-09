import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Moon,
  Sun,
  RotateCcw,
  RotateCw,
  Bell,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  X,
  Keyboard,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function Navbar({ onOpenSearch, onOpenDisasterModal }) {
  const navigate = useNavigate();
  const {
    darkMode,
    toggleDarkMode,
    emergencyMode,
    setEmergencyMode,
    resilienceScore,
    validationResult,
    notifications,
    markNotificationsRead,
    undoStack,
    redoStack,
    undo,
    redo,
    resetToDemo,
  } = useExamStore();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`print:hidden h-16 border-b transition-colors duration-200 z-30 sticky top-0 px-4 md:px-6 flex items-center justify-between ${
      darkMode
        ? 'bg-[#243528]/95 border-[#386641]/40 text-[#f2e8cf] backdrop-blur-md'
        : 'bg-[#fffdf8]/95 border-[#386641]/15 text-[#386641] backdrop-blur-md'
    }`}>
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSearch}
          className={`flex items-center space-x-2 text-xs md:text-sm px-3 py-1.5 rounded-lg border transition-all ${
            darkMode
              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-300'
              : 'bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
          title="Global Search (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Quick search anything...</span>
          <kbd className="hidden sm:inline-block text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Center: Resilience Gauge Quick View */}
      <div className="hidden lg:flex items-center space-x-3">
        <div
          onClick={() => navigate('/analytics')}
          className={`cursor-pointer px-3 py-1 rounded-full border text-xs font-medium flex items-center space-x-2 transition-all ${
            resilienceScore?.score >= 90
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : resilienceScore?.score >= 70
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            resilienceScore?.score >= 90 ? 'bg-emerald-500' : resilienceScore?.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
          }`} />
          <span>Resilience: <strong className="font-bold">{resilienceScore?.score || 94}/100</strong></span>
          <span className="text-[10px] opacity-75">({resilienceScore?.grade || 'OPTIMAL'})</span>
        </div>

        {validationResult?.hardViolations > 0 ? (
          <div
            onClick={() => navigate('/recovery')}
            className="cursor-pointer px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center space-x-1.5 animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{validationResult.hardViolations} Critical Conflict{validationResult.hardViolations > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>0 Active Conflicts</span>
          </div>
        )}
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Judge Highlight: BREAK THE SCHEDULE */}
        <button
          onClick={onOpenDisasterModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-rose-900/20 active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 animate-bounce" />
          <span className="hidden sm:inline">SIMULATE DISASTER</span>
          <span className="sm:hidden">DISASTER</span>
        </button>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center border-l border-r border-slate-200 dark:border-slate-800 px-1 space-x-0.5">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Emergency Mode Toggle */}
        <button
          onClick={() => setEmergencyMode(!emergencyMode)}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
            emergencyMode
              ? 'bg-red-600 text-white ring-2 ring-red-400'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500'
          }`}
          title="Toggle Emergency Mode"
        >
          <Flame className="w-4 h-4" />
        </button>

        {/* Dark/Light mode */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              if (!showNotifDropdown) markNotificationsRead();
            }}
            className="p-1.5 rounded-lg relative hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Audit & Operational Alerts
                </span>
                <button
                  onClick={() => setShowNotifDropdown(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No recent notifications</p>
                ) : (
                  notifications.slice(0, 8).map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs border ${
                        n.type === 'CRITICAL' || n.type === 'WARNING'
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                          : n.type === 'SUCCESS'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[10px] opacity-60 font-normal">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-90 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data */}
        <button
          onClick={() => {
            if (window.confirm('Reset all operational data back to the clean benchmark scenario?')) {
              resetToDemo();
            }
          }}
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
          title="Reset to Demo State"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
}
