import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Clock,
  Users,
  Trash2,
  Edit2,
  CalendarDays,
  Sparkles,
  X,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function ExamsPage() {
  const { papers, students, addPaper, updatePaper, deletePaper } = useExamStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    departments: ['CSE', 'IT'],
    durationMinutes: 180,
    priority: 'HIGH',
    batches: ['CSE-2023-A', 'CSE-2023-B'],
  });

  const getStudentCountForPaper = (paperCode) => {
    return students.filter(s => s.papers.includes(paperCode)).length;
  };

  const handleOpenAdd = () => {
    setEditingPaper(null);
    setFormData({
      code: '',
      name: '',
      departments: ['CSE', 'IT'],
      durationMinutes: 180,
      priority: 'HIGH',
      batches: ['CSE-2023-A'],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPaper(p);
    setFormData({
      code: p.code,
      name: p.name,
      departments: p.departments || ['CSE'],
      durationMinutes: p.durationMinutes || 180,
      priority: p.priority || 'MEDIUM',
      batches: p.batches || [],
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPaper) {
      updatePaper(editingPaper.id, formData);
    } else {
      addPaper(formData);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Examination Papers & Course Catalog
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold uppercase">
              {papers.length} Courses Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage course paper parameters, enrolled academic batches, session duration, and prioritization
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start md:self-auto flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>ADD COURSE PAPER</span>
        </button>
      </div>

      {/* Grid of Papers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {papers.map(p => {
          const count = getStudentCountForPaper(p.code);

          return (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400">
                      {p.code}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      p.priority === 'HIGH' ? 'bg-rose-500/15 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {p.priority} PRIORITY
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{p.durationMinutes} mins</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {p.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(p.departments || []).map((d, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Enrolled Examinees:</span>
                  <strong className="font-mono font-bold text-slate-900 dark:text-white">
                    {count} Candidates
                  </strong>
                </div>

                {/* Batches Associated */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Associated Batches:</span>
                  <div className="flex flex-wrap gap-1">
                    {(p.batches || []).map((b, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-[10px] text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Specifications</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete paper ${p.code}?`)) {
                      deletePaper(p.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingPaper ? 'Edit Examination Paper' : 'Add Course Paper'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Course Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. CS204"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) || 180 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Course Paper Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence & Heuristics"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                >
                  <option value="HIGH">HIGH (Multi-branch core)</option>
                  <option value="MEDIUM">MEDIUM (Department elective)</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
