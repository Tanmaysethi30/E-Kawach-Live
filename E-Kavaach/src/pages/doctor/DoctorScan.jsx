import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorScan() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [manualAbha, setManualAbha] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('Error stopping camera tracks:', err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleToggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
      showToast('Optical camera stream deactivated.');
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser or environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      showToast('Optical 60 FPS Camera feed active. Align ABHA QR token within reticle.');
    } catch (err) {
      console.warn('Camera access unavailable:', err);
      stopCamera();
      showToast('Camera access unavailable or permission denied. Switched to manual ABHA lookup.');
      const input = document.getElementById('abha-input');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleManualFocus = () => {
    const input = document.getElementById('abha-input');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleScan = () => {
    const id = manualAbha.trim() || '9824-8819-3320-TN';
    setScanResult({
      name: 'Rajesh V. Sharma',
      abha: id,
      blood: 'O+ Positive',
      allergies: 'Penicillin (Severe anaphylaxis)',
      emergencyContact: 'Meera Sharma (+91 98401 99281)',
      status: 'CRITICAL INGRESS VERIFIED',
    });
    showToast(`Patient record for ${id} retrieved via Bay 3 Optical Ingress.`);
  };

  const handlePairBluetooth = () => {
    showToast('Bluetooth handheld scanner paired (GREAMS-BT-BAY-03). Ready for NFC/Optical scan.');
  };

  const handleExportLog = () => {
    showToast('Trauma Ingress telemetry log exported (JSON/CSV encrypted packet).');
  };
  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
<div className="flex flex-col gap-space-xl max-w-7xl mx-auto w-full pb-space-2xl">
{toastMsg && (
        <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-label-md text-sm flex items-center justify-between shadow-sm animate-fade-in max-w-7xl mx-auto">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg('')} className="text-teal-800 hover:opacity-75">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
      {/* Header Section */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
<div className="flex flex-col gap-space-2xs">
<div className="inline-flex items-center gap-2">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
</span>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Doctor Clinical Ingress / Patient Identification
          </span>
<span className="text-outline-variant text-[12px] font-mono">:: BAY-OPTIC-09</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
          Scan Patient QR
        </h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Scan a patient's ABHA QR health token or NFC wristband to instantly trigger trauma triage telemetrics and retrieve protected clinical summaries.
        </p>
</div>
{/* Action pill */}
<div className="flex items-center gap-space-sm self-start md:self-auto">
<button className="inline-flex items-center gap-2 px-space-md h-10 rounded-lg bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container-low transition-colors cursor-pointer" id="manual-focus-btn" onClick={handleManualFocus} type="button">
<span className="material-symbols-outlined text-[18px]">keyboard</span>
<span className="font-label-lg text-label-lg">Enter Health ID manually</span>
</button>
</div>
</div>
{/* Scanner Core Stage (Dominant Visual Element) */}
<div className="relative w-full max-w-3xl mx-auto">
{/* Ambient Glow Decorator */}
<div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-secondary/15 via-primary/10 to-tertiary/15 blur-xl pointer-events-none -z-10"></div>
<div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-10 shadow-xl flex flex-col items-center text-center">
{/* Scanner Top Banner */}
<div className="w-full flex flex-col sm:flex-row items-center justify-between gap-space-xs pb-space-md mb-space-md">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">lens_blur</span>
</div>
<div className="text-left">
<span className="font-headline-sm text-headline-sm text-primary font-semibold block leading-tight">
                High-Speed Optical &amp; NFC Telemetry Scanner
              </span>
<span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                Hardware Node: GREAMS-TRAUMA-BAY-3
              </span>
</div>
</div>
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold tracking-wide">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
<span className="">Ready for Ingress • 60 FPS Optical</span>
</div>
</div>
{/* Viewfinder Viewport */}
<div className="relative w-full max-w-[420px] aspect-[4/3] bg-surface-container-highest/60 rounded-xl flex items-center justify-center overflow-hidden group shadow-inner">
{isCameraActive && (
  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    className="absolute inset-0 w-full h-full object-cover z-0"
  />
)}
{/* Background Grid Simulation */}
<div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00354c_1px,transparent_1px)] [background-size:16px_16px]"></div>
{/* Tactical Reticle Brackets (4 corners) */}
<div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-secondary rounded-tl-sm pointer-events-none"></div>
<div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-secondary rounded-tr-sm pointer-events-none"></div>
<div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-secondary rounded-bl-sm pointer-events-none"></div>
<div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-secondary rounded-br-sm pointer-events-none"></div>
{/* Crosshairs Reticle Center Overlay */}
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
<div className="w-48 h-48 rounded-lg border border-dashed border-secondary/40 flex items-center justify-center">
<div className="w-2 h-2 rounded-full bg-secondary"></div>
</div>
</div>
{/* Pulsing Laser Scan Line */}
<div className="absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent shadow-[0_0_12px_#006876] animate-[scan_2.8s_ease-in-out_infinite] pointer-events-none"></div>

{/* Central Scanner Trigger UI */}
<div className="relative z-10 flex flex-col items-center gap-3">
<div className="relative flex items-center justify-center">
<span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-primary/20"></span>
<div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
</div>
</div>
<div className="flex flex-col items-center">
<span className="font-label-lg text-label-lg text-primary font-semibold">Position ABHA QR within frame</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Macro autoFocus distance: 15–30 cm</span>
</div>
</div>
{/* Live Frame Rate & Stream Metadata Tag in Viewfinder */}
<div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-mono text-[10px] flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
<span className="">RAW 1080P // RGB 24bpp</span>
</div>
<div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-mono text-[10px]">
<span className="">LATENCY 14ms</span>
</div>
</div>
{/* Ingress Controls */}
<div className="mt-space-lg flex flex-wrap items-center justify-center gap-space-sm w-full">
<button onClick={handleToggleCamera} className="inline-flex items-center justify-center gap-2 px-space-lg h-11 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-medium shadow-md hover:bg-primary-container transition-all cursor-pointer" id="open-cam-btn" type="button">
<span className="material-symbols-outlined text-[20px]">videocam</span>
<span className="">{isCameraActive ? 'Active 60 FPS Camera Feed (Click to Stop)' : 'Tap to Open Optical Camera'}</span>
</button>
<button onClick={handlePairBluetooth} className="inline-flex items-center justify-center gap-2 px-space-md h-11 rounded-lg bg-surface-container text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high transition-colors cursor-pointer" type="button">
<span className="material-symbols-outlined text-[20px]">bluetooth_searching</span>
<span className="">Pair Bluetooth Handheld</span>
</button>
<button className="inline-flex items-center justify-center gap-1.5 px-space-md h-11 rounded-lg bg-secondary-container text-on-secondary-fixed-variant font-label-lg text-label-lg font-semibold hover:bg-secondary-fixed transition-all" id="simulate-scan-btn" onClick={handleScan}>
<span className="material-symbols-outlined text-[18px]">bolt</span>
<span className="">Simulate ER Bay Scan (Rajesh V.)</span>
</button>
</div>
{/* Hardware & Security Encryption Badges */}
<div className="mt-space-lg pt-space-md w-full flex flex-wrap items-center justify-center gap-2 text-on-surface-variant">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-low font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
<span className="">256-Bit Decryption Active</span>
</span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-low font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px] text-secondary">contactless</span>
<span className="">NFC Direct Touch Ready</span>
</span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-low font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px] text-secondary">center_focus_strong</span>
<span className="">Auto-Macro Focus Active</span>
</span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-low font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
<span className="">ABHA M1/M2 Certified</span>
</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md">
          Instantly pulls verified allergy status, blood type, chronic conditions, and prescription history upon scan.
        </p>
</div>
</div>
{/* Manual Entry Fallback Deck */}
<div className="w-full max-w-3xl mx-auto bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md" id="manual-entry-section">
<div className="flex items-center gap-space-sm w-full md:w-auto">
<div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[20px]">badge</span>
</div>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg font-semibold text-primary">Manual ABHA / Aadhaar Triage Ingress</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Enter 14-digit ABHA ID or mobile-linked virtual ID</span>
</div>
</div>
<div className="flex items-center gap-2 w-full md:w-auto flex-1 md:max-w-md">
<div className="relative flex-1">
<input value={manualAbha} onChange={(e) => setManualAbha(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleScan()} className="w-full h-10 px-space-sm bg-surface-container-lowest rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary shadow-sm uppercase tracking-wider font-mono text-[13px]" id="abha-input" placeholder="e.g. 9824-8819-3320-TN" type="text" />
</div>
<button className="h-10 px-space-md rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-medium hover:bg-primary-container transition-colors whitespace-nowrap shadow-sm" id="lookup-btn" onClick={handleScan}>
          Lookup Record
        </button>
</div>
</div>
{/* Scanned Patient Feedback Modal / Live Result Drawer (Interactive simulation state) */}
<div className={`w-full max-w-3xl mx-auto bg-surface-container-lowest rounded-xl p-space-md shadow-lg transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${scanResult ? 'block' : 'hidden'}`} id="scan-feedback-banner">
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold font-headline-sm text-headline-sm">
            RS
          </div>
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-primary font-bold">Rajesh V. Sharma</span>
<span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono">ABHA: 9824-8819-3320-TN</span>
</div>
<div className="flex items-center gap-3 text-on-surface-variant font-body-sm text-body-sm">
<span className="">52 Y / Male</span>
<span className="">•</span>
<span className="font-semibold text-primary">Blood: O+ Rh Pos</span>
<span className="">•</span>
<span className="text-secondary font-medium">Just scanned via Bay 3 Optical</span>
</div>
</div>
</div>
<div className="flex items-center gap-2 self-end sm:self-center">
{/* Critical Allergy Flag with Strict Zero Red Exception */}
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-error-container text-on-error-container font-label-sm text-label-sm font-bold shadow-sm">
<span className="material-symbols-outlined text-[16px]">warning</span>
<span className="">Severe Allergy: Penicillin</span>
</div>
<Link to="/doctor/patient-history" className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-medium hover:bg-primary-container transition-all">
            Access Full Chart →
          </Link>
</div>
</div>
</div>
{/* Recently Scanned Patients (Today's Intake) */}
<div className="w-full flex flex-col gap-space-md mt-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<h2 className="font-headline-sm text-headline-sm text-primary font-bold">
            Recently Scanned Patients (Today's Trauma Intake)
          </h2>
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant font-semibold">
            3 Ingress Records Active
          </span>
</div>
<div className="flex items-center gap-space-sm">
<button onClick={handleExportLog} className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">file_download</span>
<span className="">Export Log</span>
</button>
<button onClick={() => showToast('Filtered by active trauma ingress sessions.')} className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
<span className="">Filter</span>
</button>
</div>
</div>
{/* Patients Data Table Card */}
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
<th className="py-3 px-space-md font-semibold">Patient Name &amp; ABHA</th>
<th className="py-3 px-space-md font-semibold">Blood Group</th>
<th className="py-3 px-space-md font-semibold">Scanned Channel</th>
<th className="py-3 px-space-md font-semibold">Clinical Priority / Allergy Flag</th>
<th className="py-3 px-space-md font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0 text-on-surface font-body-md text-body-md">
{/* Row 1: Rajesh V. Sharma (Contains the ONLY permitted red alert badge on page) */}
<tr className="hover:bg-surface-container-low/70 transition-colors">
<td className="py-4 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                      RS
                    </div>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">Rajesh V. Sharma</span>
<span className="font-body-sm text-body-sm text-on-surface-variant font-mono">9824-8819-3320-TN</span>
</div>
</div>
</td>
<td className="py-4 px-space-md">
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container font-label-md text-label-md font-semibold text-primary">
                    O+ Rh Pos
                  </span>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-body-sm text-body-sm text-on-surface font-medium">Bay 3 Optical Reticle</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">12m ago • Dr. Menon</span>
</div>
</td>
<td className="py-4 px-space-md">
{/* Permitted Red Exception: Critical Allergy Tag */}
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold tracking-tight">
<span className="material-symbols-outlined text-[14px]">error</span>
<span className="">Severe Allergy: Penicillin</span>
</span>
</td>
<td className="py-4 px-space-md text-right whitespace-nowrap">
<Link to="/doctor/patient-history" className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-medium hover:bg-primary-container transition-all">
<span className="">View Full Chart</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</td>
</tr>
{/* Row 2: Meenakshi Sundaram */}
<tr className="hover:bg-surface-container-low/70 transition-colors bg-surface-bright">
<td className="py-4 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-full bg-secondary-fixed-dim text-on-secondary-fixed flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                      MS
                    </div>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">Meenakshi Sundaram</span>
<span className="font-body-sm text-body-sm text-on-surface-variant font-mono">7712-4401-2918-TN</span>
</div>
</div>
</td>
<td className="py-4 px-space-md">
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container font-label-md text-label-md font-semibold text-primary">
                    B+ Rh Pos
                  </span>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-body-sm text-body-sm text-on-surface font-medium">ER Wristband NFC</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">45m ago • Nurse Triage</span>
</div>
</td>
<td className="py-4 px-space-md">
{/* Soft Lavender/Periwinkle Tag */}
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E4E4FB] text-[#2c2e68] font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">water_drop</span>
<span className="">Diabetic Protocol • Type II DM</span>
</span>
</td>
<td className="py-4 px-space-md text-right whitespace-nowrap">
<Link to="/doctor/patient-history" className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-medium hover:bg-primary-container transition-all">
<span className="">View Full Chart</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</td>
</tr>
{/* Row 3: Anand R. Patel */}
<tr className="hover:bg-surface-container-low/70 transition-colors">
<td className="py-4 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                      AP
                    </div>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">Anand R. Patel</span>
<span className="font-body-sm text-body-sm text-on-surface-variant font-mono">8821-0034-7741-TN</span>
</div>
</div>
</td>
<td className="py-4 px-space-md">
<span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container font-label-md text-label-md font-semibold text-primary">
                    A+ Rh Pos
                  </span>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-body-sm text-body-sm text-on-surface font-medium">Kiosk Ingress Scanner</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">1h 15m ago • Self Check-in</span>
</div>
</td>
<td className="py-4 px-space-md">
{/* Emerald / Active Protocol Tag */}
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">monitor_heart</span>
<span className="">Cardiac Stent Routine</span>
</span>
</td>
<td className="py-4 px-space-md text-right whitespace-nowrap">
<Link to="/doctor/patient-history" className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-medium hover:bg-primary-container transition-all">
<span className="">View Full Chart</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Footer / Telemetry Sync Banner */}
<div className="bg-surface-container-low px-space-md py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant font-body-sm text-body-sm">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">cloud_done</span>
<span className="">ABDM Telemetry Gateway Node #09: Synced with National Health Authority at 100% integrity</span>
</div>
<div className="flex items-center gap-4 font-mono text-[11px]">
<span className="">TOTAL TODAY: 38 SCANS</span>
<span className="">•</span>
<span className="">0 MISREADS</span>
</div>
</div>
</div>
</div>
</div>
</div>

    </div>
  );
}
