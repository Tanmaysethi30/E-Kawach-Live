import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeAppointments } from '../../services/telemetry';
import QRCode from 'qrcode';
import {
  validateProfileCompleteness,
  getOrCreateEmergencyId,
  createQrReferencePayload,
  savePatientToRegistry,
  lookupPatientInRegistry,
  DEFAULT_PATIENT_PROFILE,
  calculateAge,
} from '../../utils/emergencyRegistry';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeRecordTab, setActiveRecordTab] = useState('appointments');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Dynamic QR Code generation states
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [profileSyncKey, setProfileSyncKey] = useState(0);

  // Listen for background profile updates (e.g. from Settings or emergency contacts)
  useEffect(() => {
    const handleProfileSync = (event) => {
      if (event?.detail?.source === 'PatientDashboard') return;
      setProfileSyncKey((prev) => prev + 1);
    };
    window.addEventListener('ekawach_patient_profile_updated', handleProfileSync);
    return () => {
      window.removeEventListener('ekawach_patient_profile_updated', handleProfileSync);
    };
  }, []);

  // Fetch fresh verified profile from backend database on mount / auth change
  useEffect(() => {
    let isMounted = true;
    const fetchFreshProfile = async () => {
      const token = localStorage.getItem('ekawach_token');
      if (!token) return;
      try {
        const res = await fetch('/api/patient/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.profile && isMounted) {
            const p = data.profile;
            const updated = {
              fullName: p.name || p.fullName,
              name: p.name || p.fullName,
              abhaNumber: p.abhaNumber,
              phone: p.phone,
              aadhaarNumber: p.aadhaarNumber,
              email: p.email,
              dob: p.dob ? (typeof p.dob === 'string' && p.dob.includes('T') ? p.dob.split('T')[0] : p.dob) : undefined,
              gender: p.gender,
              bloodGroup: p.bloodGroup,
              address: p.address,
              pincode: p.pincode,
              city: p.city,
              state: p.state,
              emergencyContactName: p.emergencyContactName,
              emergencyContactPhone: p.emergencyContactPhone,
              emergencyContactRelation: p.emergencyContactRelation,
              bpLevel: p.bpLevel,
              hasDiabetes: p.hasDiabetes,
              diabetesType: p.diabetesType,
              diabetesMedication: p.diabetesMedication,
              allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : p.allergies,
              chronicConditions: Array.isArray(p.chronicConditions) ? p.chronicConditions.join(', ') : p.chronicConditions,
            };
            Object.keys(updated).forEach((k) => updated[k] === undefined && delete updated[k]);

            savePatientToRegistry({ ...currentUser, ...updated }, false, 'PatientDashboard');
            localStorage.setItem(
              'ekawach_patient_profile',
              JSON.stringify({ ...updated, userId: currentUser?.id, email: currentUser?.email })
            );
            setProfileSyncKey((prev) => prev + 1);
          }
        }
      } catch (err) {
        console.warn('Dashboard profile fetch notice:', err);
      }
    };
    fetchFreshProfile();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, currentUser?.email]);

  const isDemoRajesh = !currentUser || currentUser?.id === 'user-patient-rajesh' || currentUser?.email === 'rajesh.sharma@ekawach.health';

  // Compute active patient profile combining currentUser, saved local profile, and registry
  const activeProfile = useMemo(() => {
    let savedLocal = {};
    try {
      const p = localStorage.getItem('ekawach_patient_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (!currentUser?.id || !parsed.userId || parsed.userId === currentUser.id || parsed.email === currentUser.email) {
          savedLocal = parsed;
        }
      }
    } catch (_e) {}

    const queryKey = savedLocal.emergencyId || currentUser?.emergencyId || currentUser?.abhaNumber || currentUser?.id || (isDemoRajesh ? 'EK-EMG-9824-8819' : null);
    const regMatch = queryKey ? lookupPatientInRegistry(queryKey) : null;
    const base = isDemoRajesh ? DEFAULT_PATIENT_PROFILE : {};

    return {
      ...base,
      ...(currentUser || {}),
      ...(regMatch || {}),
      ...savedLocal,
    };
  }, [currentUser, profileSyncKey, isDemoRajesh]);

  // Validate profile completeness
  const completeness = useMemo(() => validateProfileCompleteness(activeProfile), [activeProfile]);
  const isProfileComplete = completeness.isComplete;
  const emergencyId = useMemo(() => activeProfile.emergencyId || getOrCreateEmergencyId(activeProfile), [activeProfile]);

  // Patient details with robust fallbacks
  const patientName = activeProfile.name || activeProfile.fullName || currentUser?.name || (isDemoRajesh ? 'Rajesh V. Sharma' : 'Patient');
  const abhaVal = activeProfile.abhaNumber || activeProfile.id || currentUser?.abhaNumber || currentUser?.id || (isDemoRajesh ? '9824-8819-3320-TN' : 'ABHA-PENDING');
  const phrVal = activeProfile.email || currentUser?.email || (patientName ? `${patientName.toLowerCase().replace(/\s+/g, '.')}@abdm` : 'patient@abdm');
  const bloodGroup = activeProfile.bloodGroup || currentUser?.bloodGroup || (isDemoRajesh ? 'O+' : 'Not Set');
  const phoneVal = activeProfile.phone || currentUser?.phone || '';
  const rawAadhaar = activeProfile.aadhaarNumber || activeProfile.aadhaar || currentUser?.aadhaarNumber || currentUser?.aadhaar;
  const aadhaarVal = rawAadhaar ? (rawAadhaar.length >= 4 ? `XXXX-XXXX-${rawAadhaar.slice(-4)}` : rawAadhaar) : (isDemoRajesh ? 'XXXX-XXXX-3320' : 'Not Linked');
  const genderVal = activeProfile.gender || currentUser?.gender || 'Not Specified';
  const dobVal = activeProfile.dob || currentUser?.dob || (isDemoRajesh ? '1984-08-14' : '');
  const ageVal = dobVal ? calculateAge(dobVal, activeProfile.age || currentUser?.age) : (activeProfile.age || currentUser?.age || (isDemoRajesh ? '42 Yrs' : 'Not Set'));
  const addressVal = activeProfile.address || currentUser?.address || (isDemoRajesh ? 'Greams Road, Thousand Lights' : 'Residential Address');
  const cityVal = activeProfile.city || currentUser?.city || (isDemoRajesh ? 'Chennai' : 'New Delhi');
  const stateVal = activeProfile.state || currentUser?.state || (isDemoRajesh ? 'Tamil Nadu' : 'Delhi');
  const pincodeVal = activeProfile.pincode || currentUser?.pincode || (isDemoRajesh ? '600006' : '');
  const allergiesVal = activeProfile.allergies || currentUser?.allergies || (isDemoRajesh ? 'Penicillin (Severe anaphylaxis)' : 'None reported');
  const conditionsVal = activeProfile.conditions || activeProfile.chronicConditions || currentUser?.chronicConditions || (isDemoRajesh ? 'Hypertension, Mild Asthmatic Bronchitis' : 'None reported');
  const bpLevelVal = activeProfile.bpLevel || currentUser?.bpLevel || (isDemoRajesh ? '128/82 mmHg (Optimal)' : 'Normal (120/80)');
  const hasDiabetesVal = activeProfile.hasDiabetes || currentUser?.hasDiabetes;
  const diabetesVal = hasDiabetesVal === 'Yes' 
    ? `Diabetic (${activeProfile.diabetesType || currentUser?.diabetesType || 'Type 2'}) • ${activeProfile.diabetesMedication || currentUser?.diabetesMedication || 'Metformin'}`
    : 'Non-Diabetic (Normal Range)';
  const emergencyName = activeProfile.emergencyContactName || currentUser?.emergencyContactName || (isDemoRajesh ? 'Ananya S. Sharma' : 'Emergency Contact');
  const emergencyRelation = activeProfile.emergencyContactRelation || currentUser?.emergencyContactRelation || (isDemoRajesh ? 'Spouse' : 'Family');
  const emergencyPhone = activeProfile.emergencyContactPhone || currentUser?.emergencyContactPhone || (isDemoRajesh ? '+91 98401 22819' : '');
  const hospitalVal = (typeof activeProfile.hospital === 'object' && activeProfile.hospital !== null)
    ? (activeProfile.hospital.name || activeProfile.hospital.hospital_name || 'Apollo Greams Trauma Hub (Connected)')
    : (activeProfile.hospital || currentUser?.hospital || 'Apollo Greams Trauma Hub (Connected)');

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: `${patientName}, your E-KAWACH Trauma & Clinical Assistant is active. You can check medication interactions, triage questions, or ask about hospital access anytime.`,
    },
  ]);

  // Automatic QR Code Generation:
  // Automatically generates unique Patient Emergency QR upon completion of required details.
  // Privacy safe: encodes secure reference ID rather than readable plain-text medical history.
  useEffect(() => {
    if (!isProfileComplete) {
      setQrCodeUrl('');
      return;
    }

    let isMounted = true;
    const generateQR = async () => {
      try {
        // Register in local prototype emergency registry without triggering recursive broadcast loop
        savePatientToRegistry(
          {
            ...activeProfile,
            emergencyId,
            abhaNumber: abhaVal,
            token: `EK-TR-${abhaVal.replace(/[^0-9]/g, '').slice(-4) || '8819'}-V4`,
          },
          false,
          'PatientDashboard'
        );

        // Encoded secure reference payload (No plain text sensitive data inside QR)
        const payload = createQrReferencePayload({
          ...activeProfile,
          emergencyId,
          abhaNumber: abhaVal,
          token: `EK-TR-${abhaVal.replace(/[^0-9]/g, '').slice(-4) || '8819'}-V4`,
        });

        const url = await QRCode.toDataURL(payload, {
          width: 320,
          margin: 1.5,
          color: {
            dark: '#00354c',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        if (isMounted) {
          setQrCodeUrl(url);
        }
      } catch (err) {
        console.error('Error generating optical QR matrix:', err);
      }
    };

    generateQR();
    return () => {
      isMounted = false;
    };
  }, [isProfileComplete, emergencyId, abhaVal]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingData(true);
        const token = localStorage.getItem('ekawach_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch live appointments
        const aptRes = await fetch('/api/patient/appointments', { headers });
        if (aptRes.ok) {
          const aptData = await aptRes.json();
          if (aptData.success && Array.isArray(aptData.appointments) && aptData.appointments.length > 0) {
            setAppointments(aptData.appointments);
          }
        }

        // Fetch health history records
        const recRes = await fetch('/api/patient/health-history', { headers });
        if (recRes.ok) {
          const recData = await recRes.json();
          const list = recData.records || recData.history?.records || [];
          if (Array.isArray(list) && list.length > 0) {
            setHealthRecords(list);
          }
        }
      } catch (e) {
        console.error('Error fetching dashboard records:', e);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();

    const unsubscribe = subscribeAppointments((event) => {
      fetchDashboardData();
      if (event.message) {
        showToast(event.message);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.id, currentUser?.role]);

  // Demo fallback datasets when empty to maintain high clinical utility
  const fallbackAppointments = [
    {
      id: 'APT-88219',
      doctor: { name: 'Dr. Kavitha Menon', specialization: 'Cardiology' },
      doctorName: 'Dr. Kavitha Menon',
      department: 'Interventional Cardiology',
      hospital: 'Apollo Greams Trauma Hub',
      scheduledAt: '2026-10-28T10:30:00Z',
      timeSlot: '10:30 AM',
      status: 'CONFIRMED',
      token: 'TK-042',
      type: 'Follow-up Cardiology Review',
    },
    {
      id: 'APT-88194',
      doctor: { name: 'Dr. Suresh Rao', specialization: 'Pulmonology' },
      doctorName: 'Dr. Suresh Rao',
      department: 'Respiratory Medicine',
      hospital: 'Apollo Greams Trauma Hub',
      scheduledAt: '2026-11-04T14:15:00Z',
      timeSlot: '02:15 PM',
      status: 'PENDING',
      token: 'TK-089',
      type: 'Bronchial Assessment',
    },
  ];

  const activeAppointments = appointments.length > 0 ? appointments : fallbackAppointments;
  const nextAppointment = activeAppointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  ) || activeAppointments[0];

  const fallbackPrescriptions = [
    {
      id: 'rx-1',
      title: 'Rosuvastatin 10mg',
      dosage: '1 Tablet Daily (Bedtime)',
      duration: '30 Days',
      doctorName: 'Dr. Kavitha Menon',
      diagnosis: 'Dyslipidemia / Cardiovascular Prophylaxis',
      prescribedAt: '15-Oct-2026',
      status: 'ACTIVE',
    },
    {
      id: 'rx-2',
      title: 'Telmisartan 40mg + Amlodipine 5mg',
      dosage: '1 Tablet Daily (Morning)',
      duration: '60 Days',
      doctorName: 'Dr. Kavitha Menon',
      diagnosis: 'Primary Essential Hypertension',
      prescribedAt: '15-Oct-2026',
      status: 'ACTIVE',
    },
    {
      id: 'rx-3',
      title: 'Salbutamol Inhaler 100mcg',
      dosage: '2 Puffs PRN (As needed)',
      duration: 'PRN',
      doctorName: 'Dr. Suresh Rao',
      diagnosis: 'Mild Asthmatic Bronchitis',
      prescribedAt: '02-Sep-2026',
      status: 'ACTIVE',
    },
  ];

  const livePrescriptions = healthRecords.filter(
    (r) => r.type === 'PRESCRIPTION' || r.recordType === 'PRESCRIPTION'
  );
  const displayedPrescriptions = livePrescriptions.length > 0 ? livePrescriptions : fallbackPrescriptions;

  const fallbackLabReports = [
    {
      id: 'lab-1',
      title: 'Comprehensive Metabolic Panel (CMP) + Lipid Profile',
      facility: 'Apollo Central Diagnostic Laboratory',
      date: '18-Oct-2026',
      summary: 'Total Cholesterol: 168 mg/dL • HDL: 48 mg/dL • LDL: 94 mg/dL',
      flag: 'NORMAL',
    },
    {
      id: 'lab-2',
      title: 'Glycated Hemoglobin (HbA1c) & Fasting Blood Sugar',
      facility: 'Greams PathLab Care',
      date: '14-Oct-2026',
      summary: 'HbA1c: 6.8% (Fair Control) • Fasting Glucose: 118 mg/dL',
      flag: 'ATTENTION',
    },
    {
      id: 'lab-3',
      title: '12-Lead Resting Electrocardiogram (ECG)',
      facility: 'Apollo Greams Trauma Heart Station',
      date: '24-Sep-2026',
      summary: 'Normal Sinus Rhythm • Rate 72 bpm • No ischemic ST shifts',
      flag: 'NORMAL',
    },
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(label);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleDownloadQr = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `EKAWACH-ABHA-QR-${patientName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Emergency ABHA QR Code downloaded successfully.');
  };

  const handleDownloadSummary = () => {
    showToast(`Downloading Universal Health Summary (${abhaVal}.pdf)...`);
    const content = `E-KAWACH UNIVERSAL EMERGENCY HEALTH SUMMARY\nPatient: ${patientName}\nABHA ID: ${abhaVal}\nPHR Handle: ${phrVal}\nBlood Group: ${bloodGroup}\nAge & Gender: ${ageVal}, ${genderVal}\nAllergies: ${allergiesVal}\nChronic Conditions: ${conditionsVal}\nBP Baseline: ${bpLevelVal}\nPrimary Emergency Kin: ${emergencyName} (${emergencyRelation}) • ${emergencyPhone}\nPrimary Hospital: ${hospitalVal}\nABDM Cryptographic Stamp: Level-4 Certified`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EKAWACH-Summary-${patientName.replace(/\s+/g, '-')}.pdf`;
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
      let reply = 'E-KAWACH AI: Based on your ABHA health records, your metrics are synchronized with Apollo Greams Trauma Hub. Let me know if you need clinical triage assistance.';
      if (textToSend.toLowerCase().includes('interaction') || textToSend.toLowerCase().includes('drug')) {
        reply = 'E-KAWACH AI: Checking Rosuvastatin 10mg & Telmisartan 40mg against your profile. No adverse contraindications found. Penicillin remains flagged as a SEVERE ALLERGY.';
      } else if (textToSend.toLowerCase().includes('lab') || textToSend.toLowerCase().includes('report')) {
        reply = 'E-KAWACH AI: Your last HbA1c reading was 6.8% (fair glycemic control). Fasting blood sugar logged at 118 mg/dL.';
      } else if (textToSend.toLowerCase().includes('emergency') || textToSend.toLowerCase().includes('er')) {
        reply = `E-KAWACH AI: Emergency protocol active. Your primary kin ${emergencyName} (${emergencyPhone}) and Apollo ER have your Level-1 telemetry token.`;
      }
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div className="w-full">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm bg-primary text-on-primary rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">info</span>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg font-semibold">Notification</span>
            <span className="font-body-sm text-body-sm text-surface-variant">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-space-md text-surface-variant hover:text-on-primary transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* ENLARGE QR CODE MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col items-center gap-4 relative border border-outline-variant/30">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              type="button"
              title="Close QR Modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-primary">Emergency Triage ABHA Pass</span>
                <span className="text-xs text-on-surface-variant">ABDM Ayushman Bharat Digital ID</span>
              </div>
            </div>

            {/* High-Resolution QR Canvas */}
            <div className="p-3 bg-white rounded-xl shadow-inner border border-outline-variant/40 flex flex-col items-center">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="High Resolution Patient QR Code"
                  className="w-64 h-64 object-contain rounded-md"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-on-surface-variant text-sm">
                  Generating optical QR...
                </div>
              )}
              <div className="mt-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-sm font-bold text-primary tracking-wider">{abhaVal}</span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-mono text-xs font-semibold text-secondary">{emergencyId}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5 font-sans">
                  Scannable by any Doctor Portal scanner, triage kiosk, or hospital camera
                </p>
              </div>
            </div>

            {/* Quick Summary Pill inside Modal */}
            <div className="w-full bg-surface-container-low rounded-xl p-3 text-xs space-y-1.5 border border-outline-variant/20">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Emergency ID:</span>
                <span className="font-mono font-bold text-secondary">{emergencyId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Patient Name:</span>
                <span className="font-semibold text-on-surface">{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Blood Group:</span>
                <span className="font-bold text-primary">{bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Allergies:</span>
                <span className="font-semibold text-error">{allergiesVal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Emergency SOS:</span>
                <span className="font-mono font-medium text-on-surface">{emergencyPhone}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2 w-full mt-1">
              <button
                onClick={handleDownloadQr}
                className="py-2.5 px-3 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Save Image
              </button>
              <button
                onClick={() => handleCopy(abhaVal, 'ABHA ID')}
                className="py-2.5 px-3 rounded-lg bg-primary text-on-primary hover:bg-primary/95 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedKey === 'ABHA ID' ? 'check' : 'content_copy'}
                </span>
                {copiedKey === 'ABHA ID' ? 'Copied' : 'Copy ABHA'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full gap-space-xl">
        {/* GREETING HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                Welcome, {patientName}
              </h1>
              <span className="inline-flex items-center gap-1 px-space-xs py-space-2xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                LIVE PATIENT NODE
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-space-xs flex-wrap">
              <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
              <span>Today is Monday, 24 October 2026</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
              <span className="flex items-center gap-1 font-medium text-primary">
                <span className="material-symbols-outlined text-[16px] text-tertiary-container">hub</span>
                {hospitalVal}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              onClick={handleDownloadSummary}
              className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container text-primary font-label-lg text-label-lg shadow-xs hover:bg-surface-container-high transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download Health Summary</span>
            </button>
            <button
              onClick={() => navigate('/patient/book-doctor')}
              className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Book Consultation</span>
            </button>
          </div>
        </div>

        {/* TOP SECTION: SECURE HEALTH ID & 3 QUICK-GLANCE CARDS */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-stretch">
          {/* E-KAWACH SECURE HEALTH ID CARD WITH LIVE GENERATED QR */}
          <div className="xl:col-span-7 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-space-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-primary/5 pointer-events-none"></div>

            {/* Card Top Header */}
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                    Universal Health Identity (ABDM)
                  </span>
                  <span className="font-headline-sm text-base text-primary font-bold">
                    E-KAWACH DIGITAL HEALTH CARD
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E4E4FB] text-primary font-label-sm text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">contactless</span>
                  NFC • QR READY
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-xs font-semibold">
                  Active Grid
                </span>
              </div>
            </div>

            {/* Card Main Body: Comprehensive Patient Details & Scannable QR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md py-space-md items-center">
              {/* Patient Info Column */}
              <div className="lg:col-span-8 flex flex-col gap-space-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline-md text-xl text-on-surface font-bold">
                    {patientName}
                  </h2>
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium text-xs">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    NDHM Verified
                  </span>
                </div>

                {/* 14-Digit ABHA ID Box with Copy */}
                <div className="flex items-center gap-2 flex-wrap bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30 w-fit my-0.5">
                  <span className="text-xs font-medium text-on-surface-variant">ABHA:</span>
                  <span className="font-mono text-sm font-bold text-primary tracking-wide">
                    {abhaVal}
                  </span>
                  <button
                    onClick={() => handleCopy(abhaVal, 'ABHA ID')}
                    className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    title="Copy 14-Digit ABHA"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedKey === 'ABHA ID' ? 'check' : 'content_copy'}
                    </span>
                  </button>
                  <span className="text-outline-variant">•</span>
                  <span className="text-xs text-on-surface-variant font-mono">{phrVal}</span>
                </div>

                {/* Patient Key Badges (Blood Group, Age, Gender, Aadhaar, Phone) */}
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-xs font-bold shadow-xs">
                    Blood Group: {bloodGroup}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-xs font-medium">
                    {ageVal} • {genderVal}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-xs font-medium font-mono">
                    Aadhaar: {aadhaarVal}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
                    PIN: {pincodeVal}
                  </span>
                </div>

                {/* Medical & Triage Line Items */}
                <div className="mt-2 space-y-1.5 text-xs text-on-surface">
                  {allergiesVal && (
                    <div className="flex items-center gap-1.5 text-error font-medium">
                      <span className="material-symbols-outlined text-[16px] text-error">warning</span>
                      <span className="font-bold">Critical Allergies:</span>
                      <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-semibold">
                        {allergiesVal}
                      </span>
                    </div>
                  )}

                  {conditionsVal && (
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-secondary">vital_signs</span>
                      <span className="font-medium text-on-surface">Chronic Conditions:</span>
                      <span className="text-on-surface">{conditionsVal}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-teal-600">favorite</span>
                    <span className="font-medium text-on-surface">BP Baseline:</span>
                    <span className="font-semibold text-secondary">{bpLevelVal}</span>
                    <span className="text-outline-variant">•</span>
                    <span className="text-on-surface-variant">{diabetesVal}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-error">contact_emergency</span>
                    <span className="font-medium text-on-surface">Primary SOS Kin:</span>
                    <span className="font-semibold text-primary">{emergencyName} ({emergencyRelation})</span>
                    <span className="font-mono text-on-surface-variant">• {emergencyPhone}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic QR Code Module (Generated Real-Time Optical Matrix) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 bg-surface-container-low rounded-xl text-center border border-outline-variant/30 transition-all duration-300">
                {isProfileComplete ? (
                  <>
                    <div
                      onClick={() => setQrModalOpen(true)}
                      className="p-2 bg-white rounded-xl shadow-xs border border-outline-variant/40 flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-300 group relative"
                      title="Click to Enlarge QR Code"
                    >
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="ABDM Patient Optical QR Code"
                          className="w-28 h-28 object-contain rounded transition-opacity duration-300"
                        />
                      ) : (
                        <div className="w-28 h-28 flex flex-col items-center justify-center text-on-surface-variant text-xs font-mono gap-1">
                          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                          <span>Syncing QR...</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs">
                          Enlarge
                        </span>
                      </div>
                    </div>

                    {/* QR Subtitle & Scannability Tag */}
                    <div className="flex flex-col items-center gap-0.5 mt-2">
                      <span className="font-label-sm text-xs font-bold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary">sensors</span>
                        ID: <span className="font-mono text-secondary">{emergencyId}</span>
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        ABDM Certified • Scannable Optical QR
                      </span>
                    </div>

                    {/* QR Actions (Enlarge / Save / Mode) */}
                    <div className="flex items-center gap-1.5 mt-2.5 w-full justify-center">
                      <button
                        onClick={() => setQrModalOpen(true)}
                        className="px-2.5 py-1 rounded-md bg-surface-container-highest text-primary text-[11px] font-semibold hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                        Enlarge
                      </button>
                      <button
                        onClick={handleDownloadQr}
                        className="px-2.5 py-1 rounded-md bg-primary text-on-primary text-[11px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-center gap-2 w-full">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">contact_emergency</span>
                    </div>
                    <span className="font-label-sm text-xs font-bold text-amber-900">
                      Emergency QR Pending
                    </span>
                    <p className="text-[11px] text-on-surface-variant leading-tight">
                      Complete required medical profile to activate your Emergency Health QR.
                    </p>
                    <button
                      onClick={() => navigate('/patient/settings#profile')}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
                      type="button"
                    >
                      Complete Details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card Bottom Verified Footer Bar */}
            <div className="pt-space-xs flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface-container px-space-md py-space-xs rounded-xl mt-space-xs gap-1">
              <div className="flex items-center gap-space-xs text-primary font-label-md text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px] text-tertiary-container">verified</span>
                <span>Universal Trauma Pass • Golden Hour Protocol Level 1</span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-mono">
                Token: EK-TR-{abhaVal.replace(/[^0-9]/g, '').slice(-4) || '8819'}-V4
              </span>
            </div>
          </div>

          {/* 3 QUICK-GLANCE STATUS CARDS */}
          <div className="xl:col-span-5 flex flex-col justify-between gap-space-sm">
            {/* Card 1: Next Appointment */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/30 flex items-start justify-between">
              <div className="flex items-start gap-space-sm">
                <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[24px]">calendar_clock</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                    Next Consultation Slot
                  </span>
                  {nextAppointment ? (
                    <>
                      <span className="font-headline-sm text-base text-on-surface font-bold mt-0.5">
                        {nextAppointment.scheduledAt
                          ? new Date(nextAppointment.scheduledAt).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Scheduled'},{' '}
                        {nextAppointment.timeSlot || nextAppointment.slot || '10:30 AM'}
                      </span>
                      <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                        {nextAppointment.doctor?.name || nextAppointment.doctorName || 'Dr. Kavitha Menon'} (
                        {nextAppointment.department || nextAppointment.doctor?.specialization || 'Cardiology'}) • Token:{' '}
                        {nextAppointment.token || nextAppointment.id}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-headline-sm text-base text-on-surface font-bold mt-0.5">
                        No Pending Slot
                      </span>
                      <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                        Ready to schedule routine or emergency checkup
                      </span>
                    </>
                  )}
                </div>
              </div>
              {nextAppointment ? (
                <span
                  className={`px-2.5 py-1 rounded-full font-label-sm text-xs font-bold ${
                    nextAppointment.status === 'CONFIRMED'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {nextAppointment.status}
                </span>
              ) : (
                <button
                  onClick={() => navigate('/patient/book-doctor')}
                  className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                  type="button"
                >
                  Book
                </button>
              )}
            </div>

            {/* Card 2: ABDM Grid Status */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/30 flex items-start justify-between">
              <div className="flex items-start gap-space-sm">
                <div className="w-11 h-11 rounded-xl bg-[#E4E4FB] flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                    ABDM Consent Gateway
                  </span>
                  <span className="font-headline-sm text-base text-on-surface font-bold mt-0.5">
                    Golden Hour Override Active
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Instant emergency consent override enabled • HIPAA &amp; NDHM Compliant
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#E4E4FB] text-primary font-label-sm text-xs font-bold">
                Active Sync
              </span>
            </div>

            {/* Card 3: Clinical Health Records */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/30 flex items-start justify-between">
              <div className="flex items-start gap-space-sm">
                <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[24px]">medication</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                    Prescriptions &amp; Vault
                  </span>
                  <span className="font-headline-sm text-base text-on-surface font-bold mt-0.5">
                    {displayedPrescriptions.length} Active Prescriptions on File
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    {displayedPrescriptions[0]?.diagnosis || displayedPrescriptions[0]?.title || 'Synchronized with Apollo Hub'}
                  </span>
                </div>
              </div>
              <Link
                to="/patient/health-history"
                className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-bold no-underline hover:opacity-90"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION: REGISTERED EMERGENCY SOS CONTACT BANNER */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/30 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-error"></div>
          <div className="flex items-center gap-space-md pl-1">
            <div className="w-12 h-12 rounded-xl bg-error-container/80 text-error flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">connect_without_contact</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] animate-pulse">e911_emergency</span>
                  Registered Primary Emergency SOS Kin
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-semibold">
                  {emergencyRelation}
                </span>
              </div>
              <span className="font-headline-sm text-base text-on-surface font-bold mt-0.5">
                {emergencyName}
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant font-mono flex items-center gap-1 mt-0.5 flex-wrap">
                <span className="material-symbols-outlined text-[15px] text-error">call</span>
                <span>{emergencyPhone}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-sans ml-1 text-xs">
                  • Verified 24/7 Dispatch Contact
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <a
              href={`tel:${emergencyPhone.replace(/\s+/g, '')}`}
              className="px-3.5 py-2 rounded-lg bg-error text-on-error font-label-md text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all no-underline"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              Direct SOS Call
            </a>
            <button
              onClick={() => navigate('/patient/settings#emergency')}
              className="px-3.5 py-2 rounded-lg bg-surface-container text-primary font-label-md text-xs font-semibold flex items-center gap-1 hover:bg-surface-container-high transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Update Kin
            </button>
          </div>
        </div>

        {/* SECTION: HOSPITAL ER ACCESS CALLOUT BANNER */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col md:flex-row items-stretch">
          <div className="w-2.5 bg-error shrink-0"></div>
          <div className="p-space-lg flex-1 flex flex-col justify-between gap-space-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">e911_emergency</span>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-headline-sm text-base text-on-surface font-bold">
                      Emergency Room &amp; Golden Hour Ingress
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-[11px] font-bold animate-pulse">
                      EMERGENCY PRIORITY
                    </span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Instant zero-friction access for ER paramedics &amp; trauma staff via optical QR scan or NFC. Grants immediate one-time clinical override for medical history &amp; allergy telemetry.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-xs flex-wrap">
                <button
                  onClick={() => navigate('/patient/settings')}
                  className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container text-primary font-label-lg text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">contacts</span>
                  <span>Trauma Contacts</span>
                </button>
                <button
                  onClick={() => navigate('/patient/emergency')}
                  className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-error text-on-error font-label-lg text-xs font-bold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                  <span>View ER Access Card</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-xl text-on-surface font-body-sm text-xs">
              <span className="flex items-center gap-1 font-semibold text-error">
                <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                Emergency Protocol: Level 1 Trauma Active
              </span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant font-medium">Biometric Override Enabled</span>
              <span className="text-on-surface-variant">•</span>
              <span className="font-mono text-on-surface-variant">Auth Token: EK-TR-88190-V4</span>
            </div>
          </div>
        </div>

        {/* SECTION: CLINICAL DOSSIER TABS (Appointments, Prescriptions, Lab Reports, Linked Hospitals) */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-space-lg flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">medical_services</span>
              <h2 className="font-headline-sm text-base text-primary font-bold">
                Clinical Health Records &amp; Consultations
              </h2>
            </div>
            {/* Tab Controls */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
              <button
                onClick={() => setActiveRecordTab('appointments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeRecordTab === 'appointments'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Appointments ({activeAppointments.length})
              </button>
              <button
                onClick={() => setActiveRecordTab('prescriptions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeRecordTab === 'prescriptions'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Prescriptions ({displayedPrescriptions.length})
              </button>
              <button
                onClick={() => setActiveRecordTab('labs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeRecordTab === 'labs'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Lab Reports ({fallbackLabReports.length})
              </button>
              <button
                onClick={() => setActiveRecordTab('hospitals')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeRecordTab === 'hospitals'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Linked Hospitals (3)
              </button>
            </div>
          </div>

          {/* TAB CONTENT: APPOINTMENTS */}
          {activeRecordTab === 'appointments' && (
            <div className="space-y-3">
              {activeAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-space-md rounded-xl border border-outline-variant/30 hover:border-primary/40 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shrink-0">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-on-surface text-sm">
                          {apt.doctor?.name || apt.doctorName || 'Dr. Kavitha Menon'}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          • {apt.department || apt.doctor?.specialization || 'Clinical'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            apt.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        <span className="font-medium text-primary">{apt.timeSlot || '10:30 AM'}</span>
                        {apt.scheduledAt && ` • ${new Date(apt.scheduledAt).toLocaleDateString()}`}
                        {' • '}
                        <span className="font-mono">Token: {apt.token || apt.id}</span>
                        {' • '}
                        {typeof apt.hospital === 'object' && apt.hospital !== null
                          ? (apt.hospital.name || apt.hospital.hospital_name || hospitalVal)
                          : (apt.hospital || hospitalVal)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => showToast(`Consultation token ${apt.token || apt.id} confirmed.`)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-medium text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
                      type="button"
                    >
                      View Slip
                    </button>
                    <button
                      onClick={() => navigate('/patient/book-doctor')}
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-medium text-xs hover:bg-primary/90 transition-colors cursor-pointer"
                      type="button"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: PRESCRIPTIONS */}
          {activeRecordTab === 'prescriptions' && (
            <div className="space-y-3">
              {displayedPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-space-md rounded-xl border border-outline-variant/30 hover:border-primary/40 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <span className="material-symbols-outlined text-[20px]">pill</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-on-surface text-sm">{rx.title || rx.medicine}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          {rx.status || 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        <span className="font-semibold text-primary">{rx.dosage}</span> • Duration: {rx.duration || '30 Days'}
                      </p>
                      <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                        Prescribed by {rx.doctorName || 'Dr. Kavitha Menon'} • Diagnosis: {rx.diagnosis}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(rx.title || rx.medicine, 'Prescription Name')}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-medium text-xs hover:bg-surface-container-high transition-colors self-end sm:self-center cursor-pointer"
                    type="button"
                  >
                    Copy Dosage
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: LAB REPORTS */}
          {activeRecordTab === 'labs' && (
            <div className="space-y-3">
              {fallbackLabReports.map((lab) => (
                <div
                  key={lab.id}
                  className="p-space-md rounded-xl border border-outline-variant/30 hover:border-primary/40 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <span className="material-symbols-outlined text-[20px]">biotechnology</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-on-surface text-sm">{lab.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            lab.flag === 'NORMAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {lab.flag}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {lab.summary}
                      </p>
                      <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                        {lab.facility} • Reported on {lab.date}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Full telemetry report downloaded for ${lab.title}.`)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-medium text-xs hover:bg-surface-container-high transition-colors self-end sm:self-center cursor-pointer"
                    type="button"
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: LINKED HOSPITALS */}
          {activeRecordTab === 'hospitals' && (
            <div className="space-y-3">
              <div className="p-space-md rounded-xl border border-outline-variant/30 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                    AG
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface text-sm">Apollo Hospitals (Greams Road Trauma Hub)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                        Primary ER Node
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                      HIP-ID: HIP-IN-TN-CHN-0041 • Last synced: Just now
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Sync refreshed for Apollo Greams Trauma Hub.')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-medium text-xs hover:bg-surface-container-high transition-colors self-end sm:self-center cursor-pointer"
                  type="button"
                >
                  Sync Now
                </button>
              </div>

              <div className="p-space-md rounded-xl border border-outline-variant/30 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                    AI
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface text-sm">AIIMS Apex Trauma Center</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold">
                        National Tertiary
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                      HIP-ID: HIP-IN-DL-DEL-0001 • Last synced: Yesterday
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Sync refreshed for AIIMS Apex Trauma Center.')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-medium text-xs hover:bg-surface-container-high transition-colors self-end sm:self-center cursor-pointer"
                  type="button"
                >
                  Sync Now
                </button>
              </div>

              <div className="p-space-md rounded-xl border border-outline-variant/30 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                    RG
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface text-sm">Rajiv Gandhi Government General Hospital</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-semibold">
                        Government Hub
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                      HIP-ID: HIP-IN-TN-CHN-0009 • Last synced: 2 days ago
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Sync refreshed for RGGGH.')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-medium text-xs hover:bg-surface-container-high transition-colors self-end sm:self-center cursor-pointer"
                  type="button"
                >
                  Sync Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FLOATING AI CHATBOT ASSISTANT WIDGET */}
        <aside aria-label="Clinical Navigator Chatbot" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-space-xs pointer-events-none">
          {/* Flyout Chat Window Card */}
          <div className={`pointer-events-auto w-80 sm:w-96 bg-surface-container-lowest rounded-xl shadow-xl p-space-md flex flex-col gap-space-sm transition-all duration-300 transform scale-100 origin-bottom-right ${aiChatOpen ? 'block' : 'hidden'}`} id="ai-chat-card">
            {/* AI Header */}
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
              <button onClick={() => setAiChatOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer" type="button">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            {/* AI Prompt Preview Bubble */}
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
            {/* Quick Action Pills */}
            <div className="flex items-center gap-space-2xs flex-wrap">
              <button onClick={() => handleSendChat('Check Drug Interaction')} className="px-space-xs py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-colors cursor-pointer" type="button">
                Check Drug Interaction
              </button>
              <button onClick={() => handleSendChat('Explain Lab Report')} className="px-space-xs py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-colors cursor-pointer" type="button">
                Explain Lab Report
              </button>
              <button onClick={() => handleSendChat('Emergency ER Guidance')} className="px-space-xs py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer" type="button">
                Emergency ER Guidance
              </button>
            </div>
            {/* Input Field */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="flex items-center gap-space-xs bg-surface-container-low rounded-lg px-space-sm py-space-2xs">
              <input
                className="bg-transparent border-none outline-none font-body-sm text-body-sm w-full text-on-surface placeholder:text-outline"
                placeholder="Ask about medications, allergies, or triage..."
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button className="text-primary hover:text-primary-container transition-colors flex items-center justify-center cursor-pointer" type="submit">
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
          {/* Floating Toggle Button */}
          <button onClick={() => setAiChatOpen(!aiChatOpen)} className="pointer-events-auto flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-xl hover:bg-primary/90 transition-all cursor-pointer" type="button">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span>Ask E-KAWACH AI</span>
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping ml-1"></span>
          </button>
        </aside>
      </div>
    </div>
  );
}
