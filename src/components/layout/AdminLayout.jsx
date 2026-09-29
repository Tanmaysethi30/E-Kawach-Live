import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import EmergencyMarquee from '../common/EmergencyMarquee';
import Avatar from '../common/Avatar';
import LogoImg from '../../assets/images/Logo.jpg';
import { useAuth } from '../../context/AuthContext';
import SirenAlertModal from '../common/SirenAlertModal';
import { subscribeEmergencyAlert } from '../../services/telemetry';

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState(null);
  const [isSimulatingIvr, setIsSimulatingIvr] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Listen for real-time IVR emergency dispatch siren events across the hospital
  useEffect(() => {
    const unsub = subscribeEmergencyAlert((alertData) => {
      console.log('🚨 [UNIVERSAL HOSPITAL] Emergency IVR SOS received:', alertData);
      setActiveEmergencyAlert(alertData);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleSimulateIvrCall = async () => {
    setIsSimulatingIvr(true);
    try {
      const res = await fetch('/api/ai/ivr-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_phone_number: '+91 98401 22819',
          approximate_location: 'Central Trauma Axis, Bay 01',
          hospital_name: 'Apollo Greams Trauma Hub',
          detected_language: 'hi',
          transcript: 'Emergency SOS: Severe trauma dispatch request routed to Universal Hospital Apollo Greams Trauma Hub.',
        }),
      });
      const data = await res.json();
      if (data.alertData) {
        setActiveEmergencyAlert(data.alertData);
      }
    } catch (err) {
      console.error('Error triggering test IVR dispatch:', err);
    } finally {
      setIsSimulatingIvr(false);
    }
  };

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login?role=hospital', { replace: true });
      return;
    }
    const role = currentUser.role === 'admin' ? 'hospital' : currentUser.role;
    if (role && role !== 'hospital') {
      const target = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
      navigate(target, { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const adminName = currentUser?.name || currentUser?.fullName || 'Hospital Administrator';
  const adminInitials = adminName
    ? adminName
      .replace(/^(Dr\.|Doctor)\s+/i, '')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD'
    : 'AD';
  const adminTitle = currentUser?.title || 'Hospital Administrator';
  const adminHospital = currentUser?.hospital || currentUser?.name || 'Apollo Greams Trauma Hub';
  const adminTag = currentUser?.tag || 'VERIFIED ADMIN';
  const universalHospitalId = 'HOSP-APOLLO-001';
  const abdmFacilityId = 'IN-TN-CHN-84201';

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'grid_view' },
    { to: '/admin/hospital-details', label: 'Hospital Details', icon: 'apartment' },
    { to: '/admin/staff', label: 'Staff Management', icon: 'badge' },
    { to: '/admin/doctors', label: 'Doctor Management', icon: 'stethoscope' },
    { to: '/admin/patients', label: 'Patient Management', icon: 'personal_injury' },
    { to: '/admin/emergency-ward', label: 'Emergency Ward', icon: 'emergency' },
    { to: '/admin/pharmacy', label: 'Pharmacy Management', icon: 'medication' },
    { to: '/admin/network', label: 'Hospital Network', icon: 'hub' },
  ];

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      <EmergencyMarquee />

      {/* Global Real-time IVR Siren Alert Modal */}
      {activeEmergencyAlert && (
        <SirenAlertModal
          alertData={activeEmergencyAlert}
          onClose={() => setActiveEmergencyAlert(null)}
        />
      )}

      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed left-0 z-50 flex flex-col justify-between w-72 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{ top: '28px', height: 'calc(100vh - 28px)' }}
      >
        <div className="p-space-lg flex-1">
          {/* Brand */}
          <div className="flex items-center gap-space-sm mb-space-lg">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-[0_1px_8px_rgba(0,77,108,0.06)] p-1">
                <img src={LogoImg} alt="E-KAWACH Logo" className="w-full h-full object-contain rounded" />
              </div>
              <div>
                <div className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                  E-KAWACH
                </div>
                <div className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
                  ADMIN CONSOLE
                </div>
              </div>
            </Link>
          </div>

          {/* Universal Hospital Identity Badge */}
          <div className="bg-gradient-to-br from-primary/10 via-surface-container-lowest to-surface-container-lowest p-3.5 rounded-2xl mb-space-md border border-primary/20 shadow-xs">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {universalHospitalId}
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-500">
                ABDM: {abdmFacilityId}
              </span>
            </div>
            <div className="font-label-md text-sm font-bold text-slate-900 truncate">
              {adminHospital}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
              <span>Universal Ingress Node</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-600"></span> IVR SOS Active
              </span>
            </div>
          </div>

          {/* Admin Profile Card */}
          <div className="bg-surface-container-lowest p-space-sm rounded-xl mb-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-space-sm">
              <Avatar name={adminName} initials={adminInitials} role="admin" size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-space-2xs mb-space-2xs">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                    {adminName}
                  </span>
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant leading-none mb-space-xs">
                  {adminTitle}
                </div>
                <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1"></span>
                  {adminTag}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors font-label-lg text-sm ${isActive
                    ? 'bg-primary text-on-primary font-medium shadow-[0_1px_8px_rgba(0,77,108,0.06)]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Node Active Footer */}
        <div className="p-space-md m-space-sm rounded-lg bg-surface-container">
          <div className="flex items-center gap-space-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide">
              UNIVERSAL NODE ONLINE
            </span>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
            Universal Hospital ID: {universalHospitalId}
          </div>
          <div className="font-label-sm text-label-sm text-secondary font-medium mt-space-2xs">
            Voice IVR SOS • Zero Drop Telemetry
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header
          className="fixed top-7 left-0 lg:left-72 right-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container"
        >
          <div className="h-16 w-full px-4 sm:px-grid-margin flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface rounded-lg"
                aria-label="Toggle Sidebar"
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  search
                </span>
                <input
                  className="w-full h-11 pl-10 pr-space-md rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  placeholder="Search staff, patients, records, or wards..."
                  type="text"
                />
              </div>
            </div>

            <div className="flex items-center gap-space-sm sm:gap-space-md shrink-0">
              {/* Universal Hospital & Test IVR Trigger */}
              <button
                type="button"
                onClick={handleSimulateIvrCall}
                disabled={isSimulatingIvr}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-label-sm text-xs font-bold transition-all shadow-sm shadow-red-600/20 cursor-pointer disabled:opacity-50"
                title="Simulate incoming IVR Voice Emergency Call"
              >
                <span className="material-symbols-outlined text-[16px] animate-bounce">phone_in_talk</span>
                <span>{isSimulatingIvr ? 'Calling...' : 'Test IVR Call'}</span>
              </button>

              <div className="hidden xl:inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-high text-on-surface">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-label-sm text-label-sm font-medium">
                  {universalHospitalId} (Active)
                </span>
              </div>
              <button
                className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
              </button>
              <Avatar name={adminName} initials={adminInitials} role="admin" size="sm" />
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-error hover:bg-error-container/20 transition-colors flex items-center justify-center cursor-pointer ml-1"
                title="Sign Out of Session"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="w-full flex-1 bg-surface"
          style={{ paddingTop: 'calc(28px + 4rem)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
