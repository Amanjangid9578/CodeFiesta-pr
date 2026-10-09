import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Building2,
  CalendarDays,
  Clock,
  MapPin,
  HeartPulse,
  Printer,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import QrCodeImage from '../components/QrCodeImage';
import { buildAdmitPayload } from '../utils/admitCard';

export default function StudentPortalPage() {
  const { students, schedule, halls } = useExamStore();

  const [inputRoll, setInputRoll] = useState('23CSE014');
  const [selectedStudent, setSelectedStudent] = useState(
    students.find(s => s.rollNumber === '23CSE014') || students[0]
  );

  const handleSearch = (roll) => {
    setInputRoll(roll);
    const found = students.find(s => s.rollNumber.toLowerCase() === roll.toLowerCase().trim());
    if (found) setSelectedStudent(found);
  };

  // Find candidate's upcoming exam and hall placement
  const findExamPlacement = (student) => {
    if (!student || !schedule?.assignments) return null;

    for (const asg of schedule.assignments) {
      if ((asg.studentIds || []).includes(student.id)) {
        const hall = halls.find(h => h.id === asg.hallId);
        const seatObj = asg.seating?.seats?.find(s => s.studentId === student.id);

        return {
          paperCode: asg.paperCode,
          paperName: asg.paperName,
          slotTime: asg.slotTime,
          slotDate: asg.slotDate,
          hallName: asg.hallName,
          building: hall?.building || 'Block A',
          floor: hall?.floor || 1,
          seatNumber: seatObj?.seatNumber || 'A04',
          seatId: seatObj?.seatId || `${hall?.code}-A04`,
          reportingTime: '08:30 AM (30 mins before start)',
        };
      }
    }
    return null;
  };

  const placement = findExamPlacement(selectedStudent);

  const admitPayload = selectedStudent && placement
    ? buildAdmitPayload(selectedStudent, placement)
    : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Student Admit & Route Finder
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
              Self-Service
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Instant candidate hall directions, desk number allocations, and digital entry pass
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="self-start md:self-auto flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Admit Card</span>
        </button>
      </div>

      {/* Roll Number Lookup Bar */}
      <div className="no-print p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Enter University Roll Number:
        </label>
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={inputRoll}
            onChange={(e) => setInputRoll(e.target.value)}
            placeholder="e.g. 23CSE014"
            className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
          />
          <button
            onClick={() => handleSearch(inputRoll)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            Locate Desk
          </button>
        </div>

        {/* Quick sample chips */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>Quick test rolls:</span>
          {['23CSE014', '23CSE042', '23ECE015', '23IT001'].map(r => (
            <button
              key={r}
              onClick={() => handleSearch(r)}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Admit Card & Route View */}
      {selectedStudent && placement ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-200">
          {/* Admit Card Details (2 cols) */}
          <div id="admit-card-print" className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase">
                  VERIFIED ADMIT PASS
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectedStudent.name}
                </h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Roll: {selectedStudent.rollNumber} • {selectedStudent.department} Dept ({selectedStudent.batchId})
                </div>
              </div>

              <div className="text-center p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <QrCodeImage value={admitPayload} size={104} className="mx-auto" />
                <span className="text-[8px] font-mono text-slate-400 block mt-0.5">SCAN ADMIT</span>
              </div>
            </div>

            {/* Next Exam Details */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                Upcoming Examination Session
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Course Paper</span>
                  <strong className="text-slate-900 dark:text-white block mt-0.5">{placement.paperCode}</strong>
                  <span className="text-[11px] text-slate-500 line-clamp-1">{placement.paperName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Hall</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 block mt-0.5 text-base">{placement.hallName}</strong>
                  <span className="text-[11px] text-slate-500">{placement.building}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Seat Number</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 block mt-0.5 text-xl font-mono">{placement.seatNumber}</strong>
                  <span className="text-[11px] text-slate-500 font-mono">ID: {placement.seatId}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Session Time</span>
                  <strong className="text-slate-900 dark:text-white block mt-0.5">{placement.slotTime}</strong>
                  <span className="text-[11px] text-slate-500">{placement.slotDate}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Reporting Time</span>
                  <strong className="text-amber-600 dark:text-amber-400 block mt-0.5">{placement.reportingTime}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Floor Level</span>
                  <strong className="text-slate-900 dark:text-white block mt-0.5">Floor {placement.floor}</strong>
                </div>
              </div>

              {/* Accessibility Accommodations */}
              {selectedStudent.accessibility && (selectedStudent.accessibility.wheelchairAccess || selectedStudent.accessibility.extraTime) && (
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-300 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <HeartPulse className="w-4 h-4 text-blue-500" />
                    <span>Special Accommodation Assigned:</span>
                  </div>
                  <p className="text-[11px]">
                    {selectedStudent.accessibility.description || 'Ground floor wheelchair ramp & extended time accommodation.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mini Route Map / Direction Card */}
          <div className="no-print p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                <Compass className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  Campus Navigation Route
                </h3>
              </div>

              {/* Visual Route Timeline */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">1</span>
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200">Main Quadrangle Entrance</strong>
                    <span className="text-[11px] text-slate-400">Security check & biometric gate</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">2</span>
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200">{placement.building}</strong>
                    <span className="text-[11px] text-slate-400">Follow corridor to Floor {placement.floor}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                  <div>
                    <strong className="block text-emerald-600 dark:text-emerald-400">{placement.hallName} • Seat {placement.seatNumber}</strong>
                    <span className="text-[11px] text-slate-400">Front entrance desk check-in</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 italic text-center">
              Carry student identity card with official barcode • Arrive 30 mins prior
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          No student found with roll number "{inputRoll}". Please check and re-enter.
        </div>
      )}
    </div>
  );
}
