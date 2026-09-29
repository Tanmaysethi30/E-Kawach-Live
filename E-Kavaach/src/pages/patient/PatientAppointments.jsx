import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [lastAdded, setLastAdded] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: '',
    age: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
  });

  const [recentPatients, setRecentPatients] = useState([
    {
      id: '1',
      initials: 'KS',
      name: 'Kaviarasan S.',
      tag: '#EK-8839',
      status: 'Active Bay 04',
      statusColor: 'bg-tertiary-fixed text-tertiary',
      details: 'Added 18m ago • Routine Walk-in • Chief: Chest heaviness on exertion',
    },
    {
      id: '2',
      initials: 'DV',
      name: 'Deepa Venkataraman',
      tag: '#EK-8838',
      status: 'ECG Queued',
      statusColor: 'bg-surface-container-high text-on-surface-variant',
      details: 'Added 1h 12m ago • OPD Referral • Dr. Arumugam Cardiology Clinic',
    },
    {
      id: '3',
      initials: 'MF',
      name: 'Mohamed Farooq',
      tag: '#EK-8837',
      status: 'Consult Completed',
      statusColor: 'bg-surface-container text-on-surface-variant',
      details: 'Added 2h 45m ago • Follow-up • Prescription updated & e-signed',
    },
  ]);

  const [filterModality, setFilterModality] = useState('all');
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'p1',
      initials: 'AP',
      initialsBg: 'bg-surface-container-high text-primary',
      name: 'Anand R. Patel',
      ageGender: '54y • Male',
      abha: 'ABHA: 91-4421-9041-01',
      badge: 'Action Required • 48h waiting',
      badgeColor: 'bg-amber-100 text-amber-900',
      badgeDot: 'bg-amber-500',
      time: 'Tomorrow, 09:30 AM (In-person)',
      room: 'Cardiac OPD Suite 3',
      note: 'Follow-up: Post-cardiac consult & stent review',
      roomIcon: 'meeting_room',
      modality: 'in-person'
    },
    {
      id: 'p2',
      initials: 'MS',
      initialsBg: 'bg-secondary-fixed-dim/40 text-secondary',
      name: 'Meenakshi Sundaram',
      ageGender: '42y • Female',
      abha: 'ABHA: 22-8901-4402-19',
      badge: 'Routine',
      badgeColor: 'bg-surface-container-high text-on-surface-variant',
      time: '25 Oct, 02:15 PM (Cardiac Lab 2)',
      room: 'Stress Testing Unit',
      note: 'Palpitations & Exercise ECG Evaluation',
      roomIcon: 'ecg',
      modality: 'in-person'
    },
    {
      id: 'p3',
      initials: 'VS',
      initialsBg: 'bg-surface-container-high text-primary',
      name: 'Vikramaditya Sen',
      ageGender: '61y • Male',
      abha: 'ABHA: 44-7711-3004-91',
      badge: 'Action Required • BP Escalation',
      badgeColor: 'bg-amber-100 text-amber-900',
      badgeDot: 'bg-amber-500',
      time: '26 Oct, 11:00 AM (Telehealth Encrypted)',
      room: 'Remote Vitals Stream Linked',
      note: 'Hypertension Med Adjustment & Ambulatory BP Review',
      roomIcon: 'monitor_heart',
      modality: 'telehealth'
    },
    {
      id: 'p4',
      initials: 'KP',
      initialsBg: 'bg-surface-container-high text-primary',
      name: 'K. Premkumar',
      ageGender: '48y • Male',
      abha: 'ABHA: 19-3329-8421-88',
      badge: 'Elective Protocol',
      badgeColor: 'bg-surface-container-high text-on-surface-variant',
      time: '27 Oct, 10:00 AM (OPD Clinic)',
      room: 'Cath Pre-Assessment Hub',
      note: 'Pre-op Clearance for Elective Angioplasty',
      roomIcon: 'medical_services',
      modality: 'in-person'
    },
    {
      id: 'p5',
      initials: 'SJ',
      initialsBg: 'bg-secondary-fixed-dim/40 text-secondary',
      name: 'Sarita Joshi',
      ageGender: '58y • Female',
      abha: 'ABHA: 83-1104-5519-72',
      badge: 'Device Check',
      badgeColor: 'bg-surface-container-high text-on-surface-variant',
      time: '27 Oct, 03:30 PM (Bay 3)',
      room: 'Pacing & Electrophysiology',
      note: 'Pacemaker telemetry review & battery diagnostic',
      roomIcon: 'settings_remote',
      modality: 'in-person'
    },
  ]);

  const [approvedAppointments, setApprovedAppointments] = useState([
    {
      id: 'a1',
      name: 'Rajesh V. Sharma',
      time: '10:30 AM • Consultation Room 4',
      note: 'Routine Post-CABG Review',
    },
    {
      id: 'a2',
      name: 'Smt. Lakshmi Narayanan',
      time: '11:45 AM • Pacemaker Bay 3',
      note: 'Biventricular ICD Interrogation',
    },
    {
      id: 'a3',
      name: 'Harish K. Varma',
      time: '02:30 PM • Cath Prep Clearance',
      note: 'Elective Diagnostic Cath',
    },
  ]);

  const handleApprove = (req) => {
    setPendingRequests((prev) => prev.filter((item) => item.id !== req.id));
    setApprovedAppointments((prev) => [
      {
        id: `approved-${Date.now()}`,
        name: req.name,
        time: req.time,
        note: req.note,
      },
      ...prev,
    ]);
    showToast(`Appointment approved for ${req.name}. Slot confirmed.`);
  };

  const handleDecline = (req) => {
    setPendingRequests((prev) => prev.filter((item) => item.id !== req.id));
    showToast(`Reschedule request initiated for ${req.name}. Notification sent.`);
  };

  const filteredRequests = pendingRequests.filter((r) => {
    if (filterModality === 'all') return true;
    return r.modality === filterModality;
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    const initials = formData.name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'PT';
    const tempId = `#EK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry = {
      id: Date.now().toString(),
      initials,
      name: formData.name,
      tag: tempId,
      status: 'Admitted & Queued',
      statusColor: 'bg-tertiary-fixed text-tertiary',
      details: `Added just now • OPD Walk-in • Chief: ${formData.notes || 'Routine consultation'}`,
    };
    setRecentPatients([newEntry, ...recentPatients]);
    setLastAdded({ name: formData.name, tempId });
    setFormData({
      name: '',
      phone: '',
      notes: '',
      age: '',
      gender: '',
      bloodGroup: '',
      allergies: '',
    });
    showToast(`Patient ${formData.name} admitted successfully. ${tempId} assigned.`);
  };

  return (
    <div className="w-full">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm bg-primary text-on-primary rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">how_to_reg</span>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg font-semibold">Admission Operation Acknowledged</span>
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

      <div className="flex flex-col w-full gap-space-xl">
{/* Page Header & Key Metrics */}
<section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
<div className="flex flex-col gap-space-2xs">
<div className="flex items-center gap-space-sm">
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Appointments &amp; Patients</h1>
<div className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
<span className="">ROUTINE CLINICAL DESK</span>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
        Manage incoming clinical consultation requests and onboard new outpatient admissions into E-KAVACH.
      </p>
</div>
{/* Right Side Stat Pills (Zero Red, Crisp High-Trust Accents) */}
<div className="flex flex-wrap items-center gap-space-sm">
{/* Amber Attention Pill */}
<div className="inline-flex items-center gap-2 px-space-md py-2 rounded-xl bg-surface-container-lowest shadow-[0_1px_6px_rgba(0,53,76,0.06)]">
<span className="relative flex h-2.5 w-2.5">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
</span>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-amber-800 leading-none">{pendingRequests.length} Pending</span>
<span className="font-label-sm text-label-sm text-amber-900/70">Action required</span>
</div>
</div>
{/* Scheduled Today Pill */}
<div className="inline-flex items-center gap-2 px-space-md py-2 rounded-xl bg-surface-container-lowest shadow-[0_1px_6px_rgba(0,53,76,0.06)]">
<span className="material-symbols-outlined text-secondary text-[20px]">calendar_today</span>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-primary leading-none">18 Scheduled</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Confirmed today</span>
</div>
</div>
{/* Onboarded Pill */}
<div className="inline-flex items-center gap-2 px-space-md py-2 rounded-xl bg-surface-container-lowest shadow-[0_1px_6px_rgba(0,53,76,0.06)]">
<span className="material-symbols-outlined text-tertiary-container text-[20px]">how_to_reg</span>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-primary leading-none">3 Onboarded</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">OPD tokens active</span>
</div>
</div>
</div>
</section>
{/* MODULE 1: PENDING APPOINTMENT APPROVALS */}
<section className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,53,76,0.05)] overflow-hidden flex flex-col">
{/* Module Header */}
<div className="px-space-xl py-space-lg bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">pending_actions</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<h2 className="font-headline-md text-headline-md text-primary">Pending Appointments</h2>
<span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">{pendingRequests.length} Requests</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Triage queue filtered for Dr. Kavitha Menon • Cardiology Core</span>
</div>
</div>
<div className="flex items-center gap-space-sm">
<button onClick={() => { const next = filterModality === "all" ? "in-person" : filterModality === "in-person" ? "telehealth" : "all"; setFilterModality(next); showToast(`Filter applied: ${next.toUpperCase()}`); }} className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
<span className="">Filter: {filterModality.toUpperCase()}</span>
</button>
<button onClick={() => showToast("Queue synchronized with Greams Trauma Hub (0.18s latency)")} className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">sync</span>
<span className="">Refresh Queue</span>
</button>
</div>
</div>
{/* Request Rows Container */}
<div className="flex flex-col" id="appointment-queue-list">
{filteredRequests.map((req, idx) => (
  <React.Fragment key={req.id}>
    {idx > 0 && <div className="h-px w-full bg-surface-container"></div>}
    <div className="p-space-lg flex flex-col xl:flex-row xl:items-center justify-between gap-space-md hover:bg-surface-container-low/60 transition-colors">
      <div className="flex items-start gap-space-md flex-1 min-w-0">
        <div className={`w-12 h-12 rounded-full ${req.initialsBg} flex-shrink-0 flex items-center justify-center font-headline-sm text-headline-sm font-bold shadow-sm`}>
          {req.initials}
        </div>
        <div className="flex flex-col min-w-0 gap-1 flex-1">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{req.name}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{req.ageGender}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {req.abha}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${req.badgeColor} font-label-sm text-label-sm font-medium`}>
              {req.badgeDot && <span className={`w-1.5 h-1.5 rounded-full ${req.badgeDot}`}></span>}
              {req.badge}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            <span className="inline-flex items-center gap-1 text-primary font-medium">
              <span className="material-symbols-outlined text-[18px]">event</span>
              {req.time}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">{req.roomIcon}</span>
              {req.room}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">
              {req.note}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-space-sm self-end xl:self-center flex-shrink-0">
        <button onClick={() => handleDecline(req)} className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all cursor-pointer" type="button">
          Reschedule / Decline
        </button>
        <button onClick={() => handleApprove(req)} className="inline-flex items-center gap-1.5 px-space-lg py-2 rounded-lg bg-tertiary-container hover:bg-tertiary text-on-tertiary font-label-md text-label-md shadow-sm transition-all cursor-pointer" type="button">
          <span className="material-symbols-outlined text-[18px]">check</span>
          <span className="">Approve</span>
        </button>
      </div>
    </div>
  </React.Fragment>
))}
</div>
{/* Empty State Trigger (Hidden by default, shown when queue hits zero) */}
<div className={`${filteredRequests.length === 0 ? "flex" : "hidden"} p-space-2xl flex-col items-center justify-center text-center gap-space-sm`} id="empty-queue-notice">
<div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined text-[28px]">task_alt</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary">No pending requests — you're all caught up</h3>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">
        All pending consultation approvals for Dr. Kavitha Menon have been triaged. New referrals will appear here dynamically.
      </p>
</div>
{/* SUB-SECTION: Upcoming Approved Appointments */}
<div className="p-space-lg bg-surface-container-low border-t border-surface-container flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px]">event_available</span>
<span className="font-headline-sm text-headline-sm text-primary">Upcoming Approved Appointments</span>
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
            {approvedAppointments.length} Scheduled for Today
          </span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Live Synchronized</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md" id="approved-cards-grid">
{approvedAppointments.map((app) => (
  <div key={app.id} className="p-space-md rounded-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-xs">
    <div className="flex items-center justify-between">
      <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">{app.name}</span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-label-sm font-semibold">
        <span className="material-symbols-outlined text-[12px]">check_circle</span>
        Approved
      </span>
    </div>
    <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
      <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
      <span className="">{app.time}</span>
    </div>
    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{app.note}</span>
  </div>
))}
</div>
</div>
</section>
{/* MODULE 2: ADD NEW PATIENT & QUICK CLINICAL INTAKE */}
<section className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,53,76,0.05)] overflow-hidden flex flex-col">
{/* Header with Prominent Title & Action */}
<div className="px-space-xl py-space-lg bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[24px]">person_add</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<h2 className="font-headline-md text-headline-md text-primary">Add New Patient</h2>
<span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">OPD INTAKE</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Quick clinical intake and instant biometric token generation for OPD admission</span>
</div>
</div>
<button onClick={() => document.getElementById("patient-name-input")?.focus()} className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm transition-all self-start sm:self-center cursor-pointer" type="button">
<span className="material-symbols-outlined text-[20px]">add</span>
<span className="">+ Add Patient</span>
</button>
</div>
              {/* Inline Confirmation Banner */}
              {lastAdded && (
                <div className="mx-space-xl mt-space-lg p-space-md rounded-xl bg-tertiary-fixed/40 flex flex-col md:flex-row md:items-center justify-between gap-space-md" id="patient-success-banner">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-lg text-label-lg text-primary font-bold">Patient Added Successfully</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                          Temp ID: {lastAdded.tempId} • Patient: {lastAdded.name}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sync token transmitted to Nursing Bay 4 • Clinical file initialized</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm self-end md:self-center">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md shadow-sm transition-all"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">print</span>
                      <span className="">Print Wristband Label</span>
                    </button>
                    <button
                      onClick={() => navigate('/patient/health-history')}
                      className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all"
                      type="button"
                    >
                      <span className="">Open Clinical Chart →</span>
                    </button>
                    <button
                      onClick={() => setLastAdded(null)}
                      className="text-on-surface-variant hover:text-on-surface text-sm px-2 py-1"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* The Intake Form Container */}
              <form className="p-space-xl flex flex-col gap-space-lg" id="new-patient-form" onSubmit={handleSavePatient}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  {/* Field 1: Full Legal Name */}
                  <div className="flex flex-col gap-space-2xs">
                    <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1" htmlFor="patient-name-input">
                      <span className="">Full Legal Name</span>
                      <span className="text-secondary font-bold">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">person</span>
                      <input
                        className="w-full h-11 pl-10 pr-space-md bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
                        id="patient-name-input"
                        placeholder="e.g., Saravanan Ramanathan"
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">As per Aadhaar / ABHA ID identity documents</span>
                  </div>
                  {/* Field 2: Primary Contact Number */}
                  <div className="flex flex-col gap-space-2xs">
                    <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1" htmlFor="patient-phone-input">
                      <span className="">Primary Contact Number</span>
                      <span className="text-secondary font-bold">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">phone</span>
                      <input
                        className="w-full h-11 pl-10 pr-space-md bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
                        id="patient-phone-input"
                        placeholder="+91 98400 00000"
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Instant OTP verification &amp; WhatsApp appointment sync ready</span>
                  </div>
                </div>
                {/* Field 3: Initial Notes & Chief Complaint */}
                <div className="flex flex-col gap-space-2xs">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="patient-notes-input">
                      Initial Notes &amp; Chief Complaint
                    </label>
                    <span className="font-body-sm text-body-sm text-on-surface-variant" id="char-counter">
                      {formData.notes.length} / 500
                    </span>
                  </div>
                  <textarea
                    className="w-full p-space-sm bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all resize-none"
                    id="patient-notes-input"
                    maxLength="500"
                    placeholder="Reason for visit, presenting symptoms, duration, or relevant clinical referral context..."
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>
                {/* Collapsible Additional Details */}
                <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-md">
                  <button
                    className="flex items-center justify-between w-full text-left font-label-lg text-label-lg text-primary font-semibold hover:opacity-80 transition-opacity"
                    onClick={() => setShowDetails(!showDetails)}
                    type="button"
                  >
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[20px]">tune</span>
                      <span className="">Additional Details (Demographics &amp; Allergies)</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">• Optional</span>
                    </div>
                    <span className="material-symbols-outlined text-[20px] transition-transform" id="details-toggle-icon">
                      {showDetails ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {/* Collapsible Content */}
                  <div id="additional-details-body" className={showDetails ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-xs p-space-md bg-surface-container-low flex flex-col gap-space-sm border-t border-surface-container" : "hidden"}>
                    {/* Age */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">Age</label>
                      <input
                        className="w-full h-10 px-space-sm bg-surface-container-lowest rounded-lg font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. 45"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                    </div>
                    {/* Gender Dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">Gender</label>
                      <select
                        className="w-full h-10 px-space-sm bg-surface-container-lowest rounded-lg font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {/* Blood Group */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">Blood Group</label>
                      <select
                        className="w-full h-10 px-space-sm bg-surface-container-lowest rounded-lg font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      >
                        <option value="">Provisional blood group</option>
                        <option value="o_pos">O Positive (O+)</option>
                        <option value="o_neg">O Negative (O-)</option>
                        <option value="a_pos">A Positive (A+)</option>
                        <option value="a_neg">A Negative (A-)</option>
                        <option value="b_pos">B Positive (B+)</option>
                        <option value="b_neg">B Negative (B-)</option>
                        <option value="ab_pos">AB Positive (AB+)</option>
                        <option value="ab_neg">AB Negative (AB-)</option>
                      </select>
                    </div>
                    {/* Known Drug Allergies */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">Known Drug Allergies</label>
                      <input
                        className="w-full h-10 px-space-sm bg-surface-container-lowest rounded-lg font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Penicillin, NSAIDs"
                        type="text"
                        value={formData.allergies}
                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                {/* Action Bar & Security Note */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pt-space-xs">
                  <div className="flex items-center gap-space-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
                    <span className="font-body-sm text-body-sm">
                      Generates instant biometric QR &amp; ABHA federated sync token upon admission.
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm self-end sm:self-center">
                    <button
                      onClick={() => setFormData({ name: '', phone: '', notes: '', age: '', gender: '', bloodGroup: '', allergies: '' })}
                      className="px-space-lg py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button className="inline-flex items-center gap-2 px-space-xl py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md transition-all" type="submit">
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span className="">Save Patient</span>
                    </button>
                  </div>
                </div>
              </form>
              {/* SUB-SECTION: Recently Added Patients */}
              <div className="p-space-lg bg-surface-container-low border-t border-surface-container flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">recent_patient</span>
                    <span className="font-headline-sm text-headline-sm text-primary">Recently Added</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                      {recentPatients.length} Onboarded Today
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Auto-refreshed via greams-trauma-hub.apollo.in</span>
                </div>
                <div className="flex flex-col bg-surface-container-lowest rounded-lg shadow-sm divide-y divide-surface-container" id="recent-patient-list">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-low/50 transition-colors">
                      <div className="flex items-center gap-space-md">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
                          {patient.initials}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-label-lg text-label-lg text-on-surface font-semibold">{patient.name}</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">• {patient.tag}</span>
                            <span className={`px-2 py-0.2 rounded ${patient.statusColor} font-label-sm text-label-sm font-semibold`}>
                              {patient.status}
                            </span>
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{patient.details}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/patient/health-history')}
                        className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-container font-semibold self-end sm:self-center"
                        type="button"
                      >
                        <span className="">View Chart</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
{/* Telemetry & Compliance Micro-Footer */}
<div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm px-space-xs text-on-surface-variant font-body-sm text-body-sm">
<div className="flex items-center gap-space-xs">
<span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
<span className="">Apollo Greams Node 09 • NMC National Registry Verified (MD-44912-TN)</span>
</div>
<div className="flex items-center gap-space-md">
<span className="">ABHA Federated v2.4</span>
<span className="">ISO/IEC 27001 Certified Intake</span>
<span className="text-primary font-medium">Session Secure</span>
</div>
</div>
</div>

    </div>
  );
}
