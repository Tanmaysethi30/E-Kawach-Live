import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TelemetryProvider } from './context/TelemetryContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import PatientLayout from './components/layout/PatientLayout';
import DoctorLayout from './components/layout/DoctorLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import AbhaHealthId from './pages/patient/AbhaHealthId';
import PatientAppointments from './pages/patient/PatientAppointments';
import GovernmentSchemes from './pages/patient/GovernmentSchemes';
import EmergencyAccess from './pages/patient/EmergencyAccess';
import HealthHistory from './pages/patient/HealthHistory';
import PatientMessages from './pages/patient/PatientMessages';
import PatientNotifications from './pages/patient/PatientNotifications';
import PatientSettings from './pages/patient/PatientSettings';
import PrivacySecuritySettings from './pages/patient/PrivacySecuritySettings';
import PatientScan from './pages/patient/PatientScan';
import ConsultPage from './pages/patient/ConsultPage';
import DocBook from './pages/patient/DocBook';
import ClinicalConsultation from './pages/patient/ClinicalConsultation';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import AddPatient from './pages/doctor/AddPatient';
import DoctorScan from './pages/doctor/DoctorScan';
import DoctorNetwork from './pages/doctor/DoctorNetwork';
import DoctorCredentials from './pages/doctor/DoctorCredentials';
import DoctorSettings from './pages/doctor/DoctorSettings';
import DoctorMessages from './pages/doctor/DoctorMessages';
import DoctorNotifications from './pages/doctor/DoctorNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import HospitalDetails from './pages/admin/HospitalDetails';
import StaffManagement from './pages/admin/StaffManagement';
import DoctorManagement from './pages/admin/DoctorManagement';
import PatientManagement from './pages/admin/PatientManagement';
import EmergencyWard from './pages/admin/EmergencyWard';
import PharmacyManagement from './pages/admin/PharmacyManagement';
import HospitalNetwork from './pages/admin/HospitalNetwork';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-surface">
      <span className="material-symbols-outlined text-[64px] text-primary mb-4">emergency_home</span>
      <h1 className="font-headline-lg text-3xl font-bold text-primary mb-2">404 — Node Not Found</h1>
      <p className="font-body-md text-on-surface-variant max-w-md mb-6">
        The requested clinical node or patient registry route could not be resolved on the E-KAWACH emergency network.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-sm">
          Return to Emergency Landing
        </Link>
        <Link to="/login" className="px-5 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
          Sign In Portal
        </Link>
        <Link to="/patient/dashboard" className="px-5 py-2.5 rounded-lg bg-surface-container text-primary font-semibold text-sm">
          Patient Portal
        </Link>
        <Link to="/doctor/dashboard" className="px-5 py-2.5 rounded-lg bg-surface-container text-primary font-semibold text-sm">
          Doctor Console
        </Link>
        <Link to="/admin/dashboard" className="px-5 py-2.5 rounded-lg bg-surface-container text-primary font-semibold text-sm">
          Hospital Admin
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TelemetryProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
          </Route>

          {/* PATIENT ROLE ROUTES */}
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="abha" element={<AbhaHealthId />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="schemes" element={<GovernmentSchemes />} />
            <Route path="emergency" element={<EmergencyAccess />} />
            <Route path="health-history" element={<HealthHistory />} />
            <Route path="scan" element={<PatientScan />} />
            <Route path="messages" element={<PatientMessages />} />
            <Route path="notifications" element={<PatientNotifications />} />
            <Route path="settings" element={<PatientSettings />} />
            <Route path="privacy" element={<PrivacySecuritySettings />} />
            <Route path="consult" element={<Navigate to="/patient/messages" replace />} />
            <Route path="emergency-access" element={<Navigate to="/patient/emergency" replace />} />
            <Route path="emergency-contacts" element={<Navigate to="/patient/settings" replace />} />
            <Route path="history" element={<Navigate to="/patient/health-history" replace />} />
            <Route path="consult-page" element={<ConsultPage />} />
            <Route path="book-doctor" element={<DocBook />} />
            <Route path="consultation" element={<ClinicalConsultation />} />
          </Route>

          {/* DOCTOR ROLE ROUTES */}
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="add-patient" element={<AddPatient />} />
            <Route path="scan" element={<DoctorScan />} />
            <Route path="network" element={<DoctorNetwork />} />
            <Route path="credentials" element={<DoctorCredentials />} />
            <Route path="settings" element={<DoctorSettings />} />
            <Route path="privacy" element={<PrivacySecuritySettings />} />
            <Route path="messages" element={<DoctorMessages />} />
            <Route path="notifications" element={<DoctorNotifications />} />
            <Route path="patient-history" element={<HealthHistory />} />
            <Route path="consult" element={<ConsultPage />} />
            <Route path="consultation" element={<ClinicalConsultation />} />
          </Route>

          {/* HOSPITAL ADMIN ROLE ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="hospital-details" element={<HospitalDetails />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="doctors" element={<DoctorManagement />} />
            <Route path="patients" element={<PatientManagement />} />
            <Route path="emergency-ward" element={<EmergencyWard />} />
            <Route path="pharmacy" element={<PharmacyManagement />} />
            <Route path="network" element={<HospitalNetwork />} />
          </Route>

          {/* CATCH-ALL */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </TelemetryProvider>
    </AuthProvider>
  );
}
