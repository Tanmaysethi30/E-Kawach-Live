import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function EmergencyAccess() {
  const navigate = useNavigate();
  const [beaconStatus, setBeaconStatus] = useState(null);
  const triggerBeacon = (target) => {
    setBeaconStatus(`Telemetry Ingress Signal Dispatched: Test packet securely routed to ${target} via ABDM Gateway (0.18s latency).`);
    setTimeout(() => setBeaconStatus(null), 4000);
  };
  return (
    <div className="w-full">
      {/* Dynamic Beacon Toast Feedback */}
      {beaconStatus && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm bg-primary text-on-primary rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-[20px] text-teal-tactical">cell_tower</span>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg font-semibold">Emergency Beacon Broadcast</span>
            <span className="font-body-sm text-body-sm text-surface-variant">{beaconStatus}</span>
          </div>
          <button
            onClick={() => setBeaconStatus(null)}
            className="ml-space-md text-surface-variant hover:text-on-primary transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

{/* Breadcrumb and Live Operational Ingress Bar */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-outline-variant/30">
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider">
      <span className="material-symbols-outlined text-[16px] text-teal-tactical">shield_person</span>
      <span className="">Patient Preferences &amp; Safety Protocols</span>
    </div>
    <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary tracking-tight">Emergency Contacts &amp; SOS Dispatch</h1>
    <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-2xl">Manage your emergency contacts, triage escalation pipeline, and ABDM SOS broadcast preferences.</p>
  </div>
  <div className="flex items-center gap-3 shrink-0">
    <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-teal-tactical/30 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-tactical opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-tactical"></span>
      </span>
      <span className="font-label-sm text-[11px] text-primary font-bold tracking-tight">ABDM Cloud Sync: Active</span>
    </div>
    <button onClick={() => triggerBeacon('ABDM Preferences Vault')} type="button" className="px-4 py-2 bg-primary hover:bg-navy-accent text-white font-headline-sm text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
      <span className="material-symbols-outlined text-[16px] text-teal-tactical">check_circle</span>
      <span className="">Save All Preferences</span>
    </button>
  </div>
</div><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-outline-variant/20 mb-6">
<div className="flex items-center gap-2 text-on-surface-variant text-xs">
<span className="font-label-md">Patient Portal</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="font-label-md">System Preferences</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="font-label-md text-primary font-semibold">Emergency Contacts &amp; Telemetry Command</span>
</div>
<div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-teal-tactical/30 shadow-sm">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-tactical opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-teal-tactical"></span>
</span>
<span className="font-label-sm text-[11px] text-primary font-bold tracking-tight">ABDM Tactical Beacon: LIVE (0.18s Telemetry)</span>
</div>
</div>
{/* Main Layout: Navigation Column + Bento Grid */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
{/* MINI SIDEBAR TABS (Left Col - 3 cols) */}
<aside className="lg:col-span-3 flex flex-col gap-4">
<div className="bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-1">
<div className="px-3 py-2">
<span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">System Configuration</span>
</div>
<Link to="/patient/settings" className="flex items-center justify-between px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors no-underline">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px]">account_circle</span>
<span className="font-label-lg text-xs font-medium">Profile</span>
</div>
</Link>
<Link to="/patient/abha" className="flex items-center justify-between px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors no-underline">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px]">fingerprint</span>
<span className="font-label-lg text-xs font-medium">Health ID &amp; ABHA</span>
</div>
</Link>
{/* Active Settings Item */}
<div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition-colors cursor-default">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px] text-teal-tactical">cell_tower</span>
<span className="font-label-lg text-xs">Emergency Contacts</span>
</div>
<span className="bg-teal-tactical/20 text-teal-tactical font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold">2 Synced</span>
</div>
<Link to="/patient/notifications" className="flex items-center justify-between px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors no-underline">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px]">notifications_active</span>
<span className="font-label-lg text-xs font-medium">Notifications</span>
</div>
<span className="bg-surface-container text-on-surface-variant font-label-sm text-[10px] px-1.5 py-0.5 rounded-md">Auto</span>
</Link>



</div>
{/* Diagnostic Telemetry Quick-Run Card */}
<div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-3">
<div className="flex items-center justify-between">
<span className="font-label-sm text-[10px] uppercase tracking-wider font-bold text-secondary">Dispatch Health</span>
<span className="flex items-center gap-1 text-[11px] font-semibold text-teal-tactical">
<span className="w-1.5 h-1.5 rounded-full bg-teal-tactical"></span> 99.99% Up
              </span>
</div>
<div className="p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
<span className="text-on-surface-variant font-medium">Heartbeat Ping</span>
<span className="font-mono font-bold text-primary">0.18 ms</span>
</div>
<div className="p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
<span className="text-on-surface-variant font-medium">FIPS Key Status</span>
<span className="font-mono font-bold text-teal-tactical">Armed &amp; Valid</span>
</div>
<button onClick={() => triggerBeacon('Node GREAMS-BAY-03 (FIPS Armed)')} className="w-full py-2 bg-surface-container-high hover:bg-surface-container text-primary font-label-md text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-outline-variant/40 cursor-pointer" type="button">
<span className="material-symbols-outlined text-[16px] text-teal-tactical">wifi_tethering</span>
<span className="">Self-Test Ingress Pulse</span>
</button>
</div>
</aside>
{/* BENTO GRID CONTAINER (Right Col - 9 cols) */}
<div className="lg:col-span-9 flex flex-col gap-6">
{/* MODULE 1: PRIMARY HERO BENTO (Active Dispatch Beacon & Trauma Network) */}
<div className="bg-gradient-to-br from-[#00354c] via-[#004d6c] to-[#00283a] rounded-3xl p-6 text-white shadow-md relative overflow-hidden border border-white/10">
{/* Background Decorative Grid Lines */}
<div className="absolute inset-0 bg-[radial-gradient(#02C39A_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>
<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
<div className="flex flex-col gap-1.5 max-w-xl">
<div className="flex items-center gap-2">
<span className="bg-teal-tactical/20 border border-teal-tactical/40 text-teal-tactical px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-teal-tactical animate-pulse"></span> Tactical Telemetry OS
                  </span>
<span className="text-white/60 text-xs font-mono">NODE: TN-CH-992</span>
</div>
<h1 className="font-headline-lg text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                  Active Dispatch Beacon &amp; Trauma Network
                </h1>
<p className="font-body-md text-xs md:text-sm text-slate-200 leading-relaxed">
                  Real-time algorithmic dispatch matrix connected to ABDM National Registry and local Golden-Hour emergency bays. Instant broadcast on triage trigger.
                </p>
</div>
{/* Top Quick Action CTA */}
<div className="flex items-center gap-3 shrink-0">
<button className="px-4 py-2.5 bg-teal-tactical hover:bg-teal-tactical/90 text-primary font-headline-sm text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2" onClick={() => triggerBeacon('Master Network Broadcast')} type="button">
<span className="material-symbols-outlined text-[18px]">satellite_alt</span>
<span className="">Broadcast Test Ping</span>
</button>
</div>
</div>
{/* Hero Bento Sub-Stats (3-Column Tactical Telemetry Strip) */}
<div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
{/* Sub-metric 1 */}
<div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3.5">
<div className="w-11 h-11 rounded-xl bg-teal-tactical/20 text-teal-tactical flex items-center justify-center shrink-0 border border-teal-tactical/30">
<span className="material-symbols-outlined text-[24px]">speed</span>
</div>
<div className="flex flex-col">
<span className="text-[11px] text-slate-300 font-medium">Ingress Ping Latency</span>
<div className="flex items-baseline gap-1.5">
<span className="font-headline-md text-xl font-bold text-white tracking-tight">0.18s</span>
<span className="text-[10px] text-teal-tactical font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[12px]">bolt</span> Sub-second
                    </span>
</div>
</div>
</div>
{/* Sub-metric 2 */}
<div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3.5">
<div className="w-11 h-11 rounded-xl bg-white/10 text-cyan-200 flex items-center justify-center shrink-0 border border-white/15">
<span className="material-symbols-outlined text-[24px]">local_hospital</span>
</div>
<div className="flex flex-col">
<span className="text-[11px] text-slate-300 font-medium">Connected Trauma Bays</span>
<div className="flex items-baseline gap-1.5">
<span className="font-headline-md text-base font-bold text-white tracking-tight truncate">Apollo Greams &amp; Fortis</span>
</div>
<span className="text-[10px] text-slate-400">Level-1 Trauma Certified</span>
</div>
</div>
{/* Sub-metric 3 */}
<div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3.5">
<div className="w-11 h-11 rounded-xl bg-teal-tactical/20 text-teal-tactical flex items-center justify-center shrink-0 border border-teal-tactical/30">
<span className="material-symbols-outlined text-[24px]">ambulance</span>
</div>
<div className="flex flex-col">
<span className="text-[11px] text-slate-300 font-medium">108 Fleet Sync</span>
<div className="flex items-baseline gap-1.5">
<span className="font-headline-md text-xl font-bold text-teal-tactical">Continuous</span>
<span className="w-2 h-2 rounded-full bg-teal-tactical animate-ping"></span>
</div>
<span className="text-[10px] text-slate-300">Auto-Handshake Armed</span>
</div>
</div>
</div>
</div>
{/* MODULE 2: BENTO GRID OF CONTACT TILES (Priority 1 & Priority 2 Side-by-Side) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{/* Bento Tile: Priority 1 Contact (Ananya S. Sharma) */}
<div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/30 shadow-sm flex flex-col justify-between relative group hover:border-primary/40 transition-all">
<div className="flex flex-col gap-4">
{/* Header badge & timing */}
<div className="flex items-center justify-between">
<span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
<span className="material-symbols-outlined text-[13px] text-teal-tactical">verified_user</span> Primary Next-of-Kin
                  </span>
<span className="bg-surface-container text-primary font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-outline-variant/30">
                    Tier-1 (0s Delay)
                  </span>
</div>
{/* Contact Identity */}
<div className="flex items-start gap-3.5">
<div className="w-12 h-12 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center font-headline-md text-lg font-bold shrink-0 border border-outline-variant/20">
                    AS
                  </div>
<div className="flex flex-col min-w-0">
<div className="flex items-center gap-1.5">
<h3 className="font-headline-sm text-base font-bold text-on-surface truncate">Ananya S. Sharma</h3>
</div>
<span className="text-xs text-on-surface-variant font-medium">Spouse • Legal Power of Attorney</span>
<span className="text-xs font-mono font-bold text-primary mt-1">+91 98401 22819</span>
</div>
</div>
{/* Visual Permission Badges */}
<div className="flex flex-wrap gap-1.5 pt-1">
<span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
<span className="material-symbols-outlined text-[13px] text-teal-tactical">gavel</span> Full DPOA Consent
                  </span>
<span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
<span className="material-symbols-outlined text-[13px] text-secondary">sms</span> Live SMS Telemetry
                  </span>
<span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
<span className="material-symbols-outlined text-[13px] text-teal-tactical">vital_signs</span> ICU Break-Glass
                  </span>
</div>
</div>
{/* Actions Strip */}
<div className="pt-5 mt-4 border-t border-outline-variant/20 flex items-center justify-between gap-2">
<button onClick={() => triggerBeacon('Priority 1 Contact (Ananya S. Sharma)')} className="flex-1 py-2 px-3 bg-surface-container-low hover:bg-surface-container text-primary rounded-xl font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 cursor-pointer" type="button">
<span className="material-symbols-outlined text-[16px] text-teal-tactical">cell_tower</span>
<span className="">Simulate Beacon</span>
</button>
<button onClick={() => triggerBeacon('Carrier Voice Line (+91 98401 22819)')} className="py-2 px-3 bg-surface-container-low hover:bg-surface-container text-secondary rounded-xl font-label-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-outline-variant/30 cursor-pointer" title="Direct Line Verification" type="button">
<span className="material-symbols-outlined text-[16px]">call</span>
<span className="">Test Ring</span>
</button>
<button onClick={() => navigate('/patient/settings')} className="p-2 text-on-surface-variant hover:text-primary rounded-xl hover:bg-surface-container transition-colors cursor-pointer" title="Edit Contact" type="button">
<span className="material-symbols-outlined text-[18px]">tune</span>
</button>
</div>
</div>
{/* Bento Tile: Priority 2 Contact (Dr. Vijay Sharma) */}
<div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/30 shadow-sm flex flex-col justify-between relative group hover:border-primary/40 transition-all">
<div className="flex flex-col gap-4">
{/* Header badge & timing */}
<div className="flex items-center justify-between">
<span className="bg-surface-container-highest text-secondary text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
<span className="material-symbols-outlined text-[13px] text-teal-tactical">medical_services</span> Secondary Medical Proxy
                  </span>
<span className="bg-surface-container text-secondary font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-outline-variant/30">
                    Tier-2 (+2m Delay)
                  </span>
</div>
{/* Contact Identity */}
<div className="flex items-start gap-3.5">
<div className="w-12 h-12 rounded-2xl bg-surface-container-high text-secondary flex items-center justify-center font-headline-md text-lg font-bold shrink-0 border border-outline-variant/20">
                    VS
                  </div>
<div className="flex flex-col min-w-0">
<div className="flex items-center gap-1.5">
<h3 className="font-headline-sm text-base font-bold text-on-surface truncate">Dr. Vijay Sharma</h3>
</div>
<span className="text-xs text-on-surface-variant font-medium">Brother • Cardiologist, Apollo (NMC-7419)</span>
<span className="text-xs font-mono font-bold text-primary mt-1">+91 94440 18234</span>
</div>
</div>
{/* Visual Permission Badges */}
<div className="flex flex-wrap gap-1.5 pt-1">
<span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
<span className="material-symbols-outlined text-[13px] text-teal-tactical">health_and_safety</span> Clinical Consult Proxy
                  </span>
<span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
<span className="material-symbols-outlined text-[13px] text-secondary">history_edu</span> Diagnostics Access
                  </span>
<span className="bg-surface-container-low text-primary text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant/30">
<span className="material-symbols-outlined text-[13px] text-teal-tactical">update</span> 2-min Fallback Relay
                  </span>
</div>
</div>
{/* Actions Strip */}
<div className="pt-5 mt-4 border-t border-outline-variant/20 flex items-center justify-between gap-2">
<button onClick={() => triggerBeacon('Priority 2 Contact (Dr. Vijay Sharma)')} className="flex-1 py-2 px-3 bg-surface-container-low hover:bg-surface-container text-primary rounded-xl font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 cursor-pointer" type="button">
<span className="material-symbols-outlined text-[16px] text-teal-tactical">cell_tower</span>
<span className="">Simulate Beacon</span>
</button>
<button onClick={() => triggerBeacon('Carrier Voice Line (+91 94440 18234)')} className="py-2 px-3 bg-surface-container-low hover:bg-surface-container text-secondary rounded-xl font-label-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-outline-variant/30 cursor-pointer" title="Direct Line Verification" type="button">
<span className="material-symbols-outlined text-[16px]">call</span>
<span className="">Test Ring</span>
</button>
<button onClick={() => navigate('/patient/settings')} className="p-2 text-on-surface-variant hover:text-primary rounded-xl hover:bg-surface-container transition-colors cursor-pointer" title="Edit Contact" type="button">
<span className="material-symbols-outlined text-[18px]">tune</span>
</button>
</div>
</div>
</div>
{/* MODULE 3 & 4: DUAL BENTO ROW (Enrollment Drawer + Ingress Policy Rules) */}

{/* MODULE 5: DISPATCH ACTIVITY LOG & AUDIT MICRO-FEED */}

</div>
</div>

    </div>
  );
}
