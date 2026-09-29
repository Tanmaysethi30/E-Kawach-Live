import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sirenPlayer } from '../../utils/sirenAudio';

export default function SirenAlertModal({ alertData, onClose }) {
  const navigate = useNavigate();
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    if (alertData) {
      // Play audio siren automatically when modal appears
      sirenPlayer.playSiren(10000);
    }
    return () => {
      sirenPlayer.stop();
    };
  }, [alertData]);

  if (!alertData) return null;

  const toggleMute = () => {
    if (isAudioMuted) {
      sirenPlayer.playSiren(8000);
      setIsAudioMuted(false);
    } else {
      sirenPlayer.stop();
      setIsAudioMuted(true);
    }
  };

  const handleOpenTriagePortal = () => {
    sirenPlayer.stop();
    onClose();
    if (alertData.patient?.id) {
      navigate(`/doctor/patient-history?patientId=${alertData.patient.id}&emergency=true&source=ivr`);
    } else {
      navigate('/doctor/patient-history?emergency=true&source=ivr');
    }
  };

  const patient = alertData.patient || {};
  const location = alertData.location || {};
  const targetHospital = alertData.targetHospital || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border-4 border-red-600 shadow-2xl overflow-hidden flex flex-col relative animate-pulse-border">
        {/* Flashing Top Alert Banner */}
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[32px] text-white">emergency</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 font-mono font-black text-xs uppercase tracking-wider animate-pulse">
                  CRITICAL SOS ALERT • IVR DISPATCH
                </span>
                <span className="text-xs text-red-100 font-mono">
                  {new Date(alertData.timestamp || Date.now()).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-xl font-bold font-headline text-white m-0 tracking-tight">
                Emergency Triage Dispatch Received
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              title={isAudioMuted ? 'Unmute Siren' : 'Mute Siren'}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">
                {isAudioMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                sirenPlayer.stop();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-4 text-slate-800">
          {/* Patient Header Card */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">{patient.name || 'Verified Patient'}</span>
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-xs">
                  {patient.bloodGroup || 'O+ Rh Pos'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                  ABDM Linked
                </span>
              </div>
              <div className="text-xs text-slate-600 font-mono mt-0.5 flex flex-wrap gap-3">
                <span>ABHA: <strong>{patient.abhaNumber || '9824-8819-3320-TN'}</strong></span>
                <span>Phone: <strong>{patient.phone || '+91 98401 22819'}</strong></span>
              </div>
            </div>
            <div className="flex sm:flex-col items-end gap-1">
              <span className="px-3 py-1 rounded-lg bg-red-700 text-white text-xs font-black uppercase tracking-wider">
                {alertData.priorityLevel || 'Priority 1 (Red)'}
              </span>
              <span className="text-[11px] font-semibold text-red-900">
                Bay: {alertData.bayNumber || 'Trauma Bay 01'}
              </span>
            </div>
          </div>

          {/* Location & Target Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="material-symbols-outlined text-red-600 text-base">location_on</span>
                <span>Caller / Incident Location</span>
              </div>
              <p className="text-slate-900 font-medium m-0">
                {location.resolvedArea || location.raw || 'Indore Central / Local Landmark'}
              </p>
              {location.city && (
                <span className="text-slate-500 font-mono text-[11px]">Region: {location.city}</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="material-symbols-outlined text-[#004d6c] text-base">local_hospital</span>
                <span>Target Receiving Hospital</span>
              </div>
              <p className="text-slate-900 font-medium m-0">
                {targetHospital.name || 'Apollo Greams Trauma Hub'}
              </p>
              <span className="text-slate-500 font-mono text-[11px]">
                Fleet 108 Status: <strong className="text-red-700">EN ROUTE (~{alertData.etaMinutes || 4} MIN)</strong>
              </span>
            </div>
          </div>

          {/* Critical Medical History Warnings */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <span className="material-symbols-outlined text-amber-700 text-base">warning</span>
              <span>Critical Health Alerts &amp; Clinical Context</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 mt-1">
              <div>
                <strong>Allergies: </strong>
                <span className="text-red-700 font-semibold">
                  {patient.allergies?.join(', ') || 'Penicillin (Severe anaphylaxis)'}
                </span>
              </div>
              <div>
                <strong>Chronic Conditions: </strong>
                <span>{patient.chronicConditions?.join(', ') || 'Type II Diabetes, Hypertension'}</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
            <div className="text-[11px] text-slate-500">
              IVR Dispatch Ref: <strong className="font-mono text-slate-700">{alertData.alertId}</strong>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sirenPlayer.stop();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Acknowledge Alert
              </button>
              <button
                type="button"
                onClick={handleOpenTriagePortal}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              >
                <span className="material-symbols-outlined text-base">medical_information</span>
                Open Full Emergency SOS Chart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
