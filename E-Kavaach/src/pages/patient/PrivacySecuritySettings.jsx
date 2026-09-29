import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacySecuritySettings() {
  const [toastMessage, setToastMessage] = useState(null);

  const DEFAULT_SETTINGS = {
    biometric2fa: true,
    quickUnlock: true,
    maskTelemetry: true,
    auditNotification: true,
    aiNavigator: true,
    aiSummaries: true,
  };

  // Settings State with localStorage persistence
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ekavach_privacy_settings');
    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : DEFAULT_SETTINGS;
  });

  // Sessions State
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('ekavach_active_sessions');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: '1',
            name: 'Apollo Trauma Bay 3 Node',
            platform: 'Chrome OS / FIDO2 Station',
            location: 'Chennai Central Trauma Hub',
            current: true,
            ip: '10.14.22.84',
            time: 'Active now',
          },
          {
            id: '2',
            name: 'Emergency Floor Rover Tablet #12',
            platform: 'iOS 17 • ABDM Companion App',
            location: 'Apollo ER Triage Bay B',
            current: false,
            ip: '10.14.22.190',
            time: 'Active 18 mins ago',
          },
        ];
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggle = (key, label) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    localStorage.setItem('ekavach_privacy_settings', JSON.stringify(next));
    showToast(`${label} is now ${next[key] ? 'ENABLED' : 'DISABLED'}.`);
  };

  const terminateSession = (id, name) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem('ekavach_active_sessions', JSON.stringify(updated));
    showToast(`Session terminated for "${name}".`);
  };

  const revokeAllOtherSessions = () => {
    const currentOnly = sessions.filter((s) => s.current);
    setSessions(currentOnly);
    localStorage.setItem('ekavach_active_sessions', JSON.stringify(currentOnly));
    showToast('All other remote workstation sessions have been revoked.');
  };

  const promptChangePassword = () => {
    const p = window.prompt('Enter new Master Clinician Password:');
    if (p) {
      showToast('Master Clinician Password successfully updated and synced with Apollo HSM Node.');
    }
  };

  const saveAllPreferences = () => {
    localStorage.setItem('ekavach_privacy_settings', JSON.stringify(settings));
    showToast('All Privacy, Break-Glass, and AI Assistant preferences synchronized with ABDM Vault.');
  };

  return (
    <div className="w-full">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm bg-primary text-on-primary rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">verified_user</span>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg font-semibold">Security Operation Acknowledged</span>
            <span className="font-body-sm text-body-sm text-surface-variant">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-space-md text-surface-variant hover:text-on-primary transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col w-full">
        {/* Header Ribbon */}
        <div className="flex flex-col gap-space-sm pb-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-[#E4E4FB] text-primary font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                <span className="material-symbols-outlined text-[14px]">shield_lock</span>
                CLINICAL PRIVACY, VAULT &amp; ABDM SECURITY
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium">
                <span className="material-symbols-outlined text-primary text-[15px]">verified_user</span>
                <span className="font-semibold text-primary">ABDM LEVEL-3 SECURE</span> • VAULT PROTOCOL ACTIVE
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Privacy &amp; Security</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                Manage cryptographic authentication, ABDM hardware tokens, clinical audit trails, and active workstation sessions.
              </p>
            </div>
            <button
              onClick={saveAllPreferences}
              className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-medium hover:bg-primary-container transition-all shadow-sm self-start md:self-auto"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Save All Preferences</span>
            </button>
          </div>
        </div>

        {/* Master Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-space-lg items-start">
          {/* LEFT SIDEBAR: Mini Navigation */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col gap-1">
              <Link
                to="/doctor/settings"
                className="flex items-center justify-between px-space-sm py-2.5 rounded-lg text-on-surface hover:bg-surface-container-high transition-all no-underline"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                  <span className="font-label-md text-label-md">Profile</span>
                </div>
              </Link>
              <Link
                to="/doctor/credentials"
                className="flex items-center justify-between px-space-sm py-2.5 rounded-lg text-on-surface hover:bg-surface-container-high transition-all no-underline"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">shield</span>
                  <span className="font-label-md text-label-md">Credentials</span>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-[#E4E4FB] text-primary">Verified</span>
              </Link>
              <Link
                to="/doctor/notifications"
                className="flex items-center justify-between px-space-sm py-2.5 rounded-lg text-on-surface hover:bg-surface-container-high transition-all no-underline"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">notifications</span>
                  <span className="font-label-md text-label-md">Notifications</span>
                </div>
              </Link>
              {/* ACTIVE TAB */}
              <div className="flex items-center justify-between px-space-sm py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-medium shadow-sm transition-all cursor-default">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  <span>Privacy &amp; Security</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
              <a
                href="#active-sessions"
                className="flex items-center justify-between px-space-sm py-2.5 rounded-lg text-on-surface hover:bg-surface-container-high transition-all no-underline"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">devices</span>
                  <span className="font-label-md text-label-md">Connected Devices</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#02C39A]"></span>
              </a>
              <Link
                to="/doctor/settings"
                className="flex items-center justify-between px-space-sm py-2.5 rounded-lg text-on-surface hover:bg-surface-container-high transition-all no-underline"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">manage_accounts</span>
                  <span className="font-label-md text-label-md">Account</span>
                </div>
              </Link>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">cloud_sync</span>
                <span className="font-label-md text-label-md font-semibold text-primary">Storage &amp; Encryption</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                AES-256 Cloud Sync Active • 128 MB Local Cache Encrypted on Bay 3 Node
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 w-full flex flex-col gap-space-lg">
            {/* Card 1: Authentication & ABDM Biometrics */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">fingerprint</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Authentication &amp; ABDM Biometrics</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E0F7F6] text-[#028090] font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></span>
                  FIDO2 &amp; AADHAAR L3 READY
                </span>
              </div>

              <div className="flex flex-col divide-y divide-surface-container">
                {/* ABDM Biometric / OTP 2FA */}
                <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-label-lg text-label-lg font-semibold text-primary">ABDM Biometric / OTP 2FA</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E4E4FB] text-primary uppercase">Mandatory</span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Mandatory hardware token or Aadhaar OTP authentication for high-privilege trauma orders and Schedule-H prescriptions.
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle('biometric2fa', 'ABDM Biometric / OTP 2FA')}
                    className={`w-12 h-6 rounded-full ${settings.biometric2fa ? 'bg-[#00A896] justify-end' : 'bg-outline-variant justify-start'} p-0.5 flex items-center transition-all flex-shrink-0 cursor-pointer`}
                    type="button"
                    aria-label="Toggle Biometric 2FA"
                  >
                    <span className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm"></span>
                  </button>
                </div>

                {/* Hardware Token Authentication */}
                <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">usb</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-label-md font-semibold text-primary">Hardware Token Authentication</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E0F7F6] text-[#028090] font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></span>Enrolled &amp; Verified
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        YubiKey 5 Bio / FIDO2 Tier-1 Hardware Key (Bay 3 Station &amp; Mobile NFC)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => showToast('FIDO2 Keystore: 1 active YubiKey 5 Bio hardware token registered under NMC: MD-44912-TN.')}
                      className="px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-medium transition-all"
                      type="button"
                    >
                      Manage Keys
                    </button>
                    <button
                      onClick={() => showToast('Hardware token handshake verified successfully with local NFC reader on Bay 3.')}
                      className="px-space-sm py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-medium hover:bg-primary-container transition-all shadow-sm"
                      type="button"
                    >
                      Tap to Verify
                    </button>
                  </div>
                </div>

                {/* Master Clinician Password & Passkey */}
                <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">password</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-primary">Master Clinician Password &amp; Passkey</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Last updated 42 days ago • Meets Apollo Health CISO complexity standards
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={promptChangePassword}
                    className="inline-flex items-center gap-1 px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-medium transition-all self-start sm:self-auto"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">key</span>
                    <span>Change Password</span>
                  </button>
                </div>

                {/* WebAuthn / Touch ID Quick-Unlock */}
                <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-semibold text-primary">WebAuthn / Touch ID Biometric Quick-Unlock</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Permit 15-minute quick workstation lock resumption using local system biometric sensor without full re-authentication
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle('quickUnlock', 'WebAuthn Quick-Unlock')}
                    className={`w-12 h-6 rounded-full ${settings.quickUnlock ? 'bg-[#00A896] justify-end' : 'bg-outline-variant justify-start'} p-0.5 flex items-center transition-all flex-shrink-0 cursor-pointer`}
                    type="button"
                    aria-label="Toggle WebAuthn Quick Unlock"
                  >
                    <span className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm"></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Active Clinical Sessions & Workstations */}
            <div id="active-sessions" className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">devices</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Active Clinical Sessions &amp; Workstations</h2>
                </div>
                <button
                  onClick={revokeAllOtherSessions}
                  className="text-error hover:bg-error-container/20 px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1 self-start sm:self-auto"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Revoke All Other Sessions</span>
                </button>
              </div>

              <div className="flex flex-col divide-y divide-surface-container">
                {sessions.map((session) => (
                  <div key={session.id} className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {session.platform.includes('iOS') ? 'smartphone' : 'desktop_windows'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md text-label-md font-semibold text-primary">{session.name}</span>
                          {session.current ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E0F7F6] text-[#028090] font-label-sm text-label-sm font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></span>Current Device
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                              Remote
                            </span>
                          )}
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {session.platform} • {session.location} ({session.ip}) • {session.time}
                        </span>
                      </div>
                    </div>
                    <div>
                      {session.current ? (
                        <span className="text-secondary font-label-sm text-label-sm font-medium px-space-sm py-1 rounded bg-secondary-container/30">
                          Active Terminal
                        </span>
                      ) : (
                        <button
                          onClick={() => terminateSession(session.id, session.name)}
                          className="px-space-sm py-1 rounded-lg border border-error/30 text-error hover:bg-error-container/20 font-label-sm text-label-sm font-medium transition-colors"
                          type="button"
                        >
                          Terminate Session
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: ABDM Audit Logs & Clinical Data Access Records */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">history_edu</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">ABDM Audit Logs &amp; Clinical Data Access Records</h2>
                </div>
                <button
                  onClick={() => showToast('Audit trail packet (NDHM HIPAA-2024 JSON) generated for compliance review.')}
                  className="inline-flex items-center gap-1 px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-medium transition-all self-start sm:self-auto"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export Audit Trail</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-primary">
                        ABHA #91-8834-1120-9921 (Trauma Patient T-402)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        NDHM Sec 29 Emergency Break-Glass Ingress • Greams Bay 3 • Latency 0.12s
                      </span>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Today, 14:22</span>
                </div>

                <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">clinical_notes</span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-primary">
                        ABHA #33-1029-4481-0021 (Rohan Verma)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Routine Outpatient Cardiology Consultation Records Synced • Bay 3 Station
                      </span>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Today, 11:05</span>
                </div>

                <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">lock_clock</span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-primary">
                        FIPS 140-2 Level 3 Keystore Key Rotation
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Automated cryptographic token renewal completed with Apollo HSM Node
                      </span>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Yesterday, 23:59</span>
                </div>
              </div>
            </div>

            {/* Card 4: Data Fortress, Break-Glass & AI Preferences */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">policy</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Data Fortress, Break-Glass &amp; AI Preferences</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">
                  DISHA 2024 Certified
                </span>
              </div>

              <div className="flex flex-col divide-y divide-surface-container">
                <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-semibold text-primary">Mask Telemetry on Shared Trauma Displays</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Redact patient PII and national IDs when mirroring diagnostics onto overhead ER monitors.
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle('maskTelemetry', 'Mask Telemetry')}
                    className={`w-12 h-6 rounded-full ${settings.maskTelemetry ? 'bg-[#00A896] justify-end' : 'bg-outline-variant justify-start'} p-0.5 flex items-center transition-all flex-shrink-0 cursor-pointer`}
                    type="button"
                    aria-label="Toggle Mask Telemetry"
                  >
                    <span className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm"></span>
                  </button>
                </div>

                <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-semibold text-primary">Strict Break-Glass SMS Alerts</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Dispatch immediate SMS notification to your verified clinician mobile whenever an emergency break-glass token is invoked.
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle('auditNotification', 'Break-Glass SMS Alerts')}
                    className={`w-12 h-6 rounded-full ${settings.auditNotification ? 'bg-[#00A896] justify-end' : 'bg-outline-variant justify-start'} p-0.5 flex items-center transition-all flex-shrink-0 cursor-pointer`}
                    type="button"
                    aria-label="Toggle Break-Glass SMS Alerts"
                  >
                    <span className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm"></span>
                  </button>
                </div>

                <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-semibold text-primary">AI Clinical Navigator &amp; Triage Assistant</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Enable automated ICD-11 triage prioritization and real-time clinical drug allergy conflict warnings.
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle('aiNavigator', 'AI Clinical Navigator')}
                    className={`w-12 h-6 rounded-full ${settings.aiNavigator ? 'bg-[#00A896] justify-end' : 'bg-outline-variant justify-start'} p-0.5 flex items-center transition-all flex-shrink-0 cursor-pointer`}
                    type="button"
                    aria-label="Toggle AI Navigator"
                  >
                    <span className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm"></span>
                  </button>
                </div>

                <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-semibold text-primary">Auto-Generate Emergency Summaries</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Automatically draft ABHA-compliant discharge and handover packets upon emergency resolution.
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle('aiSummaries', 'Auto-Generate Summaries')}
                    className={`w-12 h-6 rounded-full ${settings.aiSummaries ? 'bg-[#00A896] justify-end' : 'bg-outline-variant justify-start'} p-0.5 flex items-center transition-all flex-shrink-0 cursor-pointer`}
                    type="button"
                    aria-label="Toggle AI Summaries"
                  >
                    <span className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm"></span>
                  </button>
                </div>

                <div className="pt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-semibold text-primary">Purge Local Station Cache</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Securely wipe local temporary patient EHR buffers from this Bay 3 workstation.
                    </span>
                  </div>
                  <button
                    onClick={() => showToast('Local clinical cache securely purged and zero-filled.')}
                    className="px-space-sm py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-medium transition-all self-start sm:self-auto cursor-pointer"
                    type="button"
                  >
                    Purge Local Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
