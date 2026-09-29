import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TelemetryProvider } from './context/TelemetryContext';

// Layouts (Static shells)
import PublicLayout from './components/layout/PublicLayout';
import PatientLayout from './components/layout/PatientLayout';
import DoctorLayout from './components/layout/DoctorLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages (Lazy Loaded on Demand)
const HomePage = lazy(() => import('./pages/public/HomePage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));

// Patient Pages (Lazy Loaded on Demand)
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const AbhaHealthId = lazy(() => import('./pages/patient/AbhaHealthId'));
const PatientAppointments = lazy(() => import('./pages/patient/PatientAppointments'));
const GovernmentSchemes = lazy(() => import('./pages/patient/GovernmentSchemes'));
const EmergencyAccess = lazy(() => import('./pages/patient/EmergencyAccess'));
const HealthHistory = lazy(() => import('./pages/patient/HealthHistory'));
const PatientMessages = lazy(() => import('./pages/patient/PatientMessages'));
const PatientNotifications = lazy(() => import('./pages/patient/PatientNotifications'));
const PatientSettings = lazy(() => import('./pages/patient/PatientSettings'));
const PrivacySecuritySettings = lazy(() => import('./pages/patient/PrivacySecuritySettings'));
const PatientScan = lazy(() => import('./pages/patient/PatientScan'));
const ConsultPage = lazy(() => import('./pages/patient/ConsultPage'));
const DocBook = lazy(() => import('./pages/patient/DocBook'));
const ClinicalConsultation = lazy(() => import('./pages/patient/ClinicalConsultation'));

// Doctor Pages (Lazy Loaded on Demand)
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const AddPatient = lazy(() => import('./pages/doctor/AddPatient'));
const DoctorScan = lazy(() => import('./pages/doctor/DoctorScan'));
const DoctorNetwork = lazy(() => import('./pages/doctor/DoctorNetwork'));
const DoctorCredentials = lazy(() => import('./pages/doctor/DoctorCredentials'));
const DoctorSettings = lazy(() => import('./pages/doctor/DoctorSettings'));
const DoctorMessages = lazy(() => import('./pages/doctor/DoctorMessages'));
const DoctorNotifications = lazy(() => import('./pages/doctor/DoctorNotifications'));

// Admin Pages (Lazy Loaded on Demand)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const HospitalDetails = lazy(() => import('./pages/admin/HospitalDetails'));
const StaffManagement = lazy(() => import('./pages/admin/StaffManagement'));
const DoctorManagement = lazy(() => import('./pages/admin/DoctorManagement'));
const PatientManagement = lazy(() => import('./pages/admin/PatientManagement'));
const EmergencyWard = lazy(() => import('./pages/admin/EmergencyWard'));
const PharmacyManagement = lazy(() => import('./pages/admin/PharmacyManagement'));
const HospitalNetwork = lazy(() => import('./pages/admin/HospitalNetwork'));

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin"></div>
        <span className="material-symbols-outlined text-[18px] text-primary absolute">emergency</span>
      </div>
      <p className="text-xs font-semibold text-on-surface-variant animate-pulse font-mono">
        Securing Clinical Node...
      </p>
    </div>
  );
}

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
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signin" element={<Navigate to="/login" replace />} />
            </Route>

            {/* PATIENT ROLE ROUTES */}
            <Route element={<PatientLayout />}>
              <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/abha" element={<AbhaHealthId />} />
              <Route path="/patient/appointments" element={<PatientAppointments />} />
              <Route path="/patient/schemes" element={<GovernmentSchemes />} />
              <Route path="/patient/emergency" element={<EmergencyAccess />} />
              <Route path="/patient/health-history" element={<HealthHistory />} />
              <Route path="/patient/scan" element={<PatientScan />} />
              <Route path="/patient/messages" element={<PatientMessages />} />
              <Route path="/patient/notifications" element={<PatientNotifications />} />
              <Route path="/patient/settings" element={<PatientSettings />} />
              <Route path="/patient/privacy" element={<PrivacySecuritySettings />} />
              <Route path="/patient/consult" element={<Navigate to="/patient/messages" replace />} />
              <Route path="/patient/emergency-access" element={<Navigate to="/patient/emergency" replace />} />
              <Route path="/patient/emergency-contacts" element={<Navigate to="/patient/settings" replace />} />
              <Route path="/patient/history" element={<Navigate to="/patient/health-history" replace />} />
              <Route path="/patient/consult-page" element={<ConsultPage />} />
              <Route path="/patient/book-doctor" element={<DocBook />} />
              <Route path="/patient/consultation" element={<ClinicalConsultation />} />
            </Route>

            {/* DOCTOR ROLE ROUTES */}
            <Route element={<DoctorLayout />}>
              <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/add-patient" element={<AddPatient />} />
              <Route path="/doctor/scan" element={<DoctorScan />} />
              <Route path="/doctor/network" element={<DoctorNetwork />} />
              <Route path="/doctor/credentials" element={<DoctorCredentials />} />
              <Route path="/doctor/settings" element={<DoctorSettings />} />
              <Route path="/doctor/privacy" element={<PrivacySecuritySettings />} />
              <Route path="/doctor/messages" element={<DoctorMessages />} />
              <Route path="/doctor/notifications" element={<DoctorNotifications />} />
              <Route path="/doctor/patient-history" element={<HealthHistory />} />
              <Route path="/doctor/consult" element={<ConsultPage />} />
              <Route path="/doctor/consultation" element={<ClinicalConsultation />} />
            </Route>

            {/* HOSPITAL ADMIN ROLE ROUTES */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/hospital-details" element={<HospitalDetails />} />
              <Route path="/admin/staff" element={<StaffManagement />} />
              <Route path="/admin/doctors" element={<DoctorManagement />} />
              <Route path="/admin/patients" element={<PatientManagement />} />
              <Route path="/admin/emergency-ward" element={<EmergencyWard />} />
              <Route path="/admin/pharmacy" element={<PharmacyManagement />} />
              <Route path="/admin/network" element={<HospitalNetwork />} />
            </Route>

            {/* CATCH-ALL */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </TelemetryProvider>
    </AuthProvider>
  );
}
