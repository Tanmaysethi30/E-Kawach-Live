import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorMessages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const conversations = [
    {
      id: 'rajesh',
      initials: 'RS',
      name: 'Rajesh V. Sharma',
      abha: 'ABHA: 9824-8819-TN',
      badge: 'Active Consult',
      badgeColor: 'bg-[#E0F7F6] text-[#028090]',
      dotColor: 'bg-[#00A896]',
      message: 'Doctor, I logged my fasting BP for the last 3 days as requested (138/86). Should I continue the same Metformin dose?',
      tag: 'Post-Angioplasty Follow-up',
      tagIcon: 'favorite',
      timeText: 'Just now',
      timeColor: 'text-[#006876] font-bold',
      isOnline: true,
      hasVideo: true,
      isActive: true,
      isUnread: false,
      isFollowup: true
    },
    {
      id: 'meenakshi',
      initials: 'MS',
      name: 'Meenakshi Sundaram',
      abha: 'ABHA: 9845-6612-TN',
      badge: 'Active Consult',
      badgeColor: 'bg-[#E0F7F6] text-[#028090]',
      dotColor: 'bg-[#00A896]',
      message: "Sent the treadmill ECG PDF report from yesterday's session. Heart rate peaked at 142 bpm.",
      tag: 'Cardiac Diagnostic Lab',
      tagIcon: 'monitor_heart',
      timeText: '14m ago',
      timeColor: 'text-on-surface-variant',
      unreadBadge: 'Unread',
      isOnline: true,
      hasVideo: true,
      isActive: true,
      isUnread: true,
      isFollowup: false
    },
    {
      id: 'vikramaditya',
      initials: 'VS',
      name: 'Vikramaditya Sen',
      abha: 'ABHA: 9112-5509-WB',
      badge: 'Active Consult',
      badgeColor: 'bg-[#E0F7F6] text-[#028090]',
      dotColor: 'bg-[#00A896]',
      message: 'Prescription refill received at Apollo Pharmacy, thank you Dr. Menon.',
      tag: 'Hypertension Review',
      tagIcon: 'vital_signs',
      timeText: '1h ago',
      timeColor: 'text-on-surface-variant',
      isOnline: false,
      hasVideo: true,
      isActive: true,
      isUnread: false,
      isFollowup: true
    },
    {
      id: 'lakshmi',
      initials: 'LN',
      name: 'Smt. Lakshmi Narayanan',
      abha: 'ABHA: 8901-4471-TN',
      badge: null,
      message: 'Pacemaker telemetry report successfully transmitted to Bay 3 monitor.',
      tag: 'Pacemaker Telemetry',
      tagIcon: 'medical_information',
      timeText: '3h ago',
      timeColor: 'text-on-surface-variant',
      isOnline: true,
      hasVideo: false,
      isActive: false,
      isUnread: false,
      isFollowup: false
    },
    {
      id: 'harish',
      initials: 'HV',
      name: 'Harish K. Varma',
      abha: 'ABHA: 7810-9011-AP',
      badge: null,
      message: 'Pre-op echo clearance paperwork submitted to admissions desk.',
      tag: 'Pre-Op Clearance',
      tagIcon: 'assignment_turned_in',
      timeText: 'Yesterday',
      timeColor: 'text-on-surface-variant',
      isOnline: false,
      hasVideo: false,
      isActive: false,
      isUnread: false,
      isFollowup: false
    },
    {
      id: 'anand',
      initials: 'RP',
      name: 'Anand R. Patel',
      abha: 'ABHA: 9812-4410-TN',
      badge: null,
      message: 'Consultation summary saved in ABHA locker. Scheduling stitch removal.',
      tag: 'Post-Op Review',
      tagIcon: 'healing',
      timeText: '24 Oct',
      timeColor: 'text-on-surface-variant',
      isOnline: false,
      hasVideo: false,
      isActive: false,
      isUnread: false,
      isFollowup: true
    }
  ];

  const filteredConversations = conversations.filter(c => {
    if (activeFilter === 'active' && !c.isActive) return false;
    if (activeFilter === 'unread' && !c.isUnread) return false;
    if (activeFilter === 'followup' && !c.isFollowup) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.abha.toLowerCase().includes(q) || c.message.toLowerCase().includes(q);
    }
    return true;
  });

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

      <div className="flex flex-col w-full">
        {/* Top Header */}
        <div className="flex flex-col gap-space-sm pb-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-[#E4E4FB] text-primary font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                ABDM ENCRYPTED TELEHEALTH • CHAT &amp; VIDEO HUB
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-xs">
              <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-medium shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00A896]"></span>
                <span className="font-semibold">3</span> Active Consults
              </div>
              <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium">
                <span className="material-symbols-outlined text-primary text-[15px]">chat</span>
                <span className="font-semibold text-primary">12</span> Total Threads
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Messages</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Chat or video call with your patients.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-space-md py-1.5 rounded-xl bg-surface-container-lowest shadow-sm">
              <div className="flex flex-col text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">TELEMED PROTOCOL</span>
                <span className="font-label-md text-label-md text-primary font-semibold">ABDM E-SANJEEVANI V2.4 • 256-BIT E2EE</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md mb-space-lg">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-space-md bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" 
              id="messages-search" 
              placeholder="Search patient conversations..." 
              type="text" 
            />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${activeFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'}`} 
              type="button"
            >
              <span>All</span>
              <span className="text-xs opacity-75">(12)</span>
            </button>
            <button 
              onClick={() => setActiveFilter('active')}
              className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${activeFilter === 'active' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E0F7F6] text-[#006876] hover:bg-tertiary-fixed'}`} 
              type="button"
            >
              <span className="w-2 h-2 rounded-full bg-[#02C39A]"></span>
              <span>Active Consults</span>
              <span className="text-xs opacity-75">(3)</span>
            </button>
            <button 
              onClick={() => setActiveFilter('unread')}
              className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${activeFilter === 'unread' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'}`} 
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">mark_chat_unread</span>
              <span>Unread</span>
              <span className="text-xs opacity-75">(4)</span>
            </button>
            <button 
              onClick={() => setActiveFilter('followup')}
              className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${activeFilter === 'followup' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'}`} 
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">sync</span>
              <span>Follow-ups</span>
            </button>
          </div>
        </div>

        {/* Directory List Container */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col mb-space-lg">
          <div className="px-space-lg py-space-md bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">Patient Conversations</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                {filteredConversations.length} threads showing
              </span>
            </div>
            <div className="flex items-center gap-space-sm self-end sm:self-auto">
              <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-md font-label-md shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">sort</span>
                <span className="text-on-surface font-medium">Sort: Most Recent</span>
              </div>
              <button 
                onClick={() => showToast('ABDM clinical messages synchronized (16ms).')}
                className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-primary shadow-sm transition-all cursor-pointer" 
                title="Refresh list" 
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col" id="messages-list">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm font-body-md">
                No patient conversations match your filter or search.
              </div>
            ) : (
              filteredConversations.map((c, idx) => (
                <React.Fragment key={c.id}>
                  {idx > 0 && <div className="h-[1px] bg-surface-container-high mx-space-lg"></div>}
                  <div className="px-space-lg py-space-lg hover:bg-surface-container-low/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest animate-fade-in">
                    <div className="flex items-start sm:items-center gap-space-md min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center text-primary font-headline-sm text-headline-sm font-bold shadow-sm">
                          {c.initials}
                        </div>
                        <span 
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-surface-container-lowest ${c.isOnline ? 'bg-[#02C39A]' : 'bg-outline-variant'}`} 
                          title={c.isOnline ? 'Online' : 'Offline'}
                        ></span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-space-xs mb-1">
                          <h3 className="font-headline-sm text-headline-sm text-primary font-bold truncate">{c.name}</h3>
                          {c.isOnline && <span className="w-2 h-2 rounded-full bg-[#02C39A]"></span>}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E4E4FB] text-primary font-label-sm text-label-sm font-semibold">
                            {c.abha}
                          </span>
                          {c.badge && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${c.badgeColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${c.dotColor}`}></span>
                              {c.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface font-medium line-clamp-1">{c.message}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                            <span className="material-symbols-outlined text-[13px] text-primary">{c.tagIcon}</span>
                            {c.tag}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-sm pl-0 lg:pl-space-md self-start sm:self-auto flex-shrink-0">
                      <div className="flex flex-col items-end mr-2">
                        <span className={`text-body-sm font-body-sm ${c.timeColor}`}>{c.timeText}</span>
                        {c.unreadBadge ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#E0F7F6] text-[#028090] text-label-sm font-label-sm font-semibold mt-0.5">
                            {c.unreadBadge}
                          </span>
                        ) : (
                          c.isOnline && <span className="w-2 h-2 rounded-full bg-[#02C39A] mt-1"></span>
                        )}
                      </div>

                      {c.hasVideo ? (
                        <button 
                          onClick={() => navigate('/doctor/consultation')}
                          className="w-10 h-10 rounded-full bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center shadow-sm transition-all cursor-pointer" 
                          title="Join Video Consult" 
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px]">videocam</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate('/doctor/consult')}
                          className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center shadow-sm transition-all cursor-pointer" 
                          title="Open Chat" 
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                        </button>
                      )}

                      <button 
                        onClick={() => navigate('/doctor/consult')}
                        className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg font-medium shadow-sm transition-all cursor-pointer" 
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">reply</span>
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              ))
            )}
          </div>
        </div>

        {/* Bottom Archive Banner */}
        <div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-[#E4E4FB] text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">Looking for older archives?</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">No other unread conversations — you're up to date across all ABHA federated trauma channels.</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button 
              onClick={() => showToast('Archived clinical threads (2024-2025) retrieved from ABDM secure storage.')}
              className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container-high font-label-lg text-label-lg font-medium shadow-sm transition-all cursor-pointer" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>Access Archives</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
