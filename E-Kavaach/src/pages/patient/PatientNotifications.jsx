import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PatientNotifications() {
  const navigate = useNavigate();
  const [savedToast, setSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Notification preferences updated. Synced to ABDM gateway node and encrypted dispatch relays.');
  
  const defaultPrefs = {
    appointmentReminders: true,
    approvalUpdates: true,
    refillAlerts: true,
    newRecordAdded: true,
    newDoctorMessages: true,
    videoReminders: true,
    schemeUpdates: true,
    platformAnnouncements: false,
    channelPush: true,
    channelSms: true,
    channelEmail: true
  };

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('ekavach_notification_prefs');
      return saved ? JSON.parse(saved) : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });

  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerSave = () => {
    try {
      localStorage.setItem('ekavach_notification_prefs', JSON.stringify(prefs));
    } catch (e) {
      console.error(e);
    }
    setToastMessage('Notification preferences updated. Synced to ABDM gateway node and encrypted dispatch relays.');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const restoreDefaults = () => {
    setPrefs(defaultPrefs);
    try {
      localStorage.setItem('ekavach_notification_prefs', JSON.stringify(defaultPrefs));
    } catch (e) {}
    setToastMessage('Notification preferences restored to clinical defaults.');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const triggerSos = () => {
    setToastMessage('EMERGENCY SOS BEACON DISPATCHED to local trauma hub. Dispatch coordinates transmitting.');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 4000);
  };
  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Emergency Ticker Marquee Strip */}

{/* Secondary Patient Context Sub-header */}
<div className="w-full bg-surface-container-lowest border-b border-surface-container-highest px-grid-margin py-3">
<div className="flex flex-wrap items-center justify-between gap-space-md">
{/* Search input */}
<div className="relative flex-1 min-w-[240px] max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
<input className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" placeholder="Search health records, diagnostics, consult logs..." type="text" />
</div>
{/* Live telemetry status pills & controls */}
<div className="flex items-center gap-space-xs sm:gap-space-sm">
<div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-medium">
<span className="material-symbols-outlined text-[15px]">verified</span>
<span className="">Ayushman Bharat Portal</span>
</div>
<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
<span className="">ABDM Cloud Sync: Active</span>
</div>
<button aria-label="Notifications" className="relative w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
<span className="material-symbols-outlined text-[20px]">notifications</span>
<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
</button>
<button aria-label="Help and protocols" className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
<span className="material-symbols-outlined text-[20px]">help_outline</span>
</button>
<div className="h-6 w-px bg-surface-container-highest mx-1"></div>
<div className="flex items-center gap-2 pl-1">
<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-sm text-[12px] font-bold">
            RS
          </div>
<div className="hidden xl:flex flex-col">
<span className="font-label-sm text-label-sm font-bold text-on-surface leading-none">Rajesh Sharma</span>
<span className="font-label-sm text-[9px] text-outline font-mono mt-0.5">ABHA: 9824-8819-TN</span>
</div>
</div>
</div>
</div>
</div>
{/* Main Patient Dashboard Grid (Sidebar + Content Workspace) */}
<div className="w-full px-grid-margin py-space-lg flex flex-col lg:flex-row gap-space-lg">
{/* Left Primary Patient Sidebar Navigation */}
<aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-space-md">
{/* Patient Verified Identity Card */}
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
<div className="flex items-start justify-between">
<div className="flex items-center gap-space-xs">
<div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold shadow-sm">
              RS
            </div>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">Rajesh V. Sharma</span>
<span className="font-label-sm text-label-sm text-outline font-mono">9824-8819-TN</span>
</div>
</div>
</div>
<div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-sm text-[11px] font-semibold w-fit">
<span className="material-symbols-outlined text-[14px]">health_and_safety</span>
          Verified Health ID
        </div>
</div>
{/* Navigation Links */}
<nav className="flex flex-col gap-1 p-1 rounded-xl bg-surface-container-lowest shadow-sm">
<Link to="/patient/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[20px]">grid_view</span>
<span className="">Dashboard</span>
</Link>
<Link to="/patient/abha" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[20px]">badge</span>
<span className="">My Health ID</span>
</Link>
<Link to="/patient/appointments" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[20px]">calendar_today</span>
<span className="">Appointments</span>
</Link>
<Link to="/patient/emergency" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[20px]">local_hospital</span>
<span className="">Hospital ER Access</span>
</Link>
<Link to="/patient/health-history" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[20px]">prescriptions</span>
<span className="">Prescriptions &amp; History</span>
</Link>
<Link to="/patient/schemes" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[20px]">policy</span>
<span className="">Government Schemes</span>
</Link>
<Link to="/patient/consult" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[20px]">chat</span>
<span className="">Messages / Consults</span>
</Link>
{/* Active Nav Item */}
<Link to="/patient/settings" className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm no-underline">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[20px]">settings</span>
<span className="">Settings</span>
</div>
<span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
</Link>
</nav>
{/* Bottom Emergency SOS Trigger */}
<button onClick={triggerSos} className="mt-auto w-full group relative overflow-hidden flex items-center justify-center gap-2 p-3.5 rounded-xl bg-error text-on-error font-label-lg text-label-lg font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all">
<span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">sos</span>
<span className="">TRIGGER EMERGENCY SOS</span>
</button>
</aside>
{/* Main Workspace Container (2-Column Settings View) */}
<div className="flex-1 min-w-0 flex flex-col md:flex-row gap-space-lg">
{/* Settings Mini Sub-Navigation Column */}
<div className="w-full md:w-56 flex-shrink-0 flex flex-col gap-1">
<span className="px-3 pb-2 font-label-sm text-label-sm uppercase tracking-widest text-outline font-semibold">Settings Modules</span>
<Link to="/patient/settings#profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[18px]">account_circle</span>
<span className="">Profile</span>
</Link>
<Link to="/patient/settings#abha" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[18px]">fingerprint</span>
<span className="">Health ID &amp; ABHA</span>
</Link>
<Link to="/patient/settings#emergency" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md no-underline">
<span className="material-symbols-outlined text-[18px]">e911_emergency</span>
<span className="">Emergency Contacts &amp; SOS</span>
</Link>
{/* Active Category */}
<div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold shadow-sm cursor-default">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px] text-secondary">notifications_active</span>
<span className="">Notifications</span>
</div>
<span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-secondary-container text-on-secondary-container font-semibold">ACTIVE</span>
</div>


{/* System Diagnostic Capsule */}

</div>
{/* Right Main Workspace Area */}
<div className="flex-1 min-w-0 flex flex-col gap-space-lg">
{/* Workspace Header Banner */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
<span className="material-symbols-outlined text-[15px]">tune</span>
<span className="">Patient Preferences &amp; Safety Protocols / Notifications</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Notification Settings</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Choose how and when E-KAVACH keeps you informed across clinical updates and critical care.</p>
</div>
<div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-2 flex-shrink-0">
<button className="inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm" id="saveTopBtn" onClick={triggerSave}>
<span className="material-symbols-outlined text-[18px]">check</span>
<span className="">Save Preferences</span>
</button>
<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-mono">
<span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
<span className="">ABDM Sync: Active (0.04s)</span>
</div>
</div>
</div>
{/* Inline Toast Notification (hidden by default, revealed on save click) */}
<div className={`transition-all duration-300 p-space-md rounded-xl bg-surface-container-high text-tertiary shadow-sm flex items-center justify-between gap-3 ${savedToast ? 'flex' : 'hidden'}`} id="saveToast" style={{ 'backgroundColor': '#e6fffa' }}>
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[20px] text-tertiary font-bold">check_circle</span>
<span className="font-label-md text-label-md font-semibold text-tertiary">{toastMessage}</span>
</div>
<button onClick={() => setSavedToast(false)} className="text-tertiary opacity-70 hover:opacity-100" type="button">
<span className="material-symbols-outlined text-[18px]">close</span>
</button>
</div>
{/* Notification Category Cards Container */}
<div className="flex flex-col gap-space-lg">
{/* Card 1: Appointments */}
<section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">calendar_clock</span>
</div>
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Appointments</h2>
</div>
<span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ 'backgroundColor': '#E4E4FB', 'color': '#2e2a72' }}>
                Clinical Schedule
              </span>
</div>
<div className="flex flex-col">
{/* Toggle 1 */}
<div className="flex items-center justify-between py-space-sm gap-space-md">
<div className="flex flex-col pr-space-md">
<span className="font-label-lg text-label-lg font-semibold text-on-surface">Appointment Reminders</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Get notified 24 hours and 1 hour before your appointment.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={prefs.appointmentReminders} onChange={() => togglePref('appointmentReminders')} className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
{/* Hairline separation */}
<div className="h-px w-full bg-surface-container-high my-1"></div>
{/* Toggle 2 */}
<div className="flex items-center justify-between py-space-sm gap-space-md">
<div className="flex flex-col pr-space-md">
<span className="font-label-lg text-label-lg font-semibold text-on-surface">Approval Status Updates</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Know when a doctor approves, reschedules, or declines your request.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={prefs.approvalUpdates} onChange={() => togglePref('approvalUpdates')} className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
</div>
</section>
{/* Card 2: Prescriptions & Health Records */}
<section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">medication</span>
</div>
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Prescriptions &amp; Health Records</h2>
</div>
<span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ 'backgroundColor': '#E4E4FB', 'color': '#2e2a72' }}>
                EHR &amp; Pharmacy
              </span>
</div>
<div className="flex flex-col">
{/* Toggle 1 */}
<div className="flex items-center justify-between py-space-sm gap-space-md">
<div className="flex flex-col pr-space-md">
<span className="font-label-lg text-label-lg font-semibold text-on-surface">Prescription Refill Alerts</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Reminders when your medication is about to run out.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={prefs.refillAlerts} onChange={() => togglePref('refillAlerts')} className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
{/* Hairline separation */}
<div className="h-px w-full bg-surface-container-high my-1"></div>
{/* Toggle 2 */}
<div className="flex items-center justify-between py-space-sm gap-space-md">
<div className="flex flex-col pr-space-md">
<span className="font-label-lg text-label-lg font-semibold text-on-surface">New Health Record Added</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Notify me when a doctor updates my health history.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={prefs.newRecordAdded} onChange={() => togglePref('newRecordAdded')} className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
</div>
</section>
{/* Card 3: Messages & Consults */}
<section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
</div>
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Messages &amp; Consults</h2>
</div>
<span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ 'backgroundColor': '#E4E4FB', 'color': '#2e2a72' }}>
                Telehealth
              </span>
</div>
<div className="flex flex-col">
{/* Toggle 1 */}
<div className="flex items-center justify-between py-space-sm gap-space-md">
<div className="flex flex-col pr-space-md">
<span className="font-label-lg text-label-lg font-semibold text-on-surface">New Doctor Messages</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Get notified when a doctor sends you a message.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={prefs.newDoctorMessages} onChange={() => togglePref('newDoctorMessages')} className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
{/* Hairline separation */}
<div className="h-px w-full bg-surface-container-high my-1"></div>
{/* Toggle 2 */}
<div className="flex items-center justify-between py-space-sm gap-space-md">
<div className="flex flex-col pr-space-md">
<span className="font-label-lg text-label-lg font-semibold text-on-surface">Video Consult Reminders</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Reminders 10 minutes before a scheduled video call.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={prefs.videoReminders} onChange={() => togglePref('videoReminders')} className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
</div>
</section>
{/* Card 4: Emergency & Critical Alerts (CRITICAL & LOCKED ON) */}
<section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md relative overflow-hidden" style={{ 'boxShadow': '0 0 0 1.5px #ba1a1a' }}>
{/* Top Soft Red Indicator Strip */}
<div className="absolute top-0 left-0 right-0 h-1.5 bg-error"></div>
<div className="flex items-center justify-between pt-1">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-error-container text-error flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">health_and_safety</span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
<span className="">Emergency &amp; Critical Alerts</span>
</h2>
<p className="font-body-sm text-body-sm text-outline">Real-time patient safety safeguards governed by National Emergency Grid.</p>
</div>
</div>
<div className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold tracking-wider flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
<span className="">MANDATORY PROTOCOL</span>
</div>
</div>
<div className="flex flex-col bg-surface-container-low/50 p-space-md rounded-lg gap-space-md">
{/* Locked Row 1 */}
<div className="flex items-start justify-between gap-space-md">
<div className="flex flex-col gap-1 pr-space-md">
<div className="flex items-center gap-2">
<span className="font-label-lg text-label-lg font-bold text-on-surface">Emergency SOS Confirmations</span>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-mono">PRIORITY 0</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Instant broadcast confirmations when an ER dispatch, crash cart alert, or ambulance routing is triggered.</p>
<div className="flex items-center gap-1.5 mt-1 text-error font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[15px]">lock</span>
<span className="">Required for patient safety — cannot be disabled.</span>
</div>
</div>
{/* Disabled Locked-ON Switch */}
<div className="relative inline-flex items-center flex-shrink-0 cursor-not-allowed opacity-90">
<div className="w-11 h-6 rounded-full bg-primary flex items-center justify-end px-1 shadow-inner">
<div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
<span className="material-symbols-outlined text-[10px] text-primary">lock</span>
</div>
</div>
</div>
</div>
{/* Hairline separation */}
<div className="h-px w-full bg-surface-container-highest"></div>
{/* Locked Row 2 */}
<div className="flex items-start justify-between gap-space-md">
<div className="flex flex-col gap-1 pr-space-md">
<div className="flex items-center gap-2">
<span className="font-label-lg text-label-lg font-bold text-on-surface">Critical Health Flag Alerts</span>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-mono">CLINICAL VITAL</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Immediate alerts for drug-drug contraindications, verified allergy conflict warnings, and triage escalations.</p>
<div className="flex items-center gap-1.5 mt-1 text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[15px]">gavel</span>
<span className="">Required by National Health Authority (ABDM) — Non-optional.</span>
</div>
</div>
{/* Disabled Locked-ON Switch */}
<div className="relative inline-flex items-center flex-shrink-0 cursor-not-allowed opacity-90">
<div className="w-11 h-6 rounded-full bg-primary flex items-center justify-end px-1 shadow-inner">
<div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
<span className="material-symbols-outlined text-[10px] text-primary">lock</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Card 5: Government Schemes & General */}
<section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">assured_workload</span>
</div>
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Government Schemes &amp; General</h2>
</div>
<span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ 'backgroundColor': '#E4E4FB', 'color': '#2e2a72' }}>
                National Programs
              </span>
</div>
<div className="flex flex-col">
{/* Toggle 1 */}
<div className="flex items-center justify-between py-space-sm gap-space-md">
<div className="flex flex-col pr-space-md">
<span className="font-label-lg text-label-lg font-semibold text-on-surface">Scheme Eligibility Updates</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Notify me when I qualify for a new government health scheme or subsidized surgery program.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={prefs.schemeUpdates} onChange={() => togglePref('schemeUpdates')} className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
{/* Hairline separation */}
<div className="h-px w-full bg-surface-container-high my-1"></div>
{/* Toggle 2 (OFF by default) */}
<div className="flex items-center justify-between py-space-sm gap-space-md">
<div className="flex flex-col pr-space-md">
<span className="font-label-lg text-label-lg font-semibold text-on-surface">Platform Announcements</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Occasional updates about new E-KAVACH features, partner hospitals, and educational modules.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
<input checked={prefs.platformAnnouncements} onChange={() => togglePref('platformAnnouncements')} className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
</div>
</section>
{/* Delivery Preferences Card ("Notify Me Via") */}
<section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex flex-col">
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">alt_route</span>
<span className="">Notify Me Via</span>
</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Select authorized channels for receiving critical healthcare notifications.</p>
</div>
<span className="text-secondary font-label-sm text-label-sm font-mono font-semibold">3 OF 3 ACTIVE</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-1">
{/* Push Notification Channel Card */}
<div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm">
<div className="flex items-start justify-between">
<div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
<span className="material-symbols-outlined text-[20px]">notifications_active</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked={prefs.channelPush} onChange={() => togglePref('channelPush')} className="sr-only peer" type="checkbox" />
<div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
<div className="flex flex-col gap-0.5">
<span className="font-label-lg text-label-lg font-bold text-on-surface">Push Notification</span>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">Instant mobile app and browser alerts.</p>
</div>
<div className="pt-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Encrypted Push
                  </span>
</div>
</div>
{/* SMS Channel Card */}
<div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm">
<div className="flex items-start justify-between">
<div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
<span className="material-symbols-outlined text-[20px]">sms</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked={prefs.channelSms} onChange={() => togglePref('channelSms')} className="sr-only peer" type="checkbox" />
<div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
<div className="flex flex-col gap-0.5">
<span className="font-label-lg text-label-lg font-bold text-on-surface">SMS Cellular</span>
<p className="font-body-sm text-body-sm text-on-surface-variant font-mono text-[12px]">+91 98401 22819</p>
</div>
<div className="pt-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Verified Carrier
                  </span>
</div>
</div>
{/* Email Channel Card */}
<div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm">
<div className="flex items-start justify-between">
<div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
<span className="material-symbols-outlined text-[20px]">mail</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked={prefs.channelEmail} onChange={() => togglePref('channelEmail')} className="sr-only peer" type="checkbox" />
<div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
<div className="flex flex-col gap-0.5">
<span className="font-label-lg text-label-lg font-bold text-on-surface">Encrypted Email</span>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate text-[12px]">rajesh.sharma@kavach.abdm.in</p>
</div>
<div className="pt-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    S/MIME Verified
                  </span>
</div>
</div>
</div>
</section>
{/* Action Footer Bar */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
<span className="">Changes apply immediately across all authorized ABDM and trauma endpoints.</span>
</div>
<div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
<button onClick={restoreDefaults} className="px-space-md py-2.5 rounded-lg text-primary hover:bg-surface-container-low font-label-lg text-label-lg font-medium transition-colors" id="restoreBtn" type="button">
                Restore Defaults
              </button>
<button className="inline-flex items-center justify-center gap-2 px-space-xl py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm" id="saveBottomBtn" onClick={triggerSave}>
<span className="material-symbols-outlined text-[18px]">check</span>
<span className="">Save Preferences</span>
</button>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Micro-interaction Script for Action Confirmations */}

</div>
    </div>
  );
}
