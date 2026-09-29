import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import EmergencyMarquee from '../common/EmergencyMarquee';
import Avatar from '../common/Avatar';
import LogoImg from '../../assets/images/Logo.jpg';
import { useAuth } from '../../context/AuthContext';
import { subscribeEmergencyAlert } from '../../services/telemetry';

export default function PatientLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Listen for real-time break-glass emergency alerts via WebSocket
  useEffect(() => {
    const unsubscribe = subscribeEmergencyAlert((alertData) => {
      console.log('🚨 Received real-time emergency break-glass alert in PatientLayout:', alertData);
      setEmergencyAlert(alertData);
    });
    return () => unsubscribe();
  }, []);

  const isProfileIncomplete = currentUser?.role === 'patient' && currentUser?.profileCompleted === false;

  // Enforce mandatory profile completion redirect and role authorization
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login?role=patient', { replace: true });
      return;
    }
    if (currentUser.role && currentUser.role !== 'patient') {
      const target = currentUser.role === 'doctor' ? '/doctor/dashboard' : '/admin/dashboard';
      navigate(target, { replace: true });
      return;
    }
    if (isProfileIncomplete && !window.location.pathname.includes('/patient/settings')) {
      navigate('/patient/settings#profile', { replace: true });
    }
  }, [currentUser, isProfileIncomplete, navigate]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const userName = currentUser?.name || currentUser?.fullName || 'Patient User';
  const userInitials = userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'P';
  const abhaDisplay = currentUser?.abhaNumber || currentUser?.id || 'ABHA Health ID';

  const navItems = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/patient/abha', label: 'My Health ID', icon: 'badge' },
    { to: '/patient/appointments', label: 'Appointments', icon: 'event_available' },
    { to: '/patient/emergency', label: 'Hospital ER Access', icon: 'emergency' },
    { to: '/patient/health-history', label: 'Prescriptions & History', icon: 'prescriptions' },
    { to: '/patient/schemes', label: 'Government Schemes', icon: 'policy' },
    { to: '/patient/messages', label: 'Messages / Consults', icon: 'forum' },
    { to: '/patient/settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased">
      <EmergencyMarquee />

      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-50 flex flex-col w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: '28px', height: 'calc(100vh - 28px)' }}
      >
        {/* Sidebar Brand Header */}
        <div className="p-space-lg flex flex-col gap-space-sm bg-surface-container-low/60 border-b border-surface-container">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-space-sm no-underline">
              <img alt="E-KAWACH Logo" className="h-8 w-auto object-contain rounded" src={LogoImg} />
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                E-KAWACH
              </span>
            </Link>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
            <span>NDHM Verified Network</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-space-md mx-space-sm mt-space-sm rounded-xl bg-surface-container flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <Avatar name={userName} initials={userInitials} role="patient" size="md" />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-sm font-semibold text-on-surface truncate">
                {userName}
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant font-mono truncate">
                {abhaDisplay}
              </span>
            </div>
          </div>
          <div className="mt-space-2xs flex items-center justify-between gap-space-xs px-space-xs py-space-2xs rounded-full bg-surface-container-high">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
              <span className="font-label-sm text-[11px] text-on-surface font-medium">
                {isProfileIncomplete ? 'Pending Profile Setup' : 'Verified Health ID'}
              </span>
            </div>
            {isProfileIncomplete && (
              <span className="bg-amber-500 text-amber-950 font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold">
                Action Required
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-space-sm py-space-md flex flex-col gap-1">
          {navItems.map((item) => {
            const isDisabled = isProfileIncomplete && item.to !== '/patient/settings';
            return (
              <NavLink
                key={item.to}
                to={isDisabled ? '/patient/settings#profile' : item.to}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                    navigate('/patient/settings#profile');
                  } else {
                    setMobileNavOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-space-md py-space-xs rounded-lg transition-all font-label-lg text-sm ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed text-on-surface-variant/60'
                      : isActive
                      ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                }
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {isDisabled && (
                  <span className="material-symbols-outlined text-[14px] text-amber-600">lock</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Emergency SOS Button */}
        <div className="p-space-md mt-auto border-t border-surface-container">
          <a
            href="tel:+13029887308"
            className="w-full flex items-center justify-center gap-space-xs bg-error text-on-error py-space-sm px-space-md rounded-lg font-label-lg text-label-lg shadow-sm hover:opacity-95 transition-opacity no-underline"
          >
            <span className="material-symbols-outlined text-[20px]">e911_emergency</span>
            <span>EMERGENCY SOS</span>
          </a>
        </div>
      </aside>

      {/* Main Container */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header
          className="fixed top-7 left-0 lg:left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-md sm:px-space-xl border-b border-surface-container"
        >
          <div className="flex items-center gap-space-sm">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface rounded-lg"
              aria-label="Toggle Sidebar"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-label-md text-xs sm:text-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                National Digital Health System
              </span>
              <span className="px-space-xs py-0.5 bg-surface-container text-on-surface font-label-sm text-xs rounded-full">
                Ayushman Bharat Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm sm:gap-space-md">
            <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1.5 bg-surface-container-low rounded-lg text-on-surface-variant border border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px]">search</span>
              <input
                className="bg-transparent border-none outline-none font-body-sm text-xs w-48 lg:w-64 text-on-surface placeholder:text-outline"
                placeholder="Search health records, diagnostics..."
                type="text"
              />
            </div>
            <Link
              to={isProfileIncomplete ? '/patient/settings#profile' : '/patient/notifications'}
              className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
            </Link>
            <Link
              to="/patient/settings"
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center"
              title="Settings"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </Link>
            <div className="h-6 w-[1px] bg-surface-container-highest"></div>
            <Link to="/patient/settings" className="no-underline">
              <Avatar name={userName} initials={userInitials} role="patient" size="sm" />
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-error hover:bg-error-container/20 transition-colors flex items-center justify-center cursor-pointer ml-1"
              title="Sign Out of Session"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="w-full flex-1 bg-surface px-4 sm:px-space-xl py-space-lg"
          style={{ paddingTop: 'calc(28px + 4.5rem)' }}
        >
          {emergencyAlert && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950 via-rose-950 to-red-900 border-2 border-rose-500 text-white shadow-2xl animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-600 border border-rose-400 flex items-center justify-center shrink-0 shadow animate-pulse">
                  <span className="material-symbols-outlined text-white text-[24px]">emergency_home</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-rose-800 text-rose-100 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono border border-rose-600">
                      🚨 ABDM REGULATORY ALERT
                    </span>
                    <span className="text-xs text-amber-300 font-mono font-bold">
                      Emergency Break-Glass Override Executed
                    </span>
                    <span className="text-xs text-rose-200 font-mono">
                      Ref: {emergencyAlert.breakGlassRef || 'EK-BG-9912'}
                    </span>
                  </div>
                  <p className="text-xs text-rose-100 mt-1 leading-relaxed max-w-2xl">
                    Your complete health records have been accessed by <strong>{emergencyAlert.doctorName || 'Emergency Physician'}</strong> (NMC Reg: <code className="bg-rose-900/60 px-1 py-0.5 rounded text-amber-200">{emergencyAlert.nmcNumber || 'MD-NMC-VERIFIED'}</code>) at <strong>{emergencyAlert.hospital || 'Trauma Emergency Center'}</strong> for clinical reason: <em>"{emergencyAlert.reason || 'Critical Emergency Triage'}"</em>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Link
                  to="/patient/health-history"
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-sm no-underline"
                >
                  View Clinical Audit Log
                </Link>
                <button
                  onClick={() => setEmergencyAlert(null)}
                  className="p-1.5 text-rose-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  type="button"
                  title="Acknowledge & Close"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
}
