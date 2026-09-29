import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { subscribeTriage, subscribeReferrals, subscribeEmergencyAlert } from '../../services/telemetry';
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [toastMessage, setToastMessage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTelemetryPatient, setActiveTelemetryPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Summary State fetched from DB
  const [summaryData, setSummaryData] = useState({
    hospitalName: currentUser?.hospital || currentUser?.name || 'Apollo Greams Super-Speciality Trauma Center',
    hospitalCode: currentUser?.tag || 'AP-HSP-842-TN',
    totalBeds: 450,
    occupiedBeds: 382,
    availableBeds: 68,
    occupancyRate: 85,
    icuTotal: 50,
    icuOccupied: 46,
    icuAvailable: 4,
    icuLoadPct: 92,
    activePatientsCount: 382,
    doctorsOnDutyCount: 48,
    totalDoctors: 52,
    totalStaff: 48,
    onDutyStaff: 36,
    oxygenReservesPct: 98,
    ventilatorsInUse: 14,
    ventilatorsTotal: 18,
  });

  const [chartsData, setChartsData] = useState({
    hourlyTrend: [
      { time: '00:00', occupied: 360, available: 90, critical: 40 },
      { time: '04:00', occupied: 350, available: 100, critical: 38 },
      { time: '08:00', occupied: 375, available: 75, critical: 44 },
      { time: '12:00', occupied: 395, available: 55, critical: 48 },
      { time: '16:00', occupied: 388, available: 62, critical: 46 },
      { time: 'Now', occupied: 382, available: 68, critical: 46 },
    ],
    wardBreakdown: [
      { name: 'ICU Node', total: 50, occupied: 46, available: 4, loadPct: 92 },
      { name: 'CCU Unit', total: 32, occupied: 28, available: 4, loadPct: 88 },
      { name: 'Trauma Bay', total: 8, occupied: 6, available: 2, loadPct: 75 },
      { name: 'General Ward', total: 200, occupied: 172, available: 28, loadPct: 86 },
      { name: 'Surgical Wing', total: 60, occupied: 52, available: 8, loadPct: 87 },
      { name: 'Pediatric NICU', total: 40, occupied: 34, available: 6, loadPct: 85 },
    ],
    triageDistribution: [
      { name: 'Red (Critical)', value: 4, color: '#DC2626' },
      { name: 'Yellow (Urgent)', value: 8, color: '#D97706' },
      { name: 'Green (Stable)', value: 16, color: '#059669' },
    ],
  });

  const [triageList, setTriageList] = useState([]);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const token = localStorage.getItem('ekawach_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const res = await fetch('/api/admin/dashboard/summary', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.summary) {
            const { hospital, bedMetrics, operationsMetrics, charts } = data.summary;
            setSummaryData({
              hospitalName: hospital.name || currentUser?.hospital || currentUser?.name || 'Apollo Greams Trauma Center',
              hospitalCode: hospital.code || currentUser?.tag || 'AP-HSP-842-TN',
              totalBeds: bedMetrics.total,
              occupiedBeds: bedMetrics.occupied,
              availableBeds: bedMetrics.available,
              occupancyRate: bedMetrics.occupancyRate,
              icuTotal: bedMetrics.icu?.total || 50,
              icuOccupied: bedMetrics.icu?.occupied || 46,
              icuAvailable: bedMetrics.icu?.available || 4,
              icuLoadPct: bedMetrics.icu?.loadPct || 92,
              activePatientsCount: bedMetrics.occupied,
              doctorsOnDutyCount: operationsMetrics.onDutyDoctors || operationsMetrics.totalDoctors || 48,
              totalDoctors: operationsMetrics.totalDoctors || 52,
              totalStaff: operationsMetrics.totalStaff || 48,
              onDutyStaff: operationsMetrics.onDutyStaff || 36,
              oxygenReservesPct: hospital.oxygenReservesPct ?? 98,
              ventilatorsInUse: hospital.ventilatorsInUse ?? 14,
              ventilatorsTotal: hospital.ventilatorsTotal ?? 18,
            });

            if (charts) {
              setChartsData({
                hourlyTrend: charts.hourlyTrend || [],
                wardBreakdown: charts.wardBreakdown?.length > 0 ? charts.wardBreakdown : chartsData.wardBreakdown,
                triageDistribution: charts.triageDistribution || chartsData.triageDistribution,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    }

    async function loadTriage() {
      try {
        const token = localStorage.getItem('ekawach_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const res = await fetch('/api/admin/triage-queue', { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.queue)) {
            const mapped = data.queue.map((e) => ({
              id: e.id,
              name: e.patientName || 'Emergency Ingress Patient',
              abha: e.abhaNumber || '9824-8819-TN',
              priority: e.priorityLevel || (e.triageColor === 'RED' ? 'Critical (Priority 1)' : 'Urgent (Priority 2)'),
              condition: e.condition || 'Emergency Trauma Ingress',
              vitals: e.bayNumber ? `Trauma ${e.bayNumber} • Clinical Observation` : 'Trauma Bay 02 • Cardiac Telemetry',
              bay: e.bayNumber || 'Bay 02',
              doctor: e.doctor || 'Dr. Kavitha Menon',
              role: e.isReferral ? 'Inter-Hospital Referral Consult' : 'Emergency Response Lead',
              isReferral: !!e.isReferral,
              isLive: true,
            }));
            setTriageList(mapped);
          }
        }
      } catch (_err) {}
    }

    loadSummary();
    loadTriage();

    const unsubTriage = subscribeTriage((data) => {
      if (data.triageEntry) {
        const e = data.triageEntry;
        const newItem = {
          id: e.id || Date.now(),
          name: e.patientName || 'Referred Patient',
          abha: e.abhaNumber || 'ABHA-IN-TRANSIT',
          priority: e.priorityLevel || 'Critical (Priority 1)',
          condition: e.condition || 'Emergency Ingress',
          vitals: `${e.bayNumber || 'Bay 02'} • Live Ingress Alert (108 Fleet)`,
          bay: e.bayNumber || 'Bay 02',
          doctor: e.doctor || 'Specialist Consult Lead',
          role: 'Inter-Hospital Ingress Attending',
          isReferral: true,
          isLive: true,
        };
        setTriageList((prev) => [newItem, ...prev.filter((x) => x.id !== newItem.id)]);
        showToast(`⚡ Ingress Alert: ${newItem.name} assigned to ${newItem.bay} (${newItem.priority})`);
      }
    });

    const unsubReferral = subscribeReferrals((data) => {
      if (data.triageEntry || data.referral) {
        const r = data.referral || {};
        const te = data.triageEntry || {};
        const newItem = {
          id: te.id || r.id || Date.now(),
          name: r.patientName || te.patientName || 'Referred Patient',
          abha: r.abhaNumber || te.abhaNumber || '9824-8819-TN',
          priority: r.priorityLevel || te.priorityLevel || 'Priority 1 (Critical)',
          condition: `${r.clinicalSummary || te.condition || 'Inter-Hospital Transfer'} (from ${r.fromDoctorName || 'Referring Clinician'})`,
          vitals: `${r.bayAllocated || te.bayNumber || 'Bay 02'} • Ingress In-Transit`,
          bay: r.bayAllocated || te.bayNumber || 'Bay 02',
          doctor: r.toDoctorName || te.doctor || 'Attending Specialist',
          role: `Transferred to ${r.destinationHospital || 'Trauma Hub'}`,
          isReferral: true,
          isLive: true,
        };
        setTriageList((prev) => [newItem, ...prev.filter((x) => x.id !== newItem.id)]);
        showToast(`🚑 Live Referral Incoming: ${newItem.name} transferred to ${newItem.bay}!`);
      }
    });

    const unsubEmergencyAlert = subscribeEmergencyAlert((alertData) => {
      if (alertData) {
        const p = alertData.patient || {};
        const newItem = {
          id: alertData.alertId || `ivr-${Date.now()}`,
          name: p.name || 'Emergency IVR Patient',
          abha: p.abhaNumber || 'ABHA-IN-TRANSIT',
          priority: alertData.priorityLevel || 'Critical (Priority 1)',
          condition: `🚨 IVR SOS: ${alertData.condition || 'Immediate Golden-Hour Dispatch'} (${alertData.location?.raw || 'Local Area'})`,
          vitals: `${alertData.bayNumber || 'Bay 01'} • 108 Fleet In-Transit (~${alertData.etaMinutes || 4} min ETA)`,
          bay: alertData.bayNumber || 'Bay 01',
          doctor: 'Dr. Kavitha Menon',
          role: 'Emergency Response Lead',
          isReferral: false,
          isLive: true,
          isIvrSos: true,
        };
        setTriageList((prev) => [newItem, ...prev.filter((x) => x.id !== newItem.id)]);
        showToast(`🚨 CRITICAL EMERGENCY SOS: IVR Dispatch for ${newItem.name} -> ${newItem.bay}!`);
      }
    });

    return () => {
      if (unsubTriage) unsubTriage();
      if (unsubReferral) unsubReferral();
      if (unsubEmergencyAlert) unsubEmergencyAlert();
    };
  }, [currentUser?.id, currentUser?.registration_id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportDailyReport = () => {
    const csvContent = `E-KAWACH HOSPITAL COMMAND NODE 01 - DAILY OPERATIONS REPORT
Generated: ${new Date().toLocaleString()}
Hospital: ${summaryData.hospitalName} (${summaryData.hospitalCode})

=== BED & CAPACITY METRICS ===
Total Beds: ${summaryData.totalBeds}
Occupied: ${summaryData.occupiedBeds} (${summaryData.occupancyRate}% Capacity)
Available: ${summaryData.availableBeds}
ICU Beds: ${summaryData.icuOccupied}/${summaryData.icuTotal} Occupied (${summaryData.icuLoadPct}% Load)
CCU Beds: 28/32 Occupied (87.5% Load)
Trauma Bays: 6/8 Occupied (75% Load)

=== CLINICAL RESOURCES ===
Oxygen Cryogenic Reserves: ${summaryData.oxygenReservesPct}%
Ventilators: ${summaryData.ventilatorsInUse} in use / ${summaryData.ventilatorsTotal} total
Doctors On Duty: ${summaryData.doctorsOnDutyCount} of ${summaryData.totalDoctors}
Ward Staff On Duty: ${summaryData.onDutyStaff} of ${summaryData.totalStaff}

=== ACTIVE EMERGENCY INGRESS ===
${triageList.map((t) => `${t.bay}: ${t.name} (${t.abha}) - ${t.priority} - ${t.condition} - Attending: ${t.doctor}`).join('\n')}
`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `E-KAWACH_Daily_Operations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Daily Hospital Operations Report downloaded successfully.');
  };

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#004d6c] text-white rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-xl text-[#02C39A]">verified</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Command Node Notification</span>
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

      {/* Quick Add Clinical Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Add Clinical Personnel</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
              Select the administrative domain to onboard medical professionals to {summaryData.hospitalName}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  navigate('/admin/doctors');
                }}
                className="p-4 rounded-xl border border-surface-container-high bg-surface-container-low hover:bg-surface-container flex flex-col items-center text-center transition-all group cursor-pointer"
                type="button"
              >
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">stethoscope</span>
                </div>
                <span className="font-label-lg text-label-lg font-semibold text-primary">Doctor / Specialist</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant mt-1">NMC Affiliated Clinician</span>
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  navigate('/admin/staff');
                }}
                className="p-4 rounded-xl border border-surface-container-high bg-surface-container-low hover:bg-surface-container flex flex-col items-center text-center transition-all group cursor-pointer"
                type="button"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">badge</span>
                </div>
                <span className="font-label-lg text-label-lg font-semibold text-primary">Clinical &amp; Ward Staff</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant mt-1">Nurses, Pharmacists, Techs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Live Modal */}
      {activeTelemetryPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  {activeTelemetryPatient.bay} • Live Telemetry Stream
                </h3>
              </div>
              <button
                onClick={() => setActiveTelemetryPatient(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 bg-surface-container-low p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-label-lg text-label-lg font-bold text-primary">{activeTelemetryPatient.name}</div>
                  <div className="font-label-sm text-xs text-on-surface-variant">ABHA: {activeTelemetryPatient.abha}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-xs font-semibold">
                  {activeTelemetryPatient.priority}
                </span>
              </div>
              <div className="text-xs font-medium text-on-surface mt-1">
                Condition: <span className="font-bold text-primary">{activeTelemetryPatient.condition}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container text-center">
                <div className="text-[11px] text-on-surface-variant uppercase font-semibold">Heart Rate</div>
                <div className="text-lg font-bold text-error flex items-center justify-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-base animate-pulse">favorite</span>
                  104 bpm
                </div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container text-center">
                <div className="text-[11px] text-on-surface-variant uppercase font-semibold">SpO2</div>
                <div className="text-lg font-bold text-primary mt-1">94%</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container text-center">
                <div className="text-[11px] text-on-surface-variant uppercase font-semibold">Blood Pressure</div>
                <div className="text-lg font-bold text-secondary mt-1">135/88</div>
              </div>
            </div>

            <div className="p-3 bg-[#e6f7f4] rounded-lg text-xs text-[#008774] flex items-center justify-between">
              <span>Attending: <strong>{activeTelemetryPatient.doctor}</strong> ({activeTelemetryPatient.role})</span>
              <span className="material-symbols-outlined text-base">verified</span>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setActiveTelemetryPatient(null);
                  navigate('/admin/emergency-ward');
                }}
                className="px-4 py-2 bg-surface-container text-primary font-label-md text-xs font-semibold rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                Emergency Ward View
              </button>
              <button
                onClick={() => {
                  setActiveTelemetryPatient(null);
                  navigate('/doctor/patient-history');
                }}
                className="px-4 py-2 bg-primary text-on-primary font-label-md text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                type="button"
              >
                Open Full EMR
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full">
        <div className="px-grid-margin py-space-xl space-y-space-xl max-w-7xl mx-auto w-full">
          {/* 1. Header / Overview */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-xs mb-space-2xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-semibold tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> {summaryData.hospitalCode}
                </span>
                <span className="font-label-sm text-xs text-on-surface-variant">Grid Synchronized (ABDM Tier-3 Node)</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Hospital Command Dashboard
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {summaryData.hospitalName}
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-all font-label-lg text-label-lg font-medium cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                + Add Personnel
              </button>
              <Link
                to="/admin/hospital-details"
                className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-all font-label-lg text-label-lg font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">domain</span>
                Hospital Profile &amp; Beds
              </Link>
              <button
                onClick={handleExportDailyReport}
                className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container-low transition-all font-label-lg text-label-lg font-medium cursor-pointer border border-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Report
              </button>
            </div>
          </div>

          {/* 2. Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {/* Card 1 */}
            <div
              onClick={() => navigate('/admin/hospital-details')}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Hospital Beds</span>
                <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">single_bed</span>
                </div>
              </div>
              <div className="mt-space-sm">
                <div className="font-headline-xl text-3xl text-primary font-bold tracking-tight">{summaryData.totalBeds}</div>
                <div className="font-body-sm text-xs text-on-surface-variant mt-1">
                  {summaryData.occupiedBeds} Occupied • {summaryData.availableBeds} Available
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5"></span>{summaryData.availableBeds} Ready ({summaryData.occupancyRate}% Load)
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => navigate('/admin/emergency-ward')}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">ICU Critical Beds</span>
                <div className="w-9 h-9 rounded-lg bg-error-container text-on-error-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">vital_signs</span>
                </div>
              </div>
              <div className="mt-space-sm">
                <div className="font-headline-xl text-3xl text-primary font-bold tracking-tight">{summaryData.icuOccupied} / {summaryData.icuTotal}</div>
                <div className="font-body-sm text-xs text-on-surface-variant mt-1">
                  {summaryData.icuAvailable} ICU Critical Beds Vacant
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5"></span>{summaryData.icuLoadPct}% ICU Utilization
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => navigate('/admin/doctors')}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Clinical Doctors</span>
                <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                </div>
              </div>
              <div className="mt-space-sm">
                <div className="font-headline-xl text-3xl text-primary font-bold tracking-tight">{summaryData.doctorsOnDutyCount} Active</div>
                <div className="font-body-sm text-xs text-on-surface-variant mt-1">
                  Total Verified Clinicians: {summaryData.totalDoctors}
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5 animate-pulse"></span>NMC Verified
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => navigate('/admin/staff')}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Staff &amp; Nursing</span>
                <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
              </div>
              <div className="mt-space-sm">
                <div className="font-headline-xl text-3xl text-primary font-bold tracking-tight">{summaryData.onDutyStaff} On Duty</div>
                <div className="font-body-sm text-xs text-on-surface-variant mt-1">
                  Total Roster: {summaryData.totalStaff} Members
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>{Math.round((summaryData.onDutyStaff / (summaryData.totalStaff || 1)) * 100)}% Shift Coverage
                </span>
              </div>
            </div>
          </div>

          {/* 3. CHARTS SECTION: Recharts Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
            {/* Chart 1: 24-Hour Bed Occupancy Trend */}
            <div className="lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div>
                  <h3 className="font-headline-sm text-base text-primary font-bold">24-Hour Bed Occupancy &amp; Ingress Trend</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Real-time hourly census of occupied vs available vs critical beds</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold">
                  Live Stream
                </span>
              </div>

              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartsData.hourlyTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="occupiedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#004d6c" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#004d6c" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="availableGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#008774" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#008774" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Area type="monotone" dataKey="occupied" name="Occupied Beds" stroke="#004d6c" fillOpacity={1} fill="url(#occupiedGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="available" name="Available Beds" stroke="#008774" fillOpacity={1} fill="url(#availableGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="critical" name="ICU Critical" stroke="#DC2626" fillOpacity={1} fill="url(#criticalGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Emergency Triage Distribution */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div>
                  <h3 className="font-headline-sm text-base text-primary font-bold">Triage Severity Split</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Active ER ingress severity levels</p>
                </div>
                <span className="material-symbols-outlined text-primary text-xl">pie_chart</span>
              </div>

              <div className="h-52 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartsData.triageDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {chartsData.triageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 text-center pt-2 border-t border-surface-container">
                <div className="bg-red-50 p-2 rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-red-700">Red (P1)</div>
                  <div className="text-base font-bold text-red-700">
                    {chartsData.triageDistribution.find((t) => t.name.includes('Red'))?.value || 0}
                  </div>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Yellow (P2)</div>
                  <div className="text-base font-bold text-amber-700">
                    {chartsData.triageDistribution.find((t) => t.name.includes('Yellow'))?.value || 0}
                  </div>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-emerald-700">Green (P3)</div>
                  <div className="text-base font-bold text-emerald-700">
                    {chartsData.triageDistribution.find((t) => t.name.includes('Green'))?.value || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Wards Capacity Bar Chart & Critical Facilities Gauges */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
            {/* Ward Breakdown Bar Chart */}
            <div className="lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div>
                  <h3 className="font-headline-sm text-base text-primary font-bold">Ward &amp; Department Capacity Distribution</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Occupied beds compared against total departmental capacity</p>
                </div>
                <Link to="/admin/hospital-details" className="text-xs font-semibold text-primary hover:underline">
                  Manage Wards &rarr;
                </Link>
              </div>

              <div className="h-60 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartsData.wardBreakdown} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                    <Bar dataKey="occupied" name="Occupied Beds" fill="#004d6c" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Critical Resources Gauges */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <h3 className="font-headline-sm text-base text-primary font-bold">Critical Lifeline Reserves</h3>
                <span className="material-symbols-outlined text-primary text-xl">air</span>
              </div>

              <div className="space-y-4 my-auto py-2">
                {/* Oxygen */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-on-surface">Cryogenic Liquid Oxygen Reserves</span>
                    <span className="text-primary font-bold">{summaryData.oxygenReservesPct}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[#008774] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${summaryData.oxygenReservesPct}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-1">20,000L Central Tank • 96+ Hours Autonomous Run</div>
                </div>

                {/* Ventilators */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-on-surface">Mechanical Ventilators</span>
                    <span className="text-primary font-bold">
                      {summaryData.ventilatorsInUse} / {summaryData.ventilatorsTotal} in use
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((summaryData.ventilatorsInUse / (summaryData.ventilatorsTotal || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-1">
                    {Math.max(0, summaryData.ventilatorsTotal - summaryData.ventilatorsInUse)} Ventilators Available in Surge Stock
                  </div>
                </div>

                {/* Shift Coverage */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-on-surface">Active Duty Clinical Staffing</span>
                    <span className="text-secondary font-bold">
                      {summaryData.onDutyStaff} / {summaryData.totalStaff} On Duty
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-secondary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((summaryData.onDutyStaff / (summaryData.totalStaff || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-1">100% Essential Critical Care Ratio Met</div>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Grid Telemetry:</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#008774]">
                  <span className="w-2 h-2 rounded-full bg-[#008774] animate-pulse"></span> Optimal 0.04s
                </span>
              </div>
            </div>
          </div>

          {/* 5. Emergency Ward Priority Live Queue */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden relative">
            <div className="p-space-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md border-b border-surface-container">
                <div className="flex items-center gap-space-sm">
                  <div className="relative flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-error animate-ping absolute opacity-75"></span>
                    <span className="w-3 h-3 rounded-full bg-error relative"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-headline-md text-headline-md text-primary font-bold">Emergency Ward Ingress Queue</h2>
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-xs font-semibold uppercase">Live Ingress</span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      Real-time live telemetry from incoming ambulances (108 Fleet) and trauma bay admissions.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm">
                  <button
                    onClick={() => navigate('/admin/emergency-ward')}
                    className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-lg text-xs font-semibold shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">emergency</span> Open ER Command Center
                  </button>
                </div>
              </div>

              {/* ER Table */}
              <div className="overflow-x-auto mt-space-sm">
                <table className="w-full text-left font-body-sm text-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                      <th className="px-space-md py-3 rounded-l-lg">Patient &amp; ABHA ID</th>
                      <th className="px-space-md py-3">Triage Level</th>
                      <th className="px-space-md py-3">Presenting Condition</th>
                      <th className="px-space-md py-3">Bay Allocated</th>
                      <th className="px-space-md py-3">Attending Specialist</th>
                      <th className="px-space-md py-3 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {triageList.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-surface-container-low/70 transition-colors">
                        <td className="px-space-md py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-label-lg text-sm font-semibold text-primary">{p.name}</span>
                            {p.isReferral && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-secondary-fixed text-on-secondary-fixed rounded font-bold">
                                TRANSFER
                              </span>
                            )}
                          </div>
                          <div className="font-label-sm text-xs text-on-surface-variant">{p.abha}</div>
                        </td>
                        <td className="px-space-md py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-xs font-semibold ${
                              p.priority.includes('Critical') || p.priority.includes('Priority 1')
                                ? 'bg-error-container text-on-error-container'
                                : p.priority.includes('Urgent') || p.priority.includes('Priority 2')
                                ? 'bg-secondary-fixed text-on-secondary-fixed'
                                : 'bg-tertiary-fixed text-on-tertiary-fixed'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                p.priority.includes('Critical') || p.priority.includes('Priority 1')
                                  ? 'bg-error animate-pulse'
                                  : p.priority.includes('Urgent')
                                  ? 'bg-secondary'
                                  : 'bg-tertiary'
                              }`}
                            ></span>
                            {p.priority}
                          </span>
                        </td>
                        <td className="px-space-md py-3.5 text-on-surface font-medium text-xs">
                          <div>{p.condition}</div>
                          <div className="text-[11px] text-on-surface-variant font-normal">{p.vitals}</div>
                        </td>
                        <td className="px-space-md py-3.5">
                          <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-primary font-mono text-xs font-bold">
                            {p.bay}
                          </span>
                        </td>
                        <td className="px-space-md py-3.5 text-on-surface text-xs">
                          <div className="font-semibold">{p.doctor}</div>
                          <div className="text-[11px] text-on-surface-variant">{p.role}</div>
                        </td>
                        <td className="px-space-md py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setActiveTelemetryPatient(p)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high text-xs font-semibold transition-colors cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-sm">monitor_heart</span> Telemetry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
