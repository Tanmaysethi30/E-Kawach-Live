import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleExportSummary = () => {
    const summary = `E-KAVACH CLINICAL SHIFT SUMMARY
Practitioner: Dr. Kavitha Menon (Chief Interventional Cardio)
Date: Monday, 24 October 2026
Facility: Apollo Greams Trauma Hub (Bay 3 Interventional Unit)
Grid Node: AP-GRM-09 • Port #842

TRIAGE & ADMISSION STATS:
- Scheduled Appointments: 18 (4 High-Acuity Cardio)
- Pending Approvals: 5 (3 Insurance Pre-Auths)
- Active In-Patients: 24 (6 ICU / Critical Step-Down)
- Emergency Triage Scans: 42 (ABHA Verified, Latency 0.18s)

ABDM Gateway Status: Cryptographically Synchronized (18ms)`;

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EKavach_Shift_Summary_Oct24.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Shift summary exported successfully.');
  };

  return (
    <div className="w-full">
      {toastMsg && (
        <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-label-md text-sm flex items-center justify-between shadow-sm animate-fade-in max-w-[1600px] mx-auto">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg('')} className="text-teal-800 hover:opacity-75">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
      <div className="flex flex-col w-full gap-6 max-w-[1600px] mx-auto">
{/* Top Greeting & Immediate Actions (Editorial Banner) */}
<section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-white via-white to-slate-50/60 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,35,55,0.03)]">
<div className="flex flex-col gap-1.5">
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E4E4FB] text-[#4338ca] font-label-sm text-xs font-semibold uppercase tracking-wider">
<span className="w-1.5 h-1.5 rounded-full bg-[#4338ca] animate-pulse"></span>
          Live Bay 3 Unit
        </span>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 font-label-sm text-xs font-medium">
<span className="material-symbols-outlined text-[13px]">router</span>
          Grid Node: AP-GRM-09
        </span>
</div>
<h1 className="font-headline-lg text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
        Welcome back, Dr. Kavitha Menon
      </h1>
<p className="font-body-md text-sm text-slate-500">
        Monday, 24 October 2026 • Apollo Greams Trauma Hub (Bay 3 Interventional Unit)
      </p>
</div>
<div className="flex items-center gap-3 shrink-0">
<button onClick={handleExportSummary} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-label-lg text-sm font-medium shadow-sm cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px] text-slate-500">file_download</span>
        Export Shift Summary
      </button>
<button onClick={() => navigate('/doctor/add-patient')} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/25 transition-all font-label-lg text-sm font-medium cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">add_circle</span>
        + Immediate Triage Admit
      </button>
</div>
</section>
{/* Modern Bento-Box Grid Container */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
  <div onClick={() => navigate('/doctor/appointments')} className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-pointer group">
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <span className="font-label-sm text-[11px] text-slate-400 uppercase font-semibold tracking-wider group-hover:text-primary transition-colors">Today's Appointments</span>
        <span className="font-headline-lg text-2xl lg:text-[28px] font-bold text-slate-900 mt-1">18 <span className="text-base font-semibold text-slate-600">Scheduled</span></span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
      <span className="text-xs text-slate-500">4 high acuity cardio consults</span>
      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 text-[11px] font-semibold">Active Cycle</span>
    </div>
  </div>

  <div onClick={() => navigate('/doctor/appointments')} className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-pointer group">
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <span className="font-label-sm text-[11px] text-slate-400 uppercase font-semibold tracking-wider group-hover:text-[#4338ca] transition-colors">Pending Approvals</span>
        <span className="font-headline-lg text-2xl lg:text-[28px] font-bold text-slate-900 mt-1">5 <span className="text-base font-semibold text-slate-600">Requests</span></span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-[#E4E4FB] flex items-center justify-center text-[#4338ca] group-hover:bg-[#4338ca] group-hover:text-white transition-colors">
        <span className="material-symbols-outlined text-[20px]">pending_actions</span>
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
      <span className="text-xs text-slate-500">3 insurance pre-auths pending</span>
      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-[11px] font-semibold">Action Required</span>
    </div>
  </div>

  <div onClick={() => navigate('/doctor/patient-history')} className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-pointer group">
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <span className="font-label-sm text-[11px] text-slate-400 uppercase font-semibold tracking-wider group-hover:text-teal-700 transition-colors">Active In-Patients</span>
        <span className="font-headline-lg text-2xl lg:text-[28px] font-bold text-slate-900 mt-1">24 <span className="text-base font-semibold text-slate-600">Patients</span></span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-colors">
        <span className="material-symbols-outlined text-[20px]">hotel</span>
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
      <span className="text-xs text-slate-500">6 in ICU / Critical Step-Down</span>
      <span className="px-2.5 py-0.5 rounded-full bg-[#E4E4FB] text-[#4338ca] text-[11px] font-semibold">Monitored</span>
    </div>
  </div>

  <div onClick={() => navigate('/doctor/scan')} className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-pointer group">
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <span className="font-label-sm text-[11px] text-slate-400 uppercase font-semibold tracking-wider group-hover:text-primary transition-colors">Emergency Triage Scans</span>
        <span className="font-headline-lg text-2xl lg:text-[28px] font-bold text-primary mt-1">42 <span className="text-base font-semibold text-slate-600">Scanned</span></span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-cyan-50 text-secondary flex items-center justify-center border border-cyan-100 group-hover:bg-secondary group-hover:text-white transition-colors">
        <span className="material-symbols-outlined text-[20px]">bolt</span>
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
      <span className="text-xs text-slate-500">Avg sync latency: <strong className="text-teal-700 font-mono">0.18s</strong></span>
      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 text-[11px] font-semibold">Real-time ABHA</span>
    </div>
  </div>
</div>
</div>
    </div>
  );
}
