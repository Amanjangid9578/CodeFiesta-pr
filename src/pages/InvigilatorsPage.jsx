import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  X,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { invigilatorPhoto, initialsFromName } from '../utils/avatars';

export default function InvigilatorsPage() {
  const { invigilators, schedule, setInvigilatorStatus, addInvigilator, updateInvigilator, deleteInvigilator } = useExamStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: 'CSE',
    maxDuties: 3,
    status: 'AVAILABLE',
    phone: '',
    email: '',
  });

  const getDutyCount = (invId) => {
    let count = 0;
    if (schedule?.assignments) {
      schedule.assignments.forEach(asg => {
        if ((asg.invigilatorIds || []).includes(invId)) count++;
      });
    }
    return count;
  };

  const handleOpenAdd = () => {
    setEditingInv(null);
    setFormData({
      name: '',
      department: 'CSE',
      maxDuties: 3,
      status: 'AVAILABLE',
      phone: '+91 98765 00000',
      email: 'proctor@univ.edu',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingInv(inv);
    setFormData({
      name: inv.name,
      department: inv.department,
      maxDuties: inv.maxDuties,
      status: inv.status,
      phone: inv.phone || '',
      email: inv.email || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingInv) {
      updateInvigilator(editingInv.id, formData);
    } else {
      addInvigilator(formData);
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
              Invigilator Faculty & Proctors
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              {invigilators.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage proctor shift quotas, departmental neutrality preferences, and emergency leave statuses
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start md:self-auto flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>ADD INVIGILATOR</span>
        </button>
      </div>

      {/* Grid of Invigilators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invigilators.map(inv => {
          const currentDuties = getDutyCount(inv.id);
          const isOverloaded = currentDuties > inv.maxDuties;
          const isAway = inv.status === 'LEAVE' || inv.status === 'UNAVAILABLE';

          return (
            <div
              key={inv.id}
              className={`p-5 rounded-2xl border transition-all shadow-sm space-y-4 flex flex-col justify-between ${
                isAway
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#386641] text-[#f2e8cf] flex items-center justify-center text-xs font-bold">
                        {initialsFromName(inv.name)}
                      </div>
                      <img
                        src={invigilatorPhoto(inv)}
                        alt={inv.name}
                        className="absolute inset-0 w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {inv.name}
                      </h3>
                      <span className="text-xs text-slate-400">
                        Dept: {inv.department}
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={inv.status}
                    onChange={(e) => setInvigilatorStatus(inv.id, e.target.value)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                      inv.status === 'AVAILABLE'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="LEAVE">LEAVE</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>

                {/* Workload Visualization Bar */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Assigned Workload:</span>
                    <strong className={`font-mono ${isOverloaded ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                      {currentDuties} / {inv.maxDuties} shifts
                    </strong>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                    {Array.from({ length: inv.maxDuties }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 border-r border-white/20 last:border-none ${
                          i < currentDuties
                            ? isOverloaded
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inv.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inv.phone}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenEdit(inv)}
                  className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Quota</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete invigilator ${inv.name}?`)) {
                      deleteInvigilator(inv.id);
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
                {editingInv ? 'Edit Invigilator Quota' : 'Enroll Invigilator'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="IT">IT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Max Duty Quota</label>
                  <input
                    type="number"
                    required
                    value={formData.maxDuties}
                    onChange={(e) => setFormData({ ...formData, maxDuties: parseInt(e.target.value, 10) || 3 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                />
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
                  Save Invigilator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
