import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Search,
  Filter,
  Download,
  Printer,
  Grid3X3,
  Building2,
  BookOpen,
  UserCheck,
  Clock,
  ChevronRight,
  Eye,
  X,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function SchedulePage() {
  const navigate = useNavigate();
  const {
    schedule,
    papers,
    halls,
    invigilators,
    slots,
  } = useExamStore();

  const [selectedSlotId, setSelectedSlotId] = useState('ALL');
  const [selectedPaperCode, setSelectedPaperCode] = useState('ALL');
  const [selectedHallId, setSelectedHallId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAssignmentModal, setActiveAssignmentModal] = useState(null);
  const [tableView, setTableView] = useState(false);

  const assignments = schedule?.assignments || [];

  // Filter assignments
  const filteredAssignments = assignments.filter(asg => {
    if (selectedSlotId !== 'ALL' && asg.slotId !== selectedSlotId) return false;
    if (selectedPaperCode !== 'ALL' && asg.paperCode !== selectedPaperCode) return false;
    if (selectedHallId !== 'ALL' && asg.hallId !== selectedHallId) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPaper = asg.paperName?.toLowerCase().includes(q) || asg.paperCode?.toLowerCase().includes(q);
      const matchHall = asg.hallName?.toLowerCase().includes(q) || asg.hallCode?.toLowerCase().includes(q);
      const matchInv = (asg.invigilatorNames || []).some(n => n.toLowerCase().includes(q));
      if (!matchPaper && !matchHall && !matchInv) return false;
    }

    return true;
  });

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schedule, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EXAMGUARD_Schedule_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export as CSV
  const handleExportCSV = () => {
    let csv = 'Assignment ID,Paper Code,Paper Name,Time Slot,Hall,Capacity,Students Assigned,Invigilators\n';
    assignments.forEach(asg => {
      csv += `"${asg.id}","${asg.paperCode}","${asg.paperName}","${asg.slotTime}","${asg.hallName}","${asg.hallCapacity}","${asg.studentCount}","${(asg.invigilatorNames || []).join('; ')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `EXAMGUARD_Master_Timetable.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Master Examination Schedule
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
              0 CLASHES
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized timetable matrix for all departments, halls, and invigilator shifts
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTableView(v => !v)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-colors ${
              tableView
                ? 'bg-[#386641] text-[#f2e8cf]'
                : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{tableView ? 'Card format' : 'Table format'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exam, hall, proctor..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Slot Filter */}
        <div>
          <select
            value={selectedSlotId}
            onChange={(e) => setSelectedSlotId(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Time Slots</option>
            {slots.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.startTime})</option>
            ))}
          </select>
        </div>

        {/* Paper Filter */}
        <div>
          <select
            value={selectedPaperCode}
            onChange={(e) => setSelectedPaperCode(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Examination Papers</option>
            {papers.map(p => (
              <option key={p.id} value={p.code}>{p.code} - {p.name}</option>
            ))}
          </select>
        </div>

        {/* Hall Filter */}
        <div>
          <select
            value={selectedHallId}
            onChange={(e) => setSelectedHallId(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Examination Halls</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.name} (Cap {h.capacity})</option>
            ))}
          </select>
        </div>
      </div>

      {tableView ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2e8cf] dark:bg-slate-800 text-[#386641] dark:text-[#f2e8cf]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Paper</th>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Date / slot</th>
                  <th className="px-4 py-3 font-semibold">Hall</th>
                  <th className="px-4 py-3 font-semibold">Students</th>
                  <th className="px-4 py-3 font-semibold">Invigilators</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map(asg => (
                  <tr key={asg.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-[#f2e8cf]/40 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-[#386641] dark:text-[#a7c957]">{asg.paperCode}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{asg.paperName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{asg.slotDate}<br /><span className="text-slate-500">{asg.slotTime}</span></td>
                    <td className="px-4 py-3">{asg.hallName}</td>
                    <td className="px-4 py-3 font-mono">{asg.studentCount} / {asg.hallCapacity}</td>
                    <td className="px-4 py-3">{(asg.invigilatorNames || []).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssignments.map(asg => (
          <div
            key={asg.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  {asg.paperCode}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {asg.id}
                </span>
              </div>

              {/* Exam Title */}
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {asg.paperName}
                </h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{asg.slotTime} ({asg.slotDate})</span>
                </div>
              </div>

              {/* Hall & Examinees Specs */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Hall:</span>
                  </span>
                  <strong className="text-slate-900 dark:text-white">{asg.hallName}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Seated Examinees:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {asg.studentCount} / {asg.hallCapacity} seats
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Proctors Assigned:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {(asg.invigilatorNames || []).length} Staff
                  </span>
                </div>
              </div>

              {/* Proctor Names */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="line-clamp-1">{(asg.invigilatorNames || []).join(', ')}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActiveAssignmentModal(asg)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>

              <button
                onClick={() => navigate('/seating')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Seating Map</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Assignment Detail Modal */}
      {activeAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-500">{activeAssignmentModal.id}</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {activeAssignmentModal.paperName}
                </h3>
              </div>
              <button
                onClick={() => setActiveAssignmentModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Course Code:</span>
                <strong className="font-mono">{activeAssignmentModal.paperCode}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Session Window:</span>
                <strong>{activeAssignmentModal.slotTime} ({activeAssignmentModal.slotDate})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Hall Allocation:</span>
                <strong>{activeAssignmentModal.hallName} ({activeAssignmentModal.hallCapacity} seats)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Assigned Examinees:</span>
                <strong className="font-mono">{activeAssignmentModal.studentCount} Candidates</strong>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Assigned Invigilation Faculty:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeAssignmentModal.invigilatorNames || []).map((name, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setActiveAssignmentModal(null);
                  navigate('/seating');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                View Hall Seating Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
