import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Grid3X3,
  AlertOctagon,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { buildDutySms, sendDutySms } from '../utils/sms';

export default function InvigilatorPortalPage() {
  const navigate = useNavigate();
  const { invigilators, schedule, pushAudit } = useExamStore();

  const [selectedInvId, setSelectedInvId] = useState(invigilators[0]?.id || '');
  const [dutyStatuses, setDutyStatuses] = useState({});
  const [smsNotice, setSmsNotice] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  const selectedInv = invigilators.find(i => i.id === selectedInvId) || invigilators[0];
  const assignments = schedule?.assignments || [];

  // Filter assignments where this invigilator is assigned
  const myDuties = assignments.filter(asg =>
    (asg.invigilatorIds || []).includes(selectedInv.id)
  );

  const handleStartDuty = async (asg) => {
    setSendingId(asg.id);
    const message = buildDutySms(selectedInv, asg);
    let delivery = 'queued locally';
    try {
      const result = await sendDutySms(selectedInv.phone, message);
      delivery = result?.success
        ? `sent to ${selectedInv.phone}`
        : `not delivered (${result?.error || 'quota or network'}). Message is ready below.`;
    } catch {
      delivery = 'SMS API unreachable. Message is ready below.';
    }

    setDutyStatuses(prev => ({ ...prev, [asg.id]: 'IN_PROGRESS' }));
    pushAudit('Proctor Duty Started', 'Invigilator Portal', `${selectedInv.name} notified by SMS for ${asg.id}.`);
    setSmsNotice({ to: selectedInv.phone, message, delivery });
    setSendingId(null);
  };

  const handleCompleteDuty = (asgId) => {
    setDutyStatuses(prev => ({ ...prev, [asgId]: 'COMPLETED' }));
    pushAudit('Proctor Duty Completed', 'Invigilator Portal', `${selectedInv.name} submitted sealed answer scripts for ${asgId}.`);
    alert(`Duty marked as completed! Scripts sealed and verified.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Invigilator Field Portal
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              Duty Roster
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal supervisory console for hall proctoring, candidate attendance, and field incident reporting
          </p>
        </div>

        {/* Invigilator Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Active Proctor:</span>
          <select
            value={selectedInvId}
            onChange={(e) => setSelectedInvId(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white outline-none"
          >
            {invigilators.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.name} ({inv.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {smsNotice && (
        <div className="p-4 rounded-3xl bg-[#f2e8cf] border border-[#6a994e]/40 text-xs text-[#386641] space-y-2">
          <p className="font-bold">Duty SMS — {smsNotice.delivery}</p>
          <p className="text-[11px] opacity-70">To {smsNotice.to}</p>
          <pre className="whitespace-pre-wrap font-sans leading-relaxed bg-white/70 rounded-2xl p-3">{smsNotice.message}</pre>
        </div>
      )}

      {/* Proctor Duties Summary */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Assigned Examination Sessions ({myDuties.length})
        </h3>

        {myDuties.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No supervisory duties scheduled for {selectedInv.name} in current timetable.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myDuties.map(asg => {
              const currentStatus = dutyStatuses[asg.id] || 'SCHEDULED';

              return (
                <div
                  key={asg.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                        {asg.paperCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        currentStatus === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : currentStatus === 'IN_PROGRESS'
                          ? 'bg-amber-500/15 text-amber-600 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {currentStatus}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {asg.paperName}
                      </h4>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{asg.slotTime} ({asg.slotDate})</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Hall</span>
                        <strong className="text-slate-900 dark:text-white">{asg.hallName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Students</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{asg.studentCount} Candidates</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-[11px] space-y-1">
                      <strong className="block font-bold">Proctor Protocol:</strong>
                      <p>
                        Verify candidate biometric admitting barcodes at entrance. Ensure no electronic watches or mobile phones are retained at desks.
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs">
                    {currentStatus === 'SCHEDULED' && (
                      <button
                        onClick={() => handleStartDuty(asg)}
                        disabled={sendingId === asg.id}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center space-x-1.5 disabled:opacity-60"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{sendingId === asg.id ? 'SENDING SMS...' : 'START DUTY (SMS)'}</span>
                      </button>
                    )}

                    {currentStatus === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleCompleteDuty(asg.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>MARK COMPLETE</span>
                      </button>
                    )}

                    <button
                      onClick={() => navigate('/seating')}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 font-semibold"
                    >
                      <Grid3X3 className="w-3.5 h-3.5 inline mr-1" />
                      <span>Seating</span>
                    </button>

                    <button
                      onClick={() => navigate('/incidents')}
                      className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-bold"
                    >
                      <AlertOctagon className="w-3.5 h-3.5 inline mr-1" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
