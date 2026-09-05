import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineSyncProvider } from './contexts/OfflineSyncContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { PatientDashboard } from './pages/PatientDashboard';
import { AshaDashboard } from './pages/AshaDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { DiagnosticsDashboard } from './pages/DiagnosticsDashboard';
import { PharmacyDashboard } from './pages/PharmacyDashboard';
import { FacilityAdminDashboard } from './pages/FacilityAdminDashboard';
import { DistrictOfficerDashboard } from './pages/DistrictOfficerDashboard';
import { TeleconsultationPage } from './pages/TeleconsultationPage';
import { MeenaDemoStoryPage } from './pages/MeenaDemoStoryPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

const AppContent: React.FC = () => {
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Main Government Health Navigation Bar */}
      <Navbar onOpenVoice={() => setAiDrawerOpen(true)} />

      {/* Main Route Content */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/meena-journey" element={<MeenaDemoStoryPage />} />

          {/* User Profile Route (Protected) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Teleconsultation Route (Protected) */}
          <Route
            path="/teleconsult"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'ASHA']}>
                <TeleconsultationPage />
              </ProtectedRoute>
            }
          />

          {/* Patient Routes (Protected) */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/referrals"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/medicines"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* ASHA Frontline Worker Routes (Protected) */}
          <Route
            path="/asha"
            element={
              <ProtectedRoute allowedRoles={['ASHA']}>
                <AshaDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asha/patients"
            element={
              <ProtectedRoute allowedRoles={['ASHA']}>
                <AshaDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asha/appointments"
            element={
              <ProtectedRoute allowedRoles={['ASHA']}>
                <AshaDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asha/followups"
            element={
              <ProtectedRoute allowedRoles={['ASHA']}>
                <AshaDashboard />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes (Protected) */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/queue"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/referrals"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Diagnostic Lab Routes (Protected) */}
          <Route
            path="/diagnostics"
            element={
              <ProtectedRoute allowedRoles={['LAB']}>
                <DiagnosticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnostics/catalog"
            element={
              <ProtectedRoute allowedRoles={['LAB']}>
                <DiagnosticsDashboard />
              </ProtectedRoute>
            }
          />

          {/* Pharmacy Routes (Protected) */}
          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute allowedRoles={['PHARMACY']}>
                <PharmacyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy/search"
            element={
              <ProtectedRoute allowedRoles={['PHARMACY']}>
                <PharmacyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Facility Admin Routes (Protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <FacilityAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/queues"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <FacilityAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* District Officer Routes (Protected) */}
          <Route
            path="/district"
            element={
              <ProtectedRoute allowedRoles={['DISTRICT_OFFICER']}>
                <DistrictOfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/district/map"
            element={
              <ProtectedRoute allowedRoles={['DISTRICT_OFFICER']}>
                <DistrictOfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/district/quality"
            element={
              <ProtectedRoute allowedRoles={['DISTRICT_OFFICER']}>
                <DistrictOfficerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Audit Logs (Protected) */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'DISTRICT_OFFICER']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* AI Care Navigation Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <OfflineSyncProvider>
            <AppContent />
          </OfflineSyncProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
