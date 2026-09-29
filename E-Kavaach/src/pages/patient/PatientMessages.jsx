import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PatientMessages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'unread'
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: 'Rajesh, would you like to prepare consultation notes or review your past diagnostic records before starting your call?' }
  ]);

  const conversations = [
    {
      id: 'kavitha',
      initials: 'KM',
      name: 'Dr. Kavitha Menon — Cardiology',
      hospital: 'Apollo Greams Trauma Hub',
      badge: 'Active Consult',
      badgeBg: 'bg-tertiary-fixed text-on-tertiary-fixed',
      message: "Please monitor blood pressure fasting for 3 days prior to your visit. I've sent the updated dosage schedule to your portal.",
      time: '10:42 AM',
      unread: true,
      active: true,
      hasVideo: true,
      videoTitle: 'Start Video Call'
    },
    {
      id: 'arvind',
      initials: 'AS',
      name: 'Dr. Arvind Swaminathan — Diabetology & Endocrinology',
      hospital: 'Fortis Clinical',
      badge: 'Scheduled Video at 4:15 PM',
      badgeBg: 'bg-[#E4E4FB] text-primary',
      message: 'HbA1c levels look stable. Keep the current Metformin 500mg dosage and update your glucose log bi-weekly.',
      time: 'Yesterday',
      unread: false,
      active: true,
      hasVideo: true,
      videoTitle: 'Join Video Call'
    },
    {
      id: 'priya',
      initials: 'PS',
      name: 'Dr. Priya Sundaram — Ophthalmology',
      hospital: 'Sankara Eye Institute',
      badge: 'Completed',
      badgeBg: 'bg-surface-container-high text-on-surface-variant',
      message: 'Post-refractive check is clear. Discontinue nepafenac drops if there is no irritation.',
      time: '20 Oct 2026',
      unread: false,
      active: false,
      hasVideo: false,
      videoTitle: ''
    },
    {
      id: 'siddharth',
      initials: 'SM',
      name: 'Dr. Siddharth Mukherjee — Cardiothoracic Surgery',
      hospital: 'AIIMS Trauma Center',
      badge: 'Archived',
      badgeBg: 'bg-surface-container text-on-surface-variant',
      message: 'Post-CABG recovery regimen confirmed. Next annual review in January 2027.',
      time: '15 Jan 2026',
      unread: false,
      active: false,
      hasVideo: false,
      videoTitle: ''
    }
  ];

  const filteredConversations = conversations.filter(c => {
    if (activeTab === 'active' && !c.active) return false;
    if (activeTab === 'unread' && !c.unread) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.hospital.toLowerCase().includes(q) || c.message.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSendAi = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const text = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', text }]);
    setAiInput('');
    setTimeout(() => {
      setAiMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `E-KAVACH AI analyzed your query: "${text}". Your diagnostic records and prescription history have been prepared for consultation.`
        }
      ]);
    }, 600);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Messages</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Chat or video call with your doctors.</p>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap">
            <button 
              onClick={() => navigate('/patient/book-doctor')}
              className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:opacity-95 transition-opacity" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">video_call</span>
              <span>+ Book Immediate Consultation</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container-lowest rounded-lg border border-surface-container-highest text-on-surface-variant w-full sm:w-80 shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-outline">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm w-full text-on-surface placeholder:text-outline" 
              placeholder="Search conversations..." 
              type="text" 
            />
          </div>
          <div className="flex items-center gap-space-xs flex-wrap">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'}`}
              type="button"
            >
              All ({conversations.length})
            </button>
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm transition-all ${activeTab === 'active' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'bg-surface-container-high text-on-surface-variant font-medium hover:bg-surface-container'}`}
              type="button"
            >
              Active Consults (2)
            </button>
            <button 
              onClick={() => setActiveTab('unread')}
              className={`px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1 ${activeTab === 'unread' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'bg-surface-container-high text-on-surface-variant font-medium hover:bg-surface-container'}`}
              type="button"
            >
              <span>Unread (1)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
            </button>
          </div>
        </div>

        {/* Conversations Container */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-sm overflow-hidden">
          <div className="p-space-md border-b border-surface-container-highest flex items-center justify-between bg-surface-container-low/60">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[20px] text-primary">chat</span>
              <h2 className="font-headline-sm text-[16px] text-primary font-semibold">Recent Conversations</h2>
            </div>
            <div className="flex items-center gap-space-xs px-space-xs py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
              <span className="material-symbols-outlined text-[14px] text-secondary">shield</span>
              <span>Connected to ABHA Telehealth Gateway</span>
            </div>
          </div>

          <div className="flex flex-col">
            {filteredConversations.length === 0 ? (
              <div className="p-space-lg text-center text-on-surface-variant font-body-md">
                No conversations match your search or filter.
              </div>
            ) : (
              filteredConversations.map((c) => (
                <div 
                  key={c.id} 
                  className={`p-space-md border-b border-surface-container-highest hover:bg-surface-container-low/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-space-md ${c.unread ? 'bg-secondary-container/10' : ''}`}
                >
                  <div className="flex items-start gap-space-md flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-[14px] ${c.active ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                        {c.initials}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${c.active ? 'bg-secondary' : 'bg-outline-variant'}`}></span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <h3 className={`font-label-lg text-label-lg truncate ${c.unread ? 'font-bold text-primary' : 'font-semibold text-primary'}`}>
                          {c.name}
                        </h3>
                        <span className="text-outline-variant">•</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{c.hospital}</span>
                        <span className={`px-space-xs py-1 rounded-full font-label-sm text-label-sm font-semibold ml-1 ${c.badgeBg}`}>
                          {c.badge}
                        </span>
                      </div>
                      <p className={`font-body-md text-body-md truncate mt-space-2xs ${c.unread ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>
                        {c.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-space-md shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`font-label-sm text-label-sm ${c.unread ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                        {c.time}
                      </span>
                      {c.unread && <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>}
                    </div>
                    <div className="flex items-center gap-space-xs">
                      {c.hasVideo && (
                        <button 
                          onClick={() => navigate('/patient/consultation')}
                          className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm hover:opacity-95 transition-opacity" 
                          title={c.videoTitle} 
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px]">videocam</span>
                        </button>
                      )}
                      <button 
                        onClick={() => navigate('/patient/consult-page')}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${c.active ? 'bg-surface-container text-primary hover:bg-surface-container-high' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
                        title={c.active ? "Open Chat" : "View Chat History"} 
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">{c.active ? "chat_bubble" : "chat_bubble_outline"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Encrypted Disclaimer */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-highest flex items-start gap-space-md shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="font-label-lg text-label-lg font-semibold text-primary">End-to-End Encrypted Medical Consultations</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">All clinical conversations, video consultations, and attached prescription records are digitally verified and strictly comply with the ABDM Telemedicine Practice Guidelines. Only authorized registered medical practitioners (RMPs) linked to your ABHA can access this encrypted session.</p>
          </div>
        </div>
      </div>

      {/* Clinical Navigator Chatbot */}
      <aside aria-label="Clinical Navigator Chatbot" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-space-xs pointer-events-none">
        <div 
          id="ai-chat-card" 
          className={`pointer-events-auto w-80 sm:w-96 bg-surface-container-lowest rounded-xl shadow-xl p-space-md flex flex-col gap-space-sm transition-all duration-300 transform scale-100 origin-bottom-right ${aiChatOpen ? 'block' : 'hidden'}`}
        >
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md font-semibold text-on-surface">AI Clinical Navigator</h3>
                <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                  Online • Protocol Guarded
                </span>
              </div>
            </div>
            <button 
              onClick={() => setAiChatOpen(false)}
              className="text-on-surface-variant hover:text-on-surface p-1" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {aiMessages.map((m, idx) => (
              <div 
                key={idx} 
                className={`p-space-sm rounded-lg font-body-sm text-body-sm ${m.role === 'assistant' ? 'bg-surface-container-low text-on-surface' : 'bg-primary-container text-on-primary self-end'}`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendAi} className="flex items-center gap-space-xs bg-surface-container-low rounded-lg px-space-sm py-space-2xs">
            <input 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm w-full text-on-surface placeholder:text-outline" 
              placeholder="Ask a question about your consults..." 
              type="text" 
            />
            <button className="text-primary hover:text-primary-container transition-colors flex items-center justify-center" type="submit">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>

        <button 
          onClick={() => setAiChatOpen(!aiChatOpen)}
          className="pointer-events-auto flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-xl hover:bg-primary-container transition-all" 
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          <span>Ask E-KAVACH AI</span>
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping ml-1"></span>
        </button>
      </aside>
    </div>
  );
}
