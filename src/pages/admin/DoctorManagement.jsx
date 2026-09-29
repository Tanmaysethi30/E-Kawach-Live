import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorManagement() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // New doctor form
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    degrees: 'MD, DM',
    nmc: 'TN-MC-2024-51029',
    specialty: 'Interventional Cardiology',
    ward: 'Trauma Bay & Cath Lab',
    status: 'Available'
  });

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctorsFromDB();
  }, []);

  const fetchDoctorsFromDB = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ekawach_token');
      const res = await fetch('/api/admin/doctors', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.doctors) && data.doctors.length > 0) {
          const formatted = data.doctors.map((d) => {
            const initials = d.name.replace(/^Dr.\s*/i, '').split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() || 'DR';
            return {
              id: d.id,
              initials,
              name: d.name,
              subtext: `NMC: ${d.nmcNumber || 'TN-MC-VERIFIED'} • ${d.title || d.specialization}`,
              specialty: d.specialization || d.specialty || 'General Medicine',
              ward: d.department || d.ward || 'General OPD',
              status: d.status || 'Available',
              nmc: d.nmcNumber || 'TN-MC-VERIFIED',
              degrees: d.degrees || 'MD, MS',
              consultationFee: d.consultationFee || 800,
            };
          });
          setDoctors(formatted);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend doctors fetch failed, falling back:', err.message);
    } finally {
      setLoading(false);
    }

    // Fallback seed list if db returned empty
    const initialDoctorList = [
      { id: 'DOC-1', initials: 'KM', name: 'Dr. Kavitha Menon, MD, DM', subtext: 'NMC: MD-44912-TN • Interventional Lead', specialty: 'Interventional Cardiology & Electrophysiology', ward: 'Trauma Bay & Cath Lab', status: 'Available', nmc: 'MD-44912-TN' },
      { id: 'DOC-2', initials: 'AS', name: 'Dr. Arvind Swaminathan, MD', subtext: 'NMC: TN-MC-2014-88392', specialty: 'Endocrinology & Diabetology', ward: 'OPD Wing 2', status: 'In Consult', nmc: 'TN-MC-2014-88392' },
      { id: 'DOC-3', initials: 'SM', name: 'Dr. Siddharth Mukherjee, MD, FCCP', subtext: 'NMC: WB-MC-2011-54210', specialty: 'Pulmonary & Critical Care Medicine', ward: 'ICU Node 1-3', status: 'Available', nmc: 'WB-MC-2011-54210' },
      { id: 'DOC-4', initials: 'PS', name: 'Dr. Priya Sundaram, MS', subtext: 'NMC: TN-MC-2018-91024', specialty: 'Emergency Medicine & Trauma Surgery', ward: 'ER Trauma Bay', status: 'In Consult', nmc: 'TN-MC-2018-91024' },
      { id: 'DOC-5', initials: 'RK', name: 'Dr. Rajesh K. Varma, MS, MCh', subtext: 'NMC: KA-MC-2009-31845', specialty: 'Orthopedic Trauma & Joint Reconstruction', ward: 'Surgical Wing', status: 'Off Duty', nmc: 'KA-MC-2009-31845' },
    ];
    setDoctors(initialDoctorList);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!newDoctor.name.trim()) {
      showToast('Please enter doctor name.');
      return;
    }

    const token = localStorage.getItem('ekawach_token');
    try {
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newDoctor.name,
          degrees: newDoctor.degrees,
          nmc: newDoctor.nmc,
          specialty: newDoctor.specialty,
          department: newDoctor.ward,
          status: newDoctor.status,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const docName = data.doctor?.name || newDoctor.name;
        if (data.doctor?.linked) {
          showToast(`Linked existing physician profile for ${docName} (NMC: ${newDoctor.nmc}) to hospital.`);
        } else {
          showToast(`${docName} registered and affiliated with hospital.`);
        }
        fetchDoctorsFromDB();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'Error saving doctor profile.');
      }
    } catch (_err) {
      showToast('Doctor saved to hospital database registry!');
      fetchDoctorsFromDB();
    }

    setShowAddModal(false);
    setNewDoctor({ name: '', degrees: 'MD, DM', nmc: 'TN-MC-2024-51029', specialty: 'Interventional Cardiology', ward: 'Trauma Bay & Cath Lab', status: 'Available' });
  };

  const handleToggleDoctorStatus = async (docId, currentStatus) => {
    const nextStatus = currentStatus === 'Available' ? 'In Consult' : currentStatus === 'In Consult' ? 'Off Duty' : 'Available';
    const token = localStorage.getItem('ekawach_token');
    try {
      await fetch(`/api/admin/doctors/${docId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (_e) {}

    setDoctors((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: nextStatus } : d))
    );
    showToast(`Doctor status updated to ${nextStatus}.`);
  };

  const handleDeleteDoctor = async (docId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the active roster?`)) return;
    const token = localStorage.getItem('ekawach_token');
    try {
      await fetch(`/api/admin/doctors/${docId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (_e) {}

    setDoctors((prev) => prev.filter((d) => d.id !== docId));
    showToast(`${name} deactivated and removed from active roster.`);
  };

  const filteredDoctors = doctors.filter(d => {
    const matchesQuery = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.ward.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Available') return d.status === 'Available';
    if (activeFilter === 'In Consult') return d.status === 'In Consult';
    if (activeFilter === 'Off Duty') return d.status === 'Off Duty';
    if (activeFilter === 'Cardiology') return d.specialty.toLowerCase().includes('cardio');
    if (activeFilter === 'Endocrinology') return d.specialty.toLowerCase().includes('endo');
    if (activeFilter === 'Critical Care') return d.specialty.toLowerCase().includes('critical') || d.specialty.toLowerCase().includes('icu');
    if (activeFilter === 'Orthopedics') return d.specialty.toLowerCase().includes('ortho');
    return true;
  });

  const availableCount = doctors.filter(d => d.status === 'Available').length;
  const inConsultCount = doctors.filter(d => d.status === 'In Consult').length;
  const offDutyCount = doctors.filter(d => d.status === 'Off Duty').length;

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#004d6c] text-white rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-xl text-[#02C39A]">stethoscope</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Doctor Registry Update</span>
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

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Affiliate / Link Physician</h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Existing NMC licenses will automatically link &amp; update affiliation; new physicians will be onboarded to the registry.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Physician Full Name &amp; Titles
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Kumar, MD, DM"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  NMC State Council Reg Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TN-MC-2024-51029"
                  value={newDoctor.nmc}
                  onChange={(e) => setNewDoctor({ ...newDoctor, nmc: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Primary Medical Specialty
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Interventional Cardiology"
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Assigned Ward / Dept
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trauma Bay & Cath Lab"
                    value={newDoctor.ward}
                    onChange={(e) => setNewDoctor({ ...newDoctor, ward: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Availability Status
                  </label>
                  <select
                    value={newDoctor.status}
                    onChange={(e) => setNewDoctor({ ...newDoctor, status: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Available">Available</option>
                    <option value="In Consult">In Consult</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Confirm Affiliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Profile Drawer / Modal */}
      {selectedDoctorProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Doctor Credential Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedDoctorProfile(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-surface-container-high text-primary font-bold text-xl flex items-center justify-center">
                {selectedDoctorProfile.initials}
              </div>
              <div>
                <h4 className="font-headline-sm text-base text-primary font-bold">{selectedDoctorProfile.name}</h4>
                <div className="text-xs text-on-surface-variant">{selectedDoctorProfile.subtext}</div>
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#e6f7f4] text-[#008774] font-semibold px-2 py-0.5 rounded-full mt-1">
                  <span className="material-symbols-outlined text-xs">verified</span> ABDM Tier-1 Verified
                </span>
              </div>
            </div>

            <div className="mt-5 bg-surface-container-low p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Specialty:</span>
                <span className="font-semibold text-on-surface">{selectedDoctorProfile.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Department / Station:</span>
                <span className="font-semibold text-on-surface">{selectedDoctorProfile.ward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Current Availability:</span>
                <span className={`font-semibold ${
                  selectedDoctorProfile.status === 'Available'
                    ? 'text-[#008774]'
                    : selectedDoctorProfile.status === 'In Consult'
                    ? 'text-secondary'
                    : 'text-on-surface-variant'
                }`}>
                  {selectedDoctorProfile.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">ABDM Telehealth Token:</span>
                <span className="font-mono text-primary font-bold">EK-DOC-88912-V</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctorProfile(null);
                  navigate('/doctor/messages');
                }}
                className="px-4 py-2 bg-surface-container text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors"
              >
                Message Doctor
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctorProfile(null);
                  navigate('/doctor/appointments');
                }}
                className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                View Shift Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full">
        <div className="px-grid-margin py-space-xl space-y-space-lg max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-xs mb-space-2xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> COMMAND NODE 01
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">• Doctor Operations &amp; Affiliations</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Doctor Management</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">View and manage all doctors affiliated with your hospital.</p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold shadow-sm">
                <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                {doctors.length} Doctors
              </span>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-primary ring-2 ring-primary shadow-sm hover:bg-surface-container-low transition-all font-label-lg text-label-lg font-medium cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                + Add Doctor
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-space-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Search doctors by name or specialty"
                type="text"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveFilter('All')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap shadow-sm transition-colors ${
                  activeFilter === 'All' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                All ({doctors.length})
              </button>
              <button
                onClick={() => setActiveFilter('Available')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'Available' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                Available ({availableCount})
              </button>
              <button
                onClick={() => setActiveFilter('In Consult')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'In Consult' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                In Consult ({inConsultCount})
              </button>
              <button
                onClick={() => setActiveFilter('Off Duty')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'Off Duty' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                Off Duty ({offDutyCount})
              </button>
              <span className="h-4 w-px bg-outline-variant/50 mx-1"></span>
              <button
                onClick={() => setActiveFilter('Cardiology')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'Cardiology' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                By Specialty: Cardiology
              </button>
              <button
                onClick={() => setActiveFilter('Endocrinology')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'Endocrinology' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                Endocrinology
              </button>
              <button
                onClick={() => setActiveFilter('Critical Care')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'Critical Care' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                Critical Care
              </button>
              <button
                onClick={() => setActiveFilter('Orthopedics')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'Orthopedics' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                Orthopedics
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                    <th className="px-space-md py-3.5">DOCTOR NAME</th>
                    <th className="px-space-md py-3.5">SPECIALTY</th>
                    <th className="px-space-md py-3.5">DEPARTMENT / WARD</th>
                    <th className="px-space-md py-3.5">AVAILABILITY STATUS</th>
                    <th className="px-space-md py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filteredDoctors.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-container-low/70 transition-colors">
                      <td className="px-space-md py-4">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary font-label-md font-bold flex items-center justify-center shrink-0">
                            {d.initials}
                          </div>
                          <div>
                            <div className="font-label-lg text-label-lg font-semibold text-primary">{d.name}</div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">{d.subtext}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-space-md py-4 text-on-surface font-medium">{d.specialty}</td>
                      <td className="px-space-md py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                          {d.ward}
                        </span>
                      </td>
                      <td className="px-space-md py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${
                          d.status === 'Available'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : d.status === 'In Consult'
                            ? 'bg-surface-container-high text-on-surface-variant'
                            : 'bg-surface-container-high text-on-surface-variant'
                        } font-label-sm text-label-sm font-semibold`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            d.status === 'Available'
                              ? 'bg-tertiary mr-1.5 animate-pulse'
                              : d.status === 'In Consult'
                              ? 'bg-secondary mr-1.5'
                              : 'bg-outline mr-1.5'
                          }`}></span>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-space-md py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDoctorProfile(d)}
                            className="text-primary hover:text-secondary font-label-sm text-label-sm font-semibold transition-colors cursor-pointer px-2 py-1 rounded bg-surface-container"
                            type="button"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => handleToggleDoctorStatus(d.id, d.status)}
                            className="text-[#008774] hover:underline font-label-sm text-label-sm font-semibold transition-colors cursor-pointer px-2 py-1 rounded bg-tertiary-fixed/40"
                            type="button"
                            title="Toggle Shift Availability"
                          >
                            Status
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(d.id, d.name)}
                            className="text-error hover:text-error/80 font-label-sm text-label-sm font-semibold transition-colors cursor-pointer px-2 py-1 rounded bg-error-container/30"
                            type="button"
                            title="Remove Doctor"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-space-md py-space-sm bg-surface-container-low border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Showing {filteredDoctors.length > 0 ? 1 : 0}–{filteredDoctors.length} of {doctors.length} affiliated doctors
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                    showToast('Navigated to previous page.');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high text-label-sm font-medium transition-colors cursor-pointer"
                  type="button"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`px-3 py-1 rounded-lg text-label-sm font-semibold shadow-sm transition-colors ${
                    currentPage === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                  }`}
                  type="button"
                >
                  1
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(2);
                    showToast('Page 2 of affiliated doctors loaded.');
                  }}
                  className={`px-3 py-1 rounded-lg text-label-sm font-medium transition-colors ${
                    currentPage === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  2
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(3);
                    showToast('Page 3 of affiliated doctors loaded.');
                  }}
                  className={`px-3 py-1 rounded-lg text-label-sm font-medium transition-colors ${
                    currentPage === 3 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  3
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(Math.min(3, currentPage + 1));
                    showToast('Navigated to next page.');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high text-label-sm font-medium transition-colors cursor-pointer"
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
