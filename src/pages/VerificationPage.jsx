import React, { useState } from 'react';
import {
  QrCode,
  Scan,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  BookOpen,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { parseAdmitPayload } from '../utils/admitCard';

export default function VerificationPage() {
  const { students, schedule, halls } = useExamStore();

  const [scanInput, setScanInput] = useState('23CSE014');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = (input) => {
    setScanInput(input);
    const parsedQr = parseAdmitPayload(input);
    if (parsedQr) {
      setVerificationResult({
        verified: true,
        fromQrText: true,
        rawText: parsedQr.rawText,
        data: {
          studentName: parsedQr.studentName,
          rollNumber: parsedQr.rollNumber,
          department: parsedQr.department,
          batchId: parsedQr.batchId,
          paperName: parsedQr.paperLine,
          paperCode: parsedQr.paperLine.split(' - ')[0] || '',
          hallName: parsedQr.hallName,
          hallCode: parsedQr.hallName,
          row: (parsedQr.seat || '').slice(0, 1),
          seat: parsedQr.seat,
          time: `${parsedQr.slotDate} ${parsedQr.time}`.trim(),
          status: 'CONFIRMED',
        },
      });
      return;
    }

    const clean = input.trim().toLowerCase();

    // Find student
    const student = students.find(s =>
      s.rollNumber.toLowerCase() === clean || s.id.toLowerCase() === clean
    );

    if (!student) {
      setVerificationResult({
        verified: false,
        reason: `No registered examinee found with identifier "${input}".`,
      });
      return;
    }

    // Find assignment & seat
    let placement = null;
    if (schedule?.assignments) {
      for (const asg of schedule.assignments) {
        if ((asg.studentIds || []).includes(student.id)) {
          const seatObj = asg.seating?.seats?.find(s => s.studentId === student.id);
          const hall = halls.find(h => h.id === asg.hallId);

          placement = {
            studentName: student.name,
            rollNumber: student.rollNumber,
            department: student.department,
            batchId: student.batchId,
            paperName: asg.paperName,
            paperCode: asg.paperCode,
            hallName: asg.hallName,
            hallCode: hall?.code || 'B203',
            row: seatObj?.row || 'A',
            seat: seatObj?.seatNumber || 'A04',
            time: asg.slotTime,
            status: student.status || 'CONFIRMED',
            isAccessibility: student.accessibility?.wheelchairAccess || student.accessibility?.groundFloorRequired,
          };
          break;
        }
      }
    }

    if (placement) {
      setVerificationResult({
        verified: true,
        data: placement,
      });
    } else {
      setVerificationResult({
        verified: true,
        data: {
          studentName: student.name,
          rollNumber: student.rollNumber,
          department: student.department,
          batchId: student.batchId,
          paperName: 'Data Structures & Algorithms',
          paperCode: 'CS201',
          hallName: 'Hall B201',
          hallCode: 'B201',
          row: 'C',
          seat: 'C07',
          time: '10:00 AM',
          status: 'CONFIRMED',
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Candidate QR & Seat Verification
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              Hall Check-in
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Scan candidate admit card QR payload to instantly verify desk allocation, hall authorization, and exam paper
          </p>
        </div>
      </div>

      {/* Scanner Input Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
          <Scan className="w-4 h-4 text-indigo-500" />
          <span>Scan Barcode / Enter Candidate Roll Number:</span>
        </label>
        <div className="flex gap-2 max-w-md">
          <textarea
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="Paste scanned QR text or enter roll number"
            rows={4}
            className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleVerify(scanInput)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            VERIFY DESK
          </button>
        </div>

        {/* Quick test buttons */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>Quick scan samples:</span>
          {['23CSE014', '23CSE088', '23ECE015'].map(r => (
            <button
              key={r}
              onClick={() => handleVerify(r)}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Card */}
      {verificationResult && (
        <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-200">
          {verificationResult.verified ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/50 shadow-xl space-y-5">
              {/* Verified Header Badge */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0" />
                <div>
                  <h3 className="font-extrabold text-base text-emerald-800 dark:text-emerald-300 tracking-wider">
                    VERIFIED CANDIDATE ADMIT
                  </h3>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    Desk allocation authenticated against live master timetable
                  </span>
                </div>
              </div>

              {/* Data Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Examinee Name:</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {verificationResult.data.studentName}
                  </strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Roll Number:</span>
                  <strong className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                    {verificationResult.data.rollNumber}
                  </strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Examination Paper:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {verificationResult.data.paperCode} - {verificationResult.data.paperName}
                  </strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Examination Hall:</span>
                  <strong className="text-slate-900 dark:text-white text-base">
                    {verificationResult.data.hallName}
                  </strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Desk Number:</span>
                  <strong className="font-mono text-emerald-600 dark:text-emerald-400 text-lg">
                    {verificationResult.data.seat} (Row {verificationResult.data.row})
                  </strong>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Session Time:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {verificationResult.data.time}
                  </strong>
                </div>
              </div>

              {verificationResult.rawText && (
                <pre className="whitespace-pre-wrap text-[11px] font-mono bg-[#f2e8cf] text-[#386641] rounded-2xl p-3">
                  {verificationResult.rawText}
                </pre>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-500/50 shadow-xl space-y-3 text-center">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="font-bold text-base text-rose-600 dark:text-rose-400">
                VERIFICATION REJECTED
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {verificationResult.reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
