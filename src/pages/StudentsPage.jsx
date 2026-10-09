import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function StudentsPage() {
  const { students, schedule, addStudent, updateStudent, deleteStudent, importStudentsCSV } = useExamStore();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [accessibilityFilter, setAccessibilityFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: 'CSE',
    batchId: 'CSE-2023-A',
    papers: ['MAT101', 'CS201'],
    accessibility: {
      wheelchairAccess: false,
      groundFloorRequired: false,
      extraTime: false,
      description: '',
    },
  });

  // Filter students
  const filtered = students.filter(s => {
    if (selectedDept !== 'ALL' && s.department !== selectedDept) return false;
    if (selectedBatch !== 'ALL' && s.batchId !== selectedBatch) return false;
    if (accessibilityFilter === 'ACCESSIBLE') {
      const isAcc = s.accessibility?.wheelchairAccess || s.accessibility?.groundFloorRequired || s.accessibility?.extraTime;
      if (!isAcc) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchRoll = s.rollNumber.toLowerCase().includes(q);
      if (!matchName && !matchRoll) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedStudents = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Helper to find student's assigned hall and seat in the current master schedule
  const getStudentPlacement = (studentId) => {
    if (!schedule?.assignments) return { hall: 'Unassigned', seat: '—' };
    for (const asg of schedule.assignments) {
      if ((asg.studentIds || []).includes(studentId)) {
        // Look up seat in seating grid
        const seat = asg.seating?.seats?.find(s => s.studentId === studentId);
        return {
          hall: asg.hallName || asg.hallCode,
          seat: seat ? seat.seatNumber : 'Row Front',
          paper: asg.paperCode,
        };
      }
    }
    return { hall: 'Allocated', seat: 'A01' };
  };

  // CSV Export
  const handleExportCSV = () => {
    let csv = 'Roll Number,Full Name,Department,Batch,Enrolled Papers,Accessibility Need,Assigned Hall,Assigned Seat\n';
    students.forEach(s => {
      const plc = getStudentPlacement(s.id);
      const accText = s.accessibility?.wheelchairAccess ? 'Wheelchair / Ramp' : s.accessibility?.groundFloorRequired ? 'Ground Floor' : s.accessibility?.extraTime ? 'Extra Time' : 'None';
      csv += `"${s.rollNumber}","${s.name}","${s.department}","${s.batchId}","${s.papers.join('; ')}","${accText}","${plc.hall}","${plc.seat}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EXAMGUARD_Students_Roster.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Real CSV Import
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;

      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const parsed = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.replace(/"/g, '').trim());
        if (parts.length >= 4) {
          parsed.push({
            id: `STU-IMP-${Date.now()}-${i}`,
            rollNumber: parts[0] || `23IMP${i}`,
            name: parts[1] || `Candidate ${i}`,
            department: parts[2] || 'CSE',
            batchId: parts[3] || 'CSE-2023-A',
            papers: parts[4] ? parts[4].split(';').map(p => p.trim()) : ['MAT101'],
            accessibility: {
              wheelchairAccess: (parts[5] || '').toLowerCase().includes('wheelchair'),
              groundFloorRequired: (parts[5] || '').toLowerCase().includes('ground'),
              extraTime: (parts[5] || '').toLowerCase().includes('extra'),
            },
            status: 'CONFIRMED',
          });
        }
      }

      if (parsed.length > 0) {
        importStudentsCSV(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      rollNumber: `23CSE${String(students.length + 1).padStart(3, '0')}`,
      department: 'CSE',
      batchId: 'CSE-2023-A',
      papers: ['MAT101', 'CS201'],
      accessibility: {
        wheelchairAccess: false,
        groundFloorRequired: false,
        extraTime: false,
        description: '',
      },
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (stu) => {
    setEditingStudent(stu);
    setFormData({
      name: stu.name,
      rollNumber: stu.rollNumber,
      department: stu.department,
      batchId: stu.batchId,
      papers: stu.papers || ['MAT101'],
      accessibility: stu.accessibility || {
        wheelchairAccess: false,
        groundFloorRequired: false,
        extraTime: false,
        description: '',
      },
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
    } else {
      addStudent(formData);
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
              Student Examinee Master Roster
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
              {students.length} Candidates
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Student registrations, batch associations, disability accommodations, and live hall seat allocations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD STUDENT</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name or roll number..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
            <option value="IT">IT</option>
          </select>
        </div>

        <div>
          <select
            value={accessibilityFilter}
            onChange={(e) => { setAccessibilityFilter(e.target.value); setCurrentPage(1); }}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Candidates</option>
            <option value="ACCESSIBLE">With Accessibility Accommodation</option>
          </select>
        </div>

        <div className="flex items-center justify-between px-3 py-1 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-500">
          <span>Matched: <strong>{filtered.length}</strong></span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department & Batch</th>
                <th className="py-3 px-4">Enrolled Papers</th>
                <th className="py-3 px-4">Accessibility</th>
                <th className="py-3 px-4">Assigned Hall & Desk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedStudents.map(stu => {
                const plc = getStudentPlacement(stu.id);
                const hasAcc = stu.accessibility?.wheelchairAccess || stu.accessibility?.groundFloorRequired || stu.accessibility?.extraTime;

                return (
                  <tr key={stu.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {stu.rollNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {stu.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">{stu.department}</span>
                      <span className="text-[10px] text-slate-400 block">{stu.batchId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(stu.papers || []).map((p, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {hasAcc ? (
                        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[10px] font-bold w-fit">
                          <HeartPulse className="w-3 h-3 text-blue-500" />
                          <span>
                            {stu.accessibility?.wheelchairAccess ? 'Wheelchair Ramp' : stu.accessibility?.groundFloorRequired ? 'Ground Floor' : 'Extra Time'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {plc.hall}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Seat: {plc.seat}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(stu)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete examinee ${stu.name}?`)) {
                              deleteStudent(stu.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} examinees</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingStudent ? 'Edit Examinee Details' : 'Register New Examinee'}
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
                  placeholder="Candidate name"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none font-mono"
                  />
                </div>

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
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Accessibility Needs</span>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.accessibility.wheelchairAccess}
                    onChange={(e) => setFormData({
                      ...formData,
                      accessibility: { ...formData.accessibility, wheelchairAccess: e.target.checked, groundFloorRequired: e.target.checked }
                    })}
                    className="rounded text-indigo-600"
                  />
                  <span>Wheelchair / Ground Floor Required</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.accessibility.extraTime}
                    onChange={(e) => setFormData({
                      ...formData,
                      accessibility: { ...formData.accessibility, extraTime: e.target.checked }
                    })}
                    className="rounded text-indigo-600"
                  />
                  <span>Extra Time Accommodations (+30 mins)</span>
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
                  Save Examinee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
