import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Zap,
  Wrench,
  ArrowRight,
  ShieldAlert,
  X,
  FileQuestion,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function ConflictModal({ isOpen, onClose }) {
  const { explainableConflicts, fixSingleConflict } = useExamStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center space-x-2">
                <span>Explainable Conflict Center</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 font-mono font-semibold">
                  {explainableConflicts.length} DETECTED
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent constraint violations with root cause analysis & single-click remediation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Explainable Conflicts */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {explainableConflicts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                Schedule Fully Validated & Resilient
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                All 10 Hard Constraints and Soft Balancing Policies are 100% satisfied. No clashes exist.
              </p>
            </div>
          ) : (
            explainableConflicts.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-3 transition-all"
              >
                {/* Conflict Title & Severity Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-rose-600 text-white">
                      CONFLICT #{c.number}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                      {c.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    {c.severity}
                  </span>
                </div>

                {/* CAUSE Section */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cause Analysis:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {c.cause}
                  </p>
                </div>

                {/* RECOMMENDED SOLUTION & IMPACT */}
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Recommended Solution:
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Impact: {c.impact}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {c.solution}
                  </p>
                </div>

                {/* APPLY FIX Button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => fixSingleConflict(c)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-95"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>APPLY RECOMMENDED FIX</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
