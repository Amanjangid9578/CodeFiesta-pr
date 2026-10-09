import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import SeatingPage from './pages/SeatingPage';
import RecoveryPlaygroundPage from './pages/RecoveryPlaygroundPage';
import SimulatorPage from './pages/SimulatorPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import ExamDayPage from './pages/ExamDayPage';
import IncidentsPage from './pages/IncidentsPage';
import RuleBuilderPage from './pages/RuleBuilderPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HallsPage from './pages/HallsPage';
import InvigilatorsPage from './pages/InvigilatorsPage';
import StudentsPage from './pages/StudentsPage';
import ExamsPage from './pages/ExamsPage';
import InvigilatorPortalPage from './pages/InvigilatorPortalPage';
import StudentPortalPage from './pages/StudentPortalPage';
import VerificationPage from './pages/VerificationPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';
import { useExamStore } from './store/examStore';

export default function App() {
  const { darkMode } = useExamStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing & Public Demo Entry */}
        <Route path="/" element={<LandingPage />} />

        {/* Master Mission Control Layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/seating" element={<SeatingPage />} />
          <Route path="/recovery" element={<RecoveryPlaygroundPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/digital-twin" element={<DigitalTwinPage />} />
          <Route path="/exam-day" element={<ExamDayPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/rules" element={<RuleBuilderPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/halls" element={<HallsPage />} />
          <Route path="/invigilators" element={<InvigilatorsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/invigilator-portal" element={<InvigilatorPortalPage />} />
          <Route path="/student-portal" element={<StudentPortalPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
