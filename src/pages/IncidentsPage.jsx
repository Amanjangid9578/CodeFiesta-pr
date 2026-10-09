import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  Plus,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function IncidentsPage() {
  const navigate = useNavigate();
  const {
    incidents,
    halls,
    reportIncident,
    resolveIncident,
    executeRepair,
  } = useExamStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [incidentType, setIncidentType] = useState('HALL_UNAVAILABLE');
  const [title, setTitle] = useState('');
  const [hallId, setHallId] = useState(halls[0]?.id || '');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    reportIncident({
      type: incidentType,
      title: title.trim(),
      hallId,
      severity,
      description: description.trim() || 'Disruption reported by exam supervisor on floor.',
    });

    setModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleApplyIncidentRecovery = (incident) => {
    if (incident.hallId) {
      executeRepair({ type: 'HALL_UNAVAILABLE', entityId: incident.hallId });
      resolveIncident(incident.id, 'Self-healing recovery applied via backup hall substitution.');
      alert(`Automated self-healing executed for incident ${incident.code}!`);
    } else {
      resolveIncident(incident.id, 'Standard incident resolution protocol applied.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Incident Management & Recovery Dispatch
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold uppercase">
              Field Control
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log and resolve unexpected operational emergencies with immediate algorithmic recovery recommendations
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="self-start md:self-auto flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>LOG NEW INCIDENT</span>
        </button>
      </div>

      {/* Incidents List */}
      <div className="space-y-3.5">
        {incidents.map(inc => {
          const hall = halls.find(h => h.id === inc.hallId);
          const isOpen = inc.status === 'OPEN';

          return (
            <div
              key={inc.id}
              className={`p-5 rounded-2xl border transition-all ${
                isOpen
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      {inc.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {inc.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                      isOpen ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-500/15 text-emerald-600'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {inc.description}
                  </p>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1 font-medium">
                    <span>Severity: <strong className="text-rose-500">{inc.severity}</strong></span>
                    {hall && <span>Location: <strong>{hall.name}</strong></span>}
                    <span>Timestamp: <strong>{new Date(inc.timestamp).toLocaleTimeString()}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 md:pt-0">
                  {isOpen ? (
                    <>
                      <button
                        onClick={() => navigate('/simulator')}
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                      >
                        Simulate
                      </button>
                      <button
                        onClick={() => handleApplyIncidentRecovery(inc)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>APPLY RECOVERY</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Incident Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Log Operational Incident
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Incident Type</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="HALL_UNAVAILABLE">Hall Structural / AC / Power Failure</option>
                  <option value="INVIGILATOR_ABSENT">Invigilator Emergency Absence</option>
                  <option value="MEDICAL_EMERGENCY">Student Medical Emergency</option>
                  <option value="STUDENT_SURGE">Unscheduled Examinee Influx</option>
                  <option value="TECHNICAL_ISSUE">Biometric / Equipment Malfunction</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Incident Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AC Failure in Hall B203"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Location Hall</label>
                  <select
                    value={hallId}
                    onChange={(e) => setHallId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {halls.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Disruptive)</option>
                    <option value="CRITICAL">Critical (Immediate Halt)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe situational specifics..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Log & Dispatch Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
