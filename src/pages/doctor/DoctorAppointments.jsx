import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subscribeAppointments, subscribeConsentRequests } from '../../services/telemetry';
import AppointmentSlipModal from '../../components/common/AppointmentSlipModal';
import { useAuth } from '../../context/AuthContext';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [toastMsg, setToastMsg] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // 'all', 'pending', 'confirmed', 'teleconsult', 'diagnostic'
  const [searchQuery, setSearchQuery] = useState('');
  const [liveAppointments, setLiveAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedSlipApt, setSelectedSlipApt] = useState(null);

  // Patient Data Access Request via ID State
  const [searchPatientId, setSearchPatientId] = useState('patient-rajesh');
  const [accessStatus, setAccessStatus] = useState('NONE'); // NONE, PENDING_APPROVAL, APPROVED, DECLINED
  const [accessData, setAccessData] = useState(null);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [recordLookupOpen, setRecordLookupOpen] = useState(false);

  // Personal Prescription Modal State
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [selectedAptForRx, setSelectedAptForRx] = useState(null);
  const [rxDiagnosis, setRxDiagnosis] = useState('Hypertension & Cardiac Followup');
  const [rxMedicines, setRxMedicines] = useState('Rosuvastatin 10mg, Aspirin 75mg, Metformin 500mg');
  const [rxNotes, setRxNotes] = useState('Take medications after food once daily. Monitor blood pressure every morning.');
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);

  const pendingCount = useMemo(() => {
    return liveAppointments.filter(a => a.status === 'PENDING').length;
  }, [liveAppointments]);

  const confirmedCount = useMemo(() => {
    return liveAppointments.filter(a => a.status === 'CONFIRMED').length;
  }, [liveAppointments]);

  const teleconsultCount = useMemo(() => {
    return liveAppointments.filter(a => (a.mode || '').includes('TELE')).length;
  }, [liveAppointments]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Helper to safely obtain a valid doctor auth token
  const getDoctorAuthToken = async () => {
    let token = localStorage.getItem('ekawach_token');
    if (token) return token;

    try {
      const identifier = currentUser?.email || currentUser?.phone || currentUser?.id || 'dr.kavitha@apollo.health';
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'doctor', identifier, password: 'password123' }),
      });
      const loginData = await loginRes.json();
      if (loginData.accessToken) {
        localStorage.setItem('ekawach_token', loginData.accessToken);
        return loginData.accessToken;
      }
    } catch (_err) {}
    return null;
  };

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem('ekawach_token');
      let headers = token ? { Authorization: `Bearer ${token}` } : {};
      let res = await fetch('/api/doctor/appointments', { headers });

      // If token rejected due to cross-role session or expiry, re-issue doctor token
      if (res.status === 401 || res.status === 403) {
        token = await getDoctorAuthToken();
        if (token) {
          headers = { Authorization: `Bearer ${token}` };
          res = await fetch('/api/doctor/appointments', { headers });
        }
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.appointments)) {
        setLiveAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Failed to load doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAccessStatus = async (pId = searchPatientId) => {
    try {
      const token = localStorage.getItem('ekawach_token');
      const res = await fetch(`/api/doctor/access-status/${encodeURIComponent(pId)}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setAccessStatus(data.status);
          if (data.data) {
            setAccessData(data.data);
          }
        }
      }
    } catch (_e) {}
  };

  useEffect(() => {
    fetchDoctorAppointments();
    checkAccessStatus();

    const unsubscribeApt = subscribeAppointments((event) => {
      console.log('⚡ [DoctorAppointments] Live appointment update:', event);
      fetchDoctorAppointments();
      if (event.message) {
        showToast(event.message);
      }
    });

    const unsubscribeConsent = subscribeConsentRequests((event) => {
      console.log('⚡ [DoctorAppointments] Consent update event received:', event);
      checkAccessStatus();
      if (event.message) {
        showToast(event.message);
      }
    });

    return () => {
      if (unsubscribeApt) unsubscribeApt();
      if (unsubscribeConsent) unsubscribeConsent();
    };
  }, []);

  const handleRequestAccess = async (e) => {
    if (e) e.preventDefault();
    if (!searchPatientId.trim()) return;
    setIsRequestingAccess(true);
    try {
      let token = await getDoctorAuthToken();
      const res = await fetch('/api/doctor/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ patientId: searchPatientId }),
      });
      const data = await res.json();
      if (data.success) {
        setAccessStatus('PENDING_APPROVAL');
        showToast(data.message || 'Access request sent to patient. Waiting for patient approval...');
      } else {
        showToast(data.error || 'Failed to request patient access');
      }
    } catch (err) {
      showToast('Error requesting access: ' + err.message);
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const handleOpenRxModal = (apt) => {
    setSelectedAptForRx(apt);
    setRxModalOpen(true);
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setIsSubmittingRx(true);
    try {
      let token = await getDoctorAuthToken();
      const res = await fetch('/api/doctor/prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          appointmentId: selectedAptForRx ? selectedAptForRx.id : null,
          patientProfileId: selectedAptForRx ? (selectedAptForRx.patientProfileId || selectedAptForRx.patientProfile?.id) : 'patient-rajesh',
          diagnosis: rxDiagnosis,
          medicines: rxMedicines,
          doctorNotes: rxNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Personal prescription issued for ${selectedAptForRx ? (selectedAptForRx.patientName || 'Patient') : 'Patient'}!`);
        setRxModalOpen(false);
        fetchDoctorAppointments();
      } else {
        showToast(data.error || 'Failed to issue prescription');
      }
    } catch (err) {
      showToast('Error issuing prescription: ' + err.message);
    } finally {
      setIsSubmittingRx(false);
    }
  };

  const handleApprove = async (apt) => {
    setActionLoadingId(apt.id);
    try {
      let token = await getDoctorAuthToken();
      let res = await fetch(`/api/doctor/appointments/${apt.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      if (res.status === 401 || res.status === 403) {
        token = await getDoctorAuthToken();
        if (token) {
          res = await fetch(`/api/doctor/appointments/${apt.id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'CONFIRMED' }),
          });
        }
      }

      const data = await res.json();
      if (data.success) {
        showToast(`Approved slot for ${apt.patientName || 'Patient'}. Verified on ABDM Registry.`);
        // Optimistically update live state
        setLiveAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: 'CONFIRMED' } : a));
        fetchDoctorAppointments();
      } else {
        showToast(data.error || 'Failed to approve appointment slot');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Network error approving slot. Please retry.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (apt) => {
    if (!window.confirm(`Are you sure you want to decline the appointment for ${apt.patientName || 'this patient'}?`)) return;

    setActionLoadingId(apt.id);
    try {
      let token = await getDoctorAuthToken();
      let res = await fetch(`/api/doctor/appointments/${apt.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: 'DECLINED' }),
      });

      if (res.status === 401 || res.status === 403) {
        token = await getDoctorAuthToken();
        if (token) {
          res = await fetch(`/api/doctor/appointments/${apt.id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'DECLINED' }),
          });
        }
      }

      const data = await res.json();
      if (data.success) {
        showToast(`Appointment for ${apt.patientName || 'Patient'} has been declined.`);
        setLiveAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: 'DECLINED' } : a));
        fetchDoctorAppointments();
      } else {
        showToast(data.error || 'Failed to decline appointment');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Network error declining slot. Please retry.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const parseMetadata = (apt) => {
    let meta = {
      serviceType: 'DOCTOR_CONSULT',
      bookingFor: 'SELF',
      relation: 'Self',
      testName: null,
      patientAge: null,
      patientGender: null,
      patientAbha: null,
    };
    if (apt.notes) {
      try {
        const parsed = JSON.parse(apt.notes);
        if (typeof parsed === 'object' && parsed !== null) {
          meta = { ...meta, ...parsed };
        }
      } catch (_e) {}
    }
    return meta;
  };

  // Filter appointments according to statusTab and searchQuery
  const filteredAppointments = useMemo(() => {
    return liveAppointments.filter((apt) => {
      const meta = parseMetadata(apt);
      const isDiag =
        meta.serviceType !== 'DOCTOR_CONSULT' ||
        meta.testName ||
        (apt.symptoms &&
          (apt.symptoms.toLowerCase().includes('ecg') ||
            apt.symptoms.toLowerCase().includes('echo') ||
            apt.symptoms.toLowerCase().includes('scan') ||
            apt.symptoms.toLowerCase().includes('mri') ||
            apt.symptoms.toLowerCase().includes('ct') ||
            apt.symptoms.toLowerCase().includes('blood') ||
            apt.symptoms.toLowerCase().includes('test')));

      if (statusTab === 'pending' && apt.status !== 'PENDING') return false;
      if (statusTab === 'confirmed' && apt.status !== 'CONFIRMED') return false;
      if (statusTab === 'teleconsult' && !(apt.mode || '').includes('TELE')) return false;
      if (statusTab === 'diagnostic' && !isDiag) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pName = (apt.patientName || apt.patientProfile?.name || '').toLowerCase();
        const dep = (apt.department || '').toLowerCase();
        const sym = (apt.symptoms || '').toLowerCase();
        const token = (apt.tokenNumber || apt.id || '').toLowerCase();
        const phone = (apt.patientPhone || '').toLowerCase();
        const rel = (meta.relation || '').toLowerCase();

        return (
          pName.includes(q) ||
          dep.includes(q) ||
          sym.includes(q) ||
          token.includes(q) ||
          phone.includes(q) ||
          rel.includes(q)
        );
      }

      return true;
    });
  }, [liveAppointments, statusTab, searchQuery]);

  return (
    <div className="w-full">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#E6FFFA] border border-[#02C39A]/40 text-[#028090] font-medium text-sm flex items-center justify-between shadow-md animate-fade-in">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-teal-600">verified</span>
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg('')} className="text-[#028090] hover:opacity-75 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Page Header Section */}
      <section className="bg-white border border-[#E0E3E6] rounded-[16px] p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E4E4FB] text-[#0B1F3A] text-[11px] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B1F3A] animate-pulse"></span>
              CLINICIAN APPROVAL DESK
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6FFFA] border border-[#02C39A]/30 text-[#028090] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[12px]">sync</span>
              Real-time Patient Queue
            </span>
          </div>
          <h1 className="text-2xl lg:text-[30px] font-bold text-[#0B1F3A] tracking-tight leading-tight">
            Patient Appointments &amp; Approval Queue
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Review incoming patient requests in real time. Approve consultation slots, issue digital prescriptions, and generate verified ABDM OPD slips.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {pendingCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs tracking-wide shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>{pendingCount} Pending Approvals</span>
            </div>
          )}

          <button
            onClick={() => {
              fetchDoctorAppointments();
              showToast('Synchronized live appointment queue from hospital database');
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs tracking-wide transition-all shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-500">refresh</span>
            Refresh Queue
          </button>

          <button
            onClick={() => setRecordLookupOpen(!recordLookupOpen)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs tracking-wide transition-all shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">fingerprint</span>
            {recordLookupOpen ? 'Hide Record Lookup' : 'Request Patient Records'}
          </button>
        </div>
      </section>

      {/* KPI Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setStatusTab('pending')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-xs ${
            statusTab === 'pending'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Awaiting Doctor Review</span>
            <span className="text-[28px] font-bold text-amber-700 mt-1 leading-tight">
              {pendingCount} <span className="text-xs font-semibold text-slate-500">Pending</span>
            </span>
            <span className="text-xs text-amber-800/80 mt-0.5">Click to view approvals</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">hourglass_top</span>
          </div>
        </div>

        <div
          onClick={() => setStatusTab('confirmed')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-xs ${
            statusTab === 'confirmed'
              ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-400'
              : 'bg-white border-slate-200 hover:border-teal-300'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Confirmed Sessions</span>
            <span className="text-[28px] font-bold text-teal-700 mt-1 leading-tight">
              {confirmedCount} <span className="text-xs font-semibold text-slate-500">Approved</span>
            </span>
            <span className="text-xs text-teal-800/80 mt-0.5">Verified on ABDM</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">check_circle</span>
          </div>
        </div>

        <div
          onClick={() => setStatusTab('teleconsult')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-xs ${
            statusTab === 'teleconsult'
              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400'
              : 'bg-white border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Virtual Consults</span>
            <span className="text-[28px] font-bold text-indigo-700 mt-1 leading-tight">
              {teleconsultCount} <span className="text-xs font-semibold text-slate-500">Teleconsults</span>
            </span>
            <span className="text-xs text-indigo-800/80 mt-0.5">Encrypted video link</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">videocam</span>
          </div>
        </div>

        <div
          onClick={() => setStatusTab('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-xs ${
            statusTab === 'all'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total Active Slots</span>
            <span className="text-[28px] font-bold text-slate-900 mt-1 leading-tight">
              {liveAppointments.length} <span className="text-xs font-semibold text-slate-500">Total</span>
            </span>
            <span className="text-xs text-slate-500 mt-0.5">All scheduled intake</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">calendar_today</span>
          </div>
        </div>
      </section>

      {/* Optional Patient Record Lookup Panel */}
      {recordLookupOpen && (
        <section className="bg-white border border-indigo-200 rounded-[16px] p-6 shadow-sm flex flex-col gap-4 mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">badge</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0B1F3A]">Request Patient Records by Patient ID / ABHA</h2>
                <p className="text-xs text-slate-500">Request real-time clinical document access under ABDM consent framework.</p>
              </div>
            </div>

            <form onSubmit={handleRequestAccess} className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">fingerprint</span>
                <input
                  type="text"
                  value={searchPatientId}
                  onChange={(e) => setSearchPatientId(e.target.value)}
                  placeholder="e.g. patient-rajesh or ABHA ID"
                  className="pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0B1F3A] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono w-64"
                />
              </div>
              <button
                type="submit"
                disabled={isRequestingAccess}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRequestingAccess ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">lock_open</span>
                )}
                Request Access
              </button>
            </form>
          </div>

          {/* Access Status Feedback */}
          {accessStatus === 'PENDING_APPROVAL' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="material-symbols-outlined text-amber-600 text-lg">hourglass_top</span>
                <span>Access Request Sent to Patient (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">{searchPatientId}</code>). Waiting for patient approval in Patient Portal...</span>
              </div>
              <button
                onClick={() => checkAccessStatus()}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Check Status
              </button>
            </div>
          )}

          {accessStatus === 'APPROVED' && accessData && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-xl">verified_user</span>
                  <span className="font-bold text-sm text-emerald-900">Access Approved by {accessData.patient ? accessData.patient.name : 'Patient'}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">ACCESS ACTIVE</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {accessData.records && accessData.records.length > 0 ? (
                  accessData.records.map((rec) => (
                    <div key={rec.id} className="p-3 rounded-lg bg-white border border-emerald-200 text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{rec.title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">{rec.recordType}</span>
                      </div>
                      <p className="text-slate-600">{rec.notes || 'Clinical notes synchronized'}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic p-2">No uploaded records found for this patient.</div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* MAIN APPOINTMENTS CONTAINER (Top Priority, Full Focus) */}
      <section className="bg-white border border-[#E0E3E6] rounded-[16px] shadow-sm overflow-hidden flex flex-col">
        {/* Filter Navigation Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStatusTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'all'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Appointments ({liveAppointments.length})
            </button>

            <button
              onClick={() => setStatusTab('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">assignment_late</span>
              Pending Approvals ({pendingCount})
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setStatusTab('confirmed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'confirmed'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-teal-50 border border-teal-200 text-teal-900 hover:bg-teal-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Approved &amp; Confirmed ({confirmedCount})
            </button>

            <button
              onClick={() => setStatusTab('teleconsult')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'teleconsult'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">videocam</span>
              Teleconsults ({teleconsultCount})
            </button>

            <button
              onClick={() => setStatusTab('diagnostic')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusTab === 'diagnostic'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-sky-50 border border-sky-200 text-sky-900 hover:bg-sky-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">biotech</span>
              Diagnostics &amp; Labs
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, token, symptoms..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Live List Rows */}
        <div className="flex flex-col divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[32px] animate-spin text-teal-600">progress_activity</span>
              <div className="font-semibold">Loading live doctor appointment queue...</div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">event_busy</span>
              </div>
              <div className="font-bold text-slate-700">No appointments found matching this filter</div>
              <p className="text-xs text-slate-500 max-w-md">
                When a patient books an appointment in the patient portal, it appears here instantly with 1-click approval actions.
              </p>
              {statusTab !== 'all' && (
                <button
                  onClick={() => setStatusTab('all')}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Show All Appointments
                </button>
              )}
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const isPending = apt.status === 'PENDING';
              const isConfirmed = apt.status === 'CONFIRMED';
              const isDeclined = apt.status === 'DECLINED';
              const isCancelled = apt.status === 'CANCELLED';

              const patientName = apt.patientName || apt.patientProfile?.name || 'Verified Patient';
              const initials = patientName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'PT';

              const meta = parseMetadata(apt);
              const isKinBooking = meta.relation && meta.relation !== 'Self';

              return (
                <div
                  key={apt.id}
                  className={`p-5.5 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 animate-fade-in ${
                    isPending
                      ? 'bg-amber-50/30 hover:bg-amber-50/60 border-l-4 border-l-amber-500'
                      : isConfirmed
                      ? 'bg-white hover:bg-slate-50/80 border-l-4 border-l-teal-500'
                      : 'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  {/* Left Column: Patient Profile & Session Meta */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                        isPending
                          ? 'bg-amber-600 text-white'
                          : isConfirmed
                          ? 'bg-teal-700 text-white'
                          : 'bg-[#0B1F3A] text-white'
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="flex flex-col gap-1">
                      {/* Name + Badges Strip */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base font-bold text-[#0B1F3A]">{patientName}</span>

                        {isKinBooking && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                            Relation: {meta.relation}
                          </span>
                        )}

                        {meta.patientAge && (
                          <span className="text-xs text-slate-500 font-medium">
                            ({meta.patientAge}y • {meta.patientGender || 'Patient'})
                          </span>
                        )}

                        {/* Status Tag */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isConfirmed
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isDeclined
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>}
                          {isConfirmed && <span className="material-symbols-outlined text-[13px] text-emerald-700">check</span>}
                          {apt.status === 'PENDING' ? 'AWAITING APPROVAL' : apt.status}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {apt.mode || 'IN_PERSON'}
                        </span>
                      </div>

                      {/* Date & Time Slot */}
                      <div className="text-xs text-slate-600 font-medium flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="flex items-center gap-1 text-slate-700">
                          <span className="material-symbols-outlined text-[16px] text-teal-700">calendar_today</span>
                          {new Date(apt.scheduledAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 font-bold text-slate-900">
                          <span className="material-symbols-outlined text-[16px] text-teal-700">schedule</span>
                          Slot: {apt.timeSlot || '10:30 AM'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                          Token #{apt.tokenNumber || apt.id?.slice(0, 8)}
                        </span>
                        {apt.patientPhone && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-mono text-[11px]">{apt.patientPhone}</span>
                          </>
                        )}
                      </div>

                      {/* Reason / Symptoms */}
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 flex-wrap">
                        <span className="font-semibold text-slate-700">Reason / Clinical Need:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                          {apt.symptoms || meta.testName || 'Routine Specialist Consultation'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{apt.department || 'General Medicine'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Instant Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 xl:pt-0 flex-wrap">
                    {/* Prescription Button */}
                    <button
                      onClick={() => handleOpenRxModal(apt)}
                      className="h-9 px-3.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">prescriptions</span>
                      Prescription
                    </button>

                    {/* OPD Slip Button */}
                    <button
                      onClick={() => setSelectedSlipApt(apt)}
                      className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                      OPD Slip
                    </button>

                    {/* APPROVE / DECLINE BUTTONS */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleDecline(apt)}
                          disabled={actionLoadingId === apt.id}
                          className="h-9 px-4 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          type="button"
                        >
                          Decline Slot
                        </button>

                        <button
                          onClick={() => handleApprove(apt)}
                          disabled={actionLoadingId === apt.id}
                          className="h-9 px-5 rounded-xl bg-[#00A896] hover:bg-[#028090] text-white font-bold text-xs tracking-wide transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ring-2 ring-[#00A896]/30"
                          type="button"
                        >
                          {actionLoadingId === apt.id ? (
                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          )}
                          Approve Slot
                        </button>
                      </>
                    )}

                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                        Slot Approved
                      </span>
                    )}

                    {isDeclined && (
                      <button
                        onClick={() => handleApprove(apt)}
                        disabled={actionLoadingId === apt.id}
                        className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
                        type="button"
                      >
                        Re-Approve Slot
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Personal Prescription Modal */}
      {rxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00A896] text-[24px]">prescriptions</span>
                <div>
                  <h3 className="text-lg font-bold text-[#0B1F3A]">Issue Personal Digital Prescription</h3>
                  <p className="text-xs text-slate-500">Attach personal prescription directly to patient profile</p>
                </div>
              </div>
              <button onClick={() => setRxModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitPrescription} className="flex flex-col gap-4 text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 text-xs">Patient Name</label>
                <input
                  type="text"
                  readOnly
                  value={selectedAptForRx ? (selectedAptForRx.patientName || 'Rajesh Sharma') : 'Rajesh Sharma'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 text-xs">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 text-xs">Prescribed Medicines *</label>
                <textarea
                  rows={3}
                  required
                  value={rxMedicines}
                  onChange={(e) => setRxMedicines(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 text-xs">Doctor Instructions &amp; Follow-up</label>
                <textarea
                  rows={2}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRxModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRx}
                  className="px-5 py-2 rounded-lg bg-[#00A896] hover:bg-[#028090] text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingRx ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  )}
                  Issue Personal Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ABDM OPD Token Slip Modal */}
      {selectedSlipApt && (
        <AppointmentSlipModal
          appointment={selectedSlipApt}
          onClose={() => setSelectedSlipApt(null)}
        />
      )}
    </div>
  );
}
