import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineSyncProvider } from './contexts/OfflineSyncContext';
import { Navbar } from './components/common/Navbar';
import { DemoSwitcherBar } from './components/common/DemoSwitcherBar';
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
      {/* Top Testing & Simulation Bar with Collapse Toggle */}
      <DemoSwitcherBar />

      {/* Main Government Health Navigation Bar */}
      <Navbar onOpenVoice={() => setAiDrawerOpen(true)} />

      {/* Main Route Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/meena-journey" element={<MeenaDemoStoryPage />} />
          <Route path="/teleconsult" element={<TeleconsultationPage />} />

          {/* Patient Routes */}
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/appointments" element={<PatientDashboard />} />
          <Route path="/patient/referrals" element={<PatientDashboard />} />
          <Route path="/patient/medicines" element={<PatientDashboard />} />

          {/* ASHA Frontline Worker Routes */}
          <Route path="/asha" element={<AshaDashboard />} />
          <Route path="/asha/patients" element={<AshaDashboard />} />
          <Route path="/asha/appointments" element={<AshaDashboard />} />
          <Route path="/asha/followups" element={<AshaDashboard />} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/queue" element={<DoctorDashboard />} />
          <Route path="/doctor/referrals" element={<DoctorDashboard />} />

          {/* Diagnostic Lab Routes */}
          <Route path="/diagnostics" element={<DiagnosticsDashboard />} />
          <Route path="/diagnostics/catalog" element={<DiagnosticsDashboard />} />

          {/* Pharmacy Routes */}
          <Route path="/pharmacy" element={<PharmacyDashboard />} />
          <Route path="/pharmacy/search" element={<PharmacyDashboard />} />

          {/* Facility Admin Routes */}
          <Route path="/admin" element={<FacilityAdminDashboard />} />
          <Route path="/admin/queues" element={<FacilityAdminDashboard />} />

          {/* District Officer Routes */}
          <Route path="/district" element={<DistrictOfficerDashboard />} />
          <Route path="/district/map" element={<DistrictOfficerDashboard />} />
          <Route path="/district/quality" element={<DistrictOfficerDashboard />} />

          {/* Audit Logs */}
          <Route path="/audit-logs" element={<AuditLogsPage />} />

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
