import React, { useState, useEffect } from 'react';

export default function EmergencySosModal({
  isOpen,
  onClose,
  hospital,
  userLocation,
  patientData,
}) {
  const [step, setStep] = useState('confirm'); // 'confirm' | 'broadcasting' | 'dispatched'
  const [countdown, setCountdown] = useState(5);
  const [dispatchRef, setDispatchRef] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setCountdown(5);
      setDispatchRef(`EK-SOS-${Math.floor(10000 + Math.random() * 90000)}-TN`);
    }
  }, [isOpen, hospital?.id]);

  useEffect(() => {
    let timer;
    if (step === 'broadcasting') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        setStep('dispatched');
      }
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const activeHospital = hospital || {
    id: 'hosp-universal-apex',
    name: 'e-Kavach Universal Emergency Health & Trauma Hub',
    code: 'EK-UNIV-APEX-01',
    address: 'National Central Emergency Grid & Level-1 Trauma Dispatch Network',
    city: 'Delhi',
    state: 'Delhi',
    contactNumbers: { er: '+91 11 2700 0108', helpline: '1800-11-0108', ambulance: '108' },
    icuBedsAvailable: 68,
    emergencyBedsAvailable: 24,
    distanceKm: 2.5,
    ambulanceMins: 6,
  };

  const handleStartBroadcast = () => {
    setStep('broadcasting');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl border border-outline-variant/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-white">cell_tower</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 font-mono">
                ABDM Golden-Hour Triage Ingress
              </span>
              <h2 className="font-headline-sm text-lg font-bold text-white m-0">Emergency Hospital SOS Dispatch</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4">
          {step === 'confirm' && (
            <>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span>Target Emergency Receiving Hospital</span>
                </div>
                <p className="font-headline-sm font-bold text-base text-primary">{activeHospital.name}</p>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {activeHospital.address}, {activeHospital.city} ({activeHospital.distanceKm} km away)
                </p>
              </div>

              {/* Pre-Arrival Telemetry Packet Overview */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Telemetry Transmitted with SOS Packet:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-surface-container-lowest rounded-xl">
                    <span className="text-[10px] text-on-surface-variant block">GPS Patient Location</span>
                    <span className="font-mono font-bold text-primary">
                      {userLocation?.lat?.toFixed(4)}° N, {userLocation?.lng?.toFixed(4)}° E
                    </span>
                  </div>
                  <div className="p-2 bg-surface-container-lowest rounded-xl">
                    <span className="text-[10px] text-on-surface-variant block">Estimated Ambulance ETA</span>
                    <span className="font-mono font-bold text-rose-700">~{activeHospital.ambulanceMins} Minutes</span>
                  </div>
                  <div className="p-2 bg-surface-container-lowest rounded-xl">
                    <span className="text-[10px] text-on-surface-variant block">Target ICU Availability</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {activeHospital.icuBedsAvailable} Beds Ready
                    </span>
                  </div>
                  <div className="p-2 bg-surface-container-lowest rounded-xl">
                    <span className="text-[10px] text-on-surface-variant block">Encrypted Token SLA</span>
                    <span className="font-mono font-bold text-teal-700">&lt;0.25s Triage Bypass</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartBroadcast}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">cell_tower</span>
                  Confirm &amp; Broadcast SOS Signal
                </button>
              </div>
            </>
          )}

          {step === 'broadcasting' && (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin"></div>
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
                  <span className="text-2xl font-black font-mono text-rose-700">{countdown}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-base font-bold text-primary">
                  Broadcasting SOS Telemetry to Hospital ER...
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Connecting to {activeHospital.name} triage terminal and alerting nearest 108 trauma ambulance unit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="px-3 py-1 bg-surface-container-high hover:bg-surface-container text-xs font-semibold rounded-lg text-rose-700 cursor-pointer"
              >
                Abort Broadcast
              </button>
            </div>
          )}

          {step === 'dispatched' && (
            <div className="py-4 flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3">
                <span className="material-symbols-outlined text-[32px] text-emerald-700">check_circle</span>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-emerald-900">SOS Signal Successfully Acknowledged</span>
                  <span className="text-xs text-emerald-800">
                    Hospital ER intake node and 108 Trauma Command are routing ambulance to your coordinates.
                  </span>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Dispatch Reference ID:</span>
                  <span className="font-bold text-primary">{dispatchRef}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Hospital Target:</span>
                  <span className="font-bold text-primary">{activeHospital.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Emergency Hotline:</span>
                  <a href={`tel:${(activeHospital.contactNumbers?.er || activeHospital.contact_number || activeHospital.phone || '108').replace(/\s+/g, '')}`} className="font-bold text-emerald-700 underline">
                    {activeHospital.contactNumbers?.er || activeHospital.contact_number || activeHospital.phone || '108 Ambulance'}
                  </a>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">108 Ambulance Status:</span>
                  <span className="font-bold text-rose-700">EN ROUTE (~{activeHospital.ambulanceMins || 5} MIN)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <a
                  href={`tel:${(activeHospital.contactNumbers?.er || activeHospital.contact_number || activeHospital.phone || '108').replace(/\s+/g, '')}`}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 no-underline"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Call ER Desk Direct
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-primary hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
