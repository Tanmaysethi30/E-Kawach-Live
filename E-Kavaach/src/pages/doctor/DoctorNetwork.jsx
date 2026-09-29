import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorNetwork() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');
  const [connectedState, setConnectedState] = useState({
    arvind: false,
    meera: false
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleConnect = (key, name) => {
    setConnectedState(prev => ({ ...prev, [key]: true }));
    showToast(`Connected to ${name} via ABDM Registry.`);
  };
  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Active Page Context / Nav Highlighter Script */}

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
      {/* Top Hero Header Context Panel */}
<div className="flex flex-col gap-space-sm pb-space-lg">
{/* Super-title Tag & Metric Badges Row */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-xs">
<span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold tracking-wider uppercase">
<span className="material-symbols-outlined text-[14px]">domain_verification</span>
          ABDM VERIFIED DIRECTORY • STATE CLINICIAN REGISTRY
        </span>
</div>
{/* Live Clinical Telemetry Telechips */}
<div className="flex flex-wrap items-center gap-space-xs">
<div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-[#E4E4FB] text-on-surface font-label-sm text-label-sm font-medium shadow-sm">
<span className="material-symbols-outlined text-primary text-[15px]">groups</span>
<span className="font-semibold text-primary">1,420</span> Grid Clinicians
        </div>
<div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-medium shadow-sm">
<span className="w-2 h-2 rounded-full bg-[#00A896]"></span>
<span className="font-semibold">24</span> Connected Peers
        </div>
<div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
<span className="material-symbols-outlined text-[#028090] text-[15px]">sync_alt</span>
<span className="">Inter-Hospital Sync: <strong className="text-on-surface">Active</strong></span>
</div>
</div>
</div>
{/* Title & Subtitle with Micro Visual Graphic */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
<div>
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Doctor Network</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Connect and collaborate with verified doctors across hospitals.</p>
</div>
{/* Quick Telemetry Ping pill */}
<div className="hidden md:flex items-center gap-2 px-space-md py-1.5 rounded-xl bg-surface-container-lowest shadow-sm">
<div className="flex flex-col text-right">
<span className="font-label-sm text-label-sm text-on-surface-variant">TRAUMA GRID PROTOCOL</span>
<span className="font-label-md text-label-md text-primary font-semibold">FHIR R4 / ABDM-M3 Live</span>
</div>
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">share_location</span>
</div>
</div>
</div>
</div>
{/* Search & Filter Ribbon Bar */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md mb-space-lg">
{/* Live Search Input */}
<div className="relative flex-1">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
<input className="w-full h-11 pl-11 pr-space-md bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="clinician-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, specialty, or hospital..." type="text" />
</div>
{/* Filter Chips Cluster */}
<div className="flex items-center flex-wrap gap-2">
<button onClick={() => setActiveFilter('all')} className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${activeFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'}`} type="button">
<span className="">All</span>
<span className="text-xs opacity-75">6</span>
</button>
<button onClick={() => setActiveFilter('connected')} className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${activeFilter === 'connected' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E0F7F6] text-[#006876] hover:bg-tertiary-fixed'}`} type="button">
<span className="w-1.5 h-1.5 rounded-full bg-[#028090]"></span>
<span className="">Connected</span>
</button>
<button onClick={() => setActiveFilter('hospital')} className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${activeFilter === 'hospital' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'}`} type="button">
<span className="material-symbols-outlined text-[15px] text-primary">local_hospital</span>
<span className="">Same Hospital</span>
</button>
<button onClick={() => setActiveFilter('specialty')} className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${activeFilter === 'specialty' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'}`} type="button">
<span className="material-symbols-outlined text-[15px] text-primary">medical_services</span>
<span className="">Specialty Match</span>
</button>
<button onClick={() => setActiveFilter('onduty')} className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${activeFilter === 'onduty' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'}`} type="button">
<span className="w-2 h-2 rounded-full bg-[#02C39A]"></span>
<span className="">On Duty Now</span>
</button>
</div>
</div>
{/* Main Directory Container */}
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col mb-space-lg">
{/* Directory Head Bar */}
<div className="px-space-lg py-space-md bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<span className="font-headline-sm text-headline-sm text-primary font-bold">Doctor Network Directory</span>
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
          Showing 6 verified clinicians nearby
        </span>
</div>
<div className="flex items-center gap-space-sm self-end sm:self-auto">
<div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-md font-label-md">
<span className="material-symbols-outlined text-[16px] text-primary">sort</span>
<span className="text-on-surface font-medium">Sort: Recently Active</span>
</div>
<button onClick={() => showToast('ABDM Clinician Registry synchronized (18ms).')} className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer" title="Refresh list" type="button">
<span className="material-symbols-outlined text-[18px]">refresh</span>
</button>
</div>
</div>
{/* Clinician Rows */}
<div className="flex flex-col" id="clinicians-list">
{/* Entry 1: Dr. Arjun Nair (Connected, Active) */}
<div className="clinician-row group px-space-lg py-space-lg hover:bg-surface-container-low/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest">
<div className="flex items-start sm:items-center gap-space-md min-w-0">
{/* Avatar with Active Indicator */}
<div className="relative flex-shrink-0">
<div className="w-14 h-14 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center shadow-sm">
<div className="w-full h-full min-h-[44px] rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-xs" title="Portrait photograph of Dr. Arjun Nair, male Indian senior neurologist in professional clinical attire with stethoscope, calm medical studio lighting with navy and teal subtle backdrop">PP</div>
</div>
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#02C39A] ring-2 ring-surface-container-lowest" title="On Duty / Active"></span>
</div>
{/* Doctor Meta */}
<div className="flex flex-col min-w-0">
<div className="flex flex-wrap items-center gap-space-xs mb-1">
<h3 className="font-headline-sm text-headline-sm text-primary font-bold truncate">Dr. Arjun Nair, MD, DM</h3>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E0F7F6] text-[#028090] font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></span>
                Connected
              </span>
</div>
<p className="font-body-md text-body-md text-on-surface font-medium truncate">
              Neurology &amp; Stroke Intervention <span className="text-outline mx-1">•</span> <span className="text-on-surface-variant">Fortis Grid Hub</span>
</p>
<div className="flex flex-wrap items-center gap-2 mt-2">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                NMC-55210-DL
              </span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">hub</span>
                ABDM Linked
              </span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-[#00A896]">schedule</span>
                Active 4m ago
              </span>
</div>
</div>
</div>
{/* Row Actions */}
<div className="flex items-center gap-space-sm pl-0 lg:pl-space-md self-start sm:self-auto flex-shrink-0">
<Link to="/doctor/consult" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-label-md text-label-md font-semibold px-space-xs py-1 transition-all">
<span className="material-symbols-outlined text-[16px]">open_in_new</span>
<span className="">Refer Patient</span>
</Link>
<button onClick={() => navigate('/doctor/messages')} className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg font-medium shadow-sm transition-all cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">chat_bubble</span>
<span className="">Message</span>
</button>
</div>
</div>
{/* Subtle Row Divider */}
<div className="h-[1px] bg-surface-container-high mx-space-lg"></div>
{/* Entry 2: Dr. Priya Sundaram (Connected, Active) */}
<div className="clinician-row group px-space-lg py-space-lg hover:bg-surface-container-low/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest">
<div className="flex items-start sm:items-center gap-space-md min-w-0">
<div className="relative flex-shrink-0">
<div className="w-14 h-14 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center shadow-sm">
<div className="w-full h-full min-h-[44px] rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-xs" title="Close up professional portrait of Dr. Priya Sundaram, female Indian ophthalmology and trauma microsurgeon with glasses in crisp white lab coat, confident demeanor, neutral hospital background with soft ambient lighting">CU</div>
</div>
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#02C39A] ring-2 ring-surface-container-lowest" title="On Duty / Active"></span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex flex-wrap items-center gap-space-xs mb-1">
<h3 className="font-headline-sm text-headline-sm text-primary font-bold truncate">Dr. Priya Sundaram, MS, DNB</h3>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E0F7F6] text-[#028090] font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></span>
                Connected
              </span>
</div>
<p className="font-body-md text-body-md text-on-surface font-medium truncate">
              Ophthalmology &amp; Trauma Microsurgery <span className="text-outline mx-1">•</span> <span className="text-on-surface-variant">Sankara Eye Institute</span>
</p>
<div className="flex flex-wrap items-center gap-2 mt-2">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                NMC-33891-TN
              </span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E4E4FB] text-primary font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[13px]">share</span>
                Apollo Node Partner
              </span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-[#00A896]">schedule</span>
                Active now
              </span>
</div>
</div>
</div>
<div className="flex items-center gap-space-sm pl-0 lg:pl-space-md self-start sm:self-auto flex-shrink-0">
<button onClick={() => navigate('/doctor/messages')} className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg font-medium shadow-sm transition-all cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">chat_bubble</span>
<span className="">Message</span>
</button>
</div>
</div>
{/* Subtle Row Divider */}
<div className="h-[1px] bg-surface-container-high mx-space-lg"></div>
{/* Entry 3: Dr. Arvind Swaminathan (Not Connected, Active, Same Hospital) */}
<div className="clinician-row group px-space-lg py-space-lg hover:bg-surface-container-low/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest">
<div className="flex items-start sm:items-center gap-space-md min-w-0">
<div className="relative flex-shrink-0">
<div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container flex items-center justify-center shadow-sm">
<div className="w-full h-full min-h-[44px] rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-xs" title="Portrait photo of Dr. Arvind Swaminathan, male Indian endocrinologist with salt and pepper hair in modern hospital consultation room, warm clinical setting, clean navy blue tone gradient background">PP</div>
</div>
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#02C39A] ring-2 ring-surface-container-lowest" title="On Duty / Active"></span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex flex-wrap items-center gap-space-xs mb-1">
<h3 className="font-headline-sm text-headline-sm text-primary font-bold truncate">Dr. Arvind Swaminathan, MD</h3>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E4E4FB] text-on-surface-variant font-label-sm text-label-sm font-semibold">
                Not Connected
              </span>
</div>
<p className="font-body-md text-body-md text-on-surface font-medium truncate">
              Endocrinology &amp; Diabetic Foot Trauma <span className="text-outline mx-1">•</span> <span className="text-on-surface-variant">Apollo Main Greams</span>
</p>
<div className="flex flex-wrap items-center gap-2 mt-2">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                NMC-18492-TN
              </span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E4E4FB] text-primary font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[13px]">apartment</span>
                Same Hospital
              </span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-[#00A896]">medical_services</span>
                Floor 4 • Bay 12
              </span>
</div>
</div>
</div>
<div className="flex items-center gap-space-sm pl-0 lg:pl-space-md self-start sm:self-auto flex-shrink-0">
<button onClick={() => handleConnect('arvind', 'Dr. Arvind Swaminathan')} className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-medium shadow-sm transition-all cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">{connectedState.arvind ? 'check' : 'person_add'}</span>
<span className="">{connectedState.arvind ? 'Connected' : 'Connect'}</span>
</button>
</div>
</div>
{/* Subtle Row Divider */}
<div className="h-[1px] bg-surface-container-high mx-space-lg"></div>
{/* Entry 4: Dr. Siddharth Mukherjee (Connected) */}
<div className="clinician-row group px-space-lg py-space-lg hover:bg-surface-container-low/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest">
<div className="flex items-start sm:items-center gap-space-md min-w-0">
<div className="relative flex-shrink-0">
<div className="w-14 h-14 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center shadow-sm">
<div className="w-full h-full min-h-[44px] rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-xs" title="Editorial medical portrait of Dr. Siddharth Mukherjee, male cardiothoracic surgeon in sterile teal surgical scrubs holding surgical mask, focused confident expression, soft clinic lighting">EM</div>
</div>
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#02C39A] ring-2 ring-surface-container-lowest" title="On Duty / Active"></span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex flex-wrap items-center gap-space-xs mb-1">
<h3 className="font-headline-sm text-headline-sm text-primary font-bold truncate">Dr. Siddharth Mukherjee, MCh</h3>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E0F7F6] text-[#028090] font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></span>
                Connected
              </span>
</div>
<p className="font-body-md text-body-md text-on-surface font-medium truncate">
              Cardiothoracic &amp; Vascular Surgery <span className="text-outline mx-1">•</span> <span className="text-on-surface-variant">AIIMS Trauma Center</span>
</p>
<div className="flex flex-wrap items-center gap-2 mt-2">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                NMC-92014-ND
              </span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">bolt</span>
                ABDM Fast-Track
              </span>
</div>
</div>
</div>
<div className="flex items-center gap-space-sm pl-0 lg:pl-space-md self-start sm:self-auto flex-shrink-0">
<button onClick={() => navigate('/doctor/messages')} className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg font-medium shadow-sm transition-all cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">chat_bubble</span>
<span className="">Message</span>
</button>
</div>
</div>
{/* Subtle Row Divider */}
<div className="h-[1px] bg-surface-container-high mx-space-lg"></div>
{/* Entry 5: Dr. Meera Nambiar (Not Connected) */}
<div className="clinician-row group px-space-lg py-space-lg hover:bg-surface-container-low/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest">
<div className="flex items-start sm:items-center gap-space-md min-w-0">
<div className="relative flex-shrink-0">
<div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container flex items-center justify-center text-primary font-headline-sm text-headline-sm font-bold shadow-sm">
              MN
            </div>
</div>
<div className="flex flex-col min-w-0">
<div className="flex flex-wrap items-center gap-space-xs mb-1">
<h3 className="font-headline-sm text-headline-sm text-primary font-bold truncate">Dr. Meera Nambiar, MD, FRCP</h3>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E4E4FB] text-on-surface-variant font-label-sm text-label-sm font-semibold">
                Not Connected
              </span>
</div>
<p className="font-body-md text-body-md text-on-surface font-medium truncate">
              Emergency Critical Care &amp; Resuscitation <span className="text-outline mx-1">•</span> <span className="text-on-surface-variant">Stanley Medical College</span>
</p>
<div className="flex flex-wrap items-center gap-2 mt-2">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                NMC-77124-TN
              </span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">shield</span>
                State Trauma Panel
              </span>
</div>
</div>
</div>
<div className="flex items-center gap-space-sm pl-0 lg:pl-space-md self-start sm:self-auto flex-shrink-0">
<button className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-medium shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">person_add</span>
<span className="">Connect</span>
</button>
</div>
</div>
{/* Subtle Row Divider */}
<div className="h-[1px] bg-surface-container-high mx-space-lg"></div>
{/* Entry 6: Dr. Rajesh K. Varma, MS (Not Connected) */}
<div className="clinician-row group px-space-lg py-space-lg hover:bg-surface-container-low/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest">
<div className="flex items-start sm:items-center gap-space-md min-w-0">
<div className="relative flex-shrink-0">
<div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container flex items-center justify-center text-primary font-headline-sm text-headline-sm font-bold shadow-sm">
              RV
            </div>
</div>
<div className="flex flex-col min-w-0">
<div className="flex flex-wrap items-center gap-space-xs mb-1">
<h3 className="font-headline-sm text-headline-sm text-primary font-bold truncate">Dr. Rajesh K. Varma, MS</h3>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E4E4FB] text-on-surface-variant font-label-sm text-label-sm font-semibold">
                Not Connected
              </span>
</div>
<p className="font-body-md text-body-md text-on-surface font-medium truncate">
              Orthopedic Trauma &amp; Spine <span className="text-outline mx-1">•</span> <span className="text-on-surface-variant">MIOT International</span>
</p>
<div className="flex flex-wrap items-center gap-2 mt-2">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                NMC-61029-TN
              </span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[13px]">location_city</span>
                Zone 3 Trauma Cluster
              </span>
</div>
</div>
</div>
<div className="flex items-center gap-space-sm pl-0 lg:pl-space-md self-start sm:self-auto flex-shrink-0">
<button className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-medium shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">person_add</span>
<span className="">Connect</span>
</button>
</div>
</div>
</div>
</div>
{/* Informative Empty / No Results Preview Banner Component */}
<div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-[#E4E4FB] text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[24px]">person_search</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-primary font-bold">No doctors found matching your search?</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Try adjusting your specialty or hospital filters, or invite an unlisted clinician to the E-KAVACH registry.</span>
</div>
</div>
<div className="flex items-center gap-space-sm flex-shrink-0">
<button className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container-high font-label-lg text-label-lg font-medium shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">restart_alt</span>
<span className="">Reset Filters</span>
</button>
<button className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg font-medium shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">mail</span>
<span className="">Send ABDM Invite</span>
</button>
</div>
</div>
{/* Interactive Client-side Script for Instant Filtering */}

</div>
    </div>
  );
}
