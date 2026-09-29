import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { subscribeTriage, subscribeEmergencyAlert } from '../../services/telemetry';

export default function EmergencyWard() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triageQueue, setTriageQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showCardModal, setShowCardModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedPatientForQR, setSelectedPatientForQR] = useState(null);

  // Ingress Dispatch Form State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    patientName: '',
    abhaNumber: '',
    triageColor: 'RED',
    condition: 'Acute Trauma / Golden Hour',
    bayNumber: 'Bay 01',
    vitals: 'BP 140/90 • HR 112 • SpO2 93%',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate QR Code dynamically
  const generateQRCode = async (patient) => {
    try {
      const payload = JSON.stringify({
        hospital: 'Apollo Greams Trauma Hub',
        hospitalId: 'AP-HSP-842-TN',
        ingressToken: patient?.token || `EK-ER-${Math.floor(10000 + Math.random() * 90000)}`,
        patientName: patient?.name || 'Emergency Trauma Ingress',
        abhaNumber: patient?.abha || 'ABHA-9824-8819-TN',
        triageLevel: patient?.triage || 'RED (Critical / Immediate)',
        bay: patient?.bay || 'Bay 01',
        vitals: patient?.vitals || 'HR 110 • SpO2 94%',
        timestamp: new Date().toISOString(),
      });

      const url = await QRCode.toDataURL(payload, {
        width: 260,
        margin: 1,
        color: {
          dark: '#004d6c',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error creating QR code:', err);
    }
  };

  // Fetch live triage queue
  const fetchTriageData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch('/api/admin/triage-queue', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.queue) && data.queue.length > 0) {
          const mapped = data.queue.map((q, idx) => ({
            id: q.id || `tr-${idx + 1}`,
            name: q.patientName || 'Ingress Trauma Patient',
            abha: q.abhaNumber || '9824-8819-TN',
            triage: q.priorityLevel || (q.triageColor === 'RED' ? 'RED (Critical)' : q.triageColor === 'YELLOW' ? 'YELLOW (Urgent)' : 'GREEN (Standard)'),
            triageColor: q.triageColor || (q.priorityLevel?.includes('Critical') ? 'RED' : 'YELLOW'),
            condition: q.condition || 'Acute Trauma Ingress',
            bay: q.bayNumber || `Bay 0${(idx % 4) + 1}`,
            vitals: q.vitals || 'HR 108 • SpO2 95% • BP 130/85',
            doctor: q.doctor || 'Dr. Kavitha Menon',
            arrivalTime: q.arrivalTime ? new Date(q.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
            token: `EK-TR-${Math.floor(10000 + Math.random() * 90000)}`,
          }));
          setTriageQueue(mapped);
          if (mapped.length > 0) {
            setSelectedPatientForQR(mapped[0]);
            generateQRCode(mapped[0]);
          }
        } else {
          // Default initial emergency ingress records
          const initialQueue = [
            {
              id: 'tr-1',
              name: 'Rajesh V. Sharma',
              abha: '9824-8819-3320-TN',
              triage: 'RED (Critical)',
              triageColor: 'RED',
              condition: 'Acute STEMI / Golden Hour Resuscitation',
              bay: 'Trauma Bay 01',
              vitals: 'HR 118 • SpO2 92% • BP 145/95',
              doctor: 'Dr. Kavitha Menon',
              arrivalTime: '10:14 AM',
              token: 'EK-TR-88190-V4',
            },
            {
              id: 'tr-2',
              name: 'Priya Sundaram',
              abha: '8821-4402-9912-TN',
              triage: 'YELLOW (Urgent)',
              triageColor: 'YELLOW',
              condition: 'Polytrauma / Road Ingress',
              bay: 'Trauma Bay 02',
              vitals: 'HR 98 • SpO2 97% • BP 120/80',
              doctor: 'Dr. R. K. Nambiar',
              arrivalTime: '10:28 AM',
              token: 'EK-TR-55291-V2',
            },
            {
              id: 'tr-3',
              name: 'M. Anandhan',
              abha: '7712-9904-1234-TN',
              triage: 'GREEN (Standard)',
              triageColor: 'GREEN',
              condition: 'Minor Laceration & Clinical Assessment',
              bay: 'Bay 04',
              vitals: 'HR 76 • SpO2 99% • BP 118/75',
              doctor: 'Dr. Kavitha Menon',
              arrivalTime: '10:45 AM',
              token: 'EK-TR-33921-V1',
            },
          ];
          setTriageQueue(initialQueue);
          setSelectedPatientForQR(initialQueue[0]);
          generateQRCode(initialQueue[0]);
        }
      }
    } catch (err) {
      console.error('Error loading triage queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriageData();

    // Listen to live telemetry and incoming emergency transfers
    const unsubTriage = subscribeTriage((data) => {
      if (data?.triageEntry) {
        const e = data.triageEntry;
        const newEntry = {
          id: e.id || `live-${Date.now()}`,
          name: e.patientName || 'Ingress Referral',
          abha: e.abhaNumber || 'ABHA-IN-TRANSIT',
          triage: e.priorityLevel || 'RED (Critical)',
          triageColor: e.triageColor || 'RED',
          condition: e.condition || 'Emergency Ingress',
          bay: e.bayNumber || 'Bay 01',
          vitals: 'Live Telemetry Ingress',
          doctor: e.doctor || 'Dr. Kavitha Menon',
          arrivalTime: 'Just now',
          token: `EK-TR-${Math.floor(10000 + Math.random() * 90000)}`,
        };
        setTriageQueue((prev) => [newEntry, ...prev.filter((p) => p.id !== newEntry.id)]);
        setSelectedPatientForQR(newEntry);
        generateQRCode(newEntry);
        showToast(`🚨 Live ER Ingress Alert: ${newEntry.name} assigned to ${newEntry.bay}`);
      }
    });

    const unsubAlert = subscribeEmergencyAlert((alertData) => {
      if (alertData) {
        const newEntry = {
          id: alertData.alertId || `ivr-${Date.now()}`,
          name: alertData.patient?.name || 'IVR SOS Dispatch',
          abha: alertData.patient?.abhaNumber || 'ABHA-IN-TRANSIT',
          triage: 'RED (Critical)',
          triageColor: 'RED',
          condition: `🚨 IVR SOS: ${alertData.condition || 'Immediate Resuscitation'}`,
          bay: alertData.bayNumber || 'Bay 01',
          vitals: `108 Fleet In-Transit (~${alertData.etaMinutes || 4} min ETA)`,
          doctor: 'Dr. Kavitha Menon',
          arrivalTime: 'In-Transit',
          token: `EK-SOS-${Math.floor(10000 + Math.random() * 90000)}`,
        };
        setTriageQueue((prev) => [newEntry, ...prev.filter((p) => p.id !== newEntry.id)]);
        setSelectedPatientForQR(newEntry);
        generateQRCode(newEntry);
        showToast(`🚨 108 AMBULANCE SOS: ${newEntry.name} dispatched to ${newEntry.bay}`);
      }
    });

    return () => {
      if (unsubTriage) unsubTriage();
      if (unsubAlert) unsubAlert();
    };
  }, []);

  const handleSelectPatientQR = (patient) => {
    setSelectedPatientForQR(patient);
    generateQRCode(patient);
    showToast(`Generated ER Access QR for ${patient.name}`);
  };

  const handleCreateDispatch = (e) => {
    e.preventDefault();
    if (!dispatchForm.patientName.trim()) {
      showToast('Please enter patient name.');
      return;
    }

    const newPatient = {
      id: `man-${Date.now()}`,
      name: dispatchForm.patientName,
      abha: dispatchForm.abhaNumber || `9824-${Math.floor(1000 + Math.random() * 9000)}-TN`,
      triage: dispatchForm.triageColor === 'RED' ? 'RED (Critical)' : dispatchForm.triageColor === 'YELLOW' ? 'YELLOW (Urgent)' : 'GREEN (Standard)',
      triageColor: dispatchForm.triageColor,
      condition: dispatchForm.condition,
      bay: dispatchForm.bayNumber,
      vitals: dispatchForm.vitals,
      doctor: 'Dr. Kavitha Menon',
      arrivalTime: 'Just now',
      token: `EK-TR-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    setTriageQueue((prev) => [newPatient, ...prev]);
    setSelectedPatientForQR(newPatient);
    generateQRCode(newPatient);
    setShowDispatchModal(false);
    setDispatchForm({
      patientName: '',
      abhaNumber: '',
      triageColor: 'RED',
      condition: 'Acute Trauma / Golden Hour',
      bayNumber: 'Bay 01',
      vitals: 'BP 140/90 • HR 112 • SpO2 93%',
    });
    showToast(`Registered ER Ingress for ${newPatient.name} with QR token.`);
  };

  const filteredQueue = triageQueue.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.abha.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bay.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'ALL') return true;
    return item.triageColor === activeFilter;
  });

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#004d6c] text-white rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-xl text-[#02C39A]">emergency</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Emergency Trauma Hub Update</span>
            <span className="text-xs text-slate-200">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-4 text-slate-300 hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Manual Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-2xl animate-pulse">emergency</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Register ER Ingress Admission</h3>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={dispatchForm.patientName}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, patientName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    ABHA / Health ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9824-8819-TN"
                    value={dispatchForm.abhaNumber}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, abhaNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Triage Priority
                  </label>
                  <select
                    value={dispatchForm.triageColor}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, triageColor: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="RED">RED - Critical (Priority 1)</option>
                    <option value="YELLOW">YELLOW - Urgent (Priority 2)</option>
                    <option value="GREEN">GREEN - Standard (Priority 3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Allocated Bay
                  </label>
                  <select
                    value={dispatchForm.bayNumber}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, bayNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Trauma Bay 01">Trauma Bay 01 (Resuscitation)</option>
                    <option value="Trauma Bay 02">Trauma Bay 02 (Telemetry)</option>
                    <option value="Bay 03">Bay 03 (Acute Care)</option>
                    <option value="Bay 04">Bay 04 (Observation)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Initial Vitals
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.vitals}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, vitals: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Ingress Clinical Condition
                </label>
                <input
                  type="text"
                  value={dispatchForm.condition}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, condition: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-error text-on-error font-label-md text-label-md font-semibold rounded-lg hover:bg-error/90 shadow-sm cursor-pointer"
                >
                  Generate ER QR Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="px-grid-margin py-space-xl space-y-space-lg max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span> 24x7 EMERGENCY TRAUMA STATION
              </span>
              <span className="font-label-sm text-xs text-on-surface-variant">Live Ingress Grid Node</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Emergency Ward &amp; Ingress Triage
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Real-time emergency admissions, scannable ER tokens, live 108 ambulance dispatch, and trauma bay allocation.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <button
              onClick={() => setShowDispatchModal(true)}
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-error text-on-error shadow-sm hover:bg-error/90 transition-all font-label-lg text-label-lg font-semibold cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_alert</span>
              + New ER Ingress Pass
            </button>
            <button
              onClick={fetchTriageData}
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-all font-label-lg text-label-lg font-medium cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              Sync Queue
            </button>
          </div>
        </div>

        {/* Top Split Layout: Active QR Code Station + Live Triage Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {/* Column 1: Authoritative Scannable ER QR Station */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">qr_code_scanner</span>
                  <h3 className="font-headline-sm text-base font-bold text-primary">Scannable ER Token Station</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                  ABDM Verified
                </span>
              </div>

              {selectedPatientForQR ? (
                <div className="mt-4 text-center">
                  <div className="p-3 bg-surface-container-low rounded-xl mb-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-primary">{selectedPatientForQR.name}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedPatientForQR.triageColor === 'RED'
                          ? 'bg-error-container text-on-error-container'
                          : selectedPatientForQR.triageColor === 'YELLOW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {selectedPatientForQR.triage}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-on-surface-variant mt-0.5">ABHA: {selectedPatientForQR.abha}</div>
                    <div className="text-xs text-secondary font-semibold mt-1">{selectedPatientForQR.bay} • {selectedPatientForQR.condition}</div>
                  </div>

                  {/* Scannable QR Matrix Canvas */}
                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 inline-block shadow-sm">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Scannable Emergency Ingress QR Code"
                        className="w-48 h-48 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-xl">
                        <span className="material-symbols-outlined text-4xl text-slate-400 animate-spin">progress_activity</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-[11px] text-on-surface-variant font-mono">
                    Token ID: {selectedPatientForQR.token || 'EK-TR-88190-V4'}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">qr_code</span>
                  <p className="text-xs">Select a patient from the queue to generate dynamic ER access QR.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Scan with 108 Responder App</span>
              <button
                onClick={() => {
                  if (selectedPatientForQR) generateQRCode(selectedPatientForQR);
                  showToast('Regenerated dynamic ER token.');
                }}
                className="text-primary hover:text-secondary text-xs font-semibold flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">refresh</span> Refresh QR
              </button>
            </div>
          </div>

          {/* Column 2 & 3: Live ER Ingress & Triage List */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-surface-container">
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-primary">Live Emergency Ingress Roster</h3>
                  <p className="text-xs text-on-surface-variant">Trauma intake, priority classification, and real-time clinical attending</p>
                </div>
                <div className="flex items-center gap-1">
                  {['ALL', 'RED', 'YELLOW', 'GREEN'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        activeFilter === filter
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      type="button"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-3 relative">
                <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search ER queue by name, ABHA ID, condition, or bay..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Queue List */}
              <div className="mt-3 space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl animate-spin text-primary mb-2">progress_activity</span>
                    <p className="text-xs">Loading triage ingress queue...</p>
                  </div>
                ) : filteredQueue.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">check_circle</span>
                    <p className="text-xs font-semibold">No active trauma cases matching filter.</p>
                  </div>
                ) : (
                  filteredQueue.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPatientQR(item)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedPatientForQR?.id === item.id
                          ? 'bg-surface-container-high/60 border-primary ring-1 ring-primary'
                          : 'bg-surface-container-low border-surface-container hover:border-outline'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${
                          item.triageColor === 'RED' ? 'bg-error animate-pulse' : item.triageColor === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-primary">{item.name}</span>
                            <span className="text-[11px] font-mono text-on-surface-variant">({item.abha})</span>
                          </div>
                          <div className="text-xs text-on-surface-variant mt-0.5">
                            {item.condition} • <strong className="text-primary">{item.bay}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.triageColor === 'RED'
                              ? 'bg-error-container text-on-error-container'
                              : item.triageColor === 'YELLOW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.triage}
                          </span>
                          <div className="text-[11px] text-on-surface-variant mt-0.5 font-mono">{item.arrivalTime}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPatientQR(item);
                          }}
                          className="px-2.5 py-1 bg-surface-container text-primary font-semibold text-xs rounded hover:bg-surface-container-high transition-colors"
                          type="button"
                        >
                          View QR
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
              <span>Total Active Ingress: <strong>{triageQueue.length} Patients</strong></span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span> Red: {triageQueue.filter((x) => x.triageColor === 'RED').length}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Yellow: {triageQueue.filter((x) => x.triageColor === 'YELLOW').length}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Green: {triageQueue.filter((x) => x.triageColor === 'GREEN').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
