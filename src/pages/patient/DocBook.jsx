import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeAppointments } from '../../services/telemetry';
import AppointmentSlipModal from '../../components/common/AppointmentSlipModal';

export default function DocBook() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Doctors list from backend
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Appointments list from backend
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Booking Modal / Drawer state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [selectedSlipApt, setSelectedSlipApt] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Patient Booking Form state
  const [hasIdOption, setHasIdOption] = useState(user ? 'existing' : 'new');
  const [patientForm, setPatientForm] = useState({
    bookingTarget: 'SELF', // 'SELF' | 'OTHER'
    relation: 'Self', // 'Self' | 'Spouse' | 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Dependent' | 'Other'
    name: user?.name || '',
    phone: user?.phone || '',
    age: '38',
    gender: 'Male',
    bloodGroup: 'O+ (Rh Pos)',
    abhaNumber: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '10:30 AM',
    mode: 'IN_PERSON',
    department: 'Cardiology',
    symptoms: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch real doctors from backend
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await fetch('/api/patient/doctors');
      const data = await res.json();
      if (data.success && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Failed to load doctors from backend:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Fetch real appointments for patient
  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
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
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();

    // Subscribe to real-time socket events for live appointment synchronization
    const unsubscribe = subscribeAppointments((event) => {
      console.log('⚡ Real-time appointment event in DocBook:', event);
      if (event.type === 'APPOINTMENT_BOOKED' || event.type === 'APPOINTMENT_STATUS_CHANGED' || event.type === 'APPOINTMENT_CANCELLED') {
        fetchAppointments();
        if (event.message) {
          showToast(`Live Sync: ${event.message}`);
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync user info if user changes
  useEffect(() => {
    if (user) {
      setPatientForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
      setHasIdOption('existing');
    }
  }, [user?.id, user?.name, user?.phone]);

  // Open booking modal for a specific doctor
  const openBookingForDoctor = (doc) => {
    setSelectedDoctor(doc);
    setPatientForm((prev) => ({
      ...prev,
      department: doc.department || 'Cardiology',
      timeSlot: doc.availableSlots && doc.availableSlots[0] ? doc.availableSlots[0] : '10:30 AM',
    }));
    setIsBookingOpen(true);
  };

  // Submit dynamic appointment booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    setBookingLoading(true);
    try {
      const token = localStorage.getItem('ekawach_token');

      let response;
      if (token && hasIdOption === 'existing') {
        // Authenticated direct booking
        response = await fetch('/api/patient/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorProfileId: selectedDoctor.id,
            patientName: patientForm.name,
            patientPhone: patientForm.phone,
            scheduledAt: patientForm.date,
            timeSlot: patientForm.timeSlot,
            mode: patientForm.mode,
            department: selectedDoctor.department,
            symptoms: patientForm.symptoms,
            serviceType: 'DOCTOR_CONSULT',
            bookingFor: patientForm.bookingTarget,
            relation: patientForm.relation,
            patientAge: patientForm.age,
            patientGender: patientForm.gender,
          }),
        });
      } else {
        // Dynamic Quick-ID generation + booking in real time
        response = await fetch('/api/patient/quick-id-and-book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: patientForm.name,
            phone: patientForm.phone,
            email: `${patientForm.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'patient'}@ekawach.health`,
            bloodGroup: patientForm.bloodGroup,
            gender: patientForm.gender,
            doctorProfileId: selectedDoctor.id,
            scheduledAt: patientForm.date,
            timeSlot: patientForm.timeSlot,
            mode: patientForm.mode,
            department: selectedDoctor.department,
            symptoms: patientForm.symptoms,
            serviceType: 'DOCTOR_CONSULT',
            bookingFor: patientForm.bookingTarget,
            relation: patientForm.relation,
            patientAge: patientForm.age,
            patientGender: patientForm.gender,
          }),
        });
      }

      const result = await response.json();
      if (result.success || response.ok) {
        const apt = result.appointment;
        setConfirmedBooking(apt);
        setIsBookingOpen(false);
        showToast(`Consultation slot confirmed with ${selectedDoctor.name}! Token #${apt?.tokenNumber || 'EK-SLOT'}`);

        // If new token returned, store it
        if (result.token && !localStorage.getItem('ekawach_token')) {
          localStorage.setItem('ekawach_token', result.token);
        }

        // Refresh list
        fetchAppointments();
      } else {
        alert(result.message || 'Failed to book appointment. Please try again.');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      alert('Network error while booking appointment. Please retry.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel an appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment slot?')) return;

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
        showToast('Appointment cancelled successfully.');
        fetchAppointments();
      }
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      specialtyFilter === 'all' ||
      doc.department.toLowerCase() === specialtyFilter.toLowerCase() ||
      doc.specialization.toLowerCase().includes(specialtyFilter.toLowerCase());

    const matchesHospital =
      hospitalFilter === 'all' ||
      doc.hospital.toLowerCase().includes(hospitalFilter.toLowerCase());

    return matchesSearch && matchesSpecialty && matchesHospital;
  });

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'confirmed') return apt.status === 'CONFIRMED';
    if (activeTab === 'pending') return apt.status === 'PENDING';
    if (activeTab === 'cancelled') return apt.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="w-full text-slate-800" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div
          id="docbook-toast"
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

      {/* Connectivity & ABDM Status Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-100 border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs sm:text-sm font-semibold text-slate-700">
            Ayushman Bharat Digital Mission (ABDM) • Live Clinical Network
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">Real-Time Registry Connected</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 font-medium">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
          <span>Instant Token Generation • Any Doctor</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[14px]">calendar_add_on</span>
            <span>Direct Doctor Consultation Booking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Book an Appointment with Any Doctor
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
            Create or link your Digital Health ID (ABHA) and reserve real-time consultation slots with verified specialists across the emergency and hospital network.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
            <span className="material-symbols-outlined text-[24px]">stethoscope</span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Specialists</div>
            <div className="text-base font-bold text-slate-900">{doctors.length} Doctors Available Now</div>
          </div>
        </div>
      </div>

      {/* Confirmed / Submitted Booking Banner */}
      {confirmedBooking && (
        <div className="mb-8 p-5 rounded-2xl bg-teal-50 border border-teal-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[26px] text-teal-400">confirmation_number</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-900">
                  Appointment Request Registered • Token #{confirmedBooking.tokenNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                  Awaiting Doctor Approval
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                  ABDM Verified
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Scheduled for <strong className="text-slate-900">{confirmedBooking.timeSlot}</strong> on{' '}
                <strong className="text-slate-900">
                  {new Date(confirmedBooking.scheduledAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </strong>
                . Patient: <span className="font-semibold text-slate-900">{confirmedBooking.patientName}</span>.
              </p>
              <div className="text-xs text-slate-500 mt-1">
                Clinical protocol: Attending clinician will review and confirm this booking. Present your token pass at OPD Counter 04 upon arrival.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={() => setSelectedSlipApt(confirmedBooking)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
              View Token Slip
            </button>
            <button
              onClick={() => setConfirmedBooking(null)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              type="button"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="docSearchInput">
              Search Clinician or Specialty
            </label>
            <div className="relative">
              <input
                id="docSearchInput"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Dr. Menon, Cardiology, Stroke..."
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
            </div>
          </div>

          {/* Department / Specialty Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="docSpecialtySelect">
              Specialty / Department
            </label>
            <div className="relative">
              <select
                id="docSpecialtySelect"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full h-11 pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology & Brain Sciences</option>
                <option value="Pulmonology">Pulmonology & Critical Care</option>
                <option value="Orthopedics">Orthopedics & Joint Trauma</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Nephrology">Nephrology & Renal Care</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Hospital Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="docHospitalSelect">
              Hospital Center
            </label>
            <div className="relative">
              <select
                id="docHospitalSelect"
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value)}
                className="w-full h-11 pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">All Impaneled Hospitals</option>
                <option value="Apollo">Apollo Greams Trauma Hub</option>
                <option value="AIIMS">AIIMS New Delhi Trauma Center</option>
                <option value="Manipal">Manipal Hospital</option>
                <option value="Fortis">Fortis Malar Hospital</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Available Clinicians & Specialists</h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredDoctors.length} of {doctors.length} verified doctors
          </span>
        </div>

        {loadingDoctors ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <span className="material-symbols-outlined text-[32px] text-blue-600 animate-spin mb-2">
              progress_activity
            </span>
            <div className="text-sm font-medium text-slate-600">Loading verified doctors registry...</div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">person_search</span>
            <div className="text-base font-semibold text-slate-800">No clinicians match your search</div>
            <p className="text-xs text-slate-500 mt-1">Try resetting the specialty or hospital filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSpecialtyFilter('all');
                setHospitalFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              type="button"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                id={`doctor-card-${doc.id}`}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 font-bold text-lg flex-shrink-0 shadow-xs">
                      {doc.name
                        .replace('Dr. ', '')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900 truncate">{doc.name}</h3>
                        <span className="material-symbols-outlined text-teal-600 text-[18px]" title="NMC Verified">
                          verified
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-blue-700 mt-0.5">{doc.title}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{doc.specialization}</div>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">local_hospital</span>
                      <span className="truncate">{typeof doc.hospital === 'object' && doc.hospital !== null ? (doc.hospital.name || doc.hospital.hospital_name) : doc.hospital}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
                        <span>NMC: {doc.nmcNumber}</span>
                      </div>
                      <span className="text-slate-400 font-mono">{doc.degrees}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Experience: {doc.experienceYears} Years</span>
                      <span className="font-bold text-slate-900">₹{doc.consultationFee} OPD</span>
                    </div>
                  </div>

                  {/* Available Slots */}
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Available Slots Today / Tomorrow:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(doc.availableSlots || ['09:30 AM', '11:00 AM', '02:30 PM']).slice(0, 4).map((slot) => (
                        <span
                          key={slot}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking Trigger Button */}
                <div className="mt-6 pt-3">
                  <button
                    onClick={() => openBookingForDoctor(doc)}
                    id={`book-slot-btn-${doc.id}`}
                    className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Your Live Appointments Section */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">Your Consultation Appointments</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold">
                {appointments.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live synchronized across hospital OPDs and clinician schedules via E-KAWACH Telemetry.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            {['all', 'confirmed', 'pending', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loadingAppointments ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-[28px] text-blue-600 animate-spin mb-2">
              progress_activity
            </span>
            <div className="text-xs text-slate-500">Syncing live appointment records...</div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <span className="material-symbols-outlined text-[40px] text-slate-300 mb-2">event_busy</span>
            <div className="text-sm font-semibold text-slate-700">No appointments found</div>
            <p className="text-xs text-slate-400 mt-1">Select any doctor above to reserve your first slot.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => {
              const isCancelled = apt.status === 'CANCELLED';
              const isConfirmed = apt.status === 'CONFIRMED';
              const doctorObj = apt.doctorProfile || {};

              return (
                <div
                  key={apt.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCancelled
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                        isCancelled ? 'bg-slate-200 text-slate-600' : 'bg-blue-50 text-blue-900 border border-blue-100'
                      }`}
                    >
                      {doctorObj.name
                        ? doctorObj.name
                            .replace('Dr. ', '')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                        : 'DR'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900">
                          {doctorObj.name || 'Specialist Consultation'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isConfirmed
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-slate-100 text-slate-700'
                              : apt.status === 'DECLINED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isConfirmed ? 'APPROVED BY DOCTOR' : isCancelled ? 'CANCELLED' : apt.status === 'DECLINED' ? 'DECLINED BY DOCTOR' : 'AWAITING DOCTOR APPROVAL'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <span className="material-symbols-outlined text-[16px] text-teal-600">schedule</span>
                          {apt.timeSlot || '10:30 AM'} •{' '}
                          {new Date(apt.scheduledAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{apt.department || doctorObj.department || 'Clinical OPD'}</span>
                        <span>•</span>
                        <span>Mode: {apt.mode || 'IN_PERSON'}</span>
                      </div>

                      {apt.symptoms && (
                        <div className="text-xs text-slate-500 mt-1 italic">Notes: "{apt.symptoms}"</div>
                      )}
                      <div className="text-xs text-slate-400 mt-0.5">
                        Patient: {apt.patientName || 'Registered Patient'}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Prominent OPD Token */}
                  <div className="flex items-center gap-3 self-end md:self-center flex-wrap">
                    <div className="flex flex-col items-center justify-center px-3 py-1 rounded-xl bg-slate-900 text-white font-mono shadow-xs border border-slate-700">
                      <span className="text-[9px] uppercase tracking-wider text-teal-400 font-bold">OPD TOKEN</span>
                      <span className="text-xs font-black tracking-wider text-white">#{apt.tokenNumber || 'EK-SLOT-101'}</span>
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                        type="button"
                      >
                        Cancel Slot
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedSlipApt(apt)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                      View Slip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Booking Modal / Modal Drawer */}
      {isBookingOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Step 2 • Confirm Consultation Details
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">Book with {selectedDoctor.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedDoctor.specialization} • {typeof selectedDoctor.hospital === 'object' && selectedDoctor.hospital !== null ? (selectedDoctor.hospital.name || selectedDoctor.hospital.hospital_name) : selectedDoctor.hospital}
                </div>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="mt-6 space-y-6">
              {/* Doctor Quick Badge */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{selectedDoctor.name}</div>
                  <div className="text-slate-500">Consultation Fee: ₹{selectedDoctor.consultationFee}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold">
                  NMC: {selectedDoctor.nmcNumber}
                </span>
              </div>

              {/* Booking Target: Myself vs Another Patient */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  1. Who is this consultation for?
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientForm((prev) => ({
                        ...prev,
                        bookingTarget: 'SELF',
                        relation: 'Self',
                        name: user?.name || prev.name,
                        phone: user?.phone || prev.phone,
                      }));
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      patientForm.bookingTarget === 'SELF'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    Myself (Primary)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPatientForm((prev) => ({
                        ...prev,
                        bookingTarget: 'OTHER',
                        relation: prev.relation === 'Self' ? 'Spouse' : prev.relation,
                        name: '',
                        phone: '',
                      }));
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      patientForm.bookingTarget === 'OTHER'
                        ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">group_add</span>
                    Another Patient / Family
                  </button>
                </div>

                {patientForm.bookingTarget === 'OTHER' && (
                  <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col gap-2">
                    <label className="text-xs font-bold text-indigo-900">
                      Relationship to Account Holder *
                    </label>
                    <select
                      value={patientForm.relation}
                      onChange={(e) => setPatientForm({ ...patientForm, relation: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-indigo-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    >
                      <option value="Spouse">Spouse (Husband / Wife)</option>
                      <option value="Child">Child (Son / Daughter)</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Sibling">Brother / Sister</option>
                      <option value="Dependent">Elderly Dependent</option>
                      <option value="Other">Other / Emergency Patient</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Patient Identity Selector: Existing vs Create New ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  2. Patient Health ID (ABHA)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setHasIdOption('new')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      hasIdOption === 'new'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    + Create New Health ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasIdOption('existing')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      hasIdOption === 'existing'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Use Existing Profile
                  </button>
                </div>

                {/* Patient Information Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="patientName">
                        Patient Full Name *
                      </label>
                      <input
                        id="patientName"
                        type="text"
                        required
                        value={patientForm.name}
                        onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="patientPhone">
                        Mobile Number *
                      </label>
                      <input
                        id="patientPhone"
                        type="tel"
                        required
                        value={patientForm.phone}
                        onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                        placeholder="+91 98401 00000"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {hasIdOption === 'new' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="bloodGroup">
                          Blood Group
                        </label>
                        <select
                          id="bloodGroup"
                          value={patientForm.bloodGroup}
                          onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="O+ (Rh Pos)">O+ (Rh Positive)</option>
                          <option value="A+ (Rh Pos)">A+ (Rh Positive)</option>
                          <option value="B+ (Rh Pos)">B+ (Rh Positive)</option>
                          <option value="AB+ (Rh Pos)">AB+ (Rh Positive)</option>
                          <option value="O- (Rh Neg)">O- (Rh Negative)</option>
                          <option value="A- (Rh Neg)">A- (Rh Negative)</option>
                          <option value="B- (Rh Neg)">B- (Rh Negative)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="patientGender">
                          Gender
                        </label>
                        <select
                          id="patientGender"
                          value={patientForm.gender}
                          onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Mode & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="bookDate">
                    Consultation Date *
                  </label>
                  <input
                    id="bookDate"
                    type="date"
                    required
                    value={patientForm.date}
                    onChange={(e) => setPatientForm({ ...patientForm, date: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="bookMode">
                    Consultation Mode
                  </label>
                  <select
                    id="bookMode"
                    value={patientForm.mode}
                    onChange={(e) => setPatientForm({ ...patientForm, mode: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="IN_PERSON">In-Person (Hospital OPD)</option>
                    <option value="TELEHEALTH">Encrypted Telehealth (Video)</option>
                  </select>
                </div>
              </div>

              {/* Available Time Slots Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Select Consultation Time Slot
                </label>
                <div className="flex flex-wrap gap-2">
                  {(selectedDoctor.availableSlots || ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM']).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPatientForm({ ...patientForm, timeSlot: slot })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        patientForm.timeSlot === slot
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chief Complaints / Symptoms */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="symptomsNotes">
                  Chief Complaint / Symptoms (Optional)
                </label>
                <textarea
                  id="symptomsNotes"
                  rows="2"
                  value={patientForm.symptoms}
                  onChange={(e) => setPatientForm({ ...patientForm, symptoms: e.target.value })}
                  placeholder="e.g. Occasional chest tightness, palpitations during climbing stairs..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-md flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {bookingLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      <span>Reserving Slot...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Confirm & Generate ABDM Slip</span>
                    </>
                  )}
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
          onCancelSlot={handleCancelAppointment}
        />
      )}
    </div>
  );
}
