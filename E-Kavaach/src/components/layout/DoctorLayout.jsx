import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import EmergencyMarquee from '../common/EmergencyMarquee';
import Avatar from '../common/Avatar';
import LogoImg from '../../assets/images/Logo.jpg';
import { useAuth } from '../../context/AuthContext';
import SirenAlertModal from '../common/SirenAlertModal';
import { subscribeEmergencyAlert } from '../../services/telemetry';

export default function DoctorLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState(null);
  const [isSimulatingIvr, setIsSimulatingIvr] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Listen for real-time IVR emergency dispatch events across the doctor console
  useEffect(() => {
    const unsub = subscribeEmergencyAlert((alertData) => {
      console.log('🚨 [DOCTOR CONSOLE] Real-time emergency IVR SOS received:', alertData);
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
          transcript: 'Emergency SOS: Severe trauma triage request routed to Universal Hospital Apollo Greams Trauma Hub.',
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
      navigate('/login?role=doctor', { replace: true });
      return;
    }
    if (currentUser.role && currentUser.role !== 'doctor') {
      const target = currentUser.role === 'hospital' ? '/admin/dashboard' : '/patient/dashboard';
      navigate(target, { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const docName = currentUser?.name || currentUser?.fullName || 'Doctor';
  const docInitials = docName
    ? docName
        .replace(/^(Dr\.|Doctor)\s+/i, '')
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'DR'
    : 'DR';
  const docTitle = currentUser?.title || currentUser?.specialization || 'Attending Clinician';
  const docHospital = currentUser?.hospital || 'Apollo Greams Trauma Hub';
  const docBadgeId = currentUser?.licenseId || currentUser?.nmcNumber || currentUser?.id || currentUser?.tag || 'NMC Verified';

  const navItems = [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: 'grid_view' },
    { to: '/doctor/scan', label: 'Scan Patient QR', icon: 'qr_code_scanner' },
    { to: '/doctor/credentials', label: 'My Doctor ID', icon: 'badge' },
    { to: '/doctor/appointments', label: 'Appointments', icon: 'event_available' },
    { to: '/doctor/add-patient', label: 'Patients', icon: 'personal_injury' },
    { to: '/doctor/network', label: 'Doctor Network', icon: 'hub' },
    { to: '/doctor/messages', label: 'Messages / Consults', icon: 'forum' },
    { to: '/doctor/settings', label: 'Settings', icon: 'tune' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] font-body-md text-on-surface antialiased">
      <EmergencyMarquee />

      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Doctor Sidebar */}
      <aside
        className={`fixed left-0 z-50 flex flex-col justify-between w-72 bg-white/95 backdrop-blur-2xl border-r border-slate-200/70 shadow-[4px_0_24px_rgba(0,30,50,0.02)] transition-transform duration-300 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: '28px', height: 'calc(100vh - 28px)' }}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-5">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <img src={LogoImg} alt="E-KAWACH Logo" className="w-10 h-10 rounded-xl object-contain" />
              <div className="flex flex-col">
                <span className="font-headline-sm text-primary tracking-tight font-bold text-[19px]">
                  E-KAWACH
                </span>
                <span className="font-label-sm text-[11px] text-slate-400 font-medium tracking-wider uppercase">
                  Trauma OS v4.2
                </span>
              </div>
            </Link>
          </div>

          {/* Doctor Profile Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/60 rounded-2xl p-3.5 mb-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={docName} initials={docInitials} role="doctor" size="md" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg font-semibold text-slate-900 truncate">
                  {docName}
                </span>
                <span className="font-body-sm text-xs text-slate-500 truncate">
                  {docTitle}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-xs">
              <span className="text-secondary font-medium truncate">{docHospital}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-label-sm text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[12px] text-teal-600">verified</span>
                {docBadgeId}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1.5 pb-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-label-lg text-sm ${
                    isActive
                      ? 'bg-primary text-on-primary font-medium shadow-sm shadow-primary/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Node Active Telemetry Footer */}
        <div className="p-4 bg-white/40 border-t border-slate-100">
          <div className="bg-gradient-to-b from-slate-50 to-slate-100/50 border border-slate-200/70 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-label-sm text-[10px] text-slate-700 font-bold uppercase tracking-wider">
                  Node Active
                </span>
              </div>
              <span className="font-label-sm text-[10px] text-slate-400">Port #842</span>
            </div>
            <span className="font-body-sm text-xs text-slate-500 leading-tight">
              Apollo Trauma Grid: Connected
            </span>
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="font-medium text-teal-700 font-mono">0.12s ping</span>
              <span className="inline-flex items-center text-slate-400 gap-1">
                <span className="w-1 h-1 rounded-full bg-slate-400"></span>Sync OK
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header
          className="fixed top-7 left-0 lg:left-72 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-40 px-4 sm:px-8 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Sidebar"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div className="relative w-48 sm:w-80 md:w-96">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="Search patient by ABHA, phone, or name..."
                type="search"
              />
            </div>
            <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E4E4FB] text-[#4338ca] font-label-sm text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#4338ca] animate-pulse"></span>
              Live Trauma Bay Active
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Test IVR SOS Trigger */}
            <button
              type="button"
              onClick={handleSimulateIvrCall}
              disabled={isSimulatingIvr}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-label-sm text-xs font-bold shadow-sm shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
              title="Test incoming IVR Voice Emergency Call"
            >
              <span className="material-symbols-outlined text-[16px] animate-bounce">phone_in_talk</span>
              <span className="hidden sm:inline">{isSimulatingIvr ? 'Calling...' : 'Test IVR Call'}</span>
            </button>

            <Link
              to="/doctor/scan"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-label-lg text-xs font-semibold shadow-sm shadow-rose-600/20 transition-all no-underline"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              <span className="hidden sm:inline">Emergency Scan</span>
            </Link>
            <Link
              to="/doctor/settings"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors border border-slate-200/60"
              title="Settings"
            >
              <span className="material-symbols-outlined text-[19px]">tune</span>
            </Link>
            <Avatar name={docName} initials={docInitials} role="doctor" size="sm" className="ml-1" />
            <button
              onClick={handleSignOut}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-error hover:bg-rose-50 transition-colors border border-rose-200/60 ml-1 cursor-pointer"
              title="Sign Out of Session"
              type="button"
            >
              <span className="material-symbols-outlined text-[19px]">logout</span>
            </button>
          </div>
        </header>

        {/* Global Emergency Siren Alert Modal */}
        {activeEmergencyAlert && (
          <SirenAlertModal
            alertData={activeEmergencyAlert}
            onClose={() => setActiveEmergencyAlert(null)}
          />
        )}

        {/* Page Content */}
        <main
          className="w-full flex-1 px-4 sm:px-8 pb-12"
          style={{ paddingTop: 'calc(28px + 4.5rem)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
