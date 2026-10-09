import React, { useState } from 'react';
import {
  Building2,
  Plus,
  ShieldCheck,
  Zap,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  X,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function HallsPage() {
  const { halls, setHallStatus, addHall, updateHall, deleteHall } = useExamStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    building: 'Block A (Science & Tech)',
    floor: 1,
    capacity: 70,
    hasWheelchairAccess: true,
    isGroundFloor: true,
    status: 'ACTIVE',
  });

  const handleOpenAdd = () => {
    setEditingHall(null);
    setFormData({
      name: '',
      code: '',
      building: 'Block A (Science & Tech)',
      floor: 1,
      capacity: 70,
      hasWheelchairAccess: true,
      isGroundFloor: true,
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (hall) => {
    setEditingHall(hall);
    setFormData({
      name: hall.name,
      code: hall.code,
      building: hall.building,
      floor: hall.floor,
      capacity: hall.capacity,
      hasWheelchairAccess: hall.hasWheelchairAccess,
      isGroundFloor: hall.isGroundFloor,
      status: hall.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingHall) {
      updateHall(editingHall.id, formData);
    } else {
      addHall(formData);
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
              Examination Halls Management
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-bold uppercase">
              {halls.length} Facilities
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure hall capacities, wheelchair accessibility, floor parameters, and real-time operational availability
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start md:self-auto flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW HALL</span>
        </button>
      </div>

      {/* Grid of Halls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {halls.map(hall => {
          const isBackup = hall.status === 'BACKUP';
          const isDown = hall.status === 'UNAVAILABLE' || hall.status === 'MAINTENANCE';

          return (
            <div
              key={hall.id}
              className={`p-5 rounded-3xl border transition-all shadow-sm space-y-4 flex flex-col justify-between ${
                isDown
                  ? 'border-[#bc4749]/40 bg-[#bc4749]/8 dark:bg-[#bc4749]/15'
                  : isBackup
                  ? 'border-[#6a994e] bg-[#f2e8cf] dark:bg-[#2d4a32] shadow-[inset_0_0_0_1px_rgba(106,153,78,0.35)]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="space-y-3">
                {isBackup && (
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#386641] text-[#f2e8cf]">
                      <ShieldCheck className="w-3 h-3" />
                      Standby backup hall
                    </span>
                    <span className="text-[10px] font-semibold text-[#6a994e]">Ready if a live hall fails</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                      isBackup
                        ? 'bg-[#386641] text-[#f2e8cf]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {hall.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {hall.name.replace(' (Backup)', '')}
                    </h3>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={hall.status}
                    onChange={(e) => setHallStatus(hall.id, e.target.value)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                      hall.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : hall.status === 'BACKUP'
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BACKUP">BACKUP</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <p>{hall.building} • Floor {hall.floor}</p>
                </div>

                {/* Specs */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Capacity</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{hall.capacity} Desks</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Accessibility</span>
                    <strong className={hall.hasWheelchairAccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {hall.hasWheelchairAccess ? 'Ramp Access' : 'Stairs Only'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenEdit(hall)}
                  className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Parameters</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete hall ${hall.name}?`)) {
                      deleteHall(hall.id);
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingHall ? 'Edit Examination Hall' : 'Add Examination Hall'}
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
                <label className="font-semibold text-slate-700 dark:text-slate-300">Hall Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hall A104"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. A104"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Desk Capacity</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 60 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Floor Level</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value, 10) || 1, isGroundFloor: parseInt(e.target.value, 10) === 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BACKUP">BACKUP</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasWheelchairAccess}
                    onChange={(e) => setFormData({ ...formData, hasWheelchairAccess: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Wheelchair / Ramp Accessible</span>
                </label>
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
                  {editingHall ? 'Update Hall' : 'Create Hall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
