import React, { useState } from 'react';

export default function AppointmentSlipModal({ appointment, onClose, onCancelSlot }) {
  const [copied, setCopied] = useState(false);

  if (!appointment) return null;

  const apt = appointment;
  const tokenNumber = apt.tokenNumber || (apt.id ? `EK-SLOT-${apt.id.slice(-3)}` : 'EK-SLOT-101');
  const isConfirmed = apt.status === 'CONFIRMED';
  const isDeclined = apt.status === 'DECLINED';
  const isCancelled = apt.status === 'CANCELLED';
  const isPending = !isConfirmed && !isDeclined && !isCancelled;

  // Parse notes for kin / diagnostic metadata if JSON
  let meta = {};
  if (apt.notes) {
    try {
      meta = typeof apt.notes === 'string' && apt.notes.startsWith('{') ? JSON.parse(apt.notes) : {};
    } catch (_e) {
      meta = {};
    }
  }

  const patientName = apt.patientName || apt.patientProfile?.name || 'Registered Patient';
  const relation = meta.relation || (meta.bookingFor === 'OTHER' ? 'Dependent' : 'Self');
  const patientAge = meta.patientAge || '52';
  const patientGender = meta.patientGender || 'Male';
  const doctorName = apt.doctorProfile?.name || 'Dr. Kavitha Menon';
  const doctorSpec = apt.doctorProfile?.specialization || apt.department || 'Cardiology Unit';
  const hospitalName = (typeof apt.hospital === 'object' && apt.hospital !== null ? (apt.hospital.name || apt.hospital.hospital_name) : null)
    || (typeof apt.hospital === 'string' ? apt.hospital : null)
    || 'Apollo Greams Trauma Hub, Chennai';

  const handleCopyToken = () => {
    try {
      navigator.clipboard.writeText(tokenNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="appointment-slip-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* National Health Authority Official Header */}
        <div className="bg-[#0B1F3A] text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            type="button"
            title="Close Slip"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-teal-400/30">
              ABDM DIGITAL HEALTH PASS
            </span>
            <span className="text-[11px] text-slate-300">MoHFW • Govt. of India</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-teal-400">confirmation_number</span>
            Official OPD Token Slip
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            E-KAWACH Fast-Track OPD Ingress &amp; Consultation Pass
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Main OPD Token Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex flex-col text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">
                OFFICIAL OPD QUEUE TOKEN
              </span>
              <span className="text-3xl font-black font-mono tracking-wider text-white mt-0.5">
                {tokenNumber}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Desk Ingress: <strong className="text-teal-300">OPD Counter 04 • Room 204</strong>
              </span>
            </div>

            <button
              onClick={handleCopyToken}
              className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'done_all' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied Token!' : 'Copy Token'}</span>
            </button>
          </div>

          {/* Clinical Status Notice */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isConfirmed
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : isDeclined
                ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                : isCancelled
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-amber-50/90 border-amber-200 text-amber-900'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                isConfirmed
                  ? 'text-emerald-600'
                  : isDeclined
                  ? 'text-rose-600'
                  : isCancelled
                  ? 'text-slate-500'
                  : 'text-amber-600 animate-pulse'
              }`}
            >
              {isConfirmed ? 'verified' : isDeclined ? 'error' : isCancelled ? 'cancel' : 'pending_actions'}
            </span>
            <div className="text-xs">
              <div className="font-bold uppercase tracking-wider text-[11px]">
                Status:{' '}
                {isConfirmed
                  ? 'Approved by Attending Doctor'
                  : isDeclined
                  ? 'Declined by Doctor'
                  : isCancelled
                  ? 'Cancelled by Patient'
                  : 'Awaiting Doctor Review & Approval'}
              </div>
              <p className="mt-0.5 opacity-90 leading-relaxed">
                {isConfirmed
                  ? 'The clinician has accepted this consultation slot. Please present this slip at the hospital OPD triage desk 15 minutes before your time.'
                  : isDeclined
                  ? 'The attending clinician was unable to accept this appointment slot due to emergency theatre duties. Please select another slot or specialist.'
                  : isCancelled
                  ? 'This appointment was cancelled and the slot has been released back to the hospital queue.'
                  : 'Clinical Governance Notice: In the patient portal, patients can only request or cancel bookings. Only the attending doctor has the access privileges to approve or decline the slot.'}
              </p>
            </div>
          </div>

          {/* Patient and Clinician Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Patient Identity
              </span>
              <span className="font-bold text-slate-900 text-sm">{patientName}</span>
              <div className="flex items-center gap-2 text-slate-600 mt-0.5">
                <span>Age: {patientAge}</span>
                <span>•</span>
                <span>Gender: {patientGender}</span>
              </div>
              <div className="text-[11px] text-teal-700 font-semibold mt-1">
                Relation: {relation}
              </div>
              {apt.patientPhone && (
                <div className="text-[11px] text-slate-500 font-mono">
                  Phone: {apt.patientPhone}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Attending Clinician &amp; Unit
              </span>
              <span className="font-bold text-slate-900 text-sm">{doctorName}</span>
              <div className="text-slate-600 mt-0.5 font-medium">{doctorSpec}</div>
              <div className="text-[11px] text-slate-500 mt-1">{hospitalName}</div>
              <div className="text-[11px] text-slate-700 font-semibold">
                Mode: {apt.mode || 'IN_PERSON'}
              </div>
            </div>
          </div>

          {/* Timing & Venue Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="material-symbols-outlined text-[18px] text-teal-600">calendar_clock</span>
                <span className="font-bold text-sm">
                  {apt.timeSlot || '10:30 AM'} (IST) •{' '}
                  {new Date(apt.scheduledAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                ESTIMATED WAIT: 10 MINS
              </span>
            </div>

            {apt.symptoms && (
              <div className="text-slate-600 pt-1 border-t border-slate-200/60 text-[11px]">
                <strong>Clinical Notes / Symptoms:</strong> "{apt.symptoms}"
              </div>
            )}
          </div>

          {/* Barcode / ABDM QR Scanner Representation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* QR representation */}
              <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 33 33" className="w-full h-full text-slate-900 fill-current">
                  <path d="M0 0h7v7H0zm2 2v3h3V2zm6 0h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm3 0h3v1h-3zm-5 2h1v1H8zm2 0h1v2h-1zm3 0h2v1h-2zm-5 3h1v1H8zm4 0h1v1h-1zm-6 1h2v1H6zm4 0h1v1h-1zm3 0h1v1h-1zm-9 1h1v1H4zm3 0h2v1H7zm4 0h1v2h-1zm2 0h1v1h-1zm-8 2h1v1H5zm2 0h1v1H7zm6 0h2v1h-2zm-6 2h1v1H7zm2 0h1v1H9zm2 0h1v1h-1zm-4 1h1v2H7zm4 0h1v1h-1zm2 0h1v1h-1zm-5 2h2v1H8zm-8 0h7v7H0zm2 2v3h3v-3zm14-16h7v7h-7zm2 2v3h3V2z" />
                </svg>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-800 block">ABDM Scanner Ready</span>
                <span className="text-[10px] text-slate-500 block">
                  Scan at hospital triage turnstile or scan via Ayushman Bharat kiosks.
                </span>
              </div>
            </div>

            {/* Visual Barcode */}
            <div className="flex flex-col items-center">
              <div className="flex items-end gap-[2px] h-8">
                {[1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1].map((h, i) => (
                  <div
                    key={i}
                    className="bg-slate-800 w-[2px]"
                    style={{ height: `${h * 7 + 6}px` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1 tracking-widest">
                {tokenNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div>
            {!isCancelled && !isDeclined && onCancelSlot && (
              <button
                onClick={() => {
                  onCancelSlot(apt.id, patientName);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                type="button"
              >
                Cancel Slot
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
