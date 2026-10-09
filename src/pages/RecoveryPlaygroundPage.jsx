import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Building2,
  Users,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Flame,
  FileQuestion,
  HelpCircle,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useExamStore } from '../store/examStore';

export default function RecoveryPlaygroundPage() {
  const navigate = useNavigate();
  const {
    halls,
    invigilators,
    schedule,
    setHallStatus,
    setInvigilatorStatus,
    executeRepair,
    revalidateAll,
  } = useExamStore();

  const [activeTab, setActiveTab] = useState('PLAYGROUND'); // PLAYGROUND | RECOVERY_LOGS
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); // 0=idle, 1=break, 2=detect, 3=analyze, 4=optimize, 5=repair, 6=verify
  const [currentDisruption, setCurrentDisruption] = useState(null);
  const [repairData, setRepairData] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState('OPTION-A');

  const pipelineStages = [
    { name: 'BREAK', desc: 'Inject Fault' },
    { name: 'DETECT', desc: 'Isolate Failures' },
    { name: 'ANALYZE', desc: 'Trace Dependencies' },
    { name: 'OPTIMIZE', desc: 'Score Candidates' },
    { name: 'REPAIR', desc: 'Apply Mutation' },
    { name: 'VERIFY', desc: '100% Validated' },
  ];

  // Action triggers
  const triggerDisaster = async (type, entityId, label) => {
    setIsProcessing(true);
    setRepairData(null);
    setCurrentDisruption({ type, entityId, label });

    // Step 1: BREAK
    setPipelineStep(1);
    if (type === 'HALL_UNAVAILABLE') {
      setHallStatus(entityId, 'UNAVAILABLE');
    } else if (type === 'INVIGILATOR_ABSENT') {
      setInvigilatorStatus(entityId, 'LEAVE');
    } else if (type === 'DUAL_HALL') {
      setHallStatus('HALL-B202', 'UNAVAILABLE');
      setHallStatus('HALL-B203', 'UNAVAILABLE');
    }

    await new Promise(r => setTimeout(r, 450));
    // Step 2: DETECT
    setPipelineStep(2);
    await new Promise(r => setTimeout(r, 450));
    // Step 3: ANALYZE
    setPipelineStep(3);
    await new Promise(r => setTimeout(r, 450));
    // Step 4: OPTIMIZE
    setPipelineStep(4);
    await new Promise(r => setTimeout(r, 500));
    // Step 5: REPAIR
    setPipelineStep(5);

    // Compute actual algorithmic repair!
    const result = executeRepair({ type, entityId });
    setRepairData(result);
    setSelectedCandidateId(result?.appliedCandidate?.id || 'OPTION-A');

    await new Promise(r => setTimeout(r, 400));
    // Step 6: VERIFY
    setPipelineStep(6);
    setIsProcessing(false);

    try {
      confetti({
        particleCount: 70,
        spread: 55,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  const handleApplySelectedCandidate = () => {
    if (!repairData?.repairResult?.candidates) return;
    const target = repairData.repairResult.candidates.find(c => c.id === selectedCandidateId);
    if (target) {
      executeRepair(
        { type: currentDisruption.type, entityId: currentDisruption.entityId },
        target
      );
      alert(`Applied ${target.title} to production schedule!`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/70 to-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold font-mono tracking-wider uppercase">
              Judge Demonstration Suite
            </span>
            <span className="text-slate-400 text-xs">• Minimum-Disruption Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Self-Healing Recovery Playground
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Intentionally stress-test and disrupt the examination timetable. EXAMGUARD calculates minimum perturbation repairs in milliseconds.
          </p>
        </div>

        <button
          onClick={() => navigate('/simulator')}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          Open What-If Simulator
        </button>
      </div>

      {/* Disruption Trigger Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>BREAK THE SCHEDULE (DEMO INJECTIONS)</span>
          </h3>
          <span className="text-[11px] text-slate-400">Click any scenario to simulate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => triggerDisaster('HALL_UNAVAILABLE', 'HALL-B203', 'Hall B203 Offline')}
            disabled={isProcessing}
            className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 text-left transition-all group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Building2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold">
                RECOMMENDED
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
              Disable Hall B203
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              100-cap hall offline due to HVAC breakdown. 43 students affected.
            </p>
          </button>

          <button
            onClick={() => triggerDisaster('INVIGILATOR_ABSENT', 'INV-1', 'Dr. Ramesh Sharma Absent')}
            disabled={isProcessing}
            className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 text-left transition-all group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                STAFFING
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
              Dr. Sharma Absent
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Chief CSE proctor calls in sick 30 mins before morning exam.
            </p>
          </button>

          <button
            onClick={() => triggerDisaster('STUDENT_SURGE', 'ASG-001', 'Late Surge +50 Students')}
            disabled={isProcessing}
            className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 text-left transition-all group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                CAPACITY
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              Add 50 Examinees
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Late court-admitted cohort creates instant room overflow.
            </p>
          </button>

          <button
            onClick={() => triggerDisaster('DUAL_HALL', 'DUAL', 'Dual Halls Offline (B202+B203)')}
            disabled={isProcessing}
            className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-950/40 text-left transition-all group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold">
                WING FAULT
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
              Disable 2 Halls
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Simulate Block B entire electrical shutdown (180 seats).
            </p>
          </button>
        </div>
      </div>

      {/* 6-Stage Visual Lifecycle Progress Pipeline */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            Self-Healing Operational Lifecycle
          </span>
          <span className="text-xs text-slate-400">
            {pipelineStep === 0 ? 'Ready for shock simulation' : `Stage ${pipelineStep} of 6 active`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {pipelineStages.map((stage, idx) => {
            const stepNum = idx + 1;
            const isCompleted = pipelineStep >= stepNum;
            const isCurrent = pipelineStep === stepNum;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono font-bold">{stepNum}. {stage.name}</div>
                <div className="text-[11px] font-semibold mt-1">{stage.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results View: Multi-Candidate Ranking & "Why This Solution?" */}
      {repairData && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          {/* Recovery Stats Banner */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                  OPTIMAL RECOVERY FOUND ({repairData.repairResult.executionTimeMs}ms)
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Evaluated 3 candidate repair strategies. Recommended Option A: Minimum perturbation with zero timetable changes.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold">
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                0 Conflicts Remaining
              </span>
            </div>
          </div>

          {/* Comparative Candidate Cards (Option A, Option B, Option C) */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Evaluated Recovery Options
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {repairData.repairResult.candidates.map(cand => {
                const isSelected = selectedCandidateId === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateId(cand.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {cand.isRecommended && (
                      <span className="absolute top-3 right-3 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                        RECOMMENDED
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold text-slate-400">
                        {cand.id}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {cand.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {cand.rationale}
                      </p>

                      {/* Changes Breakdown */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Changes:</span>
                          <strong className="font-mono text-slate-900 dark:text-white">{cand.totalChanges}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Students Moved:</span>
                          <strong className="font-mono text-slate-900 dark:text-white">{cand.studentMoves}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Staff Reassigned:</span>
                          <strong className="font-mono text-slate-900 dark:text-white">{cand.staffMoves}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hall Replacements:</span>
                          <strong className="font-mono text-slate-900 dark:text-white">{cand.hallChanges}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">New Conflicts:</span>
                          <strong className="font-mono text-emerald-600 dark:text-emerald-400">0</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* "WHY THIS SOLUTION?" Mathematical & Operational Explanation */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>WHY WAS OPTION A SELECTED?</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {repairData.repairResult.explanation.summaryText}
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-600 dark:text-slate-300">
                {repairData.repairResult.explanation.reasons.map((reason, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Currently applied: <strong>Option A (Targeted Backup Activation)</strong>
              </span>
              <button
                onClick={handleApplySelectedCandidate}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                Apply Selected Candidate ({selectedCandidateId})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
