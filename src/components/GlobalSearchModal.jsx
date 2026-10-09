import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  UserCheck,
  BookOpen,
  AlertOctagon,
  ArrowRight,
  X,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');

  const { students, halls, invigilators, papers, incidents } = useExamStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search results
  const matchedStudents = cleanQuery
    ? students
        .filter(s => s.name.toLowerCase().includes(cleanQuery) || s.rollNumber.toLowerCase().includes(cleanQuery) || s.department.toLowerCase().includes(cleanQuery))
        .slice(0, 5)
    : [];

  const matchedHalls = cleanQuery
    ? halls
        .filter(h => h.name.toLowerCase().includes(cleanQuery) || h.code.toLowerCase().includes(cleanQuery) || h.building.toLowerCase().includes(cleanQuery))
        .slice(0, 4)
    : [];

  const matchedInvigilators = cleanQuery
    ? invigilators
        .filter(i => i.name.toLowerCase().includes(cleanQuery) || i.department.toLowerCase().includes(cleanQuery))
        .slice(0, 4)
    : [];

  const matchedPapers = cleanQuery
    ? papers
        .filter(p => p.name.toLowerCase().includes(cleanQuery) || p.code.toLowerCase().includes(cleanQuery))
        .slice(0, 4)
    : [];

  const matchedIncidents = cleanQuery
    ? incidents
        .filter(inc => inc.title.toLowerCase().includes(cleanQuery) || inc.code.toLowerCase().includes(cleanQuery))
        .slice(0, 3)
    : [];

  const totalMatches = matchedStudents.length + matchedHalls.length + matchedInvigilators.length + matchedPapers.length + matchedIncidents.length;

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Input bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, roll numbers, halls, invigilators, papers..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results view */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!cleanQuery && (
            <div className="text-center py-8 text-xs text-slate-400">
              Type anything to search students, halls, invigilators, papers, and incidents...
            </div>
          )}

          {cleanQuery && totalMatches === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching examination resources found for "{query}"
            </div>
          )}

          {/* Students */}
          {matchedStudents.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Students ({matchedStudents.length})</span>
              </div>
              <div className="space-y-1">
                {matchedStudents.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect('/students')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-400">[{s.rollNumber}]</span>
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {s.department} • {s.batchId}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Halls */}
          {matchedHalls.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>Examination Halls</span>
              </div>
              <div className="space-y-1">
                {matchedHalls.map(h => (
                  <div
                    key={h.id}
                    onClick={() => handleSelect('/halls')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{h.name}</span>
                      <span className="ml-2 text-slate-400 text-[11px]">Cap: {h.capacity}</span>
                      <span className={`ml-2 text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        h.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {h.status}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invigilators */}
          {matchedInvigilators.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Invigilators</span>
              </div>
              <div className="space-y-1">
                {matchedInvigilators.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => handleSelect('/invigilators')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{inv.name}</span>
                      <span className="ml-2 text-slate-400 text-[11px]">Dept: {inv.department}</span>
                      <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Max Duties: {inv.maxDuties}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Papers */}
          {matchedPapers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>Examination Papers</span>
              </div>
              <div className="space-y-1">
                {matchedPapers.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect('/exams')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-indigo-500 font-mono">[{p.code}]</span>
                      <span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incidents */}
          {matchedIncidents.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                <span>Incidents</span>
              </div>
              <div className="space-y-1">
                {matchedIncidents.map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => handleSelect('/incidents')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-rose-500 font-mono">[{inc.code}]</span>
                      <span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">{inc.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
