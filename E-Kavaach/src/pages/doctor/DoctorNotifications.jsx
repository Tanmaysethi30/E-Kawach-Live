import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorNotifications() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);

  const [toggles, setToggles] = useState(() => {
    const saved = localStorage.getItem('ekavach_doctor_notifications');
    return saved
      ? JSON.parse(saved)
      : {
          triageAlerts: true,
          appointmentRequests: true,
          patientMessages: true,
          networkRequests: false,
          panicValues: true,
          scheduleHOverrides: true,
        };
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggle = (key, label) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    localStorage.setItem('ekavach_doctor_notifications', JSON.stringify(next));
    showToast(`${label} is now ${next[key] ? 'ENABLED' : 'MUTED'}.`);
  };

  const handleSave = () => {
    localStorage.setItem('ekavach_doctor_notifications', JSON.stringify(toggles));
    showToast('All notification preferences synced to Apollo Local Node.');
  };

  const handleRestore = () => {
    const defaultVals = {
      triageAlerts: true,
      appointmentRequests: true,
      patientMessages: true,
      networkRequests: false,
      panicValues: true,
      scheduleHOverrides: true,
    };
    setToggles(defaultVals);
    localStorage.setItem('ekavach_doctor_notifications', JSON.stringify(defaultVals));
    showToast('Notification settings restored to default clinical protocol.');
  };

  return (
    <div className="w-full">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#004d6c] text-white rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-xl text-[#02C39A]">notifications_active</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Notification Setting Updated</span>
            <span className="text-xs text-slate-200">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-4 text-slate-300 hover:text-white transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span className="text-[#004d6c] font-semibold">SETTINGS</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700">NOTIFICATIONS &amp; CLINICAL ALERTS</span>
            <span className="bg-[#E4E4FB] text-[#4f46e5] text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">E-Kavach Telemetry</span>
          </div>
          <h1 className="font-headline font-bold text-2xl lg:text-3xl text-[#004d6c]">Clinical Alert &amp; Notification Hub</h1>
          <p className="text-sm text-slate-500 mt-1">Configure emergency trauma signals, clinical ingress audio, triage escalations, and automated peer consult alerts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Playing test audio beacon (0.18s chime sequence on Bay 3 speaker).')}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 bg-white shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-base text-slate-500">volume_up</span>
            Test Audio Beacons
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#004d6c] hover:bg-[#05668d] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-base">save</span>
            Save All Preferences
          </button>
        </div>
      </div>

      {/* MAIN SETTINGS TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT SUB-NAVIGATION (Matching Settings Page tabs) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-[#e0e3e6] p-3 shadow-sm space-y-1">
            <Link to="/doctor/settings" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-[#f2f4f7] text-xs font-medium transition-colors no-underline">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-base text-slate-400">person</span>
                Profile
              </div>
            </Link>
            <Link to="/doctor/credentials" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-[#f2f4f7] text-xs font-medium transition-colors no-underline">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-base text-slate-400">verified_user</span>
                Credentials
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">Verified</span>
            </Link>
            {/* Active Notification Tab */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#004d6c] text-white text-xs font-semibold shadow-sm cursor-default">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-base text-emerald-400">notifications_active</span>
                Notifications
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <Link to="/doctor/privacy" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-[#f2f4f7] text-xs font-medium transition-colors no-underline">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-base text-slate-400">lock</span>
                Privacy &amp; Security
              </div>
            </Link>
            <Link to="/doctor/privacy#active-sessions" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-[#f2f4f7] text-xs font-medium transition-colors no-underline">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-base text-slate-400">devices</span>
                Connected Devices
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </Link>
            <Link to="/doctor/settings" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-[#f2f4f7] text-xs font-medium transition-colors no-underline">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-base text-slate-400">manage_accounts</span>
                Account
              </div>
            </Link>
          </div>

          {/* Channel Delivery Status Card */}
          

          {/* Quick Audio Volume Helper */}
          <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200/70 p-4">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold mb-1">
              <span className="material-symbols-outlined text-sm text-emerald-600">security</span>
              Trauma Override Priority
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Level-1 triage and Red Code alerts automatically bypass "Do Not Disturb" and mute states in compliance with National Trauma Protocol.
            </p>
          </div>
        </div>

        {/* RIGHT MAIN NOTIFICATION CONFIGURATION CONTENT */}
        <div className="lg:col-span-9 space-y-6">

          {/* SECTION 1: CORE CLINICAL ALERT & NOTIFICATION PREFERENCES (The user selected element expanded into full control center) */}
          <div className="bg-white rounded-2xl border border-[#e0e3e6] shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#004d6c]/10 text-[#004d6c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-[#004d6c]">notifications_active</span>
                </div>
                <div>
                  <h2 className="font-headline font-bold text-lg text-slate-900">Clinical Alert &amp; Notification Preferences</h2>
                  <p className="text-xs text-slate-500">Fine-tune automated triggers, sound profiles, and dispatch priority for your clinical workstation.</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active&nbsp;</span>
            </div>

            {/* List of Preferences / Toggles matching user selection + detailed options */}
            <div className="divide-y divide-slate-100">

              {/* Item 1: Emergency Triage Alerts */}
              <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">Emergency Triage Alerts</span>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">Critical</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Instant high-acuity audio and visual push alerts for incoming Level-1 trauma arrivals, code blues, and acute cardiac arrest cases in Bay 3.
                  </p>
                  {/* Secondary sub-options */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked="" className="w-3.5 h-3.5 rounded text-[#004d6c] focus:ring-[#004d6c]" />
                      Klaxon Strobe Light
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked="" className="w-3.5 h-3.5 rounded text-[#004d6c] focus:ring-[#004d6c]" />
                      Loud Siren (100% Volume)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked="" className="w-3.5 h-3.5 rounded text-[#004d6c] focus:ring-[#004d6c]" />
                      SMS Emergency Fallback
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggle('triageAlerts', 'Emergency Triage Alerts')}
                    type="button"
                    className={`w-12 h-6 ${toggles.triageAlerts ? 'bg-[#02C39A]' : 'bg-slate-300'} rounded-full relative p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02C39A]/40`}
                    aria-label="Toggle Emergency Triage Alerts"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform ${toggles.triageAlerts ? 'translate-x-6' : 'translate-x-0'} transition-transform`}></div>
                  </button>
                </div>
              </div>

              {/* Item 2: New Appointment Requests */}
              <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">New Appointment Requests</span>
                    <span className="bg-[#E4E4FB] text-[#4f46e5] text-[10px] font-semibold px-2 py-0.5 rounded">OPD &amp; Ingress</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Notifications when walk-ins or scheduled consultations enter the pending triage queue or require clinician counter-signature.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                    <span className="text-slate-400">Frequency:</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">Instant Pop-up</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Auto-group every 15 mins during active rounds</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggle('appointmentRequests', 'New Appointment Requests')}
                    type="button"
                    className={`w-12 h-6 ${toggles.appointmentRequests ? 'bg-[#02C39A]' : 'bg-slate-300'} rounded-full relative p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02C39A]/40`}
                    aria-label="Toggle Appointment Requests"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform ${toggles.appointmentRequests ? 'translate-x-6' : 'translate-x-0'} transition-transform`}></div>
                  </button>
                </div>
              </div>

              {/* Item 3: Patient Messages & Teleconsults */}
              <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">Patient Messages &amp; Teleconsults</span>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded">ABHA Telehealth</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Direct communications from linked ABHA patients, incoming telemedicine video requests, and home telemetry vital updates.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-[#004d6c] focus:ring-[#004d6c]" />
                      Video Ringtone
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-[#004d6c] focus:ring-[#004d6c]" />
                      Desktop Banner
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggle('patientMessages', 'Patient Messages & Teleconsults')}
                    type="button"
                    className={`w-12 h-6 ${toggles.patientMessages ? 'bg-[#02C39A]' : 'bg-slate-300'} rounded-full relative p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02C39A]/40`}
                    aria-label="Toggle Patient Messages"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform ${toggles.patientMessages ? 'translate-x-6' : 'translate-x-0'} transition-transform`}></div>
                  </button>
                </div>
              </div>

              {/* Item 4: Doctor Network Requests */}
              <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">Doctor Network Requests</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">Peer Collaboration</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Referrals, inter-hospital second opinion invites, and collaboration requests from verified peer clinicians across Apollo and AIIMS nodes.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="">Delivered via daily digest and in-app badge</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggle('networkRequests', 'Doctor Network Requests')}
                    type="button"
                    className={`w-12 h-6 ${toggles.networkRequests ? 'bg-[#02C39A]' : 'bg-slate-300'} rounded-full relative p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300`}
                    aria-label="Toggle Doctor Network Requests"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform ${toggles.networkRequests ? 'translate-x-6' : 'translate-x-0'} transition-transform`}></div>
                  </button>
                </div>
              </div>

              {/* Item 5 (Extended): Critical Lab & Radiology Panic Values */}
              <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">Critical Lab &amp; Diagnostic Panic Values</span>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Urgent</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Immediate notification when pathology or radiology flags life-threatening lab indicators (e.g. Troponin &gt; 0.04 ng/mL, Potassium &gt; 6.5 mEq/L, severe intracranial hemorrhage).
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggle('panicValues', 'Critical Lab Panic Values')}
                    type="button"
                    className={`w-12 h-6 ${toggles.panicValues ? 'bg-[#02C39A]' : 'bg-slate-300'} rounded-full relative p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02C39A]/40`}
                    aria-label="Toggle Lab Panic Values"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform ${toggles.panicValues ? 'translate-x-6' : 'translate-x-0'} transition-transform`}></div>
                  </button>
                </div>
              </div>

              {/* Item 6 (Extended): Prescription Counter-Signature & Schedule-X Overrides */}
              <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">ABDM Prescription &amp; Schedule-H Overrides</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded">Biometric Prompt</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Prompts requiring cryptographic signature or YubiKey hardware token tap when residents order controlled trauma analgesics.
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggle('scheduleHOverrides', 'Schedule-H Overrides')}
                    type="button"
                    className={`w-12 h-6 ${toggles.scheduleHOverrides ? 'bg-[#02C39A]' : 'bg-slate-300'} rounded-full relative p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02C39A]/40`}
                    aria-label="Toggle Schedule-H Overrides"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform ${toggles.scheduleHOverrides ? 'translate-x-6' : 'translate-x-0'} transition-transform`}></div>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: AUDIO SOUND PROFILE & WORKSTATION TONE MATRIX */}
          

          {/* SECTION 3: RECENT NOTIFICATION AUDIT LOG */}
          

          {/* BOTTOM ACTION BAR */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#e0e3e6]">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="material-symbols-outlined text-sm text-emerald-600">lock_clock</span>
              Last preference update synced to ABDM Local Node: Today, 09:15 AM
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRestore}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                type="button"
              >
                Restore Defaults
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#004d6c] hover:bg-[#05668d] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                type="button"
              >
                Apply Changes
              </button>
            </div>
          </div>

        </div>

      </div>

    
    </div>
  );
}
