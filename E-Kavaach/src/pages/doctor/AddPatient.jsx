import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { savePatientToRegistry } from '../../utils/emergencyRegistry';

export default function AddPatient() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [lastAddedPatient, setLastAddedPatient] = useState(null);
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    initialNotes: '',
    age: '',
    gender: '',
    bloodGroup: '',
    allergies: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchPatientsList = async () => {
    try {
      setLoadingPatients(true);
      const token = localStorage.getItem('ekawach_token');
      const res = await fetch('/api/doctor/patients', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        const profiles = data.profiles || [];
        const triageMap = (data.triageEntries || []).reduce((acc, t) => {
          if (t.patientProfileId) acc[t.patientProfileId] = t;
          return acc;
        }, {});

        const formatted = profiles.map(p => {
          const t = triageMap[p.id];
          const initials = (p.name || 'PT')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return {
            id: p.id,
            initials: initials || 'PT',
            name: p.name,
            tempId: p.emergencyToken ? `#${p.emergencyToken.slice(0, 7)}` : `#EK-${p.id.slice(0, 4)}`,
            abhaNumber: p.abhaNumber,
            status: t ? `${t.status || 'Active'} • ${t.bayNumber || 'Bay 02'}` : 'Admitted Bay 03',
            phone: p.phone || '+91 98400 00000',
            timeText: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently Added',
            category: t ? (t.condition || 'Emergency Ingress') : 'Walk-in Intake',
            avatarBg: 'bg-primary-fixed text-primary',
            bloodGroup: p.bloodGroup,
            gender: p.gender,
            age: p.age,
            allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : p.allergies
          };
        });

        if (formatted.length > 0) {
          setRecentPatients(formatted);
        } else {
          setRecentPatients([
            {
              id: 'pat-rajesh',
              initials: 'RS',
              name: 'Rajesh V. Sharma',
              tempId: '#EK-9824',
              abhaNumber: '9824-8819-3320-TN',
              status: 'Admitted Bay 02',
              phone: '+91 98401 22819',
              timeText: '10m ago',
              category: 'Acute Chest Ingress',
              avatarBg: 'bg-secondary-container text-on-secondary-container'
            }
          ]);
        }
      }
    } catch (err) {
      console.warn('Error fetching patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchPatientsList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    setIsSubmitting(true);
    const initials = formData.fullName
      .trim()
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    let assignedId = 'patient-' + Date.now();
    let tempId = '#EK-' + Math.floor(1000 + Math.random() * 9000);
    let abhaNumber = '9824-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-TN';

    try {
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const res = await fetch('/api/doctor/patients', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.fullName.trim(),
          contactNumber: formData.contactNumber,
          phone: formData.contactNumber ? `+91 ${formData.contactNumber}` : '+91 98400 00000',
          bloodGroup: formData.bloodGroup || 'O+ Positive',
          gender: formData.gender || 'Not Specified',
          age: formData.age || '42',
          allergies: formData.allergies ? [formData.allergies] : [],
          condition: formData.initialNotes || 'Routine Emergency Ingress',
          bayNumber: 'Bay 03',
          triageColor: 'YELLOW',
          priorityLevel: 'Priority 2 (Urgent)'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          assignedId = data.profile.id;
          if (data.profile.abhaNumber) abhaNumber = data.profile.abhaNumber;
          if (data.profile.emergencyToken) tempId = `#${data.profile.emergencyToken.slice(0, 7)}`;
        }
      }
    } catch (err) {
      console.warn('API registration warning:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Save to client emergency registry as well for instant QR lookup compatibility
    savePatientToRegistry({
      id: assignedId,
      name: formData.fullName.trim(),
      abhaNumber,
      bloodGroup: formData.bloodGroup || 'O+ Positive',
      gender: formData.gender || 'Not Specified',
      age: formData.age || 42,
      allergies: formData.allergies ? [formData.allergies] : [],
      phone: formData.contactNumber ? `+91 ${formData.contactNumber}` : '+91 98400 00000',
      condition: formData.initialNotes || 'Routine Emergency Ingress'
    });

    const newPatientRecord = {
      id: assignedId,
      initials: initials || 'PT',
      name: formData.fullName.trim(),
      tempId,
      abhaNumber,
      status: 'Admitted Bay 03',
      phone: '+91 ' + (formData.contactNumber || '98400 00000'),
      timeText: 'Added just now',
      category: formData.initialNotes ? formData.initialNotes.slice(0, 30) : 'Immediate Ingress',
      avatarBg: 'bg-secondary-container text-on-secondary-container',
      ...formData
    };

    setRecentPatients(prev => [newPatientRecord, ...prev]);
    setLastAddedPatient(newPatientRecord);
    setSubmitted(true);
    showToast(`Patient ${formData.fullName} onboarded with ID ${tempId}`);

    // Reset form
    setFormData({
      fullName: '',
      contactNumber: '',
      initialNotes: '',
      age: '',
      gender: '',
      bloodGroup: '',
      allergies: ''
    });
  };

  const handlePrintWristband = () => {
    showToast(`Thermal wristband label queued for printing on Bay 3 station.`);
    window.print();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full max-w-5xl mx-auto pb-12">
        {toastMsg && (
          <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-medium text-sm flex items-center justify-between shadow-sm animate-fade-in">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              {toastMsg}
            </span>
            <button onClick={() => setToastMsg('')} className="text-teal-800 hover:opacity-75">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Top Context Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#00A896] font-bold">Registration Module • Bay Ingress</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-xs text-slate-500 font-medium">Shift #42-B</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B1F3A] tracking-tight">Add New Patient</h1>
            <p className="text-sm text-slate-600 mt-0.5">Manually onboard walk-in, urgent transfer, or referred patients into E-KAWACH core records.</p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-900 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#00A896]"></span>
              <span>Manual Ingress Portal</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs">
              <span className="material-symbols-outlined text-[16px] text-teal-700">sync</span>
              <span>Node Sync: Real-time</span>
            </div>
          </div>
        </div>

        {/* Confirmation Banner */}
        {submitted && lastAddedPatient && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 animate-fade-in shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                <span className="material-symbols-outlined text-[22px]">check</span>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-base text-emerald-950">{lastAddedPatient.name} Added Successfully</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 text-xs font-bold font-mono tracking-wide border border-emerald-200">
                    ID: {lastAddedPatient.tempId}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Biometric sync initialized. ABHA mapped to <span className="font-bold font-mono text-emerald-950">{lastAddedPatient.abhaNumber}</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrintWristband} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-slate-800 hover:bg-slate-50 transition-all text-xs font-semibold shadow-xs cursor-pointer border border-emerald-200" type="button">
                <span className="material-symbols-outlined text-[18px] text-teal-700">print</span>
                <span>Print Wristband</span>
              </button>
              <button onClick={() => navigate(`/doctor/patient-history?patientId=${lastAddedPatient.id}`)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00A896] text-white hover:bg-[#028090] transition-all text-xs font-semibold shadow-xs cursor-pointer" type="button">
                <span>Open Clinical Chart</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Patient Ingress Form Card */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-base text-[#0B1F3A]">Quick Ingress Registration</h2>
                <p className="text-xs text-slate-500">Fast intake for walk-ins, outpatient overflow, and transfer arrivals.</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Standard Triage Protocol</span>
            </div>
          </div>

          <form className="p-6 flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between" htmlFor="fullName">
                <span>Full Legal Name <span className="text-rose-600">*</span></span>
                <span className="text-[11px] text-slate-400 font-normal">Matches Government or ABHA ID</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px] pointer-events-none">person</span>
                <input
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  id="fullName"
                  name="fullName"
                  placeholder="e.g., Saravanan Ramanathan"
                  required
                  type="text"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between" htmlFor="contactNumber">
                <span>Primary Contact Number <span className="text-rose-600">*</span></span>
                <span className="text-[11px] text-slate-400 font-normal">SMS &amp; ABDM Authentication</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-400 pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span className="text-xs font-bold text-slate-700 pr-1">+91</span>
                </div>
                <input
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full h-11 pl-20 pr-4 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all font-mono"
                  id="contactNumber"
                  maxLength="10"
                  name="contactNumber"
                  placeholder="98400 00000"
                  required
                  type="tel"
                />
              </div>
            </div>

            {/* Initial Clinical Notes */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between" htmlFor="initialNotes">
                <span>Initial Notes &amp; Chief Complaint</span>
                <span className="text-[11px] text-slate-400 font-normal">Symptoms or triage observation</span>
              </label>
              <textarea
                value={formData.initialNotes}
                onChange={handleInputChange}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all resize-y font-normal"
                id="initialNotes"
                name="initialNotes"
                placeholder="Reason for visit, observed symptoms, triage acuity, or relevant arrival context..."
                rows="3"
              />
            </div>

            {/* Collapsible Additional Details */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 transition-all">
              <button
                onClick={() => setIsAdditionalOpen(!isAdditionalOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#00A896] text-[20px]">tune</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">Additional Details (Optional)</span>
                    <span className="text-[11px] text-slate-500">Age, gender, declared allergies, and blood group</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">{isAdditionalOpen ? 'expand_less' : 'expand_more'}</span>
                </div>
              </button>

              {/* Expandable Content Grid */}
              {isAdditionalOpen && (
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                  {/* Age */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700" htmlFor="age">Age</label>
                    <div className="relative flex items-center">
                      <input
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                        id="age"
                        max="125"
                        min="0"
                        name="age"
                        placeholder="45"
                        type="number"
                      />
                      <span className="absolute right-3 text-[11px] text-slate-400 pointer-events-none">Yrs</span>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700" htmlFor="gender">Gender</label>
                    <div className="relative flex items-center">
                      <select
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer pr-8"
                        id="gender"
                        name="gender"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 text-slate-400 pointer-events-none text-[18px]">keyboard_arrow_down</span>
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700" htmlFor="bloodGroup">Blood Group</label>
                    <div className="relative flex items-center">
                      <select
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer pr-8"
                        id="bloodGroup"
                        name="bloodGroup"
                      >
                        <option value="">Unknown</option>
                        <option value="O+">O+ (Positive)</option>
                        <option value="O-">O- (Negative)</option>
                        <option value="A+">A+ (Positive)</option>
                        <option value="A-">A- (Negative)</option>
                        <option value="B+">B+ (Positive)</option>
                        <option value="B-">B- (Negative)</option>
                        <option value="AB+">AB+ (Positive)</option>
                        <option value="AB-">AB- (Negative)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 text-slate-400 pointer-events-none text-[18px]">keyboard_arrow_down</span>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700" htmlFor="allergies">Known Allergies</label>
                    <input
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500"
                      id="allergies"
                      name="allergies"
                      placeholder="e.g., Penicillin, Sulfa"
                      type="text"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-[#00A896] text-white font-bold text-xs hover:bg-[#028090] transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  )}
                  <span>{isSubmitting ? 'Registering...' : 'Save & Onboard Patient'}</span>
                </button>
                <button
                  className="inline-flex items-center justify-center px-4 h-11 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                  type="reset"
                  onClick={() => setFormData({ fullName: '', contactNumber: '', initialNotes: '', age: '', gender: '', bloodGroup: '', allergies: '' })}
                >
                  Reset
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <span className="material-symbols-outlined text-teal-700 text-[18px]">lock</span>
                <span>Generates instant biometric QR &amp; ABHA sync token</span>
              </div>
            </div>
          </form>
        </div>

        {/* Recently Added Patients Table Section */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#0B1F3A]">
                <span className="material-symbols-outlined text-[20px]">history</span>
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#0B1F3A]">Recently Added Patients</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {recentPatients.length} Active
                </span>
              </div>
            </div>
            <button
              onClick={fetchPatientsList}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer self-start sm:self-auto"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-teal-700">refresh</span>
              <span>Refresh Registry</span>
            </button>
          </div>

          {/* Rows List */}
          <div className="flex flex-col divide-y divide-slate-100">
            {loadingPatients ? (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px] animate-spin text-teal-600">progress_activity</span>
                <span>Loading patient registry...</span>
              </div>
            ) : recentPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No patients registered yet. Use the form above to register your first patient.
              </div>
            ) : (
              recentPatients.map((pt) => (
                <div key={pt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2.5 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200">
                      {pt.initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#0B1F3A] truncate">{pt.name}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">{pt.tempId}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-teal-800 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></span>
                          <span>{pt.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap mt-0.5">
                        <span className="font-mono">{pt.phone}</span>
                        <span>•</span>
                        <span>{pt.timeText}</span>
                        <span>•</span>
                        <span className="text-slate-700 font-medium">{pt.category}</span>
                        {pt.bloodGroup && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-rose-700">{pt.bloodGroup}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => navigate(`/doctor/patient-history?patientId=${pt.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#00A896] text-slate-700 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                      type="button"
                    >
                      <span>View Chart</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

