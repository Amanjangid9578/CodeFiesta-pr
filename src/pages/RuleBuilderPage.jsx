import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { parseNaturalLanguageRule } from '../engine/ruleEngine';

export default function RuleBuilderPage() {
  const { rules, addRule, toggleRule, deleteRule } = useExamStore();

  const [naturalText, setNaturalText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);

  const sampleRules = [
    'CSE and ECE students should not sit next to each other.',
    'Students appearing for the same paper must not sit adjacent.',
    'Wheelchair students must be assigned ground floor.',
    'Leave 1 empty seat spacing between examinees.',
    'Invigilators should maintain department neutrality.',
  ];

  const handleParse = (text) => {
    setNaturalText(text);
    const result = parseNaturalLanguageRule(text);
    if (result.success) {
      setParsedPreview(result.rule);
    }
  };

  const handleAcceptRule = () => {
    if (!parsedPreview) return;
    addRule(parsedPreview);
    setParsedPreview(null);
    setNaturalText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Natural Language Rule Builder
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
              Semantic Parser
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Type plain-English examination policies and convert them directly into active mathematical scheduling constraints
          </p>
        </div>
      </div>

      {/* Input Box & Quick Samples */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Describe Examination Constraint:</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={naturalText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="e.g. CSE and ECE students should not sit next to each other."
              className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleParse(naturalText)}
              className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              Parse Policy
            </button>
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 block">Try standard institutional patterns:</span>
          <div className="flex flex-wrap gap-2">
            {sampleRules.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleParse(sample)}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Rule Preview Card */}
      {parsedPreview && (
        <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-indigo-600 text-white">
                RULE GENERATED
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {parsedPreview.name}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              Priority: {parsedPreview.priority}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Type</span>
              <strong className="text-slate-800 dark:text-slate-200">{parsedPreview.type}</strong>
            </div>

            {parsedPreview.departmentA && (
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Parties</span>
                <strong className="text-slate-800 dark:text-slate-200">{parsedPreview.departmentA} vs {parsedPreview.departmentB}</strong>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Min Distance</span>
              <strong className="text-slate-800 dark:text-slate-200">{parsedPreview.minDistance || 1} Seat(s)</strong>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
              <strong className="text-emerald-600 dark:text-emerald-400">Ready to Activate</strong>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
            "{parsedPreview.explanation}"
          </p>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setParsedPreview(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAcceptRule}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20"
            >
              ACCEPT & ACTIVATE RULE
            </button>
          </div>
        </div>
      )}

      {/* Active Rules Inventory */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
          Active Institutional Constraints ({rules.length})
        </h3>

        <div className="space-y-3">
          {rules.map(rule => (
            <div
              key={rule.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-white">{rule.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">
                    {rule.priority}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  "{rule.rawText}"
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    rule.active
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {rule.active ? 'ACTIVE' : 'MUTED'}
                </button>

                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
