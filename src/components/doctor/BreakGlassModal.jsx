import React, { useState, useEffect, useRef } from 'react';

const EMERGENCY_CONDITIONS = [
  { id: 'cardiac', label: 'Cardiac Arrest / Acute Coronary Syndrome (STEMI)', icon: 'ecg_heart' },
  { id: 'shock', label: 'Acute Hemodynamic Shock / Severe Polytrauma', icon: 'bloodtype' },
  { id: 'anaphylaxis', label: 'Severe Anaphylaxis / Acute Airway Compromise', icon: 'air' },
  { id: 'stroke', label: 'Altered Sensorium / Acute Ischemic Stroke / Coma', icon: 'psychology_alt' },
  { id: 'mci', label: 'Mass Casualty Incident / Critical Resuscitation', icon: 'emergency' },
];

export default function BreakGlassModal({
  isOpen,
  onClose,
  patient,
  doctorCredentials = {
    name: 'Dr. Kavitha Menon',
    nmcNumber: 'MD-44912-TN',
    hospital: 'Apollo Greams Trauma Hub',
  },
  onOverrideSuccess,
}) {
  const [selectedCondition, setSelectedCondition] = useState(EMERGENCY_CONDITIONS[0].label);
  const [justificationNote, setJustificationNote] = useState('');
  const [isCertified, setIsCertified] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  // Audio Context ref for clinical auditory alert tone
  const audioCtxRef = useRef(null);
  const toneIntervalRef = useRef(null);

  // Play auditory clinical pulse tone (two-tone beep: 880Hz / 660Hz)
  const playAuditoryBeep = (freq = 880) => {
    if (audioMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.26);
      }
    } catch (_e) {
      // Audio context might be restricted before gesture
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (toneIntervalRef.current) clearInterval(toneIntervalRef.current);
      return;
    }

    setCountdown(10);
    setIsSubmitting(false);
    setIsCertified(false);
    setJustificationNote('');
    setSelectedCondition(EMERGENCY_CONDITIONS[0].label);

    // Initial alert tone
    playAuditoryBeep(880);

    // 10-second countdown with pulse
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playAuditoryBeep(1100);
          return 0;
        }
        playAuditoryBeep(prev % 2 === 0 ? 880 : 660);
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (toneIntervalRef.current) clearInterval(toneIntervalRef.current);
    };
  }, [isOpen, audioMuted]);

  if (!isOpen) return null;

  const isFormValid =
    justificationNote.trim().length >= 10 &&
    isCertified &&
    countdown === 0 &&
    !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (justificationNote.trim().length < 10 || !isCertified || countdown > 0) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('ekawach_token') || localStorage.getItem('ek_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch('/api/doctor/emergency-break-glass', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patientId: patient?.id || 'patient-rajesh',
          condition: selectedCondition,
          justification: justificationNote.trim(),
          nmcNumber: doctorCredentials.nmcNumber,
          hospital: doctorCredentials.hospital,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onOverrideSuccess) {
          onOverrideSuccess(data);
        }
        onClose();
      } else {
        alert(data.message || 'Failed to engage emergency break-glass override.');
      }
    } catch (err) {
      console.error('Break-Glass error:', err);
      alert('Network or server error executing break-glass: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl border-2 border-rose-600/60 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Flashing Auditory & Visual Emergency Warning Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center animate-pulse shrink-0">
              <span className="material-symbols-outlined text-[28px] text-white">emergency</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded text-rose-200 font-mono">
                  ABDM SECTION 29 OVERRIDE
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-900/80 px-2 py-0.5 rounded text-white font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  IMMUTABLE AUDIT TRAIL
                </span>
              </div>
              <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-white m-0 tracking-tight mt-0.5">
                Emergency Break-Glass Clinical Override
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={() => setAudioMuted(!audioMuted)}
              title={audioMuted ? 'Unmute Audio Siren' : 'Mute Audio Siren'}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {audioMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* 10-Second Auditory / Visual Warning Bar */}
        <div className="bg-rose-950 text-rose-100 px-4 py-3 border-b border-rose-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400 text-[18px] animate-spin">
              hourglass_top
            </span>
            <span>
              {countdown > 0 ? (
                <>
                  Mandatory Verification Countdown: <strong className="text-amber-300 font-mono text-sm">{countdown}s remaining</strong> before unlock armed
                </>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Break-Glass Override Armed & Ready for Confirmation
                </span>
              )}
            </span>
          </div>
          <div className="w-28 bg-rose-900/60 rounded-full h-2 overflow-hidden shrink-0 border border-rose-700">
            <div
              className="bg-gradient-to-r from-amber-400 to-rose-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((10 - countdown) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-xs sm:text-sm">
          {/* Patient Target & Doctor Credentials Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Target Patient
              </span>
              <span className="font-bold text-primary text-sm mt-0.5">
                {patient?.name || 'Rajesh V. Sharma'}
              </span>
              <span className="text-xs font-mono text-on-surface-variant">
                ABHA: {patient?.abhaNumber || '9824-8819-3320-TN'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Authorizing Clinician (NMC Bound)
              </span>
              <span className="font-bold text-primary text-sm mt-0.5">
                {doctorCredentials.name}
              </span>
              <span className="text-xs font-mono text-rose-700 font-bold">
                NMC Registration: {doctorCredentials.nmcNumber}
              </span>
            </div>
          </div>

          {/* High-Friction Emergency Condition Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-[16px] text-rose-600">health_and_safety</span>
              Confirmed Life-Threatening Emergency Condition *
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {EMERGENCY_CONDITIONS.map((cond) => {
                const isSelected = selectedCondition === cond.label;
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setSelectedCondition(cond.label)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-xs'
                        : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-rose-600 text-white' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{cond.icon}</span>
                    </div>
                    <span className="text-xs flex-1">{cond.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-rose-600 bg-rose-600' : 'border-outline'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandatory Clinical Justification Note */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-on-surface flex items-center gap-1 text-xs">
                <span className="material-symbols-outlined text-[16px] text-rose-600">edit_note</span>
                Mandatory Clinical Justification Note *
              </label>
              <span
                className={`text-[11px] font-mono ${
                  justificationNote.trim().length >= 10 ? 'text-emerald-700 font-bold' : 'text-rose-600'
                }`}
              >
                {justificationNote.trim().length}/10 chars min
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={justificationNote}
              onChange={(e) => setJustificationNote(e.target.value)}
              placeholder="State presenting clinical crisis necessitating unconsented record override (e.g., Unresponsive male in trauma bay with BP 70/40, acute STEMI on 12-lead ECG, requiring immediate anti-platelet and allergy review)."
              className="w-full p-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs leading-relaxed"
            />
          </div>

          {/* Legal Compliance & Certification Checkbox */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="certify-checkbox"
              checked={isCertified}
              onChange={(e) => setIsCertified(e.target.checked)}
              className="mt-1 w-4 h-4 text-rose-600 rounded border-outline focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="certify-checkbox" className="text-[11px] text-amber-950 dark:text-amber-100 cursor-pointer leading-relaxed">
              <strong>ABDM Legal Certification:</strong> I formally certify under NMC Code of Medical Ethics Regulation 2023 and ABDM Section 29 that this override is strictly required to avert immediate patient mortality or irreversible clinical harm. I understand an indelible SHA-256 audit record and an immediate WebSocket alert will be committed to the patient's record.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/20 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel &amp; Keep Restricted Triage
            </button>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                isFormValid
                  ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-900/30'
                  : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSubmitting ? 'progress_activity' : 'lock_open_right'}
              </span>
              <span>
                {isSubmitting
                  ? 'Committing Audit & Unlocking...'
                  : countdown > 0
                  ? `Verification Lock Active (${countdown}s)`
                  : 'CONFIRM & ENGAGE BREAK-GLASS OVERRIDE'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
