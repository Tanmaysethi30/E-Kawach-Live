import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeReferrals } from '../../services/telemetry';

const CLINICIANS_DATA = [
  {
    id: 'doc-arjun',
    name: 'Dr. Arjun Nair, MD, DM',
    specialty: 'Neurology & Stroke Intervention',
    hospital: 'Fortis Grid Hub',
    nmc: 'NMC-55210-DL',
    activeStatus: 'Active 4m ago',
    connected: true,
    onDuty: true,
    initials: 'AN',
  },
  {
    id: 'doc-priya',
    name: 'Dr. Priya Sundaram, MS, DNB',
    specialty: 'Ophthalmology & Trauma Microsurgery',
    hospital: 'Apollo Greams Trauma Hub',
    nmc: 'NMC-49102-TN',
    activeStatus: 'Active Now',
    connected: true,
    onDuty: true,
    initials: 'PS',
  },
  {
    id: 'doc-arvind',
    name: 'Dr. Arvind Swaminathan, MD',
    specialty: 'Diabetology & Endocrinology',
    hospital: 'Fortis Clinical Center',
    nmc: 'NMC-33891-TN',
    activeStatus: 'Active 12m ago',
    connected: false,
    connectKey: 'arvind',
    onDuty: false,
    initials: 'AS',
  },
  {
    id: 'doc-meera',
    name: 'Dr. Meera Nambiar, MD, DCH',
    specialty: 'Pediatric Intensive Care & Neonatology',
    hospital: 'Apollo Greams Trauma Hub',
    nmc: 'NMC-71932-KL',
    activeStatus: 'Active 1h ago',
    connected: false,
    connectKey: 'meera',
    onDuty: false,
    initials: 'MN',
  },
  {
    id: 'doc-siddharth',
    name: 'Dr. Siddharth Mukherjee, MCh',
    specialty: 'Cardiothoracic Surgery & ECMO Lead',
    hospital: 'AIIMS Trauma Grid Node',
    nmc: 'NMC-82103-DL',
    activeStatus: 'In OT (On Call)',
    connected: false,
    connectKey: 'siddharth',
    onDuty: true,
    initials: 'SM',
  },
  {
    id: 'doc-rajesh',
    name: 'Dr. Rajesh K. Varma, MS',
    specialty: 'Orthopedic Trauma & Spine',
    hospital: 'MIOT International',
    nmc: 'NMC-61029-TN',
    activeStatus: 'On Standby',
    connected: false,
    connectKey: 'rajesh',
    onDuty: false,
    initials: 'RV',
  },
];

const PRECONFIGURED_PATIENTS = [
  {
    name: 'Rajesh V. Sharma',
    abha: '9824-8819-3320-TN',
    condition: 'Acute LAD Stent Complication / Chest Pain',
    defaultPriority: 'Priority 1 (Critical)',
    defaultBay: 'Bay 02',
  },
  {
    name: 'Meenakshi Sundaram',
    abha: '7712-4401-2918-TN',
    condition: 'Polytrauma / Compound Fracture',
    defaultPriority: 'Priority 2 (Urgent)',
    defaultBay: 'Bay 04',
  },
  {
    name: 'Harish K. Varma',
    abha: '4402-9918-1120-TN',
    condition: 'Deep Laceration / Suture Ingress',
    defaultPriority: 'Priority 3 (Stable)',
    defaultBay: 'Bay 06',
  },
];

export default function DoctorNetwork() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');
  const [connectedState, setConnectedState] = useState({
    arvind: false,
    meera: false,
    siddharth: false,
    rajesh: false,
  });

  // Inter-Hospital Referrals State
  const [referrals, setReferrals] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  // Referral Modal State
  const [referModalOpen, setReferModalOpen] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState(null);
  const [referralSubmitting, setReferralSubmitting] = useState(false);

  const [referralForm, setReferralForm] = useState({
    patientIndex: 0,
    toDoctorName: '',
    destinationHospital: '',
    priorityLevel: 'Priority 1 (Critical)',
    bayAllocated: 'Bay 02',
    clinicalSummary: 'Acute coronary syndrome requiring tertiary catheterization and emergency triage handover.',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleConnect = (key, name) => {
    setConnectedState((prev) => ({ ...prev, [key]: true }));
    showToast(`Connected to ${name} via ABDM Registry.`);
  };

  // Fetch referrals on mount
  useEffect(() => {
    async function fetchReferrals() {
      try {
        setLoadingReferrals(true);
        const token = localStorage.getItem('ekawach_token');
        const res = await fetch('/api/doctor/referrals', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.referrals)) {
            setReferrals(data.referrals);
          }
        }
      } catch (err) {
        console.error('Error fetching referrals:', err);
      } finally {
        setLoadingReferrals(false);
      }
    }

    fetchReferrals();

    const unsubscribe = subscribeReferrals((data) => {
      console.log('⚡ [DoctorNetwork] Live referral event:', data);
      if (data.referral) {
        setReferrals((prev) => [data.referral, ...prev.filter((r) => r.id !== data.referral.id)]);
        showToast(`Referral update: ${data.referral.patientName} -> ${data.referral.destinationHospital}`);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const openReferModal = (clinician) => {
    setSelectedClinician(clinician);
    setReferralForm({
      patientIndex: 0,
      toDoctorName: clinician ? clinician.name : CLINICIANS_DATA[0].name,
      destinationHospital: clinician ? clinician.hospital : 'Apollo Greams Trauma Hub',
      priorityLevel: 'Priority 1 (Critical)',
      bayAllocated: 'Bay 02',
      clinicalSummary: `Emergency referral to ${clinician ? clinician.name : 'Specialist'} for urgent specialist evaluation and critical handover.`,
    });
    setReferModalOpen(true);
  };

  const handleSubmitReferral = async (e) => {
    e.preventDefault();
    setReferralSubmitting(true);

    const selectedPatient = PRECONFIGURED_PATIENTS[referralForm.patientIndex] || PRECONFIGURED_PATIENTS[0];

    try {
      const token = localStorage.getItem('ekawach_token');
      const res = await fetch('/api/doctor/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patientName: selectedPatient.name,
          abhaNumber: selectedPatient.abha,
          toDoctorName: referralForm.toDoctorName,
          destinationHospital: referralForm.destinationHospital,
          priorityLevel: referralForm.priorityLevel,
          bayAllocated: referralForm.bayAllocated,
          clinicalSummary: referralForm.clinicalSummary,
          vitals: {
            bp: '138/88',
            spo2: '97%',
            heartRate: '92 bpm',
            temperature: '98.6 F',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.referral) {
          setReferrals((prev) => [data.referral, ...prev.filter((r) => r.id !== data.referral.id)]);
        }
        showToast(`Emergency referral for ${selectedPatient.name} dispatched to ${referralForm.destinationHospital} (${referralForm.bayAllocated})!`);
        setReferModalOpen(false);
      } else {
        showToast('Failed to dispatch referral. Please check connection.');
      }
    } catch (err) {
      showToast('Network error while dispatching referral.');
    } finally {
      setReferralSubmitting(false);
    }
  };

  // Filtering clinicians
  const filteredClinicians = CLINICIANS_DATA.filter((c) => {
    const isConnected = c.connected || (c.connectKey && connectedState[c.connectKey]);

    if (activeFilter === 'connected' && !isConnected) return false;
    if (activeFilter === 'hospital' && !c.hospital.toLowerCase().includes('apollo')) return false;
    if (activeFilter === 'specialty' && !c.specialty.toLowerCase().includes('cardio') && !c.specialty.toLowerCase().includes('trauma')) return false;
    if (activeFilter === 'onduty' && !c.onDuty) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.specialty.toLowerCase().includes(q) ||
        c.hospital.toLowerCase().includes(q) ||
        c.nmc.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                <span className="material-symbols-outlined text-[14px]">domain_verification</span>
                ABDM VERIFIED DIRECTORY • STATE CLINICIAN REGISTRY
              </span>
            </div>

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
                <span>Inter-Hospital Sync: <strong className="text-on-surface">Active</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Doctor Network</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                Connect, collaborate, and initiate inter-hospital emergency transfers across verified clinical hubs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openReferModal(null)}
                className="inline-flex items-center gap-2 px-space-md h-10 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg font-semibold shadow-sm transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">emergency_share</span>
                <span>+ Create Inter-Hospital Referral</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Active Referrals & Ingress Queue Status Card */}
        {referrals.length > 0 && (
          <div className="mb-space-lg bg-surface-container-lowest border border-surface-container rounded-2xl p-space-md shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-low mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Active Emergency Referrals &amp; Transfers ({referrals.length})
                </h3>
              </div>
              <span className="text-on-surface-variant font-label-sm text-xs">
                Real-Time Triage Telemetry Linked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-label-lg font-bold text-primary">{ref.patientName}</div>
                      <div className="font-label-sm text-xs text-on-surface-variant">ABHA: {ref.abhaNumber}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-error-container text-on-error-container">
                      {ref.bayAllocated || 'Bay 02'}
                    </span>
                  </div>

                  <div className="text-xs text-on-surface-variant line-clamp-2">
                    {ref.clinicalSummary}
                  </div>

                  <div className="pt-2 border-t border-surface-container/50 flex items-center justify-between text-[11px]">
                    <span className="text-primary font-medium">To: {ref.destinationHospital}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] font-bold">
                      {ref.status || 'DISPATCHED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Ribbon Bar */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md mb-space-lg">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              className="w-full h-11 pl-11 pr-space-md bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
              id="clinician-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialty, or hospital..."
              type="text"
            />
          </div>

          {/* Filter Chips Cluster */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'
              }`}
              type="button"
            >
              <span>All</span>
              <span className="text-xs opacity-75">{CLINICIANS_DATA.length}</span>
            </button>
            <button
              onClick={() => setActiveFilter('connected')}
              className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${
                activeFilter === 'connected' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E0F7F6] text-[#006876] hover:bg-tertiary-fixed'
              }`}
              type="button"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#028090]"></span>
              <span>Connected</span>
            </button>
            <button
              onClick={() => setActiveFilter('hospital')}
              className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${
                activeFilter === 'hospital' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">local_hospital</span>
              <span>Same Hospital</span>
            </button>
            <button
              onClick={() => setActiveFilter('specialty')}
              className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${
                activeFilter === 'specialty' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">medical_services</span>
              <span>Specialty Match</span>
            </button>
            <button
              onClick={() => setActiveFilter('onduty')}
              className={`filter-chip inline-flex items-center gap-1.5 px-space-md h-9 rounded-full font-label-md text-label-md font-medium transition-all cursor-pointer ${
                activeFilter === 'onduty' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#E4E4FB] text-on-surface hover:bg-[#d8d8f7]'
              }`}
              type="button"
            >
              <span className="w-2 h-2 rounded-full bg-[#02C39A]"></span>
              <span>On Duty Now</span>
            </button>
          </div>
        </div>

        {/* Main Directory Container */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col mb-space-lg">
          <div className="px-space-lg py-space-md bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">Doctor Network Directory</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                Showing {filteredClinicians.length} verified clinicians
              </span>
            </div>
            <div className="flex items-center gap-space-sm self-end sm:self-auto">
              <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-md font-label-md">
                <span className="material-symbols-outlined text-[16px] text-primary">sort</span>
                <span className="text-on-surface font-medium">Sort: Recently Active</span>
              </div>
              <button
                onClick={() => showToast('ABDM Clinician Registry synchronized (18ms).')}
                className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                title="Refresh list"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
          </div>

          {/* Clinician Rows */}
          <div className="flex flex-col divide-y divide-surface-container-high">
            {filteredClinicians.map((c) => {
              const isConnected = c.connected || (c.connectKey && connectedState[c.connectKey]);

              return (
                <div
                  key={c.id}
                  className="clinician-row group px-space-lg py-space-lg hover:bg-surface-container-low/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest"
                >
                  <div className="flex items-start sm:items-center gap-space-md min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center shadow-sm">
                        <div className="w-full h-full min-h-[44px] rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-xs">
                          {c.initials}
                        </div>
                      </div>
                      {c.onDuty && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#02C39A] ring-2 ring-surface-container-lowest" title="On Duty / Active"></span>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-space-xs mb-1">
                        <h3 className="font-headline-sm text-headline-sm text-primary font-bold truncate">{c.name}</h3>
                        {isConnected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E0F7F6] text-[#028090] font-label-sm text-label-sm font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></span>
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E4E4FB] text-on-surface-variant font-label-sm text-label-sm font-semibold">
                            Not Connected
                          </span>
                        )}
                      </div>
                      <p className="font-body-md text-body-md text-on-surface font-medium truncate">
                        {c.specialty} <span className="text-outline mx-1">•</span> <span className="text-on-surface-variant">{typeof c.hospital === 'object' && c.hospital !== null ? (c.hospital.name || c.hospital.hospital_name) : c.hospital}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                          {c.nmc}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[13px]">hub</span>
                          ABDM Linked
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-[#00A896]">schedule</span>
                          {c.activeStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-sm pl-0 lg:pl-space-md self-start sm:self-auto flex-shrink-0">
                    <button
                      onClick={() => openReferModal(c)}
                      className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-label-md text-label-md font-semibold px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      <span>Refer Patient</span>
                    </button>
                    <button
                      onClick={() => navigate('/doctor/messages')}
                      className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg font-medium shadow-sm transition-all cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                      <span>Message</span>
                    </button>
                    {!isConnected && (
                      <button
                        onClick={() => handleConnect(c.connectKey || c.id, c.name)}
                        className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg font-medium shadow-sm transition-all cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty Search State */}
        {filteredClinicians.length === 0 && (
          <div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md mb-space-lg">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-[#E4E4FB] text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">person_search</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">No doctors found matching your criteria</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Try adjusting your specialty or hospital filters.</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setActiveFilter('all');
              }}
              className="inline-flex items-center gap-1.5 px-space-md h-10 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container-high font-label-lg font-medium shadow-sm transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {/* Modal: Inter-Hospital Referral & Triage Dispatch */}
        {referModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-container my-8">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">emergency_share</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                      Inter-Hospital Clinical Referral
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      E-KAWACH National Emergency Trauma Grid Handover
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReferModalOpen(false)}
                  className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmitReferral} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Select Patient &amp; ABHA Record
                  </label>
                  <select
                    value={referralForm.patientIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      const pat = PRECONFIGURED_PATIENTS[idx];
                      setReferralForm((prev) => ({
                        ...prev,
                        patientIndex: idx,
                        priorityLevel: pat ? pat.defaultPriority : prev.priorityLevel,
                        bayAllocated: pat ? pat.defaultBay : prev.bayAllocated,
                        clinicalSummary: pat ? pat.condition : prev.clinicalSummary,
                      }));
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-surface-container-high bg-surface-container-low text-xs font-semibold text-primary outline-none focus:ring-2 focus:ring-primary"
                  >
                    {PRECONFIGURED_PATIENTS.map((p, idx) => (
                      <option key={idx} value={idx}>
                        {p.name} (ABHA: {p.abha})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Receiving Clinician
                    </label>
                    <input
                      type="text"
                      value={referralForm.toDoctorName}
                      onChange={(e) => setReferralForm({ ...referralForm, toDoctorName: e.target.value })}
                      required
                      placeholder="e.g. Dr. Arjun Nair, MD"
                      className="w-full h-10 px-3 rounded-lg border border-surface-container-high bg-surface-container-low text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Receiving Hospital / Center
                    </label>
                    <input
                      type="text"
                      value={referralForm.destinationHospital}
                      onChange={(e) => setReferralForm({ ...referralForm, destinationHospital: e.target.value })}
                      required
                      placeholder="e.g. Fortis Grid Hub / Apollo Greams"
                      className="w-full h-10 px-3 rounded-lg border border-surface-container-high bg-surface-container-low text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Triage Urgency &amp; Priority
                    </label>
                    <select
                      value={referralForm.priorityLevel}
                      onChange={(e) => setReferralForm({ ...referralForm, priorityLevel: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-surface-container-high bg-surface-container-low text-xs font-semibold text-error outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Priority 1 (Critical)">Priority 1 (Critical) - Immediate Red Ingress</option>
                      <option value="Priority 2 (Urgent)">Priority 2 (Urgent) - Yellow Ingress</option>
                      <option value="Priority 3 (Stable)">Priority 3 (Stable) - Green Minor Procedure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Allocated Emergency Bay
                    </label>
                    <select
                      value={referralForm.bayAllocated}
                      onChange={(e) => setReferralForm({ ...referralForm, bayAllocated: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-surface-container-high bg-surface-container-low text-xs font-semibold text-primary outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Bay 02">Bay 02 - Trauma Resuscitation</option>
                      <option value="Bay 04">Bay 04 - Neuro &amp; Ortho Observation</option>
                      <option value="Bay 06">Bay 06 - Minor Procedure Bay</option>
                      <option value="Bay 08">Bay 08 - ICU Ingress Bay</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Clinical Indication / Handover Summary
                  </label>
                  <textarea
                    rows={3}
                    value={referralForm.clinicalSummary}
                    onChange={(e) => setReferralForm({ ...referralForm, clinicalSummary: e.target.value })}
                    required
                    placeholder="Describe presenting symptoms, vital stability, and clinical transfer rationale..."
                    className="w-full p-3 rounded-lg border border-surface-container-high bg-surface-container-low text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary resize-none"
                  ></textarea>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">monitor_heart</span>
                    <span className="font-semibold text-on-surface">Bedside Vitals Sync:</span>
                    <span className="text-on-surface-variant font-mono">BP 138/88 • SpO2 97% • HR 92 bpm</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] font-bold text-[10px]">
                    HARDWARE VERIFIED
                  </span>
                </div>

                <div className="pt-3 border-t border-surface-container flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReferModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={referralSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>{referralSubmitting ? 'Dispatching...' : 'Dispatch Emergency Referral'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
