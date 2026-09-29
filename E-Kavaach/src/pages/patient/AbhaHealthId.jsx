import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AbhaHealthId() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    showToast(`${label} copied to clipboard: ${text}`);
  };

  const handleDownloadCard = () => {
    showToast('Downloading Digital ABHA Card (ABHA-9824-8819.pdf)...');
    const content = 'NATIONAL HEALTH AUTHORITY (ABDM)\nUniversal ABHA Health Card\nName: Rajesh V. Sharma\nABHA ID: 9824-8819-3320-1192\nPHR: rajesh.sharma@abdm\nBlood Group: O+\nVault Status: Level-4 Certified';
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ABHA-Card-Rajesh-Sharma.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSavePreferences = () => {
    showToast('ABDM sync preferences saved successfully to National Health Vault.');
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-xl"><div className="flex flex-col min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">Settings</span><span className="text-on-surface-variant font-label-sm text-label-sm">/</span><span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Health ID &amp; ABHA Linking</span></div><h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Health ID &amp; ABHA Linking</h1><p className="font-body-md text-body-md text-on-surface-variant mt-0.5 max-w-2xl">Manage cryptographic authentication, federated hospital records, and ABDM Ayushman Bharat Digital Health credentials.</p></div><div className="flex items-center gap-space-sm shrink-0 flex-wrap sm:flex-nowrap"><div className="inline-flex items-center gap-2 px-space-sm py-2 rounded-full bg-secondary-container text-on-secondary-container shadow-sm"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span></span><span className="font-label-md text-label-md font-semibold tracking-wide">ABDM Cloud Sync: Active (0.08s)</span></div><button onClick={handleDownloadCard} className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container-highest font-label-lg text-label-lg shadow-sm transition-colors" id="downloadAbhaBtn" type="button"><span className="material-symbols-outlined text-[18px]">badge</span><span className="">Download Digital ABHA Card</span></button><button onClick={handleSavePreferences} className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-lg text-label-lg shadow-sm transition-colors" type="button"><span className="material-symbols-outlined text-[18px]">check</span><span className="">Save All Preferences</span></button></div></div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter w-full">
<div className="lg:col-span-8 flex flex-col gap-space-xl">
<div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm p-space-lg">
<div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-secondary-container/40 via-surface-container-low/20 to-transparent pointer-events-none rounded-bl-full"></div>
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md mb-space-md bg-surface-container-low/60 -mx-space-lg -mt-space-lg px-space-lg pt-space-lg">
<div className="flex items-center gap-space-xs">
<div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
<span className="material-symbols-outlined text-[24px]">fingerprint</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-primary tracking-tight">Verified ABDM Universal Health ID</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Ministry of Health and Family Welfare (MoHFW) • NHA Enrolled</span>
</div>
</div>
<div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold self-start sm:self-auto">
<span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
<span className="">ABHA Vault Level-4 Certified</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-md">
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">14-Digit ABHA ID</span>
<span className="material-symbols-outlined text-secondary text-[20px]">credit_card</span>
</div>
<div className="mt-space-sm mb-space-xs flex items-center justify-between">
<span className="font-headline-md text-headline-md text-primary font-bold tracking-wider" id="abhaNumberVal">9824-8819-3320-1192</span>
<button onClick={() => handleCopy('9824-8819-3320-1192', '14-Digit ABHA ID')} className="p-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors cursor-pointer" title="Copy ABHA ID" type="button">
<span className="material-symbols-outlined text-[18px]">content_copy</span>
</button>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
              Aadhaar Vault linked: <span className="font-medium text-on-surface">XXXX-XXXX-4091</span>
</span>
</div>
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">ABHA PHR Address</span>
<span className="material-symbols-outlined text-secondary text-[20px]">alternate_email</span>
</div>
<div className="mt-space-sm mb-space-xs flex items-center justify-between">
<span className="font-headline-md text-headline-md text-primary font-bold tracking-tight" id="abhaAddressVal">rajesh.sharma@abdm</span>
<button onClick={() => handleCopy('rajesh.sharma@abdm', 'ABHA PHR Address')} className="p-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors cursor-pointer" title="Copy PHR Handle" type="button">
<span className="material-symbols-outlined text-[18px]">content_copy</span>
</button>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-secondary">domain</span>
              Apollo Hospital Consent Gateway: <span className="font-medium text-on-surface">Active Sync</span>
</span>
</div>
</div>
<div className="bg-surface-container rounded-lg p-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
<span className="font-body-sm text-body-sm text-on-surface">
              Biometric &amp; Aadhaar Binding: <strong className="font-semibold text-primary">Biometric Tier-1 Token Verified</strong> on 12-Feb-2025 via Greams Trauma Node.
            </span>
</div>
<button onClick={() => navigate('/patient/privacy')} className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold shrink-0" type="button">
<span className="">View Audit Logs</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>



</div>
<div className="lg:col-span-4 flex flex-col gap-space-xl">



</div>
</div>
<div className={`fixed bottom-6 right-6 px-space-md py-space-sm rounded-lg bg-inverse-surface text-inverse-on-surface shadow-xl flex items-center gap-2 transform transition-all duration-300 z-50 ${toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`} id="toastNotification">
<span className="material-symbols-outlined text-secondary text-[20px]" id="toastIcon">check_circle</span>
<span className="font-body-sm text-body-sm" id="toastMessage">{toastMessage || 'Copied to clipboard'}</span>
</div>
</div>

    </div>
  );
}
