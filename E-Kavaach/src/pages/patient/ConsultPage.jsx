import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ConsultPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activePatient, setActivePatient] = useState('RS');
  const [toastMsg, setToastMsg] = useState('');
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'patient',
      name: 'Rajesh V. Sharma',
      time: '08:42 AM',
      text: "Good morning Dr. Menon. I've logged my fasting BP and sugar readings for the last 3 days as requested. The morning BP was 138/86 and post-prandial was 142. Felt slight heaviness after stairs yesterday.",
      hasAttachment: true,
      deliveredStatus: 'Delivered to Trauma Station'
    },
    {
      id: 2,
      sender: 'doctor',
      name: 'Dr. Kavitha Menon (You)',
      time: '08:50 AM',
      text: "Thanks Rajesh. The systolic reading is trending in an acceptable range post-stent, but let's monitor that exertion heaviness closely. I am ordering a light adjustment to your Metformin and continuing the Rosuvastatin 10mg.",
      hasRx: true,
      readStatus: 'Read by Patient'
    },
    {
      id: 3,
      sender: 'patient',
      name: 'Rajesh V. Sharma',
      time: '09:05 AM',
      text: 'Understood Doctor. Will adhere to the dosage. Should we schedule the follow-up echo next week?'
    }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSendMessage = (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : replyText).trim();
    if (!text) return;
    const newMsg = {
      id: Date.now(),
      sender: 'doctor',
      name: 'Dr. Kavitha Menon (You)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text,
      readStatus: 'Sent • Synced with ABDM'
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyText('');
    showToast('Clinical directive transmitted securely.');
  };

  const handleDirectiveClick = (directiveText) => {
    handleSendMessage(directiveText);
  };
  return (
    <div className="w-full">
      <div className="flex flex-col w-full h-[calc(100vh-5.5rem)]">
{/* Top Level Sub-Header Bar (Trauma OS Status & Patient Filter Tracker) */}
<div className="flex flex-wrap items-center justify-between pb-space-sm gap-y-2">
<div className="flex items-center gap-space-sm">
<div className="flex items-center gap-2 px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-container">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
</span>
<span className="font-label-sm text-label-sm font-semibold tracking-wide uppercase">Trauma OS v4.2 • Greams Trauma Hub</span>
</div>
<span className="text-on-surface-variant font-label-sm text-label-sm tracking-wider">CHIEF CARDIOLOGY WORKSPACE</span>
</div>
<div className="flex items-center gap-space-sm">
<div className="hidden xl:flex items-center gap-2 px-space-sm py-1 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
<span className="">ABDM Digital Health Grid: Synchronized (18ms)</span>
</div>
<button onClick={() => showToast('ABDM Digital Health Grid: Feed refreshed & synchronized.')} className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">sync</span>
<span className="">Refresh Feed</span>
</button>
</div>
</div>
{toastMsg && (
          <div className="mb-2 p-2.5 rounded-lg bg-secondary-container text-on-secondary-container font-label-md text-sm flex items-center justify-between shadow-sm transition-all animate-fade-in">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              {toastMsg}
            </span>
            <button onClick={() => setToastMsg('')} className="text-on-secondary-container hover:opacity-75">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
        {/* Master-Detail 2-Column Clinical Workspace Container */}
<div className="grid grid-cols-12 gap-space-md flex-1 min-h-0">
{/* LEFT COLUMN: Patient Conversations Directory */}
<section className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden min-h-0">
{/* Master List Header & Filter Tabs */}
<div className="p-space-md bg-surface-container-lowest flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Consultations</span>
<span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">12</span>
</div>
<button aria-label="Compose new directive" className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary flex items-center justify-center transition-colors">
<span className="material-symbols-outlined text-[20px]">edit_square</span>
</button>
</div>
{/* Filter Segment Chips */}
<div className="flex items-center gap-1.5 overflow-x-auto py-1 text-nowrap">
<button onClick={() => setActiveFilter('all')} className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-medium transition-all ${activeFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'}`}>All (12)</button>
<button onClick={() => setActiveFilter('active')} className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1 ${activeFilter === 'active' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'}`}>
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            Active (3)
          </button>
<button onClick={() => setActiveFilter('unread')} className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm transition-all ${activeFilter === 'unread' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'}`}>Unread (4)</button>
<button onClick={() => setActiveFilter('post-op')} className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm transition-all ${activeFilter === 'post-op' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'}`}>Post-Op</button>
</div>
</div>
{/* Conversations Scrollable Feed */}
<div className="flex-1 overflow-y-auto divide-y divide-surface-container">
{/* Active Item: Rajesh V. Sharma */}
<article className="p-space-sm bg-surface-container-low/70 relative cursor-pointer transition-colors flex items-start gap-space-xs">
{/* Active Marker Indicator Strip */}
<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary rounded-r"></div>
<div className="relative flex-shrink-0 ml-1">
<div className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm font-semibold shadow-sm">
              RS
            </div>
<span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary-fixed-dim ring-2 ring-surface-container-lowest"></span>
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between gap-1">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">Rajesh V. Sharma</span>
<span className="font-label-sm text-label-sm text-secondary font-semibold">09:05 AM</span>
</div>
<div className="font-label-sm text-label-sm font-mono text-on-surface-variant truncate">ABHA-9824-8819-TN</div>
<p className="font-body-sm text-body-sm text-on-surface line-clamp-1 mt-0.5 font-medium">Understood Doctor. Will adhere to the dosage. Should we...</p>
<div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                Active Consult
              </span>
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">LAD Stent D-14</span>
</div>
</div>
</article>
{/* Patient 2: Meenakshi Sunder */}
<article className="p-space-sm hover:bg-surface-container-low/50 cursor-pointer transition-colors flex items-start gap-space-xs">
<div className="relative flex-shrink-0 ml-1">
<div className="w-11 h-11 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-headline-sm font-semibold">
              MS
            </div>
<span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-outline-variant ring-2 ring-surface-container-lowest"></span>
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between gap-1">
<span className="font-label-lg text-label-lg font-semibold text-on-surface truncate">Meenakshi Sunder</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Yesterday</span>
</div>
<div className="font-label-sm text-label-sm font-mono text-on-surface-variant truncate">ABHA-1102-4491-TN</div>
<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">INR level returned at 2.4. Continuing Warfarin 4mg as...</p>
<div className="mt-1.5 flex items-center gap-1.5">
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">Warfarin Protocol</span>
</div>
</div>
</article>
{/* Patient 3: Anandhan Krishnan (Unread Alert) */}
<article className="p-space-sm hover:bg-surface-container-low/50 cursor-pointer transition-colors flex items-start gap-space-xs">
<div className="relative flex-shrink-0 ml-1">
<div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-sm font-semibold">
              AK
            </div>
<span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary-fixed-dim ring-2 ring-surface-container-lowest"></span>
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between gap-1">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">Anandhan Krishnan</span>
<span className="font-label-sm text-label-sm text-primary font-bold">Yesterday</span>
</div>
<div className="font-label-sm text-label-sm font-mono text-on-surface-variant truncate">ABHA-7741-2093-TN</div>
<p className="font-body-sm text-body-sm text-on-surface font-semibold line-clamp-1 mt-0.5">Uploaded Holter Monitor report 48-hr trace summary.</p>
<div className="mt-1.5 flex items-center justify-between">
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">Post-Angio Followup</span>
<span className="w-4 h-4 rounded-full bg-primary text-on-primary font-label-sm text-[10px] flex items-center justify-center font-bold">1</span>
</div>
</div>
</article>
{/* Patient 4: Divya Balachandar */}
<article className="p-space-sm hover:bg-surface-container-low/50 cursor-pointer transition-colors flex items-start gap-space-xs">
<div className="relative flex-shrink-0 ml-1">
<div className="w-11 h-11 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-headline-sm font-semibold">
              DB
            </div>
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between gap-1">
<span className="font-label-lg text-label-lg font-medium text-on-surface truncate">Divya Balachandar</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Oct 21</span>
</div>
<div className="font-label-sm text-label-sm font-mono text-on-surface-variant truncate">ABHA-5529-6102-TN</div>
<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">Discharge summary signed and sent to primary caregiver.</p>
<div className="mt-1.5">
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">Closed Triage</span>
</div>
</div>
</article>
</div>
</section>
{/* RIGHT MAIN COLUMN: Clinical Detail Workspace */}
<div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden min-h-0">
{/* 1. Detail Chat Header */}
<header className="p-space-md bg-surface-container-lowest flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm min-w-0">
<div className="relative flex-shrink-0">
<div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-md font-bold ring-2 ring-secondary">
              RS
            </div>
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-tertiary-fixed-dim ring-2 ring-surface-container-lowest"></span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex items-center gap-2 flex-wrap">
<h1 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">Rajesh V. Sharma</h1>
<span className="font-label-sm text-label-sm font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">ABHA-9824-8819-TN</span>
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                Active Consult
              </span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant mt-0.5">
              Apollo Greams Trauma Hub • Cardiology Bed Ward 4B • Attending: Dr. Kavitha Menon
            </span>
</div>
</div>
{/* Top-Right Action Cluster */}
<div className="flex items-center gap-space-xs">
{/* ABDM Teleconsult Video Button */}
<button onClick={() => navigate('/patient/consultation')} className="flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md font-semibold transition-all shadow-sm" title="Start ABDM Teleconsult" type="button">
<span className="material-symbols-outlined text-[18px]">videocam</span>
<span className="hidden sm:inline">Start ABDM Teleconsult</span>
</button>
{/* View EHR Chart Button */}
<button onClick={() => navigate('/doctor/patient-history')} className="flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md font-semibold transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">clinical_notes</span>
<span className="hidden md:inline">View Full Chart</span>
<span className="material-symbols-outlined text-[14px]">open_in_new</span>
</button>
{/* Overflow Dropdown Menu Trigger */}
<div className="relative" id="action-dropdown-container">
<button aria-label="More options" className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors" id="overflow-menu-btn" onClick={() => setMenuOpen(!menuOpen)} type="button">
<span className="material-symbols-outlined text-[20px]">more_vert</span>
</button>
{/* Context Menu Flyout (Managed via vanilla JS) */}
<div id="overflow-dropdown-menu" className={`absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-xl p-1 z-50 ${menuOpen ? "block" : "hidden"}`}>
<button onClick={() => setMenuOpen(false)} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors" type="button">
<span className="material-symbols-outlined text-[18px] text-secondary">post_add</span>
<span className="">Add Clinical Note</span>
</button>
<button onClick={() => setMenuOpen(false)} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors" type="button">
<span className="material-symbols-outlined text-[18px] text-primary">swap_horiz</span>
<span className="">Transfer Trauma Bay</span>
</button>
<div className="my-1 h-px bg-surface-container"></div>
<button onClick={() => setMenuOpen(false)} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors" type="button">
<span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
<span className="">End Consult Session</span>
</button>
</div>
</div>
</div>
</header>
{/* 2. Patient Snapshot Strip (Doctor Triage Bar) */}
<section className="bg-surface-container-low px-space-md py-2.5 flex flex-wrap items-center justify-between gap-y-2 text-on-surface shadow-inner">
<div className="flex flex-wrap items-center gap-x-space-md gap-y-1">
{/* Blood Group */}
<div className="flex items-center gap-1.5">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Blood:</span>
<span className="font-label-md text-label-md font-bold text-on-surface">O+ (Rh Pos)</span>
</div>
<div className="hidden sm:block w-px h-3.5 bg-outline-variant/50"></div>
{/* Critical Allergy Badge (STRICT EXCLUSION RULE COMPLIED: ONLY PLACE FOR RED ACCENT) */}
<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container">
<span className="material-symbols-outlined text-[15px] text-error font-bold">warning</span>
<span className="font-label-sm text-label-sm font-bold tracking-wide">Severe Allergy: Penicillin &amp; Ceph</span>
</div>
<div className="hidden md:block w-px h-3.5 bg-outline-variant/50"></div>
{/* Chronic Conditions */}
<div className="flex items-center gap-1.5">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Conditions:</span>
<span className="font-label-sm text-label-sm text-on-surface font-medium">Type II DM (Insulin) • Post-PTCA (LAD Day 14)</span>
</div>
<div className="hidden lg:block w-px h-3.5 bg-outline-variant/50"></div>
{/* Latest Vitals Telemetry */}
<div className="flex items-center gap-1.5">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Vitals (Logged 08:30):</span>
<span className="font-label-sm text-label-sm font-mono font-semibold text-secondary">BP 138/86 • HR 74 • SpO2 98%</span>
</div>
</div>
<Link to="/doctor/patient-history" className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-secondary hover:text-primary transition-colors ml-auto">
<span className="">View Full EHR Chart</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</section>
{/* 3. Message Thread (Scrollable clinical discussion) */}
<div className="flex-1 overflow-y-auto p-space-md space-y-space-md bg-surface" id="messages-container">
{/* Date Separator */}
<div className="flex items-center justify-center my-space-xs">
<span className="px-space-md py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold tracking-wide">
            Today • 24 October 2026
          </span>
</div>
{/* 3A. Patient Message (Left-aligned) */}
<div className="flex flex-col items-start max-w-2xl">
<div className="flex items-center gap-2 mb-1 px-1">
<span className="font-label-sm text-label-sm font-bold text-on-surface">Rajesh V. Sharma</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">08:42 AM</span>
</div>
<div className="p-space-md rounded-2xl rounded-tl-sm bg-surface-container text-on-surface shadow-sm">
<p className="font-body-md text-body-md leading-relaxed">
              Good morning Dr. Menon. I've logged my fasting BP and sugar readings for the last 3 days as requested. The morning BP was 138/86 and post-prandial was 142. Felt slight heaviness after stairs yesterday.
            </p>
{/* Attached Report Card inside Patient Bubble */}
<div className="mt-space-sm p-space-sm rounded-xl bg-surface-container-lowest flex items-center justify-between gap-space-sm shadow-sm">
<div className="flex items-center gap-space-xs min-w-0">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
<span className="material-symbols-outlined text-[24px]">description</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md font-bold text-on-surface truncate">BP_Sugar_Log_Oct24.pdf</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">1.2 MB • ABDM Synced Telemetry</span>
</div>
</div>
<button onClick={() => showToast('Opening BP_Sugar_Log_Oct24.pdf in secure ABDM viewer...')} className="px-space-sm py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 flex-shrink-0" type="button">
<span className="material-symbols-outlined text-[16px]">visibility</span>
<span className="">Preview</span>
</button>
</div>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant mt-1 px-1">Delivered to Trauma Station</span>
</div>
{/* 3B. Doctor Message (Right-aligned, Dr. Kavitha Menon) */}
<div className="flex flex-col items-end max-w-2xl ml-auto">
<div className="flex items-center gap-2 mb-1 px-1">
<span className="font-label-sm text-label-sm text-on-surface-variant">08:50 AM</span>
<span className="font-label-sm text-label-sm font-bold text-primary">Dr. Kavitha Menon (You)</span>
</div>
<div className="p-space-md rounded-2xl rounded-tr-sm bg-primary text-on-primary shadow-md">
<p className="font-body-md text-body-md leading-relaxed text-on-primary">
              Thanks Rajesh. The systolic reading is trending in an acceptable range post-stent, but let's monitor that exertion heaviness closely. I am ordering a light adjustment to your Metformin and continuing the Rosuvastatin 10mg.
            </p>
{/* Embedded Clinical Prescription Card */}
<div className="mt-space-sm p-space-sm rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-between gap-space-sm shadow-sm">
<div className="flex items-center gap-space-xs min-w-0">
<div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[24px]">medication</span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex items-center gap-2">
<span className="font-label-md text-label-md font-bold text-on-surface">Digital Rx #EK-RX-99412</span>
<span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] font-bold">SIGNED</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant truncate">Rosuvastatin 10mg + Ecosprin 75mg (30-Day Refill)</span>
</div>
</div>
<button onClick={() => showToast('Digital Rx #EK-RX-99412 verified with ABDM cryptographic signature.')} className="px-space-sm py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 flex-shrink-0" type="button">
<span className="">View Rx</span>
<span className="material-symbols-outlined text-[16px]">assignment</span>
</button>
</div>
</div>
<div className="flex items-center gap-1 mt-1 px-1 font-label-sm text-label-sm text-secondary font-medium">
<span className="material-symbols-outlined text-[14px]">done_all</span>
<span className="">Read by Patient</span>
</div>
</div>
{/* 3C. Patient Response (Left-aligned) */}
<div className="flex flex-col items-start max-w-2xl">
<div className="flex items-center gap-2 mb-1 px-1">
<span className="font-label-sm text-label-sm font-bold text-on-surface">Rajesh V. Sharma</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">09:05 AM</span>
</div>
<div className="p-space-md rounded-2xl rounded-tl-sm bg-surface-container text-on-surface shadow-sm">
<p className="font-body-md text-body-md leading-relaxed">
              Understood Doctor. Will adhere to the dosage. Should we schedule the follow-up echo next week?
            </p>
</div>
</div>
{messages.slice(3).map((m) => (
  <div key={m.id} className="flex flex-col items-end max-w-2xl ml-auto animate-fade-in">
    <div className="flex items-center gap-2 mb-1 px-1">
      <span className="font-label-sm text-label-sm text-on-surface-variant">{m.time}</span>
      <span className="font-label-sm text-label-sm font-bold text-primary">{m.name}</span>
    </div>
    <div className="p-space-md rounded-2xl rounded-tr-sm bg-primary text-on-primary shadow-md">
      <p className="font-body-md text-body-md leading-relaxed text-on-primary">
        {m.text}
      </p>
    </div>
    {m.readStatus && (
      <div className="flex items-center gap-1 mt-1 px-1 font-label-sm text-label-sm text-secondary font-medium">
        <span className="material-symbols-outlined text-[14px]">done_all</span>
        <span>{m.readStatus}</span>
      </div>
    )}
  </div>
))}
</div>
{/* 4. Quick Actions Bar (Clinical shortcuts above input) */}
<div className="px-space-md py-2 bg-surface-container-low flex items-center gap-2 overflow-x-auto text-nowrap">
<span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mr-1">Directives:</span>
<button onClick={() => handleDirectiveClick('Clinical Directive: Updated prescription dispatched to pharmacy portal.')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-colors" type="button">
<span className="material-symbols-outlined text-[16px] text-secondary">medication</span>
<span className="">+ Send Prescription</span>
</button>
<button onClick={() => handleDirectiveClick('Clinical Directive: Please log your fasting BP and pulse telemetry today.')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-colors" type="button">
<span className="material-symbols-outlined text-[16px] text-secondary">monitoring</span>
<span className="">Request Vitals Update</span>
</button>
<button onClick={() => handleDirectiveClick('Clinical Directive: Follow-up 2D Echo booked for next Tuesday at 10:00 AM.')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-colors" type="button">
<span className="material-symbols-outlined text-[16px] text-secondary">calendar_add_on</span>
<span className="">Schedule Follow-up Echo</span>
</button>
<button onClick={() => handleDirectiveClick('Critical Alert: Case flagged for immediate attending review in Bay Ward 4B.')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-colors" type="button">
<span className="material-symbols-outlined text-[16px] text-secondary">emergency</span>
<span className="">Escalate to Bay Ward 4B</span>
</button>
</div>
{/* 5. Message Input Bar & Compliance Footer */}
<footer className="p-space-md bg-surface-container-lowest flex flex-col gap-space-2xs">
<div className="flex items-center gap-space-xs">
{/* Attachment action buttons */}
<div className="flex items-center gap-1">
<button onClick={() => showToast('DICOM / Lab telemetry file picker opened.')} className="w-10 h-10 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors" title="Attach Lab/DICOM" type="button">
<span className="material-symbols-outlined text-[20px]">attach_file</span>
</button>
<button onClick={() => showToast('Prescription macros library loaded.')} className="w-10 h-10 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors" title="Prescription Macros" type="button">
<span className="material-symbols-outlined text-[20px]">prescriptions</span>
</button>
</div>
{/* Main Text Input */}
<div className="flex-1 relative">
<input 
    value={replyText}
    onChange={(e) => setReplyText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }}
    className="w-full h-11 px-4 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container transition-all" 
    id="clinical-reply-input" 
    placeholder="Type a clinical directive or reply to Rajesh V. Sharma... (Enter to send, Shift+Enter for new line)" 
    type="text" 
  />
</div>
{/* Action Buttons */}
<div className="flex items-center gap-2 flex-shrink-0">
<button onClick={() => handleSendMessage()} className="h-11 px-4 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-semibold flex items-center gap-2 transition-all shadow-sm" id="send-directive-btn" type="button">
<span className="">Send</span>
<span className="material-symbols-outlined text-[18px]">send</span>
</button>
<button onClick={() => navigate('/patient/consultation')} className="hidden sm:flex h-11 px-3.5 rounded-lg bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container font-label-md text-label-md font-semibold items-center gap-1.5 transition-all cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">videocam</span>
<span className="">Encrypted Call</span>
</button>
</div>
</div>
{/* Compliance & Cryptographic Signoff Strip */}
<div className="flex flex-wrap items-center justify-between text-on-surface-variant font-label-sm text-[11px] pt-1">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-secondary">enhanced_encryption</span>
<span className="">ABDM End-to-End Encrypted Clinical Teleconsultation Protocol v2.4 • ISO 27799 / DISHA Compliant</span>
</div>
<div className="font-mono">
            NMC Token MD-44912-TN • Validated
          </div>
</div>
</footer>
</div>
</div>
</div>

    </div>
  );
}
