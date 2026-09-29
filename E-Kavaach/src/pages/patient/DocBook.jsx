import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DocBook() {
  const navigate = useNavigate();
  const [preferredDate, setPreferredDate] = useState('2026-10-26');
  const [booked, setBooked] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBooking = (e) => {
    e.preventDefault();
    setBooked(true);
    showToast(`Consultation slot confirmed for ${preferredDate}. ABDM token generated.`);
  };

  return (
    <div className="w-full">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm bg-primary text-on-primary rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">event_available</span>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg font-semibold">Appointment Notification</span>
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
{/* Dynamic Notification / Connectivity Banner */}
<div className="mb-space-lg flex items-center justify-between px-space-md py-2.5 rounded-xl bg-surface-container-low">
<div className="flex items-center gap-space-xs">
<span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
<span className="font-label-md text-label-md text-on-surface-variant font-medium">Ayushman Bharat Digital Mission (ABDM) Sync Active</span>
<span className="text-outline-variant text-label-sm mx-1">•</span>
<span className="font-label-sm text-label-sm text-secondary font-mono tracking-tight">Latency 28ms</span>
</div>
<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
<span>National Health Records Vault Linked</span>
</div>
</div>
{/* Page Header */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
<div className="flex flex-col gap-1.5">
<div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-semibold tracking-wide uppercase">
<span className="material-symbols-outlined text-[14px]">hub</span>
<span>National Digital Health Network • ABHA Integrated</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Book a Doctor Appointment</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
        Find and schedule appointments with verified doctors and hospitals. Real-time availability coordinated across government and impaneled clinical networks.
      </p>
</div>
{/* Quick Stats Counter / Telehealth Pill */}
<div className="flex items-center gap-3 bg-surface-container-lowest p-2 pr-4 rounded-xl shadow-sm self-start md:self-auto">
<div className="w-10 h-10 rounded-lg bg-secondary-container/50 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[22px]">video_call</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface-variant">Instant Teleconsult</span>
<span className="font-label-lg text-label-lg font-bold text-on-surface">14 Doctors Available</span>
</div>
</div>
</div>
{/* Book Appointment Card (Search / Filter Module) */}
<section className="bg-surface-container-lowest rounded-2xl p-space-lg md:p-space-xl shadow-sm mb-space-2xl relative overflow-hidden">
{/* Subtle architectural visual background accent */}
<div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="flex items-center justify-between mb-space-lg">
<div className="flex items-center gap-2">
<div className="w-2.5 h-6 bg-primary rounded-full"></div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Reserve Consultation Slot</h2>
</div>
<span className="font-label-md text-label-md text-secondary font-medium hidden sm:inline-flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">lock_reset</span> Instant ABDM Token Slip
      </span>
</div>

{booked && (
  <div className="mb-space-lg p-space-md rounded-xl bg-tertiary-fixed/40 border border-tertiary/20 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
    <div className="flex items-center gap-space-sm">
      <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-[20px]">check</span>
      </div>
      <div className="flex flex-col">
        <span className="font-label-lg text-label-lg text-primary font-bold">Consultation Slot Reserved Successfully!</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Provisional ABDM Token Slip #EK-ABDM-7419 generated for {preferredDate}. Ingress notification dispatched to clinic desk.
        </span>
      </div>
    </div>
    <button
      onClick={() => setBooked(false)}
      className="px-space-md py-1 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm hover:bg-surface-container transition-all self-end md:self-center"
      type="button"
    >
      Dismiss
    </button>
  </div>
)}

<form className="flex flex-col gap-space-lg" id="appointmentForm" onSubmit={handleBooking}>
{/* 3-Column Search Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
{/* Specialty Dropdown */}
<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface-variant font-medium flex items-center gap-1.5" htmlFor="specialtySelect">
<span className="material-symbols-outlined text-[18px] text-primary">stethoscope</span>
            Specialty
          </label>
<div className="relative">
<select className="w-full h-11 pl-3 pr-9 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary transition-all cursor-pointer" id="specialtySelect">
<option selected="" value="cardio">Cardiology (Heart &amp; Vascular)</option>
<option value="neuro">Neurology &amp; Brain Sciences</option>
<option value="ortho">Orthopedics &amp; Joint Replacement</option>
<option value="genmed">General Medicine &amp; Chronic Care</option>
<option value="endo">Endocrinology &amp; Diabetes</option>
<option value="pedia">Pediatrics &amp; Neonatology</option>
<option value="ophtha">Ophthalmology</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
</div>
</div>
{/* Hospital / Center Dropdown */}
<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface-variant font-medium flex items-center gap-1.5" htmlFor="hospitalSelect">
<span className="material-symbols-outlined text-[18px] text-primary">local_hospital</span>
            Hospital or Center
          </label>
<div className="relative">
<select className="w-full h-11 pl-3 pr-9 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary transition-all cursor-pointer" id="hospitalSelect">
<option selected="" value="apollo_greams">Apollo Trauma Hub (Greams Road)</option>
<option value="fortis_health">Fortis Healthcare Super Specialty</option>
<option value="aiims_trauma">AIIMS Trauma &amp; Surgical Center</option>
<option value="apollo_spec">Apollo Speciality Cancer Hospital</option>
<option value="stanley_mc">Government Stanley Medical College</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
</div>
</div>
{/* Date Picker with pill shortcuts */}
<div className="flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md text-on-surface-variant font-medium flex items-center gap-1.5" htmlFor="preferredDate">
<span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
              Preferred Date
            </label>
<div className="flex gap-1">
<button className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-all" onClick={() => setPreferredDate('2026-10-25')} type="button">Today</button>
<button className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-all" onClick={() => setPreferredDate('2026-10-26')} type="button">Tomorrow</button>
<button className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-all" onClick={() => setPreferredDate('2026-10-31')} type="button">Weekend</button>
</div>
</div>
<div className="relative">
<input className="w-full h-11 px-3 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary transition-all" id="preferredDate" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} type="date" />
</div>
</div>
</div>
{/* Action & Trust Note Footer */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md pt-space-xs">
<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
<span>Verified clinicians only • Instant teleconsult &amp; in-person slots available</span>
</div>
<button className="px-8 py-3.5 bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all group" id="searchSlotsBtn" type="submit">
<span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">search_check</span>
<span>Find &amp; Book Slot</span>
</button>
</div>
</form>
</section>
{/* Section: Your Upcoming Appointments */}
<section className="flex flex-col gap-space-md mb-space-2xl">
{/* Header with tab toggle & counter */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-2xs">
<div className="flex items-center gap-3">
<h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Your Upcoming Appointments</h2>
<span className="px-2.5 py-0.5 rounded-full bg-secondary-container/60 text-secondary font-label-sm text-label-sm font-semibold tracking-wide" id="activeCountBadge">3 Active</span>
</div>
                {/* Segmented filter control */}
                <div className="inline-flex p-1 bg-surface-container-low rounded-xl self-start sm:self-auto" id="filterButtonGroup">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all ${activeFilter === 'all' ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
                    type="button"
                  >
                    All (3)
                  </button>
                  <button
                    onClick={() => setActiveFilter('confirmed')}
                    className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all ${activeFilter === 'confirmed' ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
                    type="button"
                  >
                    Confirmed
                  </button>
                  <button
                    onClick={() => setActiveFilter('pending')}
                    className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all ${activeFilter === 'pending' ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
                    type="button"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setActiveFilter('past')}
                    className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all ${activeFilter === 'past' ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
                    type="button"
                  >
                    Past History
                  </button>
                </div>
              </div>
              {/* Appointment Rows Container */}
              <div className="flex flex-col gap-space-sm" id="appointmentsList">
                {/* Row 1: Dr. Kavitha Menon (Approved) */}
                {(activeFilter === 'all' || activeFilter === 'confirmed') && (
                  <div className="appointment-card bg-surface-container-lowest hover:bg-surface-container-low/80 p-space-md md:p-space-lg rounded-2xl shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md" data-status="approved">
                    {/* Col 1: Doctor Info */}
                    <div className="flex items-center gap-space-md min-w-[280px]">
                      <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center text-primary font-headline-sm font-semibold">
                        <div className="w-full h-full min-h-[44px] rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-xs" title="Close up warm medical studio portrait of Dr. Kavitha Menon, Indian female senior cardiologist wearing modern doctor coat, soft clinical navy background, calm and authoritative, hyperrealistic photograph">KM</div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-tertiary-container rounded-full ring-2 ring-surface-container-lowest"></span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">Dr. Kavitha Menon</span>
                          <span className="material-symbols-outlined text-secondary text-[18px]" title="ABDM Verified Specialist">verified</span>
                        </div>
                        <span className="font-label-md text-label-md text-primary font-medium">MD, DM (Cardiology)</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Interventional Cardiology • Apollo Greams Hub</span>
                      </div>
                    </div>
                    {/* Col 2: Date & Time */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-1 sm:gap-4 lg:gap-1 text-on-surface-variant min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
                        <span className="font-label-lg text-label-lg text-on-surface font-medium">Tomorrow, 25 Oct 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schedule</span>
                        <span className="font-body-md text-body-md text-on-surface-variant">10:30 AM (Bay 3, Room 4)</span>
                      </div>
                    </div>
                    {/* Col 3: Mode Tag */}
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-secondary">domain</span>
                        In-Person Consultation
                      </span>
                    </div>
                    {/* Col 4: Status Pill (Approved / Teal) */}
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                        Approved
                      </span>
                    </div>
                    {/* Col 5: Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <button
                        onClick={() => showToast('ABDM Token Slip #EK-4419: Verified for Dr. Kavitha Menon • Apollo Greams Hub.')}
                        className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors"
                        type="button"
                      >
                        View Slip
                      </button>
                      <button
                        onClick={() => showToast('Rescheduling initiated. Select an alternate date from the calendar.')}
                        className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                        Reschedule
                      </button>
                      <button
                        onClick={() => showToast('Appointment synchronized to your system calendar.')}
                        className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
                        title="Add to Calendar"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">event</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Row 2: Dr. Arvind Swaminathan (Pending) */}
                {(activeFilter === 'all' || activeFilter === 'pending') && (
                  <div className="appointment-card bg-surface-container-lowest hover:bg-surface-container-low/80 p-space-md md:p-space-lg rounded-2xl shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md" data-status="pending">
                    {/* Col 1: Doctor Info */}
                    <div className="flex items-center gap-space-md min-w-[280px]">
                      <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-primary font-headline-sm font-semibold">
                        <div className="w-full h-full min-h-[44px] rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-xs" title="Professional studio portrait of Dr. Arvind Swaminathan, male Indian endocrinologist in dark medical scrub top with spectacles, bright clean background, empathetic and focused demeanor, high resolution photograph">AS</div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary rounded-full ring-2 ring-surface-container-lowest"></span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">Dr. Arvind Swaminathan</span>
                          <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                        </div>
                        <span className="font-label-md text-label-md text-primary font-medium">MD (Endocrinology), FRCP</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Endocrinology &amp; Diabetes • Fortis Healthcare</span>
                      </div>
                    </div>
                    {/* Col 2: Date & Time */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-1 sm:gap-4 lg:gap-1 text-on-surface-variant min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
                        <span className="font-label-lg text-label-lg text-on-surface font-medium">28 Oct 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schedule</span>
                        <span className="font-body-md text-body-md text-on-surface-variant">04:15 PM (Video Link ABHA-33)</span>
                      </div>
                    </div>
                    {/* Col 3: Mode Tag */}
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container/40 font-label-md text-label-md text-on-secondary-container">
                        <span className="material-symbols-outlined text-[16px] text-secondary">video_camera_front</span>
                        Telehealth Video Call
                      </span>
                    </div>
                    {/* Col 4: Status Pill (Pending / Soft Lavender) */}
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Pending Review
                      </span>
                    </div>
                    {/* Col 5: Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <button
                        onClick={() => showToast('ABDM Telehealth Request #TH-9021 awaiting clinician counter-signature.')}
                        className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors"
                        type="button"
                      >
                        View Request
                      </button>
                      <button
                        onClick={() => showToast('Slot modification request forwarded to Fortis OPD desk.')}
                        className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                        Change Slot
                      </button>
                      <button
                        onClick={() => showToast('Teleconsult reminder added to calendar.')}
                        className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
                        title="Add to Calendar"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">event</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Row 3: Dr. Priya Sundaram (Rescheduled) */}
                {(activeFilter === 'all' || activeFilter === 'confirmed') && (
                  <div className="appointment-card bg-surface-container-lowest hover:bg-surface-container-low/80 p-space-md md:p-space-lg rounded-2xl shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md" data-status="rescheduled">
                    {/* Col 1: Doctor Info */}
                    <div className="flex items-center gap-space-md min-w-[280px]">
                      <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center text-primary font-headline-sm font-semibold">
                        <div className="w-full h-full min-h-[44px] rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-xs" title="Portrait of Dr. Priya Sundaram, an Indian ophthalmologist doctor with medical stethoscope and gentle confident smile, wearing spectacles and light cyan medical scrubs, realistic photography studio shot">PS</div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-outline-variant rounded-full ring-2 ring-surface-container-lowest"></span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">Dr. Priya Sundaram</span>
                          <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                        </div>
                        <span className="font-label-md text-label-md text-primary font-medium">MS, DNB (Ophthalmology)</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Cornea &amp; Refractive • AIIMS Trauma Center</span>
                      </div>
                    </div>
                    {/* Col 2: Date & Time */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-1 sm:gap-4 lg:gap-1 text-on-surface-variant min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
                        <span className="font-label-lg text-label-lg text-on-surface font-medium">05 Nov 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schedule</span>
                        <span className="font-body-md text-body-md text-on-surface-variant">11:00 AM (OPD Wing B)</span>
                      </div>
                    </div>
                    {/* Col 3: Mode Tag */}
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-secondary">domain</span>
                        In-Person Consultation
                      </span>
                    </div>
                    {/* Col 4: Status Pill (Rescheduled / Neutral Gray-Blue) */}
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                        Rescheduled
                      </span>
                    </div>
                    {/* Col 5: Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <button
                        onClick={() => showToast('Rescheduled appointment accepted for 05 Nov 2026.')}
                        className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors"
                        type="button"
                      >
                        Accept New Time
                      </button>
                      <button
                        onClick={() => showToast('Opening consultation modify request window...')}
                        className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                        Modify
                      </button>
                      <button
                        onClick={() => showToast('Syncing consultation entry to calendar...')}
                        className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
                        title="Add to Calendar"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">event</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Empty State Component */}
              {activeFilter === 'past' && (
                <div className="flex flex-col items-center justify-center p-space-2xl bg-surface-container-lowest rounded-2xl text-center shadow-sm py-16" id="emptyStateCard">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-space-md">
                    <span className="material-symbols-outlined text-[32px]">event_busy</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">No past appointments found in this view</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
                    No historical consultations archived yet. Active slots will migrate here upon discharge.
                  </p>
                  <button
                    onClick={() => { setActiveFilter('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-semibold inline-flex items-center gap-2 shadow-sm hover:bg-primary-container transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Schedule New Visit
                  </button>
                </div>
              )}
            </section>
{/* Hospital & Clinic Partners Grid Banner */}
<section className="mb-space-xl p-space-lg rounded-2xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
<span className="material-symbols-outlined text-[26px]">apartment</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg font-semibold text-on-surface">Integrated Emergency Trauma &amp; Referral Network</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Over 1,280 accredited government and private clinical institutions participating under ABHA protocols</span>
</div>
</div>
<div className="flex items-center gap-4 text-outline font-label-md text-label-md font-semibold">
<span>AIIMS</span>
<span className="text-outline-variant">•</span>
<span>APOLLO</span>
<span className="text-outline-variant">•</span>
<span>FORTIS</span>
<span className="text-outline-variant">•</span>
<span>STANLEY</span>
</div>
</section>
</div>

    </div>
  );
}
