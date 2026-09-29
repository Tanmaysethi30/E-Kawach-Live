import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PatientManagement() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);

  // New patient registration form
  const [newPatient, setNewPatient] = useState({
    name: '',
    ageGender: '45 M • Inpatient',
    abha: '9824-8819-3320-TN',
    status: 'Admitted',
    doctor: 'Dr. Kavitha Menon',
    specialty: 'Interventional Cardiology',
    ward: 'Bay 02 • Trauma Hub'
  });

  const initialPatients = [
    {
      id: 'PT-1',
      initials: 'RS',
      name: 'Rajesh V. Sharma',
      ageGender: '54 M • Inpatient',
      abha: '9824-8819-3320-TN',
      status: 'Admitted',
      doctor: 'Dr. Kavitha Menon',
      specialty: 'Interventional Cardiology',
      ward: 'Bay 02 • Trauma Hub',
      wardCategory: 'Trauma Bay'
    },
    {
      id: 'PT-2',
      initials: 'LN',
      name: 'Smt. Lakshmi Narayanan',
      ageGender: '68 F • Inpatient',
      abha: '1104-8829-5512-TN',
      status: 'Admitted',
      doctor: 'Dr. Kavitha Menon',
      specialty: 'Cardiology',
      ward: 'Ward 4B-12 • Inpatient Care',
      wardCategory: 'General Ward'
    },
    {
      id: 'PT-3',
      initials: 'MS',
      name: 'Meenakshi Sundaram',
      ageGender: '42 F • Inpatient',
      abha: '7712-4401-6643-TN',
      status: 'Admitted',
      doctor: 'Dr. Arvind Swaminathan',
      specialty: 'Endocrinology & Trauma',
      ward: 'Bay 04 • Ortho Post-Op',
      wardCategory: 'Trauma Bay'
    },
    {
      id: 'PT-4',
      initials: 'AP',
      name: 'Anand R. Patel',
      ageGender: '36 M • Inpatient',
      abha: '5521-9932-1108-TN',
      status: 'Admitted',
      doctor: 'Dr. Arvind Swaminathan',
      specialty: 'Endocrinology',
      ward: 'Step-Down 08',
      wardCategory: 'General Ward'
    },
    {
      id: 'PT-5',
      initials: 'VS',
      name: 'Vikramaditya Sen',
      ageGender: '29 M • Outpatient',
      abha: '3391-0021-9482-TN',
      status: 'Discharged',
      doctor: 'Dr. Priya Sundaram',
      specialty: 'Emergency & Trauma',
      ward: 'OPD Day Care (Discharged Today)',
      wardCategory: 'General Ward'
    },
    {
      id: 'PT-6',
      initials: 'HV',
      name: 'Harish K. Varma',
      ageGender: '61 M • Post-Surgical',
      abha: '4402-9918-7721-TN',
      status: 'Discharged',
      doctor: 'Dr. Rajesh K. Varma',
      specialty: 'Orthopedic Trauma',
      ward: 'Surgical Wing (Outpatient Follow-up)',
      wardCategory: 'General Ward'
    },
    {
      id: 'PT-7',
      initials: 'DR',
      name: 'Deepa Ramachandran',
      ageGender: '47 F • Critical Care',
      abha: '8812-3349-2210-TN',
      status: 'Admitted',
      doctor: 'Dr. Siddharth Mukherjee',
      specialty: 'Pulmonary & Critical Care',
      ward: 'ICU Bed 04',
      wardCategory: 'ICU'
    },
    {
      id: 'PT-8',
      initials: 'AN',
      name: 'Master Aarav Nair',
      ageGender: '7 M • Pediatric Post-Op',
      abha: '6634-1109-8832-KL',
      status: 'Discharged',
      doctor: 'Dr. Ananya Nair',
      specialty: 'Pediatric Critical Care',
      ward: 'NICU / PICU (Discharged)',
      wardCategory: 'ICU'
    }
  ];

  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('ekawach_admin_patients');
    return saved ? JSON.parse(saved) : initialPatients;
  });

  // Fetch real patients from backend database
  useEffect(() => {
    const fetchBackendPatients = async () => {
      try {
        const token = localStorage.getItem('ekawach_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/admin/patients', { headers });
        const data = await res.json();
        if (data.success && Array.isArray(data.patients) && data.patients.length > 0) {
          const mapped = data.patients.map((p) => {
            const initials = p.name ? p.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'PT';
            return {
              id: p.id,
              initials,
              name: p.name,
              ageGender: `${p.gender || 'Patient'} • Inpatient`,
              abha: p.abhaNumber || '9824-8819-3320-TN',
              status: 'Admitted',
              doctor: 'Dr. Kavitha Menon',
              specialty: 'Cardiology',
              ward: 'Bay 02 • Trauma Hub',
              wardCategory: 'Trauma Bay',
            };
          });
          // Merge unique by name or id
          setPatients((prev) => {
            const existingNames = new Set(mapped.map((m) => m.name));
            const remainder = prev.filter((pr) => !existingNames.has(pr.name));
            return [...mapped, ...remainder];
          });
        }
      } catch (err) {
        console.error('Failed to fetch backend patients:', err);
      }
    };
    fetchBackendPatients();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newPatient.name.trim()) {
      showToast('Please enter patient name.');
      return;
    }
    const initials = newPatient.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() || 'PT';
    const regItem = {
      id: `PT-${Date.now()}`,
      initials,
      name: newPatient.name,
      ageGender: newPatient.ageGender,
      abha: newPatient.abha || `9824-${Math.floor(1000 + Math.random() * 9000)}-TN`,
      status: newPatient.status,
      doctor: newPatient.doctor,
      specialty: newPatient.specialty,
      ward: newPatient.ward,
      wardCategory: newPatient.ward.toLowerCase().includes('icu') ? 'ICU' : newPatient.ward.toLowerCase().includes('bay') ? 'Trauma Bay' : 'General Ward'
    };

    try {
      const token = localStorage.getItem('ekawach_token');
      await fetch('/api/admin/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name: newPatient.name,
          ageGender: newPatient.ageGender,
          abha: regItem.abha,
          status: newPatient.status,
          doctor: newPatient.doctor,
          specialty: newPatient.specialty,
          ward: newPatient.ward,
        }),
      });
    } catch (err) {
      console.error('Failed to persist patient to backend:', err);
    }

    const updated = [regItem, ...patients];
    setPatients(updated);
    localStorage.setItem('ekawach_admin_patients', JSON.stringify(updated));
    setShowRegisterModal(false);
    setNewPatient({
      name: '',
      ageGender: '45 M • Inpatient',
      abha: '9824-8819-3320-TN',
      status: 'Admitted',
      doctor: 'Dr. Kavitha Menon',
      specialty: 'Interventional Cardiology',
      ward: 'Bay 02 • Trauma Hub'
    });
    showToast(`Patient ${regItem.name} registered with ABHA ID ${regItem.abha}. Persisted to hospital database.`);
  };

  const handleExportCSV = () => {
    let csvContent = `E-KAWACH HOSPITAL COMMAND NODE 01 - PATIENT REGISTRY AUDIT
Generated: ${new Date().toLocaleString()}
Hospital: Apollo Greams Super-Speciality Trauma Center, Chennai

Name,Age & Gender,ABHA ID,Admission Status,Attending Specialist,Specialty,Ward / Bed Allocation\n`;

    patients.forEach(p => {
      csvContent += `"${p.name}","${p.ageGender}","${p.abha}","${p.status}","${p.doctor}","${p.specialty}","${p.ward}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `E-KAWACH_Patient_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Patient Registry CSV audit log.');
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.abha.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.ward.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Admitted') return p.status === 'Admitted';
    if (activeFilter === 'Discharged') return p.status === 'Discharged';
    if (activeFilter === 'ICU') return p.ward.toLowerCase().includes('icu') || p.wardCategory === 'ICU';
    if (activeFilter === 'General Ward') return p.ward.toLowerCase().includes('ward') || p.wardCategory === 'General Ward';
    if (activeFilter === 'Cardiology') return p.specialty.toLowerCase().includes('cardio');
    if (activeFilter === 'Trauma Bay') return p.ward.toLowerCase().includes('bay') || p.wardCategory === 'Trauma Bay';
    return true;
  });

  const admittedCount = patients.filter(p => p.status === 'Admitted').length;
  const dischargedCount = patients.filter(p => p.status === 'Discharged').length;

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#004d6c] text-white rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-xl text-[#02C39A]">personal_injury</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Patient Registry Update</span>
            <span className="text-xs text-slate-200">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-4 text-slate-300 hover:text-white transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Register Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Register Patient</h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Patient Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Age &amp; Gender
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 52 M"
                    value={newPatient.ageGender}
                    onChange={(e) => setNewPatient({ ...newPatient, ageGender: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    ABHA ID
                  </label>
                  <input
                    type="text"
                    placeholder="9824-8819-TN"
                    value={newPatient.abha}
                    onChange={(e) => setNewPatient({ ...newPatient, abha: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Assigned Doctor
                  </label>
                  <select
                    value={newPatient.doctor}
                    onChange={(e) => setNewPatient({ ...newPatient, doctor: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Dr. Kavitha Menon">Dr. Kavitha Menon</option>
                    <option value="Dr. Arvind Swaminathan">Dr. Arvind Swaminathan</option>
                    <option value="Dr. Priya Sundaram">Dr. Priya Sundaram</option>
                    <option value="Dr. Siddharth Mukherjee">Dr. Siddharth Mukherjee</option>
                    <option value="Dr. Rajesh K. Varma">Dr. Rajesh K. Varma</option>
                    <option value="Dr. Ananya Nair">Dr. Ananya Nair</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Admission Status
                  </label>
                  <select
                    value={newPatient.status}
                    onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Ward / Bed Allocation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bay 02 • Trauma Hub"
                  value={newPatient.ward}
                  onChange={(e) => setNewPatient({ ...newPatient, ward: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admit Patient Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">hotel</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Fast-Track Patient Admission</h3>
              </div>
              <button
                onClick={() => setShowAdmitModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Select Pending Patient / ABHA Scan
                </label>
                <select
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Vikramaditya Sen (ABHA: 3391-0021-TN) - Re-admission</option>
                  <option>Harish K. Varma (ABHA: 4402-9918-TN) - Surgical Review</option>
                  <option>Incoming Ambulance 108 Fleet Ingress #3</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Target Inpatient Ward
                </label>
                <select
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Bay 05 • Trauma Emergency (2 beds free)</option>
                  <option>ICU Node 2 • Bed 12 (4 beds free)</option>
                  <option>General Ward 4B (15 beds free)</option>
                </select>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg text-xs text-on-surface-variant">
                ABDM National Health Vault and consent tokens will be linked automatically upon clinical admission.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setShowAdmitModal(false)}
                className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdmitModal(false);
                  showToast('Patient successfully admitted into Bay 05 • Trauma Emergency.');
                }}
                className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                Confirm Admission
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full">
        {/* Main Patient Registry Content Wrapper */}
        <div className="px-grid-margin py-space-xl space-y-space-lg max-w-[1560px] mx-auto w-full">
          {/* Page Header Area with Breadcrumb and Meta Stats */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pb-space-xs">
            <div>
              <div className="flex items-center gap-space-2xs text-secondary font-label-md text-label-md tracking-wider uppercase mb-space-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="">COMMAND NODE 01</span>
                <span className="text-outline-variant">•</span>
                <span className="text-on-surface-variant font-medium">Inpatient &amp; Outpatient Records Registry</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Patient Management</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">View and manage all patients across your hospital.</p>
            </div>
            {/* Top Right Controls: Metric pill + Secondary Add button */}
            <div className="flex items-center gap-space-sm shrink-0">
              <div className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-full bg-[#ede7f6] text-[#3949ab] shadow-sm">
                <span className="material-symbols-outlined text-[18px]">group</span>
                <span className="font-label-lg text-label-lg font-semibold tracking-tight">{patients.length} Patients</span>
              </div>
              {/* Add Patient outline button */}
              <button
                onClick={() => setShowRegisterModal(true)}
                className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg hover:bg-surface-container-low transition-colors shadow-sm focus:outline-none cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">person_add</span>
                <span className="">+ Register Patient</span>
              </button>
              {/* Secondary Admit Patient action */}
              <button
                onClick={() => setShowAdmitModal(true)}
                className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors shadow-[0_1px_8px_rgba(0,77,108,0.06)] focus:outline-none cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">hotel</span>
                <span className="">+ Admit Patient</span>
              </button>
            </div>
          </div>

          {/* Quick Vital Status Bar / Visual Metric Spark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between">
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Active Inpatients</div>
                <div className="font-headline-md text-headline-md text-primary mt-1 font-semibold">{admittedCount}</div>
                <div className="font-body-sm text-body-sm text-[#4338ca] mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c6bc0]"></span>
                  {((admittedCount / (patients.length || 1)) * 100).toFixed(1)}% total occupancy
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#ede7f6] text-[#3949ab] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">single_bed</span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between">
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Discharged (MTD)</div>
                <div className="font-headline-md text-headline-md text-primary mt-1 font-semibold">{dischargedCount}</div>
                <div className="font-body-sm text-body-sm text-[#006876] mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 18 discharged today
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#e0f2f1] text-[#006876] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between">
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">ICU &amp; Step-Down</div>
                <div className="font-headline-md text-headline-md text-primary mt-1 font-semibold">23</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> 4 beds remaining
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">vital_signs</span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between">
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">ABHA Linked Verified</div>
                <div className="font-headline-md text-headline-md text-primary mt-1 font-semibold">99.4%</div>
                <div className="font-body-sm text-body-sm text-[#006876] mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> National Registry Sync
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
            </div>
          </div>

          {/* Search & Multi-Filter Control Hub */}
          <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm space-y-space-sm">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-sm">
              {/* Search Input */}
              <div className="relative flex-1 max-w-xl">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-space-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Search patients by name or Health ID"
                  type="text"
                />
              </div>
              {/* Utility Export / Print Trigger */}
              <div className="flex items-center gap-space-xs shrink-0 self-end lg:self-auto">
                <button
                  onClick={() => showToast('Applied advanced filter matrix: Active ABDM consents only.')}
                  className="h-11 px-space-sm rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md flex items-center gap-space-2xs cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span className="">More Filters</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="h-11 px-space-sm rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md flex items-center gap-space-2xs cursor-pointer"
                  title="Export CSV"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span className="">Export</span>
                </button>
              </div>
            </div>

            {/* Quick Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-on-surface">
              {['All', 'Admitted', 'Discharged'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`shrink-0 px-space-sm py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                    activeFilter === f
                      ? 'bg-primary text-on-primary font-medium shadow-sm'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                  }`}
                  type="button"
                >
                  {f} {f === 'All' ? `(${patients.length})` : f === 'Admitted' ? `(${admittedCount})` : `(${dischargedCount})`}
                </button>
              ))}
              <span className="text-outline-variant mx-1">|</span>
              {['ICU', 'General Ward', 'Cardiology', 'Trauma Bay'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`shrink-0 px-space-sm py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                    activeFilter === f
                      ? 'bg-primary text-on-primary font-medium shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                  type="button"
                >
                  {f === 'ICU' ? 'By Ward: ICU' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Main Patient Table Module */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            {/* Desktop & Tablet Table Presentation */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/70">
                    <th className="py-3.5 pl-space-lg pr-space-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" scope="col">Patient Name</th>
                    <th className="py-3.5 px-space-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" scope="col">ABHA / Health ID</th>
                    <th className="py-3.5 px-space-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" scope="col">Admission Status</th>
                    <th className="py-3.5 px-space-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" scope="col">Assigned Doctor &amp; Specialty</th>
                    <th className="py-3.5 px-space-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" scope="col">Ward / Bed</th>
                    <th className="py-3.5 pl-space-md pr-space-lg text-right font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-md text-body-md">
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="py-space-md pl-space-lg pr-space-md">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-9 h-9 rounded-full bg-[#ede7f6] text-[#3949ab] font-headline-sm text-[13px] font-semibold flex items-center justify-center shrink-0">
                            {p.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-label-lg text-label-lg text-on-surface font-semibold group-hover:text-primary transition-colors">
                              {p.name}
                            </div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">{p.ageGender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="font-mono text-body-sm text-on-surface-variant tracking-tight bg-surface-container-low px-2 py-0.5 rounded inline-block">
                          {p.abha}
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <span className={`inline-flex items-center gap-1.5 px-space-xs py-1 rounded-full ${
                          p.status === 'Admitted'
                            ? 'bg-[#ede7f6] text-[#3949ab]'
                            : 'bg-[#e0f2f1] text-[#006876]'
                        } font-label-sm text-label-sm font-medium`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'Admitted' ? 'bg-[#5c6bc0]' : 'bg-[#00897b]'
                          }`}></span>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="font-label-lg text-label-lg text-on-surface">{p.doctor}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{p.specialty}</div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="inline-flex items-center gap-1.5 text-on-surface font-medium">
                          <span className="material-symbols-outlined text-[16px] text-secondary">
                            {p.status === 'Admitted' ? 'meeting_room' : 'task_alt'}
                          </span>
                          <span className="">{p.ward}</span>
                        </div>
                      </td>
                      <td className="py-space-md pl-space-md pr-space-lg text-right">
                        <Link to="/doctor/patient-history" className="inline-flex items-center gap-1 font-label-lg text-label-lg text-primary hover:text-primary-container font-semibold group-hover:translate-x-0.5 transition-transform no-underline">
                          <span className="">View Chart</span>
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden divide-y divide-surface-container">
              {filteredPatients.map((p) => (
                <div key={p.id} className="p-space-md space-y-space-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-full bg-[#ede7f6] text-[#3949ab] font-headline-sm text-xs font-semibold flex items-center justify-center">
                        {p.initials}
                      </div>
                      <div>
                        <div className="font-label-lg text-label-lg text-on-surface font-semibold">{p.name}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">ABHA: {p.abha}</div>
                      </div>
                    </div>
                    <span className={`px-space-xs py-0.5 rounded-full ${
                      p.status === 'Admitted' ? 'bg-[#ede7f6] text-[#3949ab]' : 'bg-[#e0f2f1] text-[#006876]'
                    } font-label-sm text-label-sm font-medium`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="text-body-sm text-on-surface-variant pt-1">
                    <div className=""><span className="font-medium text-on-surface">Doctor:</span> {p.doctor} ({p.specialty})</div>
                    <div className=""><span className="font-medium text-on-surface">Ward:</span> {p.ward}</div>
                  </div>
                  <div className="pt-2 text-right">
                    <Link to="/doctor/patient-history" className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold no-underline">
                      View Chart <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Footer & Standard Console Pagination */}
            <div className="p-space-md bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Showing <span className="font-semibold text-on-surface">{filteredPatients.length > 0 ? 1 : 0}–{filteredPatients.length}</span> of <span className="font-semibold text-on-surface">{patients.length}</span> registered patients
              </div>
              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                    showToast('Navigated to previous patient page.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span className="">Previous</span>
                </button>
                {/* Numbered Buttons */}
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`w-8 h-8 rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center shadow-sm transition-colors ${
                    currentPage === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                  }`}
                  type="button"
                >
                  1
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(2);
                    showToast('Page 2 of patient registry loaded.');
                  }}
                  className={`w-8 h-8 rounded-lg font-label-md text-label-md flex items-center justify-center transition-colors ${
                    currentPage === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  2
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(3);
                    showToast('Page 3 of patient registry loaded.');
                  }}
                  className={`w-8 h-8 rounded-lg font-label-md text-label-md flex items-center justify-center transition-colors ${
                    currentPage === 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  3
                </button>
                <span className="px-1 text-on-surface-variant font-label-md text-label-md">...</span>
                <button
                  onClick={() => {
                    setCurrentPage(20);
                    showToast('Page 20 of patient registry loaded.');
                  }}
                  className={`w-8 h-8 rounded-lg font-label-md text-label-md flex items-center justify-center transition-colors ${
                    currentPage === 20 ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  20
                </button>
                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage(Math.min(20, currentPage + 1));
                    showToast('Navigated to next patient page.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="">Next</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Supplementary Information & Security Badge Footer Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm px-space-sm pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-secondary">encrypted</span>
              <span className="">E-KAWACH Federated Health Data Exchange • 256-bit Encrypted Session #TN-TR-842</span>
            </div>
            <div className="flex items-center gap-space-md">
              <Link to="/doctor/privacy" className="hover:text-primary hover:underline transition-colors no-underline">Registry Audit Log</Link>
              <span className="">•</span>
              <button onClick={() => showToast('ABHA Bulk ingestion gateway ready.')} className="hover:text-primary hover:underline transition-colors bg-transparent border-0 p-0 text-inherit cursor-pointer font-body-sm">Bulk ABHA Ingestion</button>
              <span className="">•</span>
              <a className="hover:text-primary hover:underline transition-colors no-underline" href="https://hl7.org/fhir/" target="_blank" rel="noopener noreferrer">HL7 FHIR v4.0.1 Protocol</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
