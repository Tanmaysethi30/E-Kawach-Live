import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PatientSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [signalStatus, setSignalStatus] = useState(null);

  // Active module state ('emergency' | 'profile' | 'abha' | 'notifications')
  const [activeModule, setActiveModule] = useState(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    return ['profile', 'abha', 'emergency', 'notifications'].includes(hash) ? hash : 'emergency';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['profile', 'abha', 'emergency', 'notifications'].includes(hash)) {
        setActiveModule(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleModuleChange = (mod) => {
    setActiveModule(mod);
    window.location.hash = '#' + mod;
  };

  // Profile state
  const defaultProfile = {
    fullName: 'Rahul Sharma',
    abhaId: '91-4829-1049-2810',
    verificationStatus: 'ABDM Verified',
    phone: '+91 98401 22819',
    email: 'rahul.sharma@kavach.abdm.in',
    dob: '1984-06-14',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '14 Rajaji Salai, George Town',
    pincode: '600001',
    state: 'Tamil Nadu',
  };

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ekavach_patient_profile');
      return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const handleProfileChange = (field, val) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('ekavach_patient_profile', JSON.stringify(profile));
    } catch (err) {}
    triggerSignal('Patient profile changes saved successfully. Synced with ABDM registry.');
  };

  // Notification Preferences state
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
    channelEmail: true,
  };

  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('ekavach_notification_prefs');
      return saved ? { ...defaultPrefs, ...JSON.parse(saved) } : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });

  const toggleNotificationPref = (key) => {
    const updated = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(updated);
    try {
      localStorage.setItem('ekavach_notification_prefs', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSaveNotificationPrefs = () => {
    try {
      localStorage.setItem('ekavach_notification_prefs', JSON.stringify(notificationPrefs));
    } catch (e) {}
    triggerSignal('Notification preferences updated. Synced to ABDM gateway node and encrypted dispatch relays.');
  };

  const handleRestoreNotificationDefaults = () => {
    setNotificationPrefs(defaultPrefs);
    try {
      localStorage.setItem('ekavach_notification_prefs', JSON.stringify(defaultPrefs));
    } catch (e) {}
    triggerSignal('Notification preferences restored to clinical defaults.');
  };

  // Emergency Contacts state
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('ekavach_emergency_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: '1',
        initials: 'AS',
        name: 'Ananya S. Sharma',
        relation: 'Spouse',
        priority: 'p1',
        priorityText: 'Primary Next-of-Kin (Priority 1)',
        phone: '+91 98401 22819',
        workPhone: '+91 98401 99341 (Work)',
        email: 'ananya.sharma@gmail.com',
        timing: 'Instant (0s delay)',
        verified: true,
        permissions: [
          'Full Medical Decision Power (DPOA)',
          'Real-time ER Admittance SMS',
          'ICU Consent Tele-Authorization',
        ],
      },
      {
        id: '2',
        initials: 'VS',
        name: 'Dr. Vijay Sharma',
        relation: 'Brother (MD, Interventional Cardiology, Apollo)',
        priority: 'p2',
        priorityText: 'Secondary Medical Proxy (Priority 2)',
        phone: '+91 94440 18234',
        workPhone: '',
        email: 'dr.vijay@apollohealth.org',
        timing: 'Escalation (+2 mins delay)',
        verified: true,
        permissions: [
          'Clinical Consultation Proxy',
          'Prescription & Allergy Notification',
          'Secondary Trauma Escalation (if Primary unreachable after 2 mins)',
        ],
      },
    ];
  });

  const [permissions, setPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('ekavach_patient_permissions');
      return saved ? JSON.parse(saved) : { allowMedicalHistory: true, receiveGps: true };
    } catch (e) {
      return { allowMedicalHistory: true, receiveGps: true };
    }
  });

  const [editingContactId, setEditingContactId] = useState(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');

  const [newContact, setNewContact] = useState({
    name: '',
    relation: 'Spouse',
    phone: '',
    email: '',
    priority: 'p2',
    allowMedicalHistory: permissions.allowMedicalHistory,
    receiveGps: permissions.receiveGps,
  });

  const triggerSignal = (target) => {
    setSignalStatus(
      target.startsWith('Encrypted') ||
        target.startsWith('Diagnostic') ||
        target.startsWith('Mobile') ||
        target.startsWith('Contact') ||
        target.startsWith('Emergency') ||
        target.startsWith('Dispatch') ||
        target.startsWith('Please') ||
        target.startsWith('Aadhaar') ||
        target.startsWith('Ingress') ||
        target.startsWith('Patient') ||
        target.startsWith('Notification') ||
        target.startsWith('Profile')
        ? target
        : `Encrypted test ingress packet routed to ${target || 'All Authorized Next-of-Kin'} via ABDM Gateway.`
    );
    setTimeout(() => setSignalStatus(null), 4500);
  };

  const handlePhoneChange = (val) => {
    setNewContact({ ...newContact, phone: val });
    setIsPhoneVerified(false);
    setOtpSent(false);
  };

  const triggerOtpPrompt = () => {
    const raw = newContact.phone.replace(/\D/g, '');
    if (!raw || raw.length < 10) {
      triggerSignal('Please enter a valid 10-digit mobile number first.');
      return;
    }
    setOtpSent(true);
    setEnteredOtp('');
    triggerSignal(`Aadhaar Registry (+91 ${newContact.phone}) — Mock OTP: 482910 dispatched.`);
  };

  const verifyOtp = () => {
    if (enteredOtp.trim() === '482910' || enteredOtp.trim().length === 6) {
      setIsPhoneVerified(true);
      setOtpSent(false);
      triggerSignal(`Mobile number +91 ${newContact.phone} verified via Aadhaar OTP.`);
    } else {
      triggerSignal('Invalid OTP code. Please enter 482910 or a valid 6-digit code.');
    }
  };

  const handleToggleTiming = (id) => {
    const updated = contacts.map((c) => {
      if (c.id === id) {
        const nextTiming = c.timing?.includes('Instant') ? 'Escalation (+2 mins delay)' : 'Instant (0s delay)';
        return { ...c, timing: nextTiming };
      }
      return c;
    });
    setContacts(updated);
    localStorage.setItem('ekavach_emergency_contacts', JSON.stringify(updated));
    const target = contacts.find((x) => x.id === id);
    triggerSignal(`Dispatch timing for ${target?.name || 'Contact'} updated to ${target?.timing || 'updated'}.`);
  };

  const handleEditContact = (contact) => {
    setEditingContactId(contact.id);
    const rel = contact.relation.split(' ')[0] || 'Spouse';
    setNewContact({
      name: contact.name,
      relation: ['Spouse', 'Parent', 'Child', 'Sibling', 'Trusted Physician', 'Legal Guardian'].includes(rel) ? rel : 'Spouse',
      phone: contact.phone.replace('+91', '').trim(),
      email: contact.email || '',
      priority: contact.priority || (contact.priorityText?.includes('Priority 1') ? 'p1' : contact.priorityText?.includes('Priority 2') ? 'p2' : 'p3'),
      allowMedicalHistory: contact.permissions?.some((p) => p.includes('History Access')) ?? true,
      receiveGps: contact.permissions?.some((p) => p.includes('GPS')) ?? true,
    });
    setIsPhoneVerified(true);
    setOtpSent(false);
    const formEl = document.getElementById('quick-add-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => document.getElementById('contact-name')?.focus(), 300);
    }
  };

  const handleRemoveContact = (id, name) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem('ekavach_emergency_contacts', JSON.stringify(updated));
    triggerSignal(`Contact "${name}" removed from active dispatch list.`);
    if (editingContactId === id) {
      handleResetForm();
    }
  };

  const handleResetForm = () => {
    setEditingContactId(null);
    setIsPhoneVerified(false);
    setOtpSent(false);
    setEnteredOtp('');
    setNewContact({
      name: '',
      relation: 'Spouse',
      phone: '',
      email: '',
      priority: 'p2',
      allowMedicalHistory: permissions.allowMedicalHistory,
      receiveGps: permissions.receiveGps,
    });
  };

  const handlePermissionChange = (key, val) => {
    const next = { ...permissions, [key]: val };
    setPermissions(next);
    localStorage.setItem('ekavach_patient_permissions', JSON.stringify(next));
    setNewContact((prev) => ({ ...prev, [key]: val }));
    triggerSignal('Ingress authorization and ambulatory GPS preferences saved.');
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      triggerSignal('Please provide Full Legal Name and Primary Mobile Number.');
      return;
    }
    const cleanPhone = newContact.phone.startsWith('+91') ? newContact.phone : `+91 ${newContact.phone}`;
    const priorityText =
      newContact.priority === 'p1'
        ? 'Primary Next-of-Kin (Priority 1)'
        : newContact.priority === 'p2'
        ? 'Secondary Medical Proxy (Priority 2)'
        : 'Emergency Informational Proxy (Priority 3)';
    const timing =
      newContact.priority === 'p1'
        ? 'Instant (0s delay)'
        : newContact.priority === 'p2'
        ? 'Escalation (+2 mins delay)'
        : 'Informational (+5 mins delay)';
    const perms = [
      newContact.allowMedicalHistory ? 'Medical History Access Granted' : 'Restricted History Access',
      newContact.receiveGps ? 'Real-time ER Admittance GPS Tracking' : 'Standard SMS Telemetry',
    ];
    const initials =
      newContact.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'EC';

    let updated;
    if (editingContactId) {
      updated = contacts.map((c) =>
        c.id === editingContactId
          ? {
              ...c,
              name: newContact.name,
              relation: newContact.relation,
              priority: newContact.priority,
              priorityText,
              phone: cleanPhone,
              email: newContact.email || c.email,
              timing,
              permissions: perms,
              initials,
              verified: true,
            }
          : c
      );
      triggerSignal(`Emergency Contact "${newContact.name}" updated in ABHA Registry.`);
    } else {
      const created = {
        id: Date.now().toString(),
        initials,
        name: newContact.name,
        relation: newContact.relation,
        priority: newContact.priority,
        priorityText,
        phone: cleanPhone,
        workPhone: '',
        email: newContact.email || `${newContact.name.toLowerCase().replace(/\s+/g, '.')}@contact.in`,
        timing,
        permissions: perms,
        verified: true,
      };
      updated = [...contacts, created];
      triggerSignal(`Emergency Contact "${created.name}" successfully linked to ABHA Trauma Health Record.`);
    }

    const priorityWeight = { p1: 1, p2: 2, p3: 3 };
    updated.sort((a, b) => (priorityWeight[a.priority] || 2) - (priorityWeight[b.priority] || 2));

    setContacts(updated);
    localStorage.setItem('ekavach_emergency_contacts', JSON.stringify(updated));
    handleResetForm();
  };

  const openAddContact = (e) => {
    if (e) e.preventDefault();
    handleResetForm();
    const el = document.getElementById('quick-add-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => document.getElementById('contact-name')?.focus(), 300);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        {/* Dynamic Notification / Simulation Toast */}
        {signalStatus && (
          <div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm bg-primary text-on-primary rounded-xl shadow-xl transition-all"
            id="simulation-toast"
          >
            <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">satellite_alt</span>
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg font-semibold">Diagnostic Test Signal Dispatched</span>
              <span className="font-body-sm text-body-sm text-surface-variant">{signalStatus}</span>
            </div>
            <button
              onClick={() => setSignalStatus(null)}
              className="ml-space-md text-surface-variant hover:text-on-primary transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Settings Meta Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-space-sm">
          <div className="flex items-center gap-space-xs text-on-surface-variant flex-wrap">
            <span className="font-label-md text-label-md">Patient Portal</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-label-md text-label-md">System Preferences</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-label-md text-label-md text-primary font-semibold">
              {activeModule === 'profile' && 'Patient Profile & Demographic Record'}
              {activeModule === 'abha' && 'Health ID & ABHA Credentials'}
              {activeModule === 'emergency' && 'Emergency Contacts & SOS Dispatch'}
              {activeModule === 'notifications' && 'Notification Settings'}
            </span>
          </div>
          <div className="flex items-center gap-space-xs self-start sm:self-auto">
            <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-full">
              <span className="inline-block w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">ABDM National Emergency Ingress: Operational</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-space-sm py-1 rounded-lg text-error hover:bg-error-container/20 font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer ml-1"
              title="Sign Out of Session"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Two-Column Master Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter items-start">
          {/* LEFT COLUMN: Settings Mini-Navigation & Trust Anchor */}
          <aside className="lg:col-span-3 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col gap-1">
              <div className="px-space-sm py-space-xs mb-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Configuration Suites</span>
              </div>

              {/* Profile Module */}
              <button
                type="button"
                onClick={() => handleModuleChange('profile')}
                className={`flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-colors text-left cursor-pointer w-full ${
                  activeModule === 'profile'
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <span className={`material-symbols-outlined text-[18px] ${activeModule === 'profile' ? 'text-tertiary-fixed' : ''}`}>account_circle</span>
                  <span className="font-label-lg text-label-lg">Profile</span>
                </div>
                {activeModule === 'profile' ? (
                  <span className="bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                ) : null}
              </button>

              {/* Health ID & ABHA Module */}
              <button
                type="button"
                onClick={() => handleModuleChange('abha')}
                className={`flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-colors text-left cursor-pointer w-full ${
                  activeModule === 'abha'
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <span className={`material-symbols-outlined text-[18px] ${activeModule === 'abha' ? 'text-tertiary-fixed' : ''}`}>fingerprint</span>
                  <span className="font-label-lg text-label-lg">Health ID &amp; ABHA</span>
                </div>
                {activeModule === 'abha' ? (
                  <span className="bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                ) : null}
              </button>

              {/* Emergency Contacts Module */}
              <button
                type="button"
                onClick={() => handleModuleChange('emergency')}
                className={`flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-colors text-left cursor-pointer w-full ${
                  activeModule === 'emergency'
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <span className={`material-symbols-outlined text-[18px] ${activeModule === 'emergency' ? 'text-tertiary-fixed' : ''}`}>emergency_share</span>
                  <span className="font-label-lg text-label-lg">Emergency Contacts</span>
                </div>
                <span
                  className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium ${
                    activeModule === 'emergency'
                      ? 'bg-tertiary-container text-tertiary-fixed'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                  id="active-contacts-count"
                >
                  {contacts.length} Active
                </span>
              </button>

              {/* Notifications Module */}
              <button
                type="button"
                onClick={() => handleModuleChange('notifications')}
                className={`flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-colors text-left cursor-pointer w-full ${
                  activeModule === 'notifications'
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <span className={`material-symbols-outlined text-[18px] ${activeModule === 'notifications' ? 'text-tertiary-fixed' : ''}`}>notifications_active</span>
                  <span className="font-label-lg text-label-lg">Notifications</span>
                </div>
                <span
                  className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${
                    activeModule === 'notifications'
                      ? 'bg-tertiary-container text-tertiary-fixed font-medium'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  Automated
                </span>
              </button>
            </div>

            {/* Secure Keystore Architecture Card -> Clickable to Privacy & Security */}
            <Link
              to="/patient/privacy"
              className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm hover:bg-surface-container transition-colors no-underline block cursor-pointer group"
            >
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-[20px] text-secondary group-hover:scale-105 transition-transform">encrypted</span>
                <span className="font-headline-sm text-headline-sm tracking-tight text-primary">Data Fortress</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Instant SOS Ingress broadcast encrypted under ABDM &amp; NDHM Section 29 emergency dispatch protocol. All dispatch tokens stored in patient FIPS 140-2 Level 3 hardware keystore.
              </p>
              <div className="pt-space-xs flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm uppercase font-semibold text-secondary">Break-Glass Clearance</span>
                <span className="font-label-sm text-label-sm font-semibold">Tier-1 Trauma</span>
              </div>
            </Link>

            {/* Quick Fast-Pass Status Card */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Pre-Linked Gateway</span>
                <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-primary">NHM 108 • Greams Trauma</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Apollo Greams Trauma Emergency Bay syncs live vitals upon ingress flag.
              </p>
            </div>
          </aside>

          {/* RIGHT COLUMN: Active Content Panel */}
          <div className="lg:col-span-9 flex flex-col gap-space-md">

            {/* MODULE 1: PROFILE VIEW */}
            {activeModule === 'profile' && (
              <div className="flex flex-col gap-space-md">
                {/* Header & Action Row */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex flex-col gap-space-2xs max-w-2xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[24px] text-primary">account_circle</span>
                      <h1 className="font-headline-md text-headline-md text-primary">Patient Profile &amp; Demographics</h1>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Official legal identity and demographic records synchronized across Ayushman Bharat Digital Mission (ABDM) national health registers.
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>ABDM Verified</span>
                    </div>
                  </div>
                </div>

                {/* Identity Summary Card */}
                <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-14 h-14 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold shadow-sm flex-shrink-0">
                      {profile.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'RS'}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{profile.fullName}</span>
                        <span className="bg-tertiary text-on-tertiary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">verified</span> {profile.verificationStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-space-md mt-1 text-on-surface-variant flex-wrap">
                        <div className="flex items-center gap-space-2xs font-mono text-body-sm">
                          <span className="material-symbols-outlined text-[16px] text-secondary">fingerprint</span>
                          <span>ABHA: {profile.abhaId}</span>
                        </div>
                        <div className="flex items-center gap-space-2xs text-body-sm">
                          <span className="material-symbols-outlined text-[16px] text-secondary">bloodtype</span>
                          <span className="font-semibold text-error">Blood Group: {profile.bloodGroup}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable Profile Form */}
                <form onSubmit={handleSaveProfile} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm text-primary">Demographic Information</h2>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                      NDHM Standard Entity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Full Legal Name */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Full Legal Name</label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => handleProfileChange('fullName', e.target.value)}
                        required
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    {/* ABHA ID (Read-only) */}
                    <div className="flex flex-col gap-space-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface-variant font-semibold">ABHA ID (National Health ID)</label>
                        <span className="font-label-sm text-[11px] text-secondary font-semibold">Verified &amp; Locked</span>
                      </div>
                      <div className="flex gap-space-xs">
                        <input
                          type="text"
                          value={profile.abhaId}
                          readOnly
                          className="flex-1 px-space-md py-space-xs bg-surface-container-low text-on-surface-variant rounded-lg font-body-md text-body-md font-mono cursor-not-allowed shadow-inner"
                        />
                        <span className="px-space-sm py-space-xs bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-label-md flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-[14px]">lock</span> Linked
                        </span>
                      </div>
                    </div>

                    {/* Primary Mobile Number */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Primary Mobile Number</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        required
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        required
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Date of Birth</label>
                      <input
                        type="date"
                        value={profile.dob}
                        onChange={(e) => handleProfileChange('dob', e.target.value)}
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Gender</label>
                      <div className="relative">
                        <select
                          value={profile.gender}
                          onChange={(e) => handleProfileChange('gender', e.target.value)}
                          className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>

                    {/* Blood Group */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Blood Group</label>
                      <div className="relative">
                        <select
                          value={profile.bloodGroup}
                          onChange={(e) => handleProfileChange('bloodGroup', e.target.value)}
                          className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none font-semibold text-error"
                        >
                          <option value="A+">A+ (A Positive)</option>
                          <option value="A-">A- (A Negative)</option>
                          <option value="B+">B+ (B Positive)</option>
                          <option value="B-">B- (B Negative)</option>
                          <option value="AB+">AB+ (AB Positive)</option>
                          <option value="AB-">AB- (AB Negative)</option>
                          <option value="O+">O+ (O Positive)</option>
                          <option value="O-">O- (O Negative)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>

                    {/* Postal Pincode */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Postal Pincode</label>
                      <input
                        type="text"
                        value={profile.pincode}
                        onChange={(e) => handleProfileChange('pincode', e.target.value)}
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    {/* Residential Address */}
                    <div className="md:col-span-2 flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Residential Address</label>
                      <textarea
                        rows={2}
                        value={profile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-space-sm border-t border-surface-container-high mt-space-xs gap-space-sm">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Edits persist locally and synchronize across ABDM-connected trauma nodes.
                    </span>
                    <button
                      type="submit"
                      className="px-space-xl py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* MODULE 2: HEALTH ID & ABHA VIEW */}
            {activeModule === 'abha' && (
              <div className="flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex flex-col gap-space-2xs max-w-2xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[24px] text-primary">fingerprint</span>
                      <h1 className="font-headline-md text-headline-md text-primary">Health ID &amp; ABHA Credentials</h1>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Your Ayushman Bharat Health Account (ABHA) is your unique 14-digit identifier for digital health records under the Ayushman Bharat Digital Mission (ABDM).
                    </p>
                  </div>
                  <Link
                    to="/patient/abha"
                    className="px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg transition-colors flex items-center gap-space-2xs shadow-sm no-underline shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    <span>Open Dedicated ABHA Portal</span>
                  </Link>
                </div>

                {/* ABHA Digital Card */}
                <div className="p-space-lg rounded-2xl bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary shadow-lg flex flex-col md:flex-row justify-between gap-space-lg">
                  <div className="flex flex-col justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-headline-sm text-headline-sm font-bold tracking-tight">ABHA CARD</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-on-primary text-label-sm font-semibold">National Health Authority</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-surface-variant text-label-sm uppercase tracking-wider">Ayushman Bharat Health Account Number</span>
                      <span className="font-headline-md text-headline-md font-mono tracking-widest">{profile.abhaId}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-space-md text-body-sm">
                      <div>
                        <span className="text-surface-variant text-label-sm block">Name</span>
                        <span className="font-semibold text-body-md">{profile.fullName}</span>
                      </div>
                      <div>
                        <span className="text-surface-variant text-label-sm block">ABHA Address</span>
                        <span className="font-semibold font-mono text-body-md">rahul.sharma@abdm</span>
                      </div>
                      <div>
                        <span className="text-surface-variant text-label-sm block">Gender / DOB</span>
                        <span className="font-semibold">{profile.gender} / {profile.dob}</span>
                      </div>
                      <div>
                        <span className="text-surface-variant text-label-sm block">Mobile</span>
                        <span className="font-semibold">{profile.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-space-md bg-white rounded-xl text-primary shrink-0 self-center md:self-auto shadow-sm">
                    <div className="w-32 h-32 bg-surface-container flex items-center justify-center rounded-lg border-2 border-primary/20">
                      <span className="material-symbols-outlined text-[72px] text-primary">qr_code_2</span>
                    </div>
                    <span className="font-label-sm text-[10px] font-mono mt-2 text-on-surface-variant">ABDM SECURE QR</span>
                  </div>
                </div>

                {/* Verification Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-[24px] text-tertiary">check_circle</span>
                    <div>
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">Aadhaar Linked</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Biometrically verified with UIDAI registry.</p>
                    </div>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-[24px] text-tertiary">shield</span>
                    <div>
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">Consent Manager Active</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Section 29 break-glass protocol enabled.</p>
                    </div>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-[24px] text-secondary">cloud_sync</span>
                    <div>
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">Live EHR Sync</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Connected across 42 partner hospitals.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 3: EMERGENCY CONTACTS VIEW */}
            {activeModule === 'emergency' && (
              <div className="flex flex-col gap-space-md">
                {/* Header & Action Row */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex flex-col gap-space-2xs max-w-2xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[24px] text-primary">contact_emergency</span>
                      <h1 className="font-headline-md text-headline-md text-primary">Emergency Contacts &amp; SOS Dispatch</h1>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Designated individuals and clinical proxies authorized for instant automated SMS, GPS trauma ingress telemetry, and ICU break-glass consent.
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0 flex-wrap">
                    <button
                      onClick={() => triggerSignal('Trauma Beacon Network (Apollo Greams Trauma Bay)')}
                      className="px-space-md py-space-xs bg-surface-container-high hover:bg-surface-container text-primary font-label-lg text-label-lg rounded-lg transition-colors flex items-center gap-space-2xs shadow-sm cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">wifi_tethering</span>
                      <span>Broadcast Test Ping</span>
                    </button>
                    <a
                      className="px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg transition-colors flex items-center gap-space-2xs shadow-sm cursor-pointer"
                      href="#quick-add-form"
                      onClick={openAddContact}
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      <span>+ Add Emergency Contact</span>
                    </a>
                  </div>
                </div>

                {/* Callout: Trauma Beacon Integration Ribbon */}
                <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
                  </div>
                  <div className="flex flex-col gap-space-2xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-sm text-headline-sm text-primary">Trauma Beacon Integration</span>
                      <span className="bg-surface-container-high text-secondary text-label-sm font-label-sm px-2 py-0.5 rounded-full font-semibold">Latency: 0.18s</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      In an emergency or Level-1 trauma triage scan, automated real-time SMS alerts with live hospital bay location, telemetry packets, and attending clinician contact are dispatched within 0.18s to your Primary Contact.
                    </p>
                  </div>
                </div>

                {/* Priority Contact Cards */}
                <div className="flex flex-col gap-space-md" id="contacts-container">
                  {contacts.map((contact) => {
                    const isP1 = contact.priority === 'p1';
                    const isP2 = contact.priority === 'p2';
                    const badgeClass = isP1
                      ? 'bg-tertiary text-on-tertiary'
                      : isP2
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-high text-on-surface';
                    const badgeIcon = isP1 ? 'verified' : isP2 ? 'medical_information' : 'info';
                    const timingColor = isP1 ? 'text-primary' : isP2 ? 'text-secondary' : 'text-on-surface-variant';

                    return (
                      <div
                        key={contact.id}
                        className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md relative overflow-hidden transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                          <div className="flex items-center gap-space-md">
                            <div
                              className={`w-14 h-14 rounded-xl ${
                                isP1 ? 'bg-surface-container-high text-primary' : 'bg-surface-container-high text-secondary'
                              } flex items-center justify-center font-headline-md text-headline-md font-bold shadow-sm flex-shrink-0`}
                            >
                              {contact.initials || 'EC'}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-space-xs flex-wrap">
                                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{contact.name}</span>
                                <span className="font-label-md text-label-md text-on-surface-variant">• {contact.relation}</span>
                                <span className={`${badgeClass} font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1`}>
                                  <span className="material-symbols-outlined text-[12px]">{badgeIcon}</span> {contact.priorityText}
                                </span>
                              </div>
                              <div className="flex items-center gap-space-md mt-1 flex-wrap text-on-surface-variant">
                                <div className="flex items-center gap-space-2xs">
                                  <span className="material-symbols-outlined text-[16px] text-secondary">call</span>
                                  <span className="font-body-md text-body-md font-medium text-on-surface">{contact.phone}</span>
                                  <span className="bg-surface-container-high text-tertiary font-label-sm text-label-sm px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                                    <span className="material-symbols-outlined text-[12px]">verified_user</span> Aadhaar OTP Verified
                                  </span>
                                </div>
                                {contact.workPhone && (
                                  <div className="flex items-center gap-space-2xs">
                                    <span className="material-symbols-outlined text-[16px]">work</span>
                                    <span className="font-body-sm text-body-sm">{contact.workPhone}</span>
                                  </div>
                                )}
                                {contact.email && (
                                  <div className="flex items-center gap-space-2xs">
                                    <span className="material-symbols-outlined text-[16px]">mail</span>
                                    <span className="font-body-sm text-body-sm">{contact.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            className="bg-surface-container-low px-space-md py-space-xs rounded-lg flex flex-col md:items-end justify-center cursor-pointer hover:bg-surface-container transition-colors"
                            onClick={() => handleToggleTiming(contact.id)}
                            title="Click to toggle timing"
                          >
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Dispatch Timing</span>
                            <span className={`font-headline-sm text-headline-sm ${timingColor} font-bold`}>{contact.timing || 'Instant (0s delay)'}</span>
                          </div>
                        </div>

                        {/* Privileges & Badges */}
                        <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                          <div className="flex flex-col gap-1">
                            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Emergency Permissions &amp; Legal Authorities</span>
                            <div className="flex flex-wrap gap-space-xs mt-1">
                              {(contact.permissions || ['Medical History Access Granted', 'Real-time ER Admittance GPS Tracking']).map((perm, idx) => (
                                <span key={idx} className="bg-surface-container-lowest text-primary font-label-sm text-label-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span> {perm}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-space-xs self-end md:self-center shrink-0">
                            <button
                              className="px-space-sm py-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                              onClick={() => triggerSignal(contact.name)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">cell_tower</span> Simulate Test Alert
                            </button>
                            <button
                              className="px-space-sm py-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                              onClick={() => handleEditContact(contact)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                            </button>
                            <button
                              className="text-on-surface-variant hover:text-error font-label-md text-label-md px-2 py-1 transition-colors cursor-pointer"
                              onClick={() => handleRemoveContact(contact.id, contact.name)}
                              type="button"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Add / Ingress Proxy Form Drawer Card */}
                <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" id="quick-add-form">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm text-primary">
                        {editingContactId ? 'Edit Emergency Contact / Proxy' : 'Add Authorized Emergency Contact / Proxy'}
                      </h2>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">NDHM Sec 29 Standard Form</span>
                  </div>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-space-md" onSubmit={handleSaveContact}>
                    {/* Full Name */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="contact-name">Full Legal Name</label>
                      <input
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        id="contact-name"
                        placeholder="e.g. Meera Sharma"
                        required
                        type="text"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      />
                    </div>
                    {/* Relationship Dropdown */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="contact-relation">Relationship to Patient</label>
                      <div className="relative">
                        <select
                          className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                          id="contact-relation"
                          value={newContact.relation}
                          onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                        >
                          <option>Spouse</option>
                          <option>Parent</option>
                          <option>Child</option>
                          <option>Sibling</option>
                          <option>Trusted Physician</option>
                          <option>Legal Guardian</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>
                    {/* Primary Mobile with Verification trigger */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="contact-phone">Primary Mobile Number</label>
                      <div className="flex gap-space-xs">
                        <span className="px-space-sm py-space-xs bg-surface-container text-on-surface rounded-lg font-label-md text-label-md flex items-center font-bold">+91</span>
                        <input
                          className="flex-1 px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                          id="contact-phone"
                          placeholder="98400 00000"
                          required
                          type="tel"
                          value={newContact.phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                        />
                        <button
                          className="px-space-md py-space-xs bg-surface-container-high hover:bg-surface-container text-primary font-label-md text-label-md rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                          type="button"
                          onClick={triggerOtpPrompt}
                        >
                          Send OTP
                        </button>
                      </div>
                      {/* Dynamic Inline OTP Input Group */}
                      {otpSent && (
                        <div className="flex gap-space-xs mt-2 transition-all">
                          <input
                            className="flex-1 px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                            placeholder="Enter 6-digit OTP (Mock: 482910)"
                            maxLength={6}
                            type="text"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                          />
                          <button
                            className="px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                            type="button"
                            onClick={verifyOtp}
                          >
                            Verify OTP
                          </button>
                        </div>
                      )}
                      {isPhoneVerified && (
                        <div className="mt-1 inline-flex items-center gap-1 text-tertiary font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[14px]">verified_user</span> Aadhaar OTP Verified
                        </div>
                      )}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Instant OTP required for Aadhaar-linked break-glass authority.</span>
                    </div>
                    {/* Email Address */}
                    <div className="flex flex-col gap-space-2xs">
                      <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="contact-email">Email (Telemetry Delivery)</label>
                      <input
                        className="w-full px-space-md py-space-xs bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        id="contact-email"
                        placeholder="e.g. meera.sharma@domain.in"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      />
                    </div>
                    {/* Dispatch Priority Level Selector */}
                    <div className="md:col-span-2 flex flex-col gap-space-xs pt-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Dispatch Ingress Tier</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                        <label className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                          <input
                            className="mt-1 accent-primary"
                            name="priority"
                            type="radio"
                            value="p1"
                            checked={newContact.priority === 'p1'}
                            onChange={() => setNewContact({ ...newContact, priority: 'p1' })}
                          />
                          <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg font-semibold text-primary">Priority 1 (Primary)</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Instant SMS dispatch + DPOA authority</span>
                          </div>
                        </label>
                        <label className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                          <input
                            className="mt-1 accent-primary"
                            name="priority"
                            type="radio"
                            value="p2"
                            checked={newContact.priority === 'p2'}
                            onChange={() => setNewContact({ ...newContact, priority: 'p2' })}
                          />
                          <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg font-semibold text-primary">Priority 2 (Secondary)</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Escalation dispatch if P1 unreachable (+2 mins)</span>
                          </div>
                        </label>
                        <label className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                          <input
                            className="mt-1 accent-primary"
                            name="priority"
                            type="radio"
                            value="p3"
                            checked={newContact.priority === 'p3'}
                            onChange={() => setNewContact({ ...newContact, priority: 'p3' })}
                          />
                          <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg font-semibold text-primary">Priority 3 (Informational)</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Post-stabilization SMS notification</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    {/* Authorization Checkboxes */}
                    <div className="md:col-span-2 flex flex-col gap-space-xs pt-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Authorization &amp; Legal Permissions</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                        <label className="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded-lg cursor-pointer">
                          <input
                            className="w-4 h-4 accent-primary rounded"
                            type="checkbox"
                            checked={newContact.allowMedicalHistory}
                            onChange={(e) => handlePermissionChange('allowMedicalHistory', e.target.checked)}
                          />
                          <span className="font-body-md text-body-md text-on-surface">Allow Medical History Access during Trauma Ingress</span>
                        </label>
                        <label className="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded-lg cursor-pointer">
                          <input
                            className="w-4 h-4 accent-primary rounded"
                            type="checkbox"
                            checked={newContact.receiveGps}
                            onChange={(e) => handlePermissionChange('receiveGps', e.target.checked)}
                          />
                          <span className="font-body-md text-body-md text-on-surface">Receive Ambulatory GPS Tracking updates</span>
                        </label>
                      </div>
                    </div>
                    {/* Form Buttons */}
                    <div className="md:col-span-2 flex items-center justify-end gap-space-sm pt-space-md">
                      <button
                        className="px-space-md py-space-xs text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer"
                        type="button"
                        onClick={handleResetForm}
                      >
                        Cancel
                      </button>
                      <button className="px-space-xl py-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg shadow-sm transition-colors flex items-center gap-space-2xs cursor-pointer" type="submit">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>{editingContactId ? 'Update Emergency Contact' : 'Save Emergency Contact'}</span>
                      </button>
                    </div>
                  </form>
                </section>

                {/* SOS Ambulance & Hospital Fast-Pass Integration Strip */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[28px]">airport_shuttle</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-primary">Pre-Linked Ambulance Fast-Pass • NHM 108 &amp; Apollo Trauma</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Pre-linked to National Health Mission (NHM 108) Ambulance &amp; Apollo Greams Trauma Emergency Bay. Authorized contacts will automatically receive live ambulance dispatch GPS telemetry upon trauma activation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0 self-start md:self-center">
                    <span className="bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">cell_tower</span> Live Sync Ready
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: NOTIFICATIONS VIEW */}
            {activeModule === 'notifications' && (
              <div className="flex flex-col gap-space-lg">
                {/* Workspace Header Banner */}
                <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                      <span className="material-symbols-outlined text-[15px]">tune</span>
                      <span>Patient Preferences &amp; Safety Protocols / Notifications</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Notification Settings</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Choose how and when E-KAVACH keeps you informed across clinical updates and critical care.</p>
                  </div>
                  <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-2 flex-shrink-0">
                    <button
                      className="inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                      onClick={handleSaveNotificationPrefs}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      <span>Save Preferences</span>
                    </button>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
                      <span>ABDM Sync: Active (0.04s)</span>
                    </div>
                  </div>
                </div>

                {/* Card 1: Appointments */}
                <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Appointments</h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ backgroundColor: '#E4E4FB', color: '#2e2a72' }}>
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
                        <input
                          checked={notificationPrefs.appointmentReminders}
                          onChange={() => toggleNotificationPref('appointmentReminders')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                    <div className="h-px w-full bg-surface-container-high my-1"></div>
                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Approval Status Updates</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Know when a doctor approves, reschedules, or declines your request.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.approvalUpdates}
                          onChange={() => toggleNotificationPref('approvalUpdates')}
                          className="sr-only peer"
                          type="checkbox"
                        />
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
                    <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ backgroundColor: '#E4E4FB', color: '#2e2a72' }}>
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
                        <input
                          checked={notificationPrefs.refillAlerts}
                          onChange={() => toggleNotificationPref('refillAlerts')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                    <div className="h-px w-full bg-surface-container-high my-1"></div>
                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">New Health Record Added</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Notify me when a doctor updates my health history.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.newRecordAdded}
                          onChange={() => toggleNotificationPref('newRecordAdded')}
                          className="sr-only peer"
                          type="checkbox"
                        />
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
                    <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ backgroundColor: '#E4E4FB', color: '#2e2a72' }}>
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
                        <input
                          checked={notificationPrefs.newDoctorMessages}
                          onChange={() => toggleNotificationPref('newDoctorMessages')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                    <div className="h-px w-full bg-surface-container-high my-1"></div>
                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Video Consult Reminders</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Reminders 10 minutes before a scheduled video call.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.videoReminders}
                          onChange={() => toggleNotificationPref('videoReminders')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Card 4: Emergency & Critical Alerts (LOCKED ON) */}
                <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md relative overflow-hidden" style={{ boxShadow: '0 0 0 1.5px #ba1a1a' }}>
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-error"></div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-error-container text-error flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
                      </div>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                          <span>Emergency &amp; Critical Alerts</span>
                        </h2>
                        <p className="font-body-sm text-body-sm text-outline">Real-time patient safety safeguards governed by National Emergency Grid.</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      <span>MANDATORY PROTOCOL</span>
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
                          <span>Required for patient safety — cannot be disabled.</span>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center flex-shrink-0 cursor-not-allowed opacity-90">
                        <div className="w-11 h-6 rounded-full bg-primary flex items-center justify-end px-1 shadow-inner">
                          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
                            <span className="material-symbols-outlined text-[10px] text-primary">lock</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
                          <span>Required by National Health Authority (ABDM) — Non-optional.</span>
                        </div>
                      </div>
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
                    <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide" style={{ backgroundColor: '#E4E4FB', color: '#2e2a72' }}>
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
                        <input
                          checked={notificationPrefs.schemeUpdates}
                          onChange={() => toggleNotificationPref('schemeUpdates')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                    <div className="h-px w-full bg-surface-container-high my-1"></div>
                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between py-space-sm gap-space-md">
                      <div className="flex flex-col pr-space-md">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Platform Announcements</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Occasional updates about new E-KAVACH features, partner hospitals, and educational modules.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          checked={notificationPrefs.platformAnnouncements}
                          onChange={() => toggleNotificationPref('platformAnnouncements')}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Delivery Preferences ("Notify Me Via") */}
                <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary">alt_route</span>
                        <span>Notify Me Via</span>
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Select authorized channels for receiving critical healthcare notifications.</p>
                    </div>
                    <span className="text-secondary font-label-sm text-label-sm font-mono font-semibold">
                      {[notificationPrefs.channelPush, notificationPrefs.channelSms, notificationPrefs.channelEmail].filter(Boolean).length} OF 3 ACTIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-1">
                    {/* Push Notification Channel */}
                    <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            checked={notificationPrefs.channelPush}
                            onChange={() => toggleNotificationPref('channelPush')}
                            className="sr-only peer"
                            type="checkbox"
                          />
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

                    {/* SMS Channel */}
                    <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">sms</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            checked={notificationPrefs.channelSms}
                            onChange={() => toggleNotificationPref('channelSms')}
                            className="sr-only peer"
                            type="checkbox"
                          />
                          <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-lg text-label-lg font-bold text-on-surface">SMS Cellular</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant font-mono text-[12px]">{profile.phone}</p>
                      </div>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Verified Carrier
                        </span>
                      </div>
                    </div>

                    {/* Email Channel */}
                    <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            checked={notificationPrefs.channelEmail}
                            onChange={() => toggleNotificationPref('channelEmail')}
                            className="sr-only peer"
                            type="checkbox"
                          />
                          <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-lg text-label-lg font-bold text-on-surface">Encrypted Email</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate text-[12px]">{profile.email}</p>
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
                    <span>Changes apply immediately across all authorized ABDM and trauma endpoints.</span>
                  </div>
                  <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
                    <button
                      className="px-space-md py-2.5 rounded-lg text-primary hover:bg-surface-container-low font-label-lg text-label-lg font-medium transition-colors cursor-pointer"
                      onClick={handleRestoreNotificationDefaults}
                      type="button"
                    >
                      Restore Defaults
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 px-space-xl py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                      onClick={handleSaveNotificationPrefs}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
