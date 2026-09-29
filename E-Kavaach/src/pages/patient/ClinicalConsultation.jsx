import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ClinicalConsultation() {
  const navigate = useNavigate();
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: 'Rajesh, would you like to prepare consultation notes or review your past diagnostic records before starting your call?' }
  ]);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [activeDoctorId, setActiveDoctorId] = useState('KM');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'doctor',
      time: '10:38 AM',
      text: "Good morning Rajesh. I've reviewed your latest ambulatory blood pressure readings and your lipid panel from Apollo Greams."
    },
    {
      id: 2,
      sender: 'doctor',
      time: '10:42 AM',
      text: "Please monitor blood pressure fasting for 3 days prior to your visit. I've sent the updated dosage regimen to your vault.",
      hasRx: true
    },
    {
      id: 3,
      sender: 'patient',
      time: '10:46 AM • Delivered',
      text: "Thank you Dr. Kavitha. I have logged this morning's BP (124/82) into my ABHA record. Should I continue the Metformin on the same schedule?"
    },
    {
      id: 4,
      sender: 'doctor',
      time: '10:50 AM',
      text: "Yes, keep the Metformin 500mg as prescribed by Dr. Swaminathan. We will review both together during our video consult tomorrow at 10:30 AM."
    }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'patient',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • Delivered',
      text: inputText.trim()
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    showToast('Message encrypted and sent via ABHA Telehealth Gateway');
  };

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

  const doctors = [
    {
      id: 'KM',
      name: 'Dr. Kavitha Menon',
      specialty: 'Cardiology • Apollo Greams',
      fullTitle: 'Dr. Kavitha Menon — Cardiology',
      hospital: 'Apollo Greams Trauma Hub • Reg #TN-MED-44829',
      lastTime: '10:50 AM',
      preview: 'We will review both together during our video consult...',
      color: 'bg-primary-container text-on-primary',
      active: true
    },
    {
      id: 'AS',
      name: 'Dr. Arvind Swaminathan',
      specialty: 'Diabetology • Fortis',
      fullTitle: 'Dr. Arvind Swaminathan — Diabetology',
      hospital: 'Fortis Clinical • Reg #TN-MED-38102',
      lastTime: 'Yesterday',
      preview: 'HbA1c levels look stable. Keep the current Metformin 500mg...',
      color: 'bg-primary text-on-primary',
      active: true
    },
    {
      id: 'PS',
      name: 'Dr. Priya Sundaram',
      specialty: 'Ophthalmology • Sankara',
      fullTitle: 'Dr. Priya Sundaram — Ophthalmology',
      hospital: 'Sankara Eye Institute • Reg #TN-MED-55194',
      lastTime: '20 Oct',
      preview: 'Post-refractive check is clear. Discontinue drops...',
      color: 'bg-surface-container text-on-surface-variant',
      active: false
    },
    {
      id: 'SM',
      name: 'Dr. Siddharth Mukherjee',
      specialty: 'Cardiothoracic • AIIMS',
      fullTitle: 'Dr. Siddharth Mukherjee — Cardiothoracic Surgery',
      hospital: 'AIIMS Trauma Center • Reg #TN-MED-12904',
      lastTime: '15 Jan',
      preview: 'Post-CABG recovery regimen confirmed.',
      color: 'bg-surface-container text-on-surface-variant',
      active: false
    }
  ];

  const filteredDoctors = doctors.filter(d => {
    if (!searchDoctor.trim()) return true;
    const q = searchDoctor.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q);
  });

  const activeDoc = doctors.find(d => d.id === activeDoctorId) || doctors[0];

  return (
    <div className="w-full">
      {/* Toast */}
      {toastMsg && (
        <div className="mb-3 p-3 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg('')} className="text-on-secondary-container hover:opacity-75">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Video Call Modal Simulation */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-highest max-w-2xl w-full overflow-hidden flex flex-col">
            <div className="p-4 bg-primary text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
                <span className="font-label-lg font-bold">ABDM Telehealth Video Grid • {activeDoc.fullTitle}</span>
              </div>
              <button onClick={() => setIsVideoModalOpen(false)} className="text-on-primary hover:opacity-75">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <div className="relative bg-slate-900 aspect-video flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-lg text-2xl font-bold mb-3 shadow-lg">
                {activeDoc.id}
              </div>
              <p className="font-label-lg font-semibold">{activeDoc.name}</p>
              <p className="text-xs text-slate-300 font-mono mt-1">256-Bit TLS Encrypted • ABDM Telemedicine Token #TM-9921</p>
              <div className="absolute top-4 right-4 bg-slate-800/80 px-2.5 py-1 rounded-full text-xs font-mono text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Connected (24ms)
              </div>
            </div>
            <div className="p-4 bg-surface-container flex items-center justify-center gap-4">
              <button className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center shadow hover:bg-surface-container-highest transition-colors" title="Mute Mic">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
              <button className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center shadow hover:bg-surface-container-highest transition-colors" title="Toggle Camera">
                <span className="material-symbols-outlined text-[20px]">videocam</span>
              </button>
              <button onClick={() => { setIsVideoModalOpen(false); showToast('Video consult ended. Session archived.'); }} className="px-6 py-2.5 rounded-full bg-error text-on-error font-label-md font-bold flex items-center gap-2 shadow hover:opacity-95 transition-opacity">
                <span className="material-symbols-outlined text-[20px]">call_end</span>
                <span>End Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full gap-space-lg">
        {/* Top Header */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <Link to="/patient/messages" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to All Conversations</span>
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-medium">{activeDoc.name}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Clinical Consultation</h1>
              <span className="px-space-xs py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-ping"></span>
                <span>Live ABHA Session</span>
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button 
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:opacity-95 transition-opacity" 
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                <span>+ Start Video Call</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
          {/* Left: Doctor Conversations List */}
          <div className="lg:col-span-4 flex flex-col gap-space-sm">
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-sm overflow-hidden">
              <div className="p-space-sm border-b border-surface-container-highest bg-surface-container-low/60 flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-primary">Conversations</span>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">{doctors.length} active</span>
              </div>
              <div className="p-space-xs border-b border-surface-container-highest bg-surface-container-lowest">
                <div className="flex items-center gap-space-xs px-space-xs py-1 bg-surface-container-low rounded-lg text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-outline">search</span>
                  <input 
                    value={searchDoctor}
                    onChange={(e) => setSearchDoctor(e.target.value)}
                    className="bg-transparent border-none outline-none font-body-sm text-body-sm w-full text-on-surface placeholder:text-outline" 
                    placeholder="Search doctors..." 
                    type="text" 
                  />
                </div>
              </div>
              <div className="flex flex-col divide-y divide-surface-container-highest">
                {filteredDoctors.map((d) => (
                  <div 
                    key={d.id}
                    onClick={() => setActiveDoctorId(d.id)}
                    className={`p-space-sm flex items-start gap-space-sm cursor-pointer transition-colors ${activeDoctorId === d.id ? 'bg-secondary-container/15 border-l-4 border-primary' : 'hover:bg-surface-container-low/60'}`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[13px] ${d.color}`}>
                        {d.id}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-container-lowest ${d.active ? 'bg-secondary' : 'bg-outline-variant'}`}></span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-label-md text-label-md truncate ${activeDoctorId === d.id ? 'font-bold text-primary' : 'font-semibold text-on-surface'}`}>
                          {d.name}
                        </span>
                        <span className={`font-label-sm text-label-sm shrink-0 ${activeDoctorId === d.id ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                          {d.lastTime}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{d.specialty}</span>
                      <p className="font-body-sm text-body-sm text-on-surface font-medium truncate mt-0.5">{d.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container-highest flex items-start gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">lock</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm font-semibold text-primary">ABDM Protected</span>
                <p className="font-body-sm text-[11px] leading-tight text-on-surface-variant">Conversations are authenticated by your ABHA identity and compliant with Telemedicine Practice Guidelines.</p>
              </div>
            </div>
          </div>

          {/* Right: Active Doctor Chat Thread */}
          <div className="lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-sm overflow-hidden">
            <div className="p-space-md border-b border-surface-container-highest flex items-center justify-between bg-surface-container-lowest">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-semibold text-[14px]">
                    {activeDoc.id}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary border-2 border-surface-container-lowest"></span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <h2 className="font-headline-sm text-[16px] text-primary font-bold truncate">
                      {activeDoc.fullTitle}
                    </h2>
                    <span className="px-space-xs py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-ping"></span>
                      <span>Active Consult</span>
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{activeDoc.hospital}</span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs shrink-0">
                <button 
                  onClick={() => navigate('/patient/health-history')}
                  className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm transition-colors" 
                  title="View Patient Chart" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                  <span className="hidden sm:inline-block">Chart &amp; Rx</span>
                </button>
                <button 
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm hover:opacity-95 transition-opacity" 
                  title="Start Video Call" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">videocam</span>
                </button>
                <button 
                  onClick={() => showToast('Session telemetry: 256-bit encrypted • Latency 14ms')}
                  className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors" 
                  title="More Options" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
              </div>
            </div>

            <div className="px-space-md py-space-xs bg-surface-container-low/60 border-b border-surface-container-highest flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
                <span>Connected to ABHA Telehealth Gateway • End-to-End Encrypted Session (NMC Guidelines Compliant)</span>
              </div>
              <span className="font-mono text-[11px] text-outline">ABHA #9824-8819</span>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md bg-surface/50 overflow-y-auto" style={{ minHeight: '480px' }}>
              <div className="flex items-center justify-center my-space-2xs">
                <span className="px-space-sm py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Today, 24 October 2026</span>
              </div>

              {messages.map((m) => (
                m.sender === 'doctor' ? (
                  <div key={m.id} className="flex flex-col items-start gap-1 max-w-[85%] animate-fade-in">
                    <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface text-body-md flex flex-col gap-space-sm">
                      <p>{m.text}</p>
                      {m.hasRx && (
                        <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-space-sm shadow-sm flex flex-col gap-space-xs">
                          <div className="flex items-start gap-space-sm">
                            <div className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[20px]">pill</span>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-label-md text-label-md font-bold text-primary">Updated Dosage — Rosuvastatin 10mg, Aspirin 75mg</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">Once daily post-dinner • Active Prescription #RX-2026-9921</span>
                            </div>
                          </div>
                          <div className="border-t border-surface-container-highest pt-space-xs flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-outline">Digitally signed by Dr. K. Menon</span>
                            <Link to="/patient/health-history" className="font-label-sm text-label-sm font-semibold text-secondary hover:underline flex items-center gap-0.5">
                              <span>View Full Prescription</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="font-label-sm text-label-sm text-outline px-space-xs">{m.time}</span>
                  </div>
                ) : (
                  <div key={m.id} className="flex flex-col items-end gap-1 max-w-[85%] self-end animate-fade-in">
                    <div className="p-space-md rounded-xl bg-primary-container text-on-primary text-body-md shadow-sm">
                      <p>{m.text}</p>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline px-space-xs">{m.time}</span>
                  </div>
                )
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-space-md border-t border-surface-container-highest bg-surface-container-lowest flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <button 
                  onClick={() => showToast('File picker opened: attach lab report or ECG.')}
                  className="w-10 h-10 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex items-center justify-center transition-colors shrink-0" 
                  title="Attach lab report, ECG, or document" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </button>
                <div className="flex-1 flex items-center gap-space-xs px-space-sm py-2 rounded-xl bg-surface-container-low border border-surface-container-highest focus-within:border-primary transition-colors">
                  <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="bg-transparent border-none outline-none font-body-sm text-body-sm w-full text-on-surface placeholder:text-outline" 
                    placeholder="Type a message or clinical update..." 
                    type="text" 
                  />
                  <button 
                    onClick={() => setInputText("Logging BP readings: 120/80 mmHg, pulse 72 bpm.")}
                    className="text-outline hover:text-primary transition-colors shrink-0" 
                    title="Insert quick symptom note" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">notes</span>
                  </button>
                </div>
                <button 
                  className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container shadow-sm transition-colors shrink-0" 
                  title="Send Message" 
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
              <div className="flex items-center justify-between px-space-xs">
                <span className="font-body-sm text-[11px] text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
                  All messages stored with ABDM Consent Artefact #CA-9021
                </span>
                <div className="flex items-center gap-space-xs">
                  <button 
                    onClick={() => setIsVideoModalOpen(true)}
                    className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">videocam</span>
                    <span>Instant Teleconsult</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AI Clinical Navigator */}
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
