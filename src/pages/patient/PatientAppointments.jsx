import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeAppointments } from '../../services/telemetry';
import AppointmentSlipModal from '../../components/common/AppointmentSlipModal';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core real-time state
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [lastBookedToken, setLastBookedToken] = useState(null);
  const [selectedSlipApt, setSelectedSlipApt] = useState(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'self', 'other', 'doctor', 'diagnostic', 'confirmed'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('DOCTOR_CONSULT'); // 'DOCTOR_CONSULT' | 'DIAGNOSTIC_TEST' | 'LAB_PANEL' | 'EMERGENCY_BAY'
  const [bookingFor, setBookingFor] = useState('SELF'); // 'SELF' | 'OTHER'

  // Booking Form State
  const [formData, setFormData] = useState({
    // Patient details
    patientName: user?.name || user?.fullName || '',
    relation: 'Self', // 'Self' | 'Spouse' | 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Dependent' | 'Other'
    patientAge: user?.age || '45',
    patientGender: user?.gender || 'Male',
    patientPhone: user?.phone || '',
    patientAbha: user?.abhaNumber || user?.id || '',
    // Clinical service selection
    doctorId: 'doctor-kavitha',
    diagnosticTest: '2D Echocardiography & Color Doppler',
    department: 'Cardiology',
    scheduledAt: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '10:30 AM',
    mode: 'IN_PERSON', // 'IN_PERSON' | 'TELEHEALTH' | 'HOME_COLLECTION'
    symptoms: '',
    clinicalNotes: '',
  });

  // Pre-configured diagnostic scans and clinical services
  const diagnosticServices = [
    {
      id: 'diag-ecg',
      name: '12-Lead Digital ECG & Arrhythmia Screen',
      category: 'Cardiac Diagnostics',
      department: 'Electrophysiology',
      duration: '15 mins',
      fee: '₹450',
      icon: 'ecg',
      room: 'Cardiac ECG Bay 02',
    },
    {
      id: 'diag-echo',
      name: '2D Echocardiography & Color Doppler',
      category: 'Cardiac Ultrasound',
      department: 'Cardiology',
      duration: '35 mins',
      fee: '₹2,200',
      icon: 'monitor_heart',
      room: 'Echo Suite 3B',
    },
    {
      id: 'diag-ct',
      name: 'Coronary CT Angiography (64-Slice)',
      category: 'Diagnostic Imaging',
      department: 'Radiology & Imaging',
      duration: '45 mins',
      fee: '₹8,500',
      icon: 'radiology',
      room: 'Advanced CT Scanner Suite',
    },
    {
      id: 'diag-mri',
      name: 'Cardiac MRI & Myocardial Viability',
      category: 'High-Field MRI',
      department: 'Radiology & Imaging',
      duration: '60 mins',
      fee: '₹12,000',
      icon: 'medical_services',
      room: '3-Tesla MRI Wing',
    },
    {
      id: 'diag-trop',
      name: 'Cardiac Biomarkers (Troponin-I, hs-CRP, NT-proBNP)',
      category: 'Stat Pathology',
      department: 'Biochemistry & Pathology',
      duration: '25 mins',
      fee: '₹1,850',
      icon: 'science',
      room: 'Stat Emergency Lab Wing',
    },
    {
      id: 'diag-lipid',
      name: 'Comprehensive Lipid Panel & Glycemic HbA1c',
      category: 'Metabolic Screen',
      department: 'Pathology & Lab',
      duration: '15 mins',
      fee: '₹950',
      icon: 'bloodtype',
      room: 'Phlebotomy Center 01',
    },
    {
      id: 'diag-holter',
      name: '24-Hour Ambulatory Holter Monitor Setup',
      category: 'Telemetry Monitoring',
      department: 'Electrophysiology',
      duration: '30 mins',
      fee: '₹3,500',
      icon: 'nest_remote_comfort',
      room: 'Ambulatory Telemetry Bay',
    },
    {
      id: 'diag-trauma',
      name: 'Emergency Observation Bay / Acute Trauma Ingress',
      category: 'Acute Day Care',
      department: 'Emergency & Trauma',
      duration: 'Priority Triage',
      fee: '₹0 (ABDM Fast-Track)',
      icon: 'emergency',
      room: 'Trauma Resuscitation Bay 01',
    },
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch real appointments from backend
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ekawach_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/patient/appointments', { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real doctors from backend
  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/patient/doctors');
      const data = await res.json();
      if (data.success && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
        if (data.doctors.length > 0 && !formData.doctorId) {
          setFormData((prev) => ({ ...prev, doctorId: data.doctors[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();

    // Subscribe to real-time socket events
    const unsub = subscribeAppointments((event) => {
      console.log('⚡ Real-time appointment event in PatientAppointments:', event);
      fetchAppointments();
      if (event.message) {
        showToast(`Real-Time Sync: ${event.message}`);
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Update user-dependent defaults when auth resolves
  useEffect(() => {
    if (user && bookingFor === 'SELF') {
      setFormData((prev) => ({
        ...prev,
        patientName: user.name || prev.patientName,
        patientPhone: user.phone || prev.patientPhone,
        patientAbha: user.abhaNumber || prev.patientAbha,
        relation: 'Self',
      }));
    }
  }, [user?.id, user?.name, user?.phone, user?.abhaNumber, bookingFor]);

  // Handle switching booking for Self vs Other
  const handleBookingForChange = (target) => {
    setBookingFor(target);
    if (target === 'SELF') {
      setFormData((prev) => ({
        ...prev,
        patientName: user?.name || user?.fullName || '',
        relation: 'Self',
        patientAge: user?.age || '45',
        patientGender: user?.gender || 'Male',
        patientPhone: user?.phone || '',
        patientAbha: user?.abhaNumber || user?.id || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        patientName: '',
        relation: 'Spouse',
        patientAge: '48',
        patientGender: 'Female',
        patientPhone: '',
        patientAbha: '',
      }));
    }
  };

  // Submit appointment / diagnostic booking directly to backend
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName.trim()) {
      showToast('Please enter the patient name.');
      return;
    }

    setBookingLoading(true);
    try {
      const token = localStorage.getItem('ekawach_token');
      const selectedDoctorObj = doctors.find((d) => d.id === formData.doctorId);
      const isDiagnostic = selectedServiceType !== 'DOCTOR_CONSULT';
      const departmentName = isDiagnostic
        ? diagnosticServices.find((s) => s.name === formData.diagnosticTest)?.department || 'Diagnostics & Scans'
        : selectedDoctorObj?.department || formData.department || 'Cardiology';

      const symptomsOrIndication = isDiagnostic
        ? `${formData.diagnosticTest}${formData.symptoms ? ` • Note: ${formData.symptoms}` : ''}`
        : formData.symptoms || 'General Specialist Consultation';

      const payload = {
        doctorProfileId: isDiagnostic ? (doctors[0]?.id || 'doctor-kavitha') : formData.doctorId,
        patientName: formData.patientName.trim(),
        patientPhone: formData.patientPhone.trim() || '+91 98401 22819',
        scheduledAt: formData.scheduledAt,
        timeSlot: formData.timeSlot,
        mode: formData.mode,
        department: departmentName,
        symptoms: symptomsOrIndication,
        serviceType: selectedServiceType,
        bookingFor: bookingFor,
        relation: formData.relation,
        testName: isDiagnostic ? formData.diagnosticTest : null,
        patientAge: formData.patientAge,
        patientGender: formData.patientGender,
        patientAbha: formData.patientAbha || null,
        notes: formData.clinicalNotes || '',
      };

      let response;
      if (token) {
        response = await fetch('/api/patient/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/patient/quick-id-and-book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            name: formData.patientName,
            phone: formData.patientPhone,
            bloodGroup: 'O+ (Rh Pos)',
            gender: formData.patientGender,
          }),
        });
      }

      const result = await response.json();
      if (result.success || response.ok) {
        const apt = result.appointment;
        setLastBookedToken(apt);
        showToast(
          `Slot reserved! Token #${apt?.tokenNumber || 'EK-SLOT'} for ${formData.patientName} (${formData.relation})`
        );

        // Reset form for next booking while preserving self if applicable
        if (bookingFor === 'OTHER') {
          setFormData((prev) => ({
            ...prev,
            patientName: '',
            symptoms: '',
            clinicalNotes: '',
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            symptoms: '',
            clinicalNotes: '',
          }));
        }

        fetchAppointments();
      } else {
        showToast(result.error || result.message || 'Booking submission failed. Please retry.');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      showToast('Network error while booking appointment. Please retry.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel an appointment
  const handleCancelAppointment = async (appointmentId, patientLabel) => {
    if (!window.confirm(`Are you sure you want to cancel the booking for ${patientLabel}?`)) return;

    try {
      const token = localStorage.getItem('ekawach_token');
      const res = await fetch(`/api/patient/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Appointment slot cancelled successfully.`);
        fetchAppointments();
      }
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      showToast('Failed to cancel slot. Try again.');
    }
  };

  // Helper parser for rich notes metadata
  const parseMetadata = (apt) => {
    let meta = {
      serviceType: 'DOCTOR_CONSULT',
      bookingFor: 'SELF',
      relation: 'Self',
      testName: null,
      patientAge: null,
      patientGender: null,
    };
    if (apt.notes) {
      try {
        const parsed = JSON.parse(apt.notes);
        if (typeof parsed === 'object' && parsed !== null) {
          meta = { ...meta, ...parsed };
        }
      } catch (_e) {
        // Plain string notes
      }
    }
    return meta;
  };

  // Real-time analysis metrics computed strictly from live database appointments
  const liveStats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length;
    const pending = appointments.filter((a) => a.status === 'PENDING').length;
    const declined = appointments.filter((a) => a.status === 'DECLINED').length;
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;

    let otherCount = 0;
    let selfCount = 0;
    let diagnosticCount = 0;
    let doctorConsultCount = 0;
    let teleconsultCount = 0;

    appointments.forEach((a) => {
      const meta = parseMetadata(a);
      const isOther =
        meta.bookingFor === 'OTHER' ||
        (meta.relation && meta.relation !== 'Self') ||
        (a.notes && a.notes.toLowerCase().includes('other'));

      if (isOther) otherCount++;
      else selfCount++;

      const isDiag =
        meta.serviceType !== 'DOCTOR_CONSULT' ||
        meta.testName ||
        (a.symptoms &&
          (a.symptoms.toLowerCase().includes('ecg') ||
            a.symptoms.toLowerCase().includes('echo') ||
            a.symptoms.toLowerCase().includes('scan') ||
            a.symptoms.toLowerCase().includes('mri') ||
            a.symptoms.toLowerCase().includes('ct') ||
            a.symptoms.toLowerCase().includes('test') ||
            a.symptoms.toLowerCase().includes('lipid') ||
            a.symptoms.toLowerCase().includes('biomarker')));

      if (isDiag) diagnosticCount++;
      else doctorConsultCount++;

      if ((a.mode || '').includes('TELE')) teleconsultCount++;
    });

    const otherPercentage = total > 0 ? Math.round((otherCount / total) * 100) : 0;

    return {
      total,
      confirmed,
      pending,
      declined,
      cancelled,
      otherCount,
      selfCount,
      diagnosticCount,
      doctorConsultCount,
      teleconsultCount,
      otherPercentage,
    };
  }, [appointments]);

  // Filtered appointments list
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const meta = parseMetadata(apt);
      const isOther =
        meta.bookingFor === 'OTHER' ||
        (meta.relation && meta.relation !== 'Self') ||
        (apt.notes && apt.notes.toLowerCase().includes('other'));

      const isDiag =
        meta.serviceType !== 'DOCTOR_CONSULT' ||
        meta.testName ||
        (apt.symptoms &&
          (apt.symptoms.toLowerCase().includes('ecg') ||
            apt.symptoms.toLowerCase().includes('echo') ||
            apt.symptoms.toLowerCase().includes('scan') ||
            apt.symptoms.toLowerCase().includes('mri') ||
            apt.symptoms.toLowerCase().includes('ct') ||
            apt.symptoms.toLowerCase().includes('test')));

      // Tab filter
      if (activeTab === 'self' && isOther) return false;
      if (activeTab === 'other' && !isOther) return false;
      if (activeTab === 'doctor' && isDiag) return false;
      if (activeTab === 'diagnostic' && !isDiag) return false;
      if (activeTab === 'pending' && apt.status !== 'PENDING') return false;
      if (activeTab === 'confirmed' && apt.status !== 'CONFIRMED') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pName = (apt.patientName || apt.patientProfile?.name || '').toLowerCase();
        const dName = (apt.doctorProfile?.name || '').toLowerCase();
        const dep = (apt.department || '').toLowerCase();
        const sym = (apt.symptoms || '').toLowerCase();
        const token = (apt.tokenNumber || apt.id || '').toLowerCase();

        return (
          pName.includes(q) ||
          dName.includes(q) ||
          dep.includes(q) ||
          sym.includes(q) ||
          token.includes(q) ||
          meta.relation.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [appointments, activeTab, searchQuery]);

  return (
    <div className="w-full text-slate-800" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div
          id="appointment-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-fade-in"
        >
          <span className="material-symbols-outlined text-[20px] text-teal-400">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-3 text-slate-400 hover:text-white"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header Banner with Real-time Analysis & Switcher */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              ABDM APPOINTMENT &amp; DIAGNOSTIC HUB
            </span>
            <span className="text-xs text-slate-500 font-medium">Real-Time Telemetry Node</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Patient Appointments &amp; Diagnostic Center
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Book consultations for yourself or other family members/dependents. Schedule specialist doctor reviews,
            cardiac imaging, diagnostic blood scans, and emergency trauma intake with instant verified tokens.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/patient/book-doctor"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            Doctor Directory
          </Link>
          <button
            onClick={() => {
              fetchAppointments();
              showToast('Refreshed real-time queue from hospital database');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Sync Live Queue
          </button>
        </div>
      </div>

      {/* REAL-TIME ANALYSIS METRIC STRIP (No mock data, all computed from live database) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6" id="realtime-metrics-strip">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Bookings</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 leading-none">{liveStats.total}</span>
          <span className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-teal-600">event_available</span>
            Active in database
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Approved by Doctor</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 leading-none">{liveStats.confirmed}</span>
          <span className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Doctor authorized
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Awaiting Doctor Review</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 leading-none">{liveStats.pending}</span>
          <span className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
            Doctor action required
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-800">For Family / Kin</span>
          <span className="text-2xl font-bold text-indigo-700 mt-1 leading-none">
            {liveStats.otherCount}
            <span className="text-xs font-normal text-indigo-500 ml-1">({liveStats.otherPercentage}%)</span>
          </span>
          <span className="text-[11px] text-indigo-600 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">group</span>
            Dependents &amp; Kin
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">For Self</span>
          <span className="text-2xl font-bold text-slate-800 mt-1 leading-none">{liveStats.selfCount}</span>
          <span className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">person</span>
            Primary holder
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-800">Diagnostics &amp; Labs</span>
          <span className="text-2xl font-bold text-sky-700 mt-1 leading-none">{liveStats.diagnosticCount}</span>
          <span className="text-[11px] text-sky-600 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">biotech</span>
            Scans &amp; Tests
          </span>
        </div>
      </div>

      {/* Booking Confirmation Receipt (when just booked) */}
      {lastBookedToken && (
        <div
          id="last-booked-banner"
          className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-teal-50 to-white border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[26px]">schedule</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-900">Appointment Request Submitted!</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-xs font-bold border border-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                  STATUS: PENDING DOCTOR APPROVAL
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 text-[11px] font-semibold">
                  Token: #{lastBookedToken.tokenNumber || 'EK-SLOT'}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1">
                Scheduled for {new Date(lastBookedToken.scheduledAt).toLocaleDateString()} at{' '}
                <strong>{lastBookedToken.timeSlot}</strong> • Patient: <strong>{lastBookedToken.patientName}</strong> • Dept:{' '}
                <strong>{lastBookedToken.department}</strong>
              </p>
              <div className="mt-2 text-[11px] text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-md border border-amber-200/80 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>
                  Clinical Governance Notice: Patients cannot approve or decline appointments. Only the attending doctor has access to review and approve or decline this booking.
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={() => setSelectedSlipApt(lastBookedToken)}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
              View Full Slip
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print
            </button>
            <button
              onClick={() => setLastBookedToken(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN DUAL GRID: Booking Form on Left, Live Queue & Analysis on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Comprehensive Booking Engine (Self, Other Patient, Doctor, Diagnostic) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">calendar_add_on</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">New Booking &amp; Triage</h2>
                  <p className="text-xs text-slate-500">Book for yourself or another patient</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
                ABHA V2
              </span>
            </div>

            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
              {/* TARGET PATIENT SELECTOR: Booking for Myself vs Another Patient */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Who is this appointment for?
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleBookingForChange('SELF')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bookingFor === 'SELF'
                        ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    Myself (Primary)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBookingForChange('OTHER')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bookingFor === 'OTHER'
                        ? 'bg-white text-indigo-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">group_add</span>
                    Another Patient / Family
                  </button>
                </div>
              </div>

              {/* SERVICE TYPE SELECTOR: Doctor vs Diagnostic Scan vs Blood Lab vs Emergency Bay */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Select Healthcare Service
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedServiceType('DOCTOR_CONSULT')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedServiceType === 'DOCTOR_CONSULT'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-950 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[20px] text-teal-600">stethoscope</span>
                      {selectedServiceType === 'DOCTOR_CONSULT' && (
                        <span className="material-symbols-outlined text-[16px] text-teal-600">check_circle</span>
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight">Doctor Consult</span>
                    <span className="text-[10px] text-slate-500">Specialist OPD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedServiceType('DIAGNOSTIC_TEST')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedServiceType === 'DIAGNOSTIC_TEST'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-950 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[20px] text-amber-600">monitor_heart</span>
                      {selectedServiceType === 'DIAGNOSTIC_TEST' && (
                        <span className="material-symbols-outlined text-[16px] text-teal-600">check_circle</span>
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight">Diagnostic Imaging</span>
                    <span className="text-[10px] text-slate-500">ECG, Echo, MRI, CT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedServiceType('LAB_PANEL')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedServiceType === 'LAB_PANEL'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-950 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[20px] text-indigo-600">science</span>
                      {selectedServiceType === 'LAB_PANEL' && (
                        <span className="material-symbols-outlined text-[16px] text-teal-600">check_circle</span>
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight">Blood &amp; Lab Tests</span>
                    <span className="text-[10px] text-slate-500">Lipid, Troponin, Sugar</span>
                  </button>
                </div>
              </div>

              {/* PATIENT DETAILS (Adapts for Self vs Other Patient) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-500">badge</span>
                    Patient Identity Details
                  </span>
                  {bookingFor === 'OTHER' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      Family / Dependent Intake
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Relationship to Account Holder <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.relation}
                      onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Self">Self (Account Owner)</option>
                      <option value="Spouse">Spouse (Wife / Husband)</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Son">Son (Child)</option>
                      <option value="Daughter">Daughter (Child)</option>
                      <option value="Sibling">Brother / Sister</option>
                      <option value="Dependent">Elderly Dependent</option>
                      <option value="Other">Other / Emergency Patient</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-600">Age</label>
                    <input
                      type="number"
                      placeholder="Age"
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-600">Gender</label>
                    <select
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                      className="w-full h-9 px-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-600">Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 Phone"
                      value={formData.patientPhone}
                      onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* SPECIFIC SERVICE SELECTION (Doctor vs Diagnostic Test) */}
              {selectedServiceType === 'DOCTOR_CONSULT' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Select Attending Specialist Doctor
                  </label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => {
                      const doc = doctors.find((d) => d.id === e.target.value);
                      setFormData({
                        ...formData,
                        doctorId: e.target.value,
                        department: doc ? doc.department : formData.department,
                      });
                    }}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} • {doc.specialization || doc.title} ({doc.department}) — {typeof doc.hospital === 'object' && doc.hospital !== null ? (doc.hospital.name || doc.hospital.hospital_name) : doc.hospital}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Select Diagnostic Scan / Test Protocol
                  </label>
                  <select
                    value={formData.diagnosticTest}
                    onChange={(e) => setFormData({ ...formData, diagnosticTest: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {diagnosticServices.map((diag) => (
                      <option key={diag.id} value={diag.name}>
                        {diag.name} ({diag.category}) — {diag.duration} • Fee: {diag.fee}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* DATE, TIME & MODALITY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600">Time Slot</label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full h-9 px-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="09:00 AM">09:00 AM (Early Slot)</option>
                    <option value="09:45 AM">09:45 AM</option>
                    <option value="10:30 AM">10:30 AM (Peak OPD)</option>
                    <option value="11:15 AM">11:15 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:30 PM">02:30 PM (Post-Lunch)</option>
                    <option value="03:15 PM">03:15 PM</option>
                    <option value="04:00 PM">04:00 PM (Evening)</option>
                    <option value="05:30 PM">05:30 PM</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600">Modality</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full h-9 px-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="IN_PERSON">In-Person Hospital Visit</option>
                    <option value="TELEHEALTH">Encrypted Telehealth Call</option>
                    <option value="FAST_TRACK">Fast-Track Walk-in</option>
                  </select>
                </div>
              </div>

              {/* Symptoms / Chief Complaint */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Chief Complaint / Clinical Notes / Symptoms
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Sudden shortness of breath, palpitation history, follow-up after stent surgery..."
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wide uppercase shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {bookingLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Reserving Token in Database...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Confirm &amp; Generate ABHA Token
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Appointment Queue & Live Activity */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          {/* Controls: Search & Tabs */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter by patient name, token #, doctor, or test..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Live socket pulse */}
              <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-mono text-[11px]">Live WebSocket Telemetry: ACTIVE</span>
              </div>
            </div>

            {/* Doctor Exclusive Access Protocol Banner */}
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">verified_user</span>
              <div className="text-xs text-blue-900 leading-relaxed">
                <strong className="text-blue-950 font-semibold">Clinical Protocol:</strong> Patients can request or cancel appointments. In accordance with hospital governance, only the attending doctor has the access and authorization to <strong>approve</strong> or <strong>decline</strong> appointments.
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Bookings ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Awaiting Doctor ({liveStats.pending})
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'confirmed' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Doctor Approved ({liveStats.confirmed})
              </button>
              <button
                onClick={() => setActiveTab('self')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'self' ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                }`}
              >
                For Self ({liveStats.selfCount})
              </button>
              <button
                onClick={() => setActiveTab('other')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'other'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                For Other / Family ({liveStats.otherCount})
              </button>
              <button
                onClick={() => setActiveTab('diagnostic')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'diagnostic'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Diagnostic Scans ({liveStats.diagnosticCount})
              </button>
              <button
                onClick={() => setActiveTab('doctor')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'doctor' ? 'bg-sky-700 text-white' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                }`}
              >
                Doctor Consults ({liveStats.doctorConsultCount})
              </button>
            </div>
          </div>

          {/* APPOINTMENT QUEUE CARDS */}
          <div className="flex flex-col gap-3" id="live-appointments-container">
            {loading ? (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-white border border-slate-200">
                <span className="material-symbols-outlined text-[28px] animate-spin text-teal-600 mb-2">
                  progress_activity
                </span>
                <div className="text-sm font-medium">Fetching real-time appointments from database...</div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-white border border-slate-200">
                <span className="material-symbols-outlined text-[36px] text-slate-400 mb-2">event_busy</span>
                <div className="text-base font-bold text-slate-700">No appointments match current filters</div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Book a doctor consult or diagnostic test using the intake engine on the left. Entries will persist to
                  the database instantly.
                </p>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const meta = parseMetadata(apt);
                const isOther =
                  meta.bookingFor === 'OTHER' ||
                  (meta.relation && meta.relation !== 'Self') ||
                  (apt.notes && apt.notes.toLowerCase().includes('other'));

                const isDiag =
                  meta.serviceType !== 'DOCTOR_CONSULT' ||
                  meta.testName ||
                  (apt.symptoms &&
                    (apt.symptoms.toLowerCase().includes('ecg') ||
                      apt.symptoms.toLowerCase().includes('echo') ||
                      apt.symptoms.toLowerCase().includes('scan') ||
                      apt.symptoms.toLowerCase().includes('mri') ||
                      apt.symptoms.toLowerCase().includes('ct') ||
                      apt.symptoms.toLowerCase().includes('test')));

                const isConfirmed = apt.status === 'CONFIRMED';
                const isCancelled = apt.status === 'CANCELLED';
                const isDeclined = apt.status === 'DECLINED';
                const isPending = apt.status === 'PENDING' || (!isConfirmed && !isCancelled && !isDeclined);
                const patientDisplayName = apt.patientName || apt.patientProfile?.name || 'Verified Patient';

                return (
                  <div
                    key={apt.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                            isOther ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {isOther ? 'KIN' : 'SELF'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{patientDisplayName}</span>
                            {/* Badges for self vs other */}
                            {isOther ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                                Relation: {meta.relation || 'Dependent'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                Self (Account Owner)
                              </span>
                            )}
                            {/* Service badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDiag ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {isDiag ? 'Diagnostic / Scan' : 'Doctor Consult'}
                            </span>
                            {/* Status badge */}
                            {isConfirmed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                APPROVED BY DOCTOR
                              </span>
                            ) : isDeclined ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="material-symbols-outlined text-[13px]">cancel</span>
                                DECLINED BY DOCTOR
                              </span>
                            ) : isCancelled ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <span className="material-symbols-outlined text-[13px]">block</span>
                                CANCELLED BY USER
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                AWAITING DOCTOR APPROVAL
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                            Dept: {apt.department || 'Cardiology'} • OPD Desk 04
                          </span>
                        </div>
                      </div>

                      {/* Prominent OPD Token Box & Mode */}
                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <div className="flex flex-col items-center justify-center px-3 py-1 rounded-xl bg-slate-900 text-white font-mono shadow-xs border border-slate-700">
                          <span className="text-[9px] uppercase tracking-wider text-teal-400 font-bold">OPD TOKEN</span>
                          <span className="text-xs font-black tracking-wider text-white">#{apt.tokenNumber || 'EK-SLOT-101'}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {apt.mode || 'IN_PERSON'}
                        </span>
                      </div>
                    </div>

                    {/* Content / Details */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="material-symbols-outlined text-[16px] text-teal-600">event</span>
                          <span>
                            {new Date(apt.scheduledAt).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            at <strong>{apt.timeSlot}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">medical_information</span>
                          <span>
                            {apt.doctorProfile ? (
                              <>
                                Doctor: <strong>{apt.doctorProfile.name}</strong> ({apt.doctorProfile.specialization})
                              </>
                            ) : (
                              <>
                                Service: <strong>{apt.symptoms || 'Clinical Consultation'}</strong>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Doctor Access / Status Notice Callout */}
                      {isPending && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60">
                          <span className="material-symbols-outlined text-[15px] text-amber-600 shrink-0">lock_clock</span>
                          <span>
                            <strong>Awaiting Doctor Review:</strong> Only the attending doctor has the access to approve or decline this appointment.
                          </span>
                        </div>
                      )}
                      {isConfirmed && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600 shrink-0">verified</span>
                          <span>
                            <strong>Approved by Doctor:</strong> Attending clinician has confirmed your consultation slot.
                          </span>
                        </div>
                      )}
                      {isDeclined && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-rose-800 bg-rose-50/80 px-2.5 py-1 rounded-lg border border-rose-200/60">
                          <span className="material-symbols-outlined text-[15px] text-rose-600 shrink-0">error</span>
                          <span>
                            <strong>Declined by Doctor:</strong> The doctor was unable to accept this slot. Please select another time or specialist.
                          </span>
                        </div>
                      )}

                      {/* Action buttons footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-slate-400">shield_person</span>
                          <span>Approval / Decline: Doctor Access Only</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {!isCancelled && !isDeclined && (
                            <button
                              onClick={() => handleCancelAppointment(apt.id, patientDisplayName)}
                              className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                              type="button"
                            >
                              Cancel Slot
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedSlipApt(apt);
                              showToast(`Loaded OPD slip for token #${apt.tokenNumber || 'EK-SLOT'}`);
                            }}
                            className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                            Slip
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ABDM OPD Token Slip Modal */}
      {selectedSlipApt && (
        <AppointmentSlipModal
          appointment={selectedSlipApt}
          onClose={() => setSelectedSlipApt(null)}
          onCancelSlot={handleCancelAppointment}
        />
      )}
    </div>
  );
}
