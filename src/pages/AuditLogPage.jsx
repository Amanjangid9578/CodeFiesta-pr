import React from 'react';
import {
  History,
  ShieldCheck,
  Download,
  Filter,
  Clock,
  Layers,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function AuditLogPage() {
  const { auditLogs } = useExamStore();

  const handleExportAudit = () => {
    let csv = 'Timestamp,Action,Resource,Details\n';
    auditLogs.forEach(l => {
      csv += `"${l.timestamp}","${l.action}","${l.resource}","${l.details}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EXAMGUARD_Audit_Trail.csv`;
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
              Enterprise Operations Audit Trail
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
              Immutable Trail
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographic timestamped record of all scheduling mutations, disaster recovery simulations, and manual overrides
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="self-start md:self-auto flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-28">Timestamp</th>
                <th className="py-3 px-4 w-48">Action</th>
                <th className="py-3 px-4 w-36">Resource</th>
                <th className="py-3 px-4">Event Details & State Mutation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-bold text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 font-sans text-indigo-600 dark:text-indigo-400 font-semibold">
                    {log.resource}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
