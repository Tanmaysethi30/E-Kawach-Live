import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorCredentials() {
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleContactAdmin = () => {
    showToast('Nodal Admin Dispatch: Dr. S. Rao (Apollo Greams) • Registry Line: +91 44 2829 0200 • Token #NDR-88392');
  };

  return (
    <div className="w-full">
      {toastMsg && (
        <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-label-md text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg('')} className="text-teal-800 hover:opacity-75">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
      
{/* SECTION: Government Licensure & Registry Identifiers (Matching SCREEN_2 Card expanded) */}
<section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" data-purpose="official-identifiers-grid">
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-slate-100 text-[#004d6c] flex items-center justify-center">
<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</div>
<div>
<h2 className="text-base font-bold text-slate-900">National Medical Commission &amp; ABDM Licensure</h2>
<p className="text-xs text-slate-500">Cryptographically bound to National Doctors Registry (NPR/NDR) via DGHS portal</p>
</div>
</div>
<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-200 self-start sm:self-auto">
<svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
                VERIFIED • NMC ACTIVE
              </span>
</div>
{/* Identifiers 2x2 + Node Deployment Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
{/* 1. National Medical Commission (NMC) License */}
<div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs text-slate-500 mb-1">
<span className="">National Medical Commission (NMC) License</span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</div>
<div className="text-base font-bold text-slate-900 tracking-tight">MD-44912-TN</div>
</div>
<div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
<span className="">Issued: 14 Aug 2014</span>
<span className="text-emerald-700 font-semibold">Valid through 2034</span>
</div>
</div>
{/* 2. State Medical Council ID */}
<div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs text-slate-500 mb-1">
<span className="">State Medical Council ID</span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</div>
<div className="text-base font-bold text-slate-900 tracking-tight">TN-MC-2014-88392</div>
</div>
<div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
<span className="">Tamil Nadu Medical Council</span>
<span className="text-slate-600 font-medium">Permanent Registration</span>
</div>
</div>
{/* 3. ABDM Clinician Registry ID (HPPR) */}
<div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs text-slate-500 mb-1">
<span className="">ABDM Clinician Registry ID (HPR)</span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</div>
<div className="text-base font-bold text-slate-900 tracking-tight">DOC-9082-IND</div>
</div>
<div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
<span className="">ABDM Milestone M3 Certified</span>
<span className="text-emerald-700 font-semibold">HPPR Level-3 Verified</span>
</div>
</div>
{/* 4. Prescriber Privileges Tier */}
<div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs text-slate-500 mb-1">
<span className="">Prescriber Privileges</span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</div>
<div className="text-base font-bold text-slate-900 tracking-tight">Tier-1 Authorized (Schedule-H &amp; Overrides)</div>
</div>
<div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
<span className="">Narcotics &amp; Schedule X</span>
<span className="text-emerald-700 font-semibold">Trauma Override Enabled</span>
</div>
</div>
{/* 5. Institutional Node Deployment (Full Span) */}
<div className="md:col-span-2 bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#004d6c]">
<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</div>
<div>
<span className="text-xs text-slate-500 block">Institutional Node Deployment</span>
<span className="text-sm font-bold text-slate-900">Apollo Main Greams Road • Node 09 Cluster (Trauma Bay 3)</span>
</div>
</div>
<div className="flex items-center gap-3">
<span className="text-xs text-slate-500 hidden sm:inline">DSC Class 3 Valid</span>
<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</div>
</div>
</div>
{/* Mandatory Warning / Nodal liaison notice */}
<div className="mt-4 p-3.5 bg-sky-50 border border-sky-100 rounded-xl flex items-start gap-3 text-xs text-sky-900">
<svg className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
<div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<p className="">
                  Contact your hospital nodal admin or ABDM registrar to update verified clinical credentials or modify Schedule-H prescribing caps.
                </p>
<button onClick={handleContactAdmin} className="whitespace-nowrap font-semibold text-[#004d6c] hover:text-[#05192d] underline decoration-slate-300 underline-offset-2 cursor-pointer" type="button">
                  Contact Nodal Admin →
                </button>
</div>
</div>
</section>
{/* SECTION: Verifiable Credential QR & Digital Certificate Card */}

{/* SECTION: Audit Log & Institutional Key Sign-offs */}


    </div>
  );
}
