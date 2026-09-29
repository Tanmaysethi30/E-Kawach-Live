import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HealthHistory() {
  const navigate = useNavigate();
  const [activeRecordTab, setActiveRecordTab] = useState('rx');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: 'Rajesh, your next fasting glucose check is due in 2 days. Would you like to log readings or ask about prescription interactions?',
    },
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadFullRecord = () => {
    showToast('Generating ABDM Digital Health Record (ABHA-9824-8819-TN.pdf)...');
    const content = 'E-KAVACH VERIFIED CLINICAL HEALTH RECORD\nPatient: Rajesh V. Sharma (ABHA 9824-8819-TN)\nPrescriptions:\n1. Rosuvastatin 10mg + Aspirin 75mg (Dr. Kavitha Menon, Cardiology)\n2. Metformin 500mg + Glimepiride 2mg (Dr. Arvind Swaminathan)\nDiagnoses:\n- Type II Diabetes (Insulin Dependent)\n- Hypertension (Stage 1)\n- Post-CABG Recovery (AIIMS)\nVerified via National Digital Health Grid.';
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EKAVACH-Full-Health-Record.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendChat = (promptText) => {
    const textToSend = promptText || chatInput;
    if (!textToSend.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: textToSend };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let reply = 'E-KAVACH AI: Analyzing clinical timeline for ABHA-9824-8819-TN. All 5 prescriptions and 4 diagnostic summaries are synchronized.';
      if (textToSend.toLowerCase().includes('interaction') || textToSend.toLowerCase().includes('drug')) {
        reply = 'E-KAVACH AI: No adverse interactions between Rosuvastatin and Metformin. Cephalosporins and Penicillins remain strictly contraindicated.';
      } else if (textToSend.toLowerCase().includes('lab') || textToSend.toLowerCase().includes('report')) {
        reply = 'E-KAVACH AI: Fasting glucose 124 mg/dL. HbA1c 6.8%. Lipid panel shows LDL 84 mg/dL (on target).';
      }
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm bg-primary text-on-primary rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">info</span>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg font-semibold">Health Record Alert</span>
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

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                <h3 className="font-headline-sm text-lg font-bold text-primary">{selectedRecord.title}</h3>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-on-surface-variant hover:text-on-surface p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2 font-body-md text-sm text-on-surface">
              <div className="flex justify-between py-1 border-b border-surface-container-low">
                <span className="text-on-surface-variant">Doctor / Institution:</span>
                <span className="font-semibold text-right">{selectedRecord.doctor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container-low">
                <span className="text-on-surface-variant">Date Logged:</span>
                <span className="font-mono">{selectedRecord.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container-low">
                <span className="text-on-surface-variant">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold">{selectedRecord.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low mt-2">
                <span className="font-semibold text-primary block mb-1">Clinical Summary:</span>
                <p className="text-on-surface-variant text-xs leading-relaxed">{selectedRecord.notes}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  navigate('/patient/consultation');
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-sm font-semibold hover:bg-primary-container transition-colors"
                type="button"
              >
                Discuss with Doctor
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-sm transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full gap-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                Prescriptions &amp; Health History
              </h1>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              A complete record of your medications, diagnoses, and doctor visits.
            </p>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              onClick={handleDownloadFullRecord}
              className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container text-primary font-label-lg text-label-lg shadow-sm hover:bg-surface-container-high transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="">Download Full Record</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-space-lg border-b border-surface-container-highest pb-0">
          <button
            onClick={() => setActiveRecordTab('rx')}
            className={`relative pb-3 flex items-center gap-space-xs font-headline-sm text-[16px] font-semibold transition-all cursor-pointer ${
              activeRecordTab === 'rx' ? 'text-primary' : 'text-outline hover:text-on-surface'
            }`}
            id="tab-btn-prescriptions"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">medication</span>
            <span className="">Prescriptions</span>
            <span className="px-space-xs py-space-2xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
              5 Active &amp; Recent
            </span>
            <span
              className={`absolute bottom-0 left-0 right-0 h-[3px] bg-secondary rounded-full ${
                activeRecordTab === 'rx' ? 'block' : 'hidden'
              }`}
              id="tab-indicator-prescriptions"
            ></span>
          </button>
          <button
            onClick={() => setActiveRecordTab('history')}
            className={`relative pb-3 flex items-center gap-space-xs font-headline-sm text-[16px] font-semibold transition-all cursor-pointer ${
              activeRecordTab === 'history' ? 'text-primary' : 'text-outline hover:text-on-surface'
            }`}
            id="tab-btn-history"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
            <span className="">Health History</span>
            <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
              8 Records
            </span>
            <span
              className={`absolute bottom-0 left-0 right-0 h-[3px] bg-secondary rounded-full ${
                activeRecordTab === 'history' ? 'block' : 'hidden'
              }`}
              id="tab-indicator-history"
            ></span>
          </button>
        </div>

        {/* PRESCRIPTIONS TAB VIEW */}
        <div className={activeRecordTab === 'rx' ? 'flex flex-col' : 'hidden'} id="tab-view-prescriptions">
          <div className="relative pl-6 sm:pl-36 space-y-6 before:absolute before:left-[11px] sm:before:left-[131px] before:top-4 before:bottom-4 before:w-[2px] before:bg-surface-container-highest">
            {/* Rx 1 */}
            <div className="relative flex items-start gap-space-md group">
              <div className="hidden sm:block absolute -left-36 top-1.5 w-28 text-right font-label-md text-label-md text-on-surface-variant font-medium">
                24 Oct 2026
              </div>
              <div className="absolute -left-[19px] sm:-left-[19px] top-2 w-3.5 h-3.5 rounded-full bg-secondary border-2 border-surface-container-lowest shadow-sm z-10"></div>
              <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                  <div className="flex flex-col gap-1">
                    <div className="sm:hidden font-label-sm text-label-sm text-on-surface-variant font-medium">
                      24 Oct 2026
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                        Dr. Kavitha Menon — Cardiology
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Apollo Greams Trauma Hub</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                      Rosuvastatin 10mg, Aspirin 75mg
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Once daily post-dinner • Lipid &amp; anti-platelet management
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between gap-space-sm shrink-0">
                    <span className="px-space-xs py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                      Active
                    </span>
                    <button
                      onClick={() =>
                        setSelectedRecord({
                          title: 'Rosuvastatin 10mg, Aspirin 75mg',
                          doctor: 'Dr. Kavitha Menon (Cardiology, Apollo Greams)',
                          date: '24 Oct 2026',
                          status: 'Active (30-Day Refill)',
                          notes: 'Prescribed post-LAD PTCA stent. Take once daily after evening meal with water. Continue ambulatory BP logging.',
                        })
                      }
                      className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container font-medium cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">description</span>
                      <span className="">View Full Prescription</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rx 2 */}
            <div className="relative flex items-start gap-space-md group">
              <div className="hidden sm:block absolute -left-36 top-1.5 w-28 text-right font-label-md text-label-md text-on-surface-variant font-medium">
                12 Aug 2026
              </div>
              <div className="absolute -left-[19px] sm:-left-[19px] top-2 w-3.5 h-3.5 rounded-full bg-secondary border-2 border-surface-container-lowest shadow-sm z-10"></div>
              <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                  <div className="flex flex-col gap-1">
                    <div className="sm:hidden font-label-sm text-label-sm text-on-surface-variant font-medium">
                      12 Aug 2026
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                        Dr. Arvind Swaminathan — Diabetology &amp; Endocrinology
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Fortis Clinical</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                      Metformin 500mg, Glimepiride 2mg
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Twice daily with meals • HbA1c glycemic control protocol
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between gap-space-sm shrink-0">
                    <span className="px-space-xs py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                      Active
                    </span>
                    <button
                      onClick={() =>
                        setSelectedRecord({
                          title: 'Metformin 500mg, Glimepiride 2mg',
                          doctor: 'Dr. Arvind Swaminathan (Diabetology, Fortis)',
                          date: '12 Aug 2026',
                          status: 'Active',
                          notes: 'Maintain strict fasting sugar logs. Report any hypoglycemic episodes below 70 mg/dL immediately.',
                        })
                      }
                      className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container font-medium cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">description</span>
                      <span className="">View Full Prescription</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rx 3 */}
            <div className="relative flex items-start gap-space-md group">
              <div className="hidden sm:block absolute -left-36 top-1.5 w-28 text-right font-label-md text-label-md text-on-surface-variant font-medium">
                18 May 2026
              </div>
              <div className="absolute -left-[19px] sm:-left-[19px] top-2 w-3.5 h-3.5 rounded-full bg-[#E4E4FB] border-2 border-surface-container-lowest shadow-sm z-10"></div>
              <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                  <div className="flex flex-col gap-1">
                    <div className="sm:hidden font-label-sm text-label-sm text-on-surface-variant font-medium">
                      18 May 2026
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                        Dr. Priya Sundaram — Ophthalmology
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sankara Eye Institute</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                      Carboxymethylcellulose 0.5% Eye Drops, Nepafenac 0.1%
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Post-refractive dry-eye protocol • Completed 14-day regimen
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between gap-space-sm shrink-0">
                    <span className="px-space-xs py-space-2xs rounded-full bg-[#E4E4FB] text-primary font-label-sm text-label-sm font-semibold">
                      Completed
                    </span>
                    <button
                      onClick={() =>
                        setSelectedRecord({
                          title: 'Carboxymethylcellulose 0.5% Eye Drops, Nepafenac 0.1%',
                          doctor: 'Dr. Priya Sundaram (Ophthalmology, Sankara)',
                          date: '18 May 2026',
                          status: 'Completed',
                          notes: '14-day course completed without complications. Visual acuity restored to 6/6.',
                        })
                      }
                      className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container font-medium cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">description</span>
                      <span className="">View Full Prescription</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rx 4 */}
            <div className="relative flex items-start gap-space-md group">
              <div className="hidden sm:block absolute -left-36 top-1.5 w-28 text-right font-label-md text-label-md text-on-surface-variant font-medium">
                15 Jan 2026
              </div>
              <div className="absolute -left-[19px] sm:-left-[19px] top-2 w-3.5 h-3.5 rounded-full bg-[#E4E4FB] border-2 border-surface-container-lowest shadow-sm z-10"></div>
              <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                  <div className="flex flex-col gap-1">
                    <div className="sm:hidden font-label-sm text-label-sm text-on-surface-variant font-medium">
                      15 Jan 2026
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                        Dr. Siddharth Mukherjee — Cardiothoracic Surgery
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">AIIMS Trauma Center</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                      Pantoprazole 40mg, Paracetamol 650mg PRN
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Post-CABG recovery regimen • Completed course
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between gap-space-sm shrink-0">
                    <span className="px-space-xs py-space-2xs rounded-full bg-[#E4E4FB] text-primary font-label-sm text-label-sm font-semibold">
                      Completed
                    </span>
                    <button
                      onClick={() =>
                        setSelectedRecord({
                          title: 'Pantoprazole 40mg, Paracetamol 650mg PRN',
                          doctor: 'Dr. Siddharth Mukherjee (Cardiothoracic, AIIMS)',
                          date: '15 Jan 2026',
                          status: 'Completed',
                          notes: 'Surgical wound healed. Follow-up echo scheduled for next year.',
                        })
                      }
                      className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container font-medium cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">description</span>
                      <span className="">View Full Prescription</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HEALTH HISTORY TAB VIEW */}
        <div className={activeRecordTab === 'history' ? 'flex flex-col' : 'hidden'} id="tab-view-history">
          <div className="relative pl-6 sm:pl-36 space-y-6 before:absolute before:left-[11px] sm:before:left-[131px] before:top-4 before:bottom-4 before:w-[2px] before:bg-surface-container-highest">
            {/* Record 1 */}
            <div className="relative flex items-start gap-space-md group">
              <div className="hidden sm:block absolute -left-36 top-1.5 w-28 text-right font-label-md text-label-md text-on-surface-variant font-medium">
                Diagnosed Oct 2024
              </div>
              <div className="absolute -left-[19px] sm:-left-[19px] top-2 w-3.5 h-3.5 rounded-full bg-[#E4E4FB] border-2 border-surface-container-lowest shadow-sm z-10"></div>
              <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                  <div className="flex flex-col gap-1">
                    <div className="sm:hidden font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Diagnosed Oct 2024
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                        Dr. Arvind Swaminathan — Diabetology
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Apex Endocrinology</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                      Type II Diabetes — Insulin Dependent
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Fasting blood sugar target &lt; 120 mg/dL. Monitored quarterly with HbA1c.
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between gap-space-sm shrink-0">
                    <span className="px-space-xs py-space-2xs rounded-full bg-[#E4E4FB] text-primary font-label-sm text-label-sm font-semibold">
                      Ongoing
                    </span>
                    <button
                      onClick={() =>
                        setSelectedRecord({
                          title: 'Type II Diabetes — Insulin Dependent',
                          doctor: 'Dr. Arvind Swaminathan (Apex Endocrinology)',
                          date: 'Diagnosed Oct 2024',
                          status: 'Ongoing Management',
                          notes: 'Confirmed via OGTT and fasting plasma glucose. ABDM Care plan active.',
                        })
                      }
                      className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container font-medium cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                      <span className="">View Diagnostic Record</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Record 2 */}
            <div className="relative flex items-start gap-space-md group">
              <div className="hidden sm:block absolute -left-36 top-1.5 w-28 text-right font-label-md text-label-md text-on-surface-variant font-medium">
                Diagnosed Feb 2025
              </div>
              <div className="absolute -left-[19px] sm:-left-[19px] top-2 w-3.5 h-3.5 rounded-full bg-[#E4E4FB] border-2 border-surface-container-lowest shadow-sm z-10"></div>
              <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                  <div className="flex flex-col gap-1">
                    <div className="sm:hidden font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Diagnosed Feb 2025
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                        Dr. Kavitha Menon — Cardiology
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Apollo Greams Trauma Hub</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                      Hypertension (Stage 1)
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Managed via lifestyle and low-dose ACE inhibitor. Ambulatory BP stable.
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between gap-space-sm shrink-0">
                    <span className="px-space-xs py-space-2xs rounded-full bg-[#E4E4FB] text-primary font-label-sm text-label-sm font-semibold">
                      Ongoing
                    </span>
                    <button
                      onClick={() =>
                        setSelectedRecord({
                          title: 'Hypertension (Stage 1)',
                          doctor: 'Dr. Kavitha Menon (Apollo Greams)',
                          date: 'Diagnosed Feb 2025',
                          status: 'Ongoing',
                          notes: 'Holter and 24h ambulatory BP revealed nocturnal dipping with mild daytime elevation.',
                        })
                      }
                      className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container font-medium cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                      <span className="">View Diagnostic Record</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Record 3 */}
            <div className="relative flex items-start gap-space-md group">
              <div className="hidden sm:block absolute -left-36 top-1.5 w-28 text-right font-label-md text-label-md text-on-surface-variant font-medium">
                18 May 2026
              </div>
              <div className="absolute -left-[19px] sm:-left-[19px] top-2 w-3.5 h-3.5 rounded-full bg-secondary border-2 border-surface-container-lowest shadow-sm z-10"></div>
              <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                  <div className="flex flex-col gap-1">
                    <div className="sm:hidden font-label-sm text-label-sm text-on-surface-variant font-medium">
                      18 May 2026
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                        Dr. Priya Sundaram — Ophthalmology
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sankara Eye Institute</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                      Bilateral Dry Eye Syndrome
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Resolved following 14-day anti-inflammatory tear therapy.
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between gap-space-sm shrink-0">
                    <span className="px-space-xs py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                      Resolved
                    </span>
                    <button
                      onClick={() =>
                        setSelectedRecord({
                          title: 'Bilateral Dry Eye Syndrome',
                          doctor: 'Dr. Priya Sundaram (Sankara Eye Institute)',
                          date: '18 May 2026',
                          status: 'Resolved',
                          notes: 'Schirmer test normal. Cornea fluorescein staining negative.',
                        })
                      }
                      className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container font-medium cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                      <span className="">View Diagnostic Record</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Record 4 */}
            <div className="relative flex items-start gap-space-md group">
              <div className="hidden sm:block absolute -left-36 top-1.5 w-28 text-right font-label-md text-label-md text-on-surface-variant font-medium">
                10 Nov 2023
              </div>
              <div className="absolute -left-[19px] sm:-left-[19px] top-2 w-3.5 h-3.5 rounded-full bg-secondary border-2 border-surface-container-lowest shadow-sm z-10"></div>
              <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                  <div className="flex flex-col gap-1">
                    <div className="sm:hidden font-label-sm text-label-sm text-on-surface-variant font-medium">
                      10 Nov 2023
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                        Dr. Siddharth Mukherjee — Pulmonology
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Civil Hospital</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                      Acute Bronchitis
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Treated with 5-day antibiotic course and nebulization. Fully cleared.
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between gap-space-sm shrink-0">
                    <span className="px-space-xs py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                      Resolved
                    </span>
                    <button
                      onClick={() =>
                        setSelectedRecord({
                          title: 'Acute Bronchitis',
                          doctor: 'Dr. Siddharth Mukherjee (Civil Hospital)',
                          date: '10 Nov 2023',
                          status: 'Resolved',
                          notes: 'Chest X-ray clear. Sputum culture normal.',
                        })
                      }
                      className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container font-medium cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                      <span className="">View Diagnostic Record</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chatbot Assistant Widget */}
        <aside aria-label="Clinical Navigator Chatbot" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-space-xs pointer-events-none">
          <div
            className={`pointer-events-auto w-80 sm:w-96 bg-surface-container-lowest rounded-xl shadow-xl p-space-md flex flex-col gap-space-sm transition-all duration-300 transform scale-100 origin-bottom-right ${
              aiChatOpen ? 'block' : 'hidden'
            }`}
            id="ai-chat-card"
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
            <div className="max-h-48 overflow-y-auto space-y-2">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-space-sm rounded-lg font-body-sm text-body-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary self-end text-right'
                      : 'bg-surface-container-low text-on-surface'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-space-2xs flex-wrap">
              <button
                onClick={() => handleSendChat('Check Drug Interaction')}
                className="px-space-xs py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-colors"
                type="button"
              >
                Check Drug Interaction
              </button>
              <button
                onClick={() => handleSendChat('Explain Lab Report')}
                className="px-space-xs py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-colors"
                type="button"
              >
                Explain Lab Report
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-space-xs bg-surface-container-low rounded-lg px-space-sm py-space-2xs"
            >
              <input
                className="bg-transparent border-none outline-none font-body-sm text-body-sm w-full text-on-surface placeholder:text-outline"
                placeholder="Ask a question about your prescriptions..."
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                className="text-primary hover:text-primary-container transition-colors flex items-center justify-center"
                type="submit"
              >
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
            <span className="">Ask E-KAVACH AI</span>
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping ml-1"></span>
          </button>
        </aside>
      </div>
    </div>
  );
}
