import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function HospitalDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, updateProfile } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(queryParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Wards Filter & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [reallocModalOpen, setReallocModalOpen] = useState(false);
  const [selectedWardForRealloc, setSelectedWardForRealloc] = useState(null);
  const [reallocBedsToAdd, setReallocBedsToAdd] = useState(4);
  const [newWardModalOpen, setNewWardModalOpen] = useState(false);
  const [newWardForm, setNewWardForm] = useState({
    name: '',
    location: '',
    category: 'Inpatient',
    totalBeds: 24,
    occupied: 0,
  });

  // Tag inputs
  const [newSpecialityInput, setNewSpecialityInput] = useState('');
  const [newServiceInput, setNewServiceInput] = useState('');

  // Hospital Record State
  const [hospitalData, setHospitalData] = useState({
    registration_id: currentUser?.registration_id || currentUser?.registrationId || 'REG-HOSP-ADMIN-3003',
    hospital_id: currentUser?.id || 'hosp-apollo-greams',
    hospital_name: currentUser?.hospital?.name || currentUser?.hospital || 'Apollo Greams Trauma Hub',
    hospital_type: 'Private',
    registration_number: currentUser?.tag || 'AP-HSP-842-TN',
    contact_number: currentUser?.phone || '+91 44 2829 0200',
    email: currentUser?.email || 'admin@apollo.org',
    website: 'https://apollo.org/greams-trauma',
    address: currentUser?.address || '21 Greams Lane, Off Greams Road, Thousand Lights',
    city: currentUser?.city || 'Chennai',
    district: 'Chennai Central',
    state: currentUser?.state || 'Tamil Nadu',
    pincode: currentUser?.pinCode || currentUser?.pincode || '600006',
    latitude: 13.0604,
    longitude: 80.2496,
    total_beds: 350,
    available_beds: 128,
    icu_beds: 50,
    icu_available: 12,
    emergency_beds: 24,
    emergency_available: 8,
    general_beds: 180,
    private_beds: 96,
    ambulance_count: 6,
    blood_bank_available: true,
    pharmacy_available: true,
    diagnostic_available: true,
    operation_theatre_count: 8,
    ventilator_count: 18,
    oxygen_beds: 80,
    specialities: [
      'Emergency & Trauma',
      'Cardiology & CCU',
      'Intensive Care Unit (ICU)',
      'Neurology & Stroke Care',
      'Orthopedics & Joint Care',
      'General Medicine & Surgery',
      'Nephrology & Dialysis',
      'Pulmonology',
    ],
    services: [
      '24x7 Emergency Care',
      'Advanced Life Support Ambulance',
      'Invasive Mechanical Ventilation',
      'Cardiac Catheterization (Cath Lab)',
      'Trauma Resuscitation Bays',
      'High-Speed CT & 3T MRI Imaging',
      'Stat Pathology & Blood Bank',
    ],
    opening_time: '00:00',
    closing_time: '23:59',
    emergency_24x7: true,
    admin_name: currentUser?.name || 'Dr. R. K. Nambiar',
    admin_phone: currentUser?.phone || '+91 98401 22819',
    status: 'Approved',
    helpline: '1066',
    ambulance: '108',
    accreditation: 'NABH / JCI Accredited',
    oxygenReservesPct: 98,
    ventilatorsInUse: 14,
  });

  const [wards, setWards] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateField = (field, value) => {
    setHospitalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchHospitalDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch('/api/admin/hospital-details', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.details) {
          const { hospital, schemaRecord, wards: fetchedWards } = data.details;
          setHospitalData((prev) => ({
            ...prev,
            ...(schemaRecord || {}),
            hospital_name: schemaRecord?.hospital_name || hospital?.name || prev.hospital_name,
            registration_number: schemaRecord?.registration_number || hospital?.code || prev.registration_number,
            hospital_type: schemaRecord?.hospital_type || hospital?.hospital_type || prev.hospital_type,
            contact_number: schemaRecord?.contact_number || hospital?.contactPhone || prev.contact_number,
            email: schemaRecord?.email || hospital?.emergencyEmail || prev.email,
            address: schemaRecord?.address || hospital?.address || prev.address,
            city: schemaRecord?.city || hospital?.city || prev.city,
            state: schemaRecord?.state || hospital?.state || prev.state,
            pincode: schemaRecord?.pincode || hospital?.pinCode || prev.pincode,
            total_beds: Number(schemaRecord?.total_beds ?? hospital?.wardBedsTotal ?? prev.total_beds),
            available_beds: Number(schemaRecord?.available_beds ?? prev.available_beds),
            icu_beds: Number(schemaRecord?.icu_beds ?? hospital?.icuBedsTotal ?? prev.icu_beds),
            icu_available: Number(schemaRecord?.icu_available ?? prev.icu_available),
            emergency_beds: Number(schemaRecord?.emergency_beds ?? prev.emergency_beds),
            emergency_available: Number(schemaRecord?.emergency_available ?? prev.emergency_available),
            specialities: Array.isArray(schemaRecord?.specialities) && schemaRecord.specialities.length > 0
              ? schemaRecord.specialities
              : prev.specialities,
            services: Array.isArray(schemaRecord?.services) && schemaRecord.services.length > 0
              ? schemaRecord.services
              : prev.services,
          }));

          if (Array.isArray(fetchedWards) && fetchedWards.length > 0) {
            setWards(fetchedWards);
          } else {
            initDefaultWards(hospitalData);
          }
        }
      }
    } catch (err) {
      console.warn('Using local hospital state:', err.message);
      initDefaultWards(hospitalData);
    } finally {
      setLoading(false);
    }
  };

  const initDefaultWards = (source) => {
    setWards([
      {
        id: 1,
        name: 'Trauma & Emergency Resuscitation Bay',
        location: 'Ground Floor • Wing A',
        category: 'Emergency',
        totalBeds: source.emergency_beds || 24,
        occupied: Math.max(0, (source.emergency_beds || 24) - (source.emergency_available || 8)),
        available: source.emergency_available || 8,
      },
      {
        id: 2,
        name: 'Medical ICU (Intensive Care Unit)',
        location: '2nd Floor • Wing B',
        category: 'Critical Care',
        totalBeds: source.icu_beds || 50,
        occupied: Math.max(0, (source.icu_beds || 50) - (source.icu_available || 12)),
        available: source.icu_available || 12,
      },
      {
        id: 3,
        name: 'Coronary Care Unit (CCU)',
        location: '3rd Floor • Wing A',
        category: 'Critical Care',
        totalBeds: 32,
        occupied: 26,
        available: 6,
      },
      {
        id: 4,
        name: 'General Inpatient Medical Ward',
        location: '4th Floor • Wing C',
        category: 'Inpatient',
        totalBeds: 120,
        occupied: 78,
        available: 42,
      },
      {
        id: 5,
        name: 'Surgical Post-Op Recovery Wing',
        location: '3rd Floor • Wing B',
        category: 'Inpatient',
        totalBeds: 60,
        occupied: 44,
        available: 16,
      },
    ]);
  };

  useEffect(() => {
    fetchHospitalDetails();
  }, [currentUser?.id, currentUser?.registration_id]);

  const handleSaveHospitalDetails = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch('/api/admin/hospital-details', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ...hospitalData,
          total_beds: Number(hospitalData.total_beds),
          available_beds: Number(hospitalData.available_beds),
          icu_beds: Number(hospitalData.icu_beds),
          icu_available: Number(hospitalData.icu_available),
          emergency_beds: Number(hospitalData.emergency_beds),
          emergency_available: Number(hospitalData.emergency_available),
          ventilator_count: Number(hospitalData.ventilator_count),
          ambulance_count: Number(hospitalData.ambulance_count),
          operation_theatre_count: Number(hospitalData.operation_theatre_count),
        }),
      });

      if (res.ok) {
        showToast('Hospital configuration updated and synchronized successfully.');
        if (updateProfile) {
          updateProfile({
            hospital: hospitalData.hospital_name,
            phone: hospitalData.contact_number,
            address: hospitalData.address,
            city: hospitalData.city,
            state: hospitalData.state,
          });
        }
      } else {
        showToast('Failed to save hospital details. Please check connection.');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('Error updating hospital details.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpeciality = () => {
    if (!newSpecialityInput.trim()) return;
    const current = Array.isArray(hospitalData.specialities) ? hospitalData.specialities : [];
    if (!current.includes(newSpecialityInput.trim())) {
      updateField('specialities', [...current, newSpecialityInput.trim()]);
    }
    setNewSpecialityInput('');
  };

  const handleRemoveSpeciality = (indexToRemove) => {
    const current = Array.isArray(hospitalData.specialities) ? hospitalData.specialities : [];
    updateField('specialities', current.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    const current = Array.isArray(hospitalData.services) ? hospitalData.services : [];
    if (!current.includes(newServiceInput.trim())) {
      updateField('services', [...current, newServiceInput.trim()]);
    }
    setNewServiceInput('');
  };

  const handleRemoveService = (indexToRemove) => {
    const current = Array.isArray(hospitalData.services) ? hospitalData.services : [];
    updateField('services', current.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddNewWard = (e) => {
    e.preventDefault();
    if (!newWardForm.name.trim()) return;

    const newWard = {
      id: Date.now(),
      name: newWardForm.name,
      location: newWardForm.location || 'Wing D',
      category: newWardForm.category,
      totalBeds: Number(newWardForm.totalBeds) || 20,
      occupied: Number(newWardForm.occupied) || 0,
      available: (Number(newWardForm.totalBeds) || 20) - (Number(newWardForm.occupied) || 0),
    };

    setWards((prev) => [...prev, newWard]);
    setNewWardModalOpen(false);
    setNewWardForm({ name: '', location: '', category: 'Inpatient', totalBeds: 24, occupied: 0 });
    showToast(`Ward "${newWard.name}" created and added to clinical roster.`);
  };

  const handleReallocateBeds = (e) => {
    e.preventDefault();
    if (!selectedWardForRealloc) return;

    setWards((prev) =>
      prev.map((w) => {
        if (w.id === selectedWardForRealloc.id) {
          const newTotal = w.totalBeds + reallocBedsToAdd;
          const newAvail = Math.max(0, newTotal - w.occupied);
          return { ...w, totalBeds: newTotal, available: newAvail };
        }
        return w;
      })
    );

    setReallocModalOpen(false);
    showToast(`Reallocated +${reallocBedsToAdd} beds to ${selectedWardForRealloc.name}.`);
  };

  const filteredWards = wards.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeCategoryFilter === 'All') return true;
    return w.category === activeCategoryFilter;
  });

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#004d6c] text-white rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-xl text-[#02C39A]">domain</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Hospital Administration Update</span>
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

      {/* New Ward Modal */}
      {newWardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">add_box</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Add Clinical Ward</h3>
              </div>
              <button
                onClick={() => setNewWardModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddNewWard} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Ward Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pediatric Intensive Care (PICU)"
                  value={newWardForm.name}
                  onChange={(e) => setNewWardForm({ ...newWardForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Floor &amp; Wing
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd Floor • Wing C"
                    value={newWardForm.location}
                    onChange={(e) => setNewWardForm({ ...newWardForm, location: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Ward Category
                  </label>
                  <select
                    value={newWardForm.category}
                    onChange={(e) => setNewWardForm({ ...newWardForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Critical Care">Critical Care</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Inpatient">Inpatient</option>
                    <option value="Day Care">Day Care</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Total Beds
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newWardForm.totalBeds}
                    onChange={(e) => setNewWardForm({ ...newWardForm, totalBeds: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Currently Occupied
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newWardForm.occupied}
                    onChange={(e) => setNewWardForm({ ...newWardForm, occupied: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setNewWardModalOpen(false)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  Create Ward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bed Reallocation Modal */}
      {reallocModalOpen && selectedWardForRealloc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-headline-sm text-base text-primary font-bold">Reallocate Ward Beds</h3>
              <button
                onClick={() => setReallocModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleReallocateBeds} className="mt-4 space-y-3">
              <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1">
                <div className="font-bold text-primary">{selectedWardForRealloc.name}</div>
                <div className="text-on-surface-variant">Current Capacity: {selectedWardForRealloc.totalBeds} Beds ({selectedWardForRealloc.available} Available)</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Beds to Allocate / Add
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={reallocBedsToAdd}
                  onChange={(e) => setReallocBedsToAdd(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setReallocModalOpen(false)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant text-xs font-semibold rounded-lg hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary/90 shadow-sm cursor-pointer"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="px-grid-margin py-space-xl space-y-space-lg max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-semibold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> ABDM TIER-3 FACILITY NODE
              </span>
              <span className="font-label-sm text-xs text-on-surface-variant">ID #{hospitalData.registration_number}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Hospital Profile &amp; Clinical Configuration
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Manage authoritative hospital facility details, bed census, ICU capacity, clinical departments, and 24x7 emergency configurations.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <button
              onClick={fetchHospitalDetails}
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-all font-label-lg text-label-lg font-medium cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              Refresh
            </button>
            <button
              onClick={handleSaveHospitalDetails}
              disabled={saving}
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-all font-label-lg text-label-lg font-semibold cursor-pointer disabled:opacity-50"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">{saving ? 'progress_activity' : 'save'}</span>
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-container pb-px overflow-x-auto">
          {[
            { id: 'profile', label: 'Hospital Profile & Location', icon: 'domain' },
            { id: 'capacity', label: 'Wards & Bed Capacity', icon: 'single_bed' },
            { id: 'specialities', label: 'Clinical Specialities & Services', icon: 'medical_services' },
            { id: 'contact', label: 'Emergency Helplines & Contact', icon: 'emergency' },
            { id: 'infrastructure', label: 'Infrastructure & Facilities', icon: 'local_hospital' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-label-md text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-surface-container-low/50 rounded-t-lg'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Profile & Location */}
        {activeTab === 'profile' && (
          <div className="space-y-space-md">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container space-y-6">
              <div className="border-b border-surface-container pb-3">
                <h3 className="font-headline-sm text-lg font-bold text-primary">Institutional Identity</h3>
                <p className="text-xs text-on-surface-variant">Core registration, institution category, and licensing credentials</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Official Hospital Name *
                  </label>
                  <input
                    type="text"
                    value={hospitalData.hospital_name}
                    onChange={(e) => updateField('hospital_name', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    License / Registration Number *
                  </label>
                  <input
                    type="text"
                    value={hospitalData.registration_number}
                    onChange={(e) => updateField('registration_number', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Hospital Classification
                  </label>
                  <select
                    value={hospitalData.hospital_type}
                    onChange={(e) => updateField('hospital_type', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Private">Private Super-Speciality</option>
                    <option value="Government">Government Medical College / Tertiary</option>
                    <option value="Trust / Non-Profit">Trust &amp; Charitable Hospital</option>
                    <option value="Autonomous">Autonomous National Institute</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Accreditation Standing
                  </label>
                  <input
                    type="text"
                    value={hospitalData.accreditation}
                    onChange={(e) => updateField('accreditation', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Lead Administrator / Medical Director
                  </label>
                  <input
                    type="text"
                    value={hospitalData.admin_name}
                    onChange={(e) => updateField('admin_name', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    ABDM Facility Registry ID
                  </label>
                  <input
                    type="text"
                    value={hospitalData.registration_id}
                    readOnly
                    className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface-variant border border-outline-variant/30 text-sm font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="border-b border-surface-container pb-3 pt-4">
                <h3 className="font-headline-sm text-lg font-bold text-primary">Geographic Location &amp; Mapping</h3>
                <p className="text-xs text-on-surface-variant">Physical address and geo-coordinates for 108 Emergency Ambulance dispatch routing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={hospitalData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={hospitalData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={hospitalData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={hospitalData.pincode}
                    onChange={(e) => updateField('pincode', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={hospitalData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    GPS Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={hospitalData.latitude}
                    onChange={(e) => updateField('latitude', parseFloat(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    GPS Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={hospitalData.longitude}
                    onChange={(e) => updateField('longitude', parseFloat(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Wards & Bed Capacity */}
        {activeTab === 'capacity' && (
          <div className="space-y-space-md">
            {/* Aggregate Bed Metrics Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Total Beds</span>
                <input
                  type="number"
                  value={hospitalData.total_beds}
                  onChange={(e) => updateField('total_beds', Number(e.target.value))}
                  className="w-full text-xl font-bold text-primary mt-1 bg-transparent border-b border-dashed border-outline focus:outline-none"
                />
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Available Beds</span>
                <input
                  type="number"
                  value={hospitalData.available_beds}
                  onChange={(e) => updateField('available_beds', Number(e.target.value))}
                  className="w-full text-xl font-bold text-[#008774] mt-1 bg-transparent border-b border-dashed border-outline focus:outline-none"
                />
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase">ICU Total Beds</span>
                <input
                  type="number"
                  value={hospitalData.icu_beds}
                  onChange={(e) => updateField('icu_beds', Number(e.target.value))}
                  className="w-full text-xl font-bold text-error mt-1 bg-transparent border-b border-dashed border-outline focus:outline-none"
                />
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase">ICU Vacant</span>
                <input
                  type="number"
                  value={hospitalData.icu_available}
                  onChange={(e) => updateField('icu_available', Number(e.target.value))}
                  className="w-full text-xl font-bold text-primary mt-1 bg-transparent border-b border-dashed border-outline focus:outline-none"
                />
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Emergency Bays</span>
                <input
                  type="number"
                  value={hospitalData.emergency_beds}
                  onChange={(e) => updateField('emergency_beds', Number(e.target.value))}
                  className="w-full text-xl font-bold text-primary mt-1 bg-transparent border-b border-dashed border-outline focus:outline-none"
                />
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Ventilators</span>
                <input
                  type="number"
                  value={hospitalData.ventilator_count}
                  onChange={(e) => updateField('ventilator_count', Number(e.target.value))}
                  className="w-full text-xl font-bold text-secondary mt-1 bg-transparent border-b border-dashed border-outline focus:outline-none"
                />
              </div>
            </div>

            {/* Ward Allocations Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
              <div className="p-space-md border-b border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-primary">Clinical Ward Allocation &amp; Occupancy</h3>
                  <p className="text-xs text-on-surface-variant">Live allocation of physical beds across specialty wings</p>
                </div>
                <button
                  onClick={() => setNewWardModalOpen(true)}
                  className="px-3.5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">add</span> + Add Ward
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="p-3 bg-surface-container-low flex flex-col sm:flex-row items-center gap-3 border-b border-surface-container">
                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search wards by name or location..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['All', 'Critical Care', 'Emergency', 'Inpatient', 'Day Care'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap ${
                        activeCategoryFilter === cat
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      type="button"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-xs">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md uppercase tracking-wider border-b border-surface-container">
                      <th className="px-4 py-3">Ward Name</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">Total Beds</th>
                      <th className="px-4 py-3 text-center">Occupied</th>
                      <th className="px-4 py-3 text-center">Available</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {filteredWards.map((w) => (
                      <tr key={w.id} className="hover:bg-surface-container-low/70 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-primary">{w.name}</td>
                        <td className="px-4 py-3.5 text-on-surface-variant">{w.location}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-semibold text-[11px]">
                            {w.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold">{w.totalBeds}</td>
                        <td className="px-4 py-3.5 text-center text-error font-semibold">{w.occupied}</td>
                        <td className="px-4 py-3.5 text-center text-[#008774] font-bold">{w.available}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedWardForRealloc(w);
                              setReallocModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-surface-container-high text-primary font-semibold text-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                            type="button"
                          >
                            Reallocate Beds
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Specialities & Services */}
        {activeTab === 'specialities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Specialities Card */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container space-y-4">
              <div className="border-b border-surface-container pb-3">
                <h3 className="font-headline-sm text-base font-bold text-primary">Clinical Specialities Offered</h3>
                <p className="text-xs text-on-surface-variant">Departments verified for outpatient and inpatient admissions</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add speciality (e.g. Oncology, Urology)..."
                  value={newSpecialityInput}
                  onChange={(e) => setNewSpecialityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSpeciality()}
                  className="flex-1 h-9 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleAddSpeciality}
                  className="px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                  type="button"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {hospitalData.specialities.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-medium text-xs border border-surface-container"
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveSpeciality(idx)}
                      className="text-on-surface-variant hover:text-error cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Services Card */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container space-y-4">
              <div className="border-b border-surface-container pb-3">
                <h3 className="font-headline-sm text-base font-bold text-primary">Hospital Services &amp; Facilities</h3>
                <p className="text-xs text-on-surface-variant">Diagnostic, critical, and specialized healthcare services</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add service (e.g. 24x7 Cath Lab, Dialysis)..."
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                  className="flex-1 h-9 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleAddService}
                  className="px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                  type="button"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {hospitalData.services.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-medium text-xs border border-surface-container"
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveService(idx)}
                      className="text-on-surface-variant hover:text-error cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Emergency Helplines & Contact */}
        {activeTab === 'contact' && (
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container space-y-6">
            <div className="border-b border-surface-container pb-3">
              <h3 className="font-headline-sm text-lg font-bold text-primary">Contact &amp; Emergency Dispatch Lines</h3>
              <p className="text-xs text-on-surface-variant">Authoritative emergency contact numbers synchronized with 108 Emergency Grid</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  24x7 Emergency Trauma Hotline *
                </label>
                <input
                  type="text"
                  value={hospitalData.contact_number}
                  onChange={(e) => updateField('contact_number', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Ambulance Dispatch Helpline
                </label>
                <input
                  type="text"
                  value={hospitalData.ambulance}
                  onChange={(e) => updateField('ambulance', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Official Medical Email *
                </label>
                <input
                  type="email"
                  value={hospitalData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Institutional Portal Website
                </label>
                <input
                  type="text"
                  value={hospitalData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Administrator Phone
                </label>
                <input
                  type="text"
                  value={hospitalData.admin_phone}
                  onChange={(e) => updateField('admin_phone', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Emergency Service Availability
                </label>
                <div className="flex items-center h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/50">
                  <input
                    type="checkbox"
                    id="emergency24x7"
                    checked={hospitalData.emergency_24x7}
                    onChange={(e) => updateField('emergency_24x7', e.target.checked)}
                    className="w-4 h-4 text-primary rounded focus:ring-primary mr-2"
                  />
                  <label htmlFor="emergency24x7" className="text-xs font-semibold text-primary">
                    24x7 Emergency Ingress Active
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Infrastructure & Critical Resources */}
        {activeTab === 'infrastructure' && (
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container space-y-6">
            <div className="border-b border-surface-container pb-3">
              <h3 className="font-headline-sm text-lg font-bold text-primary">Critical Medical Infrastructure</h3>
              <p className="text-xs text-on-surface-variant">Diagnostics, surgical theaters, and life-support assets</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-primary">24x7 Blood Bank</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">Component separation &amp; Cross-matching</div>
                </div>
                <input
                  type="checkbox"
                  checked={hospitalData.blood_bank_available}
                  onChange={(e) => updateField('blood_bank_available', e.target.checked)}
                  className="w-5 h-5 text-primary rounded"
                />
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-primary">In-House Pharmacy</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">24x7 Emergency formulary supply</div>
                </div>
                <input
                  type="checkbox"
                  checked={hospitalData.pharmacy_available}
                  onChange={(e) => updateField('pharmacy_available', e.target.checked)}
                  className="w-5 h-5 text-primary rounded"
                />
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-primary">Diagnostic Imaging Center</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">64-Slice CT, 3T MRI, Digital X-Ray</div>
                </div>
                <input
                  type="checkbox"
                  checked={hospitalData.diagnostic_available}
                  onChange={(e) => updateField('diagnostic_available', e.target.checked)}
                  className="w-5 h-5 text-primary rounded"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Active Ambulances Fleet
                </label>
                <input
                  type="number"
                  value={hospitalData.ambulance_count}
                  onChange={(e) => updateField('ambulance_count', Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Operation Theatres (OTs)
                </label>
                <input
                  type="number"
                  value={hospitalData.operation_theatre_count}
                  onChange={(e) => updateField('operation_theatre_count', Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Oxygen Pipeline Beds
                </label>
                <input
                  type="number"
                  value={hospitalData.oxygen_beds}
                  onChange={(e) => updateField('oxygen_beds', Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
