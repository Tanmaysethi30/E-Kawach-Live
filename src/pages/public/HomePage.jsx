import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeTelemetry } from '../../context/TelemetryContext';
import LogoImg from '../../assets/images/Logo.jpg';
import BackgroundImg from '../../assets/images/Background.jpg';

export default function HomePage() {
  const navigate = useNavigate();
  const { login, register, signInWithGoogle, firebaseUser } = useAuth();
  const telemetry = useRealtimeTelemetry();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const dest = await signInWithGoogle(activeRole);
      navigate(dest);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Auth Card State
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
  const [activeRole, setActiveRole] = useState('patient'); // 'patient' | 'doctor' | 'hospital'
  const [regError, setRegError] = useState('');

  // Patient Registration Form
  const [patientReg, setPatientReg] = useState({
    name: '',
    phone: '',
    aadhaar: '',
    dob: '',
    emergencyContactName: '',
    emergencyContactRelation: 'Parent',
    emergencyContactPhone: '',
    password: '',
    confirmPassword: '',
    otp: '482910',
  });

  // Doctor Registration Form
  const [doctorReg, setDoctorReg] = useState({
    name: '',
    phone: '',
    email: '',
    licenseId: '',
    password: '',
    confirmPassword: '',
    otp: '482910',
  });

  // Hospital Registration Form
  const [hospitalReg, setHospitalReg] = useState({
    name: '',
    regId: '',
    clinicalId: '',
    contact: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '482910',
  });

  // Login Form
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: '',
    remember: true,
  });

  // Password Matching Validation Helpers
  const isPatientPassMatching = patientReg.password.length >= 6 && patientReg.password === patientReg.confirmPassword;
  const isDoctorPassMatching = doctorReg.password.length >= 6 && doctorReg.password === doctorReg.confirmPassword;
  const isHospitalPassMatching = hospitalReg.password.length >= 6 && hospitalReg.password === hospitalReg.confirmPassword;

  // OTP Unlocked state
  const isPatientOtpUnlocked = patientReg.aadhaar.trim().length >= 4;
  const isDoctorOtpUnlocked = doctorReg.licenseId.trim().length >= 3;
  const isHospitalOtpUnlocked = hospitalReg.regId.trim().length >= 3;

  // OTP resend timer
  const [timerSeconds, setTimerSeconds] = useState(27);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (timerSeconds > 0) {
      const interval = setInterval(() => setTimerSeconds((s) => s - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timerSeconds]);

  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setRegError('');
    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        const dest = await login(activeRole, {
          identifier: (loginForm.identifier || '').trim(),
          password: loginForm.password || 'password123',
        });
        navigate(dest);
      } else {
        let details = {};
        if (activeRole === 'patient') {
          const cleanPhone = (patientReg.phone || '').replace(/\D/g, '');
          if (cleanPhone.length !== 10) {
            setRegError('Please enter a valid 10-digit primary mobile number for patient registration.');
            return;
          }
          if (patientReg.emergencyContactPhone) {
            const cleanEmergencyPhone = patientReg.emergencyContactPhone.replace(/\D/g, '');
            if (cleanEmergencyPhone.length > 0 && cleanEmergencyPhone.length !== 10) {
              setRegError('Emergency contact number must be exactly 10 digits.');
              return;
            }
          }
          details = { ...patientReg, phone: cleanPhone };
        } else if (activeRole === 'doctor') {
          const cleanPhone = (doctorReg.phone || '').replace(/\D/g, '');
          if (cleanPhone.length !== 10) {
            setRegError('Please enter a valid 10-digit contact mobile number for doctor registration.');
            return;
          }
          details = { ...doctorReg, phone: cleanPhone };
        } else {
          const cleanPhone = (hospitalReg.contact || '').replace(/\D/g, '');
          if (cleanPhone.length !== 10) {
            setRegError('Please enter a valid 10-digit official contact number for hospital registration.');
            return;
          }
          details = { ...hospitalReg, contact: cleanPhone, phone: cleanPhone };
        }

        if (details.password || details.confirmPassword) {
          if (!details.password || details.password.length < 6) {
            setRegError('Password must be at least 6 characters long.');
            return;
          }
          if (details.password !== details.confirmPassword) {
            setRegError('Passwords do not match. Please re-enter.');
            return;
          }
        }

        const dest = await register(activeRole, details);
        navigate(dest);
      }
    } catch (err) {
      console.error('Registration/Login error:', err);
      if (err && err.message) {
        setRegError(err.message);
      } else {
        setRegError('Registration failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track whether user explicitly selected a role tab
  const [userSelectedRole, setUserSelectedRole] = useState(false);
  const userSelectedRoleRef = React.useRef(false);

  const scrollToRegisterCard = (targetRole) => {
    // Flip to 'register' mode
    setAuthMode('register');

    if (targetRole) {
      userSelectedRoleRef.current = true;
      setUserSelectedRole(true);
      setActiveRole(targetRole);
    } else if (!userSelectedRoleRef.current) {
      setActiveRole('patient');
    }

    // Smooth scroll specifically to the registration card
    const elem = document.getElementById('registration-card');
    if (elem) {
      const navOffset = 110;
      const top = elem.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      setTimeout(() => {
        const firstInput = elem.querySelector('input:not([disabled])');
        if (firstInput) {
          firstInput.focus({ preventScroll: true });
        }
      }, 400);
    }
  };

  const scrollToLoginCard = (targetRole) => {
    setAuthMode('login');

    if (targetRole) {
      userSelectedRoleRef.current = true;
      setUserSelectedRole(true);
      setActiveRole(targetRole);
    }

    const elem = document.getElementById('registration-card');
    if (elem) {
      const navOffset = 110;
      const top = elem.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      setTimeout(() => {
        const firstInput = elem.querySelector('#login-id') || elem.querySelector('input:not([disabled])');
        if (firstInput) {
          firstInput.focus({ preventScroll: true });
        }
      }, 400);
    }
  };

  useEffect(() => {
    const handleRegisterScrollEvent = () => {
      scrollToRegisterCard();
    };

    const handleLoginScrollEvent = () => {
      scrollToLoginCard();
    };

    window.addEventListener('ekawach:scroll-to-register', handleRegisterScrollEvent);
    window.addEventListener('ekavach:scroll-to-register', handleRegisterScrollEvent);
    window.addEventListener('ekawach:scroll-to-login', handleLoginScrollEvent);
    window.addEventListener('ekavach:scroll-to-login', handleLoginScrollEvent);

    if (window.location.hash === '#registration-card') {
      setTimeout(scrollToRegisterCard, 150);
    }

    const handleHashChange = () => {
      if (window.location.hash === '#registration-card') {
        scrollToRegisterCard();
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('ekawach:scroll-to-register', handleRegisterScrollEvent);
      window.removeEventListener('ekavach:scroll-to-register', handleRegisterScrollEvent);
      window.removeEventListener('ekawach:scroll-to-login', handleLoginScrollEvent);
      window.removeEventListener('ekavach:scroll-to-login', handleLoginScrollEvent);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const getEyebrowText = () => {
    if (activeRole === 'patient') return 'PATIENT ACCESS NODE';
    if (activeRole === 'doctor') return 'CLINICAL ACCESS NODE';
    return 'ADMINISTRATIVE NODE';
  };

  return (
    <div className="flex flex-col w-full font-body-md text-on-surface">
      {/* HERO SECTION - LIGHTENED BACKGROUND FOR FULL TEXT LEGIBILITY */}
      <section id="hero" className="relative w-full overflow-hidden px-grid-margin py-space-xl pb-14 lg:py-space-2xl lg:pb-18 bg-white">
        {/* Lightened Background Image Layer */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-no-repeat bg-contain sm:bg-cover bg-left sm:bg-center opacity-25"
            style={{ backgroundImage: `url(${BackgroundImg})` }}
          />
          {/* Light wash overlay ensuring maximum text contrast and legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to right, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.20) 50%, transparent 80%)`
            }}
          />
        </div>

        {/* Subtle Ambient Background Gradients */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-20 h-96 w-96 rounded-full bg-primary-fixed/20 blur-3xl z-10"></div>
        <div aria-hidden="true" className="pointer-events-none absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-secondary-fixed/15 blur-3xl z-10"></div>

        <div className="mx-auto max-w-7xl relative z-20">
          <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12 lg:gap-grid-gutter">
            
            {/* Left Column: Copy & CTAs */}
            <div className="flex flex-col gap-space-md lg:col-span-6 lg:pr-space-md pt-4">
              <div className="inline-flex items-center gap-space-xs self-start rounded-full bg-surface-container-high px-space-sm py-1 shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-label-sm text-label-sm font-semibold tracking-wide text-on-surface-variant uppercase">
                  Mission-Critical Care Infrastructure
                </span>
              </div>

              <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">
                Your medical history, <span className="text-secondary">ready before you are.</span>
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                A scannable Digital Health ID that gives doctors instant access to critical medical history the moment a patient arrives — no forms, no waiting.
              </p>

              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <a
                  href="#registration-card"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToRegisterCard('patient');
                    window.history.pushState(null, '', '#registration-card');
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-space-xl py-space-sm font-label-lg text-label-lg text-on-primary shadow-sm hover:bg-primary-container transition-all no-underline"
                >
                  <span className="material-symbols-outlined mr-2 text-[20px]">badge</span>
                  Create Your Health ID
                </a>

                <a
                  href="#continuum-care"
                  className="inline-flex items-center justify-center rounded-lg bg-surface-container px-space-lg py-space-sm font-label-lg text-label-lg text-primary hover:bg-surface-container-high transition-all no-underline"
                >
                  <span className="material-symbols-outlined mr-2 text-[20px]">corporate_fare</span>
                  For Hospitals &amp; Doctors
                </a>
              </div>

              {/* Mini trust metric below CTAs */}
              <div className="flex items-center gap-space-md pt-space-xs text-on-surface-variant flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                  <span className="font-label-sm text-label-sm">Instant Golden Hour Triaging</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Auth Card (Register / Sign In) */}
            <div className="relative lg:col-span-6 flex justify-center lg:justify-end">
              <div id="registration-card" className="relative w-full max-w-lg scroll-mt-28">
                {/* Main Auth Container Card */}
                <div className="relative rounded-2xl bg-surface-container-lowest p-5 sm:p-space-lg shadow-xl ring-1 ring-outline-variant/30">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-space-md border-b border-surface-container">
                    <div className="flex items-center gap-space-sm">
                      <img src={LogoImg} alt="E-KAVACH Logo" className="h-10 w-auto object-contain rounded-lg" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                            {getEyebrowText()}
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                          {authMode === 'register' ? 'Register for E-KAVACH' : 'Sign In to E-KAVACH'}
                        </h3>
                      </div>
                    </div>
                    <span className="rounded-md bg-secondary-fixed/20 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span>256-BIT SSL
                    </span>
                  </div>

                  {/* Mode Switcher: Register vs Sign In */}
                  <div className="mt-3 flex items-center justify-between bg-surface-container-high/40 p-1 rounded-lg text-xs font-semibold gap-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                        authMode === 'register'
                          ? 'bg-white text-primary shadow-xs font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      New Registration
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                        authMode === 'login'
                          ? 'bg-white text-primary shadow-xs font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Sign In
                    </button>
                  </div>

                  {/* Role Tab Switcher */}
                  <div className="mt-space-sm p-1 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-center gap-1 text-label-md">
                    <button
                      type="button"
                      onClick={() => {
                        setUserSelectedRole(true);
                        userSelectedRoleRef.current = true;
                        setActiveRole('patient');
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all duration-200 text-xs sm:text-sm ${
                        activeRole === 'patient'
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface font-medium'
                      }`}
                    >
                      For Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserSelectedRole(true);
                        userSelectedRoleRef.current = true;
                        setActiveRole('doctor');
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all duration-200 text-xs sm:text-sm ${
                        activeRole === 'doctor'
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface font-medium'
                      }`}
                    >
                      For Doctor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserSelectedRole(true);
                        userSelectedRoleRef.current = true;
                        setActiveRole('hospital');
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all duration-200 text-xs sm:text-sm ${
                        activeRole === 'hospital'
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface font-medium'
                      }`}
                    >
                      For Hospital
                    </button>
                  </div>

                  {/* FORM VIEWPORT */}
                  <div className="relative w-full overflow-hidden mt-1">
                    {authMode === 'register' ? (
                      /* ===================== REGISTRATION FORMS ===================== */
                      <div>
                        {activeRole === 'patient' && (
                          <form className="flex flex-col gap-3 py-space-sm" onSubmit={handleAuthSubmit}>
                            {regError && (
                              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                                <span>{regError}</span>
                              </div>
                            )}

                            <div className="flex flex-col gap-1">
                              <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="patient-reg-name">
                                Name on Aadhaar
                              </label>
                              <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">person</span>
                                <input
                                  id="patient-reg-name"
                                  type="text"
                                  value={patientReg.name}
                                  onChange={(e) => setPatientReg({ ...patientReg, name: e.target.value })}
                                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                  placeholder="e.g. Rajesh V. Sharma"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="patient-reg-phone">
                                  Primary Phone Number
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">call</span>
                                  <span className="absolute left-8 font-label-md text-xs text-on-surface-variant font-semibold pl-1">+91</span>
                                  <input
                                    id="patient-reg-phone"
                                    type="tel"
                                    value={patientReg.phone}
                                    onChange={(e) => setPatientReg({ ...patientReg, phone: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-[4.5rem] pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="98401 22819"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="patient-reg-aadhaar">
                                    Aadhaar Card Number
                                  </label>
                                  <span className="font-label-sm text-label-sm text-secondary font-medium flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[14px]">verified</span>ABHA Sync
                                  </span>
                                </div>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">badge</span>
                                  <input
                                    id="patient-reg-aadhaar"
                                    type="text"
                                    value={patientReg.aadhaar}
                                    onChange={(e) => setPatientReg({ ...patientReg, aadhaar: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all font-mono"
                                    placeholder="9824-8819-3320"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="patient-reg-dob">
                                Date of Birth (as per Aadhaar)
                              </label>
                              <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">calendar_today</span>
                                <input
                                  id="patient-reg-dob"
                                  type="date"
                                  value={patientReg.dob}
                                  onChange={(e) => setPatientReg({ ...patientReg, dob: e.target.value })}
                                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                  required
                                />
                              </div>
                            </div>

                            {/* Password Setup */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="patient-reg-pass">
                                  Create Password
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">lock</span>
                                  <input
                                    id="patient-reg-pass"
                                    type="password"
                                    value={patientReg.password}
                                    onChange={(e) => setPatientReg({ ...patientReg, password: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="•••••••• (Min 6 chars)"
                                    minLength={6}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="patient-reg-confirm-pass">
                                  Confirm Password
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">verified</span>
                                  <input
                                    id="patient-reg-confirm-pass"
                                    type="password"
                                    value={patientReg.confirmPassword}
                                    onChange={(e) => setPatientReg({ ...patientReg, confirmPassword: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="Re-enter password"
                                    minLength={6}
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Live Password Match Validation Banner */}
                            {patientReg.password || patientReg.confirmPassword ? (
                              patientReg.password !== patientReg.confirmPassword ? (
                                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">cancel</span>
                                  Passwords do not match. You cannot create account until passwords match.
                                </p>
                              ) : patientReg.password.length < 6 ? (
                                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">warning</span>
                                  Password must be at least 6 characters long.
                                </p>
                              ) : (
                                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                                  Passwords match! Ready to create account.
                                </p>
                              )
                            ) : null}

                            {/* OTP Unlock Section */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="patient-reg-otp">
                                    One-Time Password (OTP)
                                  </label>
                                  {isPatientOtpUnlocked && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                      Unlocked
                                    </span>
                                  )}
                                </div>
                                <span
                                  onClick={() => setTimerSeconds(30)}
                                  className="font-label-sm text-label-sm text-on-surface-variant font-medium cursor-pointer hover:text-secondary transition-colors"
                                >
                                  Resend OTP (00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds})
                                </span>
                              </div>
                              <div className="relative flex items-center">
                                <span className={`material-symbols-outlined absolute left-3 text-[18px] pointer-events-none ${isPatientOtpUnlocked ? 'text-secondary' : 'text-on-surface-variant'}`}>
                                  {isPatientOtpUnlocked ? 'lock_open' : 'lock'}
                                </span>
                                <input
                                  id="patient-reg-otp"
                                  type="text"
                                  value={patientReg.otp}
                                  onChange={(e) => setPatientReg({ ...patientReg, otp: e.target.value })}
                                  disabled={!isPatientOtpUnlocked}
                                  className={`w-full rounded-lg border py-2 pl-9 pr-space-sm font-body-md text-sm transition-all ${
                                    isPatientOtpUnlocked
                                      ? 'border-outline-variant bg-surface-container-low text-on-surface focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest'
                                      : 'border-outline-variant/60 bg-surface-container-high/40 text-on-surface/50 cursor-not-allowed'
                                  }`}
                                  placeholder="Enter 6-digit OTP received on mobile"
                                />
                              </div>
                              <p className={`font-body-sm text-xs flex items-center gap-1 pt-0.5 ${isPatientOtpUnlocked ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
                                <span className="material-symbols-outlined text-[14px]">
                                  {isPatientOtpUnlocked ? 'check_circle' : 'info'}
                                </span>
                                {isPatientOtpUnlocked ? 'OTP sent to mobile linked with Aadhaar' : 'Complete Aadhaar field above to unlock OTP'}
                              </p>
                            </div>

                            <button
                              type="submit"
                              disabled={!isPatientPassMatching}
                              className={`mt-2 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-space-lg font-label-lg text-label-lg font-semibold transition-all ${
                                isPatientPassMatching
                                  ? 'bg-primary text-on-primary shadow-sm hover:bg-primary-container cursor-pointer'
                                  : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <span>Create Patient Account</span>
                              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                          </form>
                        )}

                        {activeRole === 'doctor' && (
                          <form className="flex flex-col gap-3 py-space-sm" onSubmit={handleAuthSubmit}>
                            <div className="flex items-center justify-between bg-primary-container/20 p-2 rounded-lg border border-primary/20">
                              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                                New Clinical Registration Node
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const randomId = Math.floor(10000 + Math.random() * 90000);
                                  setDoctorReg({
                                    name: 'Dr. Sameer R. Verma',
                                    phone: '98401 98765',
                                    email: `dr.sameer_${randomId}@apollo.org`,
                                    licenseId: `NMC-${randomId}-TN`,
                                    password: 'Password@123',
                                    confirmPassword: 'Password@123',
                                    otp: '883921',
                                  });
                                }}
                                className="text-[11px] font-bold text-secondary hover:text-primary transition-colors bg-white px-2 py-1 rounded border border-secondary/30 shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                                Fill Sample Doctor Data
                              </button>
                            </div>

                            {regError && (
                              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                                <span>{regError}</span>
                              </div>
                            )}

                            <div className="flex flex-col gap-1">
                              <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="doctor-reg-name">
                                Doctor Name
                              </label>
                              <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">person</span>
                                <input
                                  id="doctor-reg-name"
                                  type="text"
                                  value={doctorReg.name}
                                  onChange={(e) => setDoctorReg({ ...doctorReg, name: e.target.value })}
                                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                  placeholder="e.g. Dr. Kavitha Menon"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="doctor-reg-phone">
                                  Phone Number
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">call</span>
                                  <span className="absolute left-8 font-label-md text-xs text-on-surface-variant font-semibold pl-1">+91</span>
                                  <input
                                    id="doctor-reg-phone"
                                    type="tel"
                                    value={doctorReg.phone}
                                    onChange={(e) => setDoctorReg({ ...doctorReg, phone: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-[4.5rem] pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="98401 22819"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="doctor-reg-email">
                                  Email
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">mail</span>
                                  <input
                                    id="doctor-reg-email"
                                    type="email"
                                    value={doctorReg.email}
                                    onChange={(e) => setDoctorReg({ ...doctorReg, email: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="kavitha.menon@apollo.org"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="doctor-license-id">
                                  Doctor License ID Number
                                </label>
                                <span className="font-label-sm text-label-sm text-on-surface-variant">NMC / State Council</span>
                              </div>
                              <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">badge</span>
                                <input
                                  id="doctor-license-id"
                                  type="text"
                                  value={doctorReg.licenseId}
                                  onChange={(e) => setDoctorReg({ ...doctorReg, licenseId: e.target.value })}
                                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                  placeholder="e.g. NMC-44912-TN"
                                  required
                                />
                              </div>
                            </div>

                            {/* Password Setup */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="doctor-reg-pass">
                                  Create Password
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">lock</span>
                                  <input
                                    id="doctor-reg-pass"
                                    type="password"
                                    value={doctorReg.password}
                                    onChange={(e) => setDoctorReg({ ...doctorReg, password: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="•••••••• (Min 6 chars)"
                                    minLength={6}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="doctor-reg-confirm-pass">
                                  Confirm Password
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">verified</span>
                                  <input
                                    id="doctor-reg-confirm-pass"
                                    type="password"
                                    value={doctorReg.confirmPassword}
                                    onChange={(e) => setDoctorReg({ ...doctorReg, confirmPassword: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="Re-enter password"
                                    minLength={6}
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Live Password Match Validation Banner */}
                            {doctorReg.password || doctorReg.confirmPassword ? (
                              doctorReg.password !== doctorReg.confirmPassword ? (
                                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">cancel</span>
                                  Passwords do not match. You cannot create account until passwords match.
                                </p>
                              ) : doctorReg.password.length < 6 ? (
                                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">warning</span>
                                  Password must be at least 6 characters long.
                                </p>
                              ) : (
                                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                                  Passwords match! Ready to create account.
                                </p>
                              )
                            ) : null}

                            {/* OTP Unlock Section */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="doctor-reg-otp">
                                    Clinical OTP
                                  </label>
                                  {isDoctorOtpUnlocked && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                      Unlocked
                                    </span>
                                  )}
                                </div>
                                <span
                                  onClick={() => setTimerSeconds(30)}
                                  className="font-label-sm text-label-sm text-on-surface-variant font-medium cursor-pointer hover:text-secondary transition-colors"
                                >
                                  Resend OTP (00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds})
                                </span>
                              </div>
                              <div className="relative flex items-center">
                                <span className={`material-symbols-outlined absolute left-3 text-[18px] pointer-events-none ${isDoctorOtpUnlocked ? 'text-secondary' : 'text-on-surface-variant'}`}>
                                  {isDoctorOtpUnlocked ? 'lock_open' : 'lock'}
                                </span>
                                <input
                                  id="doctor-reg-otp"
                                  type="text"
                                  value={doctorReg.otp}
                                  onChange={(e) => setDoctorReg({ ...doctorReg, otp: e.target.value })}
                                  disabled={!isDoctorOtpUnlocked}
                                  className={`w-full rounded-lg border py-2 pl-9 pr-space-sm font-body-md text-sm transition-all ${
                                    isDoctorOtpUnlocked
                                      ? 'border-outline-variant bg-surface-container-low text-on-surface focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest'
                                      : 'border-outline-variant/60 bg-surface-container-high/40 text-on-surface/50 cursor-not-allowed'
                                  }`}
                                  placeholder="Enter OTP sent to registered registry"
                                />
                              </div>
                              <p className={`font-body-sm text-xs flex items-center gap-1 pt-0.5 ${isDoctorOtpUnlocked ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
                                <span className="material-symbols-outlined text-[14px]">
                                  {isDoctorOtpUnlocked ? 'check_circle' : 'info'}
                                </span>
                                {isDoctorOtpUnlocked ? 'OTP sent to state clinical registry contact' : 'Enter Doctor License ID to unlock OTP'}
                              </p>
                            </div>

                            <button
                              type="submit"
                              disabled={!isDoctorPassMatching}
                              className={`mt-2 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-space-lg font-label-lg text-label-lg font-semibold transition-all ${
                                isDoctorPassMatching
                                  ? 'bg-primary text-on-primary shadow-sm hover:bg-primary-container cursor-pointer'
                                  : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <span>Create Doctor Account</span>
                              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                          </form>
                        )}

                        {activeRole === 'hospital' && (
                          <form className="flex flex-col gap-3 py-space-sm" onSubmit={handleAuthSubmit}>
                            {regError && (
                              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                                <span>{regError}</span>
                              </div>
                            )}

                            <div className="flex flex-col gap-1">
                              <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="hospital-reg-name">
                                Hospital Name
                              </label>
                              <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">domain</span>
                                <input
                                  id="hospital-reg-name"
                                  type="text"
                                  value={hospitalReg.name}
                                  onChange={(e) => setHospitalReg({ ...hospitalReg, name: e.target.value })}
                                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                  placeholder="e.g. Apollo Greams Trauma Hub"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="hospital-reg-id">
                                  Registration ID
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">shield</span>
                                  <input
                                    id="hospital-reg-id"
                                    type="text"
                                    value={hospitalReg.regId}
                                    onChange={(e) => setHospitalReg({ ...hospitalReg, regId: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="e.g. HSP-REG-2210"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="hospital-reg-clinical-id">
                                  Clinical ID
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">badge</span>
                                  <input
                                    id="hospital-reg-clinical-id"
                                    type="text"
                                    value={hospitalReg.clinicalId}
                                    onChange={(e) => setHospitalReg({ ...hospitalReg, clinicalId: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="e.g. IND-TN-APO-09"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="hospital-reg-contact">
                                  Official Contact (10 Digits)
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">call</span>
                                  <span className="absolute left-8 font-label-md text-xs text-on-surface-variant font-semibold pl-1">+91</span>
                                  <input
                                    id="hospital-reg-contact"
                                    type="tel"
                                    value={hospitalReg.contact}
                                    onChange={(e) => setHospitalReg({ ...hospitalReg, contact: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-[4.5rem] pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="98401 22819"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="hospital-reg-email">
                                  Admin Email
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">mail</span>
                                  <input
                                    id="hospital-reg-email"
                                    type="email"
                                    value={hospitalReg.email}
                                    onChange={(e) => setHospitalReg({ ...hospitalReg, email: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="admin.chennai@apollo.health"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Password Setup */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="hospital-reg-pass">
                                  Create Password
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">lock</span>
                                  <input
                                    id="hospital-reg-pass"
                                    type="password"
                                    value={hospitalReg.password}
                                    onChange={(e) => setHospitalReg({ ...hospitalReg, password: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="•••••••• (Min 6 chars)"
                                    minLength={6}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="hospital-reg-confirm-pass">
                                  Confirm Password
                                </label>
                                <div className="relative flex items-center">
                                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">verified</span>
                                  <input
                                    id="hospital-reg-confirm-pass"
                                    type="password"
                                    value={hospitalReg.confirmPassword}
                                    onChange={(e) => setHospitalReg({ ...hospitalReg, confirmPassword: e.target.value })}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-space-sm font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                                    placeholder="Re-enter password"
                                    minLength={6}
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Live Password Match Validation Banner */}
                            {hospitalReg.password || hospitalReg.confirmPassword ? (
                              hospitalReg.password !== hospitalReg.confirmPassword ? (
                                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">cancel</span>
                                  Passwords do not match. You cannot create account until passwords match.
                                </p>
                              ) : hospitalReg.password.length < 6 ? (
                                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">warning</span>
                                  Password must be at least 6 characters long.
                                </p>
                              ) : (
                                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                                  Passwords match! Ready to create account.
                                </p>
                              )
                            ) : null}

                            {/* OTP Unlock Section */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="hospital-reg-otp">
                                    Node Verification OTP
                                  </label>
                                  {isHospitalOtpUnlocked && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                      Unlocked
                                    </span>
                                  )}
                                </div>
                                <span
                                  onClick={() => setTimerSeconds(30)}
                                  className="font-label-sm text-label-sm text-on-surface-variant font-medium cursor-pointer hover:text-secondary transition-colors"
                                >
                                  Resend OTP (00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds})
                                </span>
                              </div>
                              <div className="relative flex items-center">
                                <span className={`material-symbols-outlined absolute left-3 text-[18px] pointer-events-none ${isHospitalOtpUnlocked ? 'text-secondary' : 'text-on-surface-variant'}`}>
                                  {isHospitalOtpUnlocked ? 'lock_open' : 'lock'}
                                </span>
                                <input
                                  id="hospital-reg-otp"
                                  type="text"
                                  value={hospitalReg.otp}
                                  onChange={(e) => setHospitalReg({ ...hospitalReg, otp: e.target.value })}
                                  disabled={!isHospitalOtpUnlocked}
                                  className={`w-full rounded-lg border py-2 pl-9 pr-space-sm font-body-md text-sm transition-all ${
                                    isHospitalOtpUnlocked
                                      ? 'border-outline-variant bg-surface-container-low text-on-surface focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest'
                                      : 'border-outline-variant/60 bg-surface-container-high/40 text-on-surface/50 cursor-not-allowed'
                                  }`}
                                  placeholder="Enter institutional OTP authorization"
                                />
                              </div>
                              <p className={`font-body-sm text-xs flex items-center gap-1 pt-0.5 ${isHospitalOtpUnlocked ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
                                <span className="material-symbols-outlined text-[14px]">
                                  {isHospitalOtpUnlocked ? 'check_circle' : 'info'}
                                </span>
                                {isHospitalOtpUnlocked ? 'OTP sent to registered hospital nodal officer' : 'Complete Registration ID above to unlock OTP'}
                              </p>
                            </div>

                            <button
                              type="submit"
                              disabled={!isHospitalPassMatching}
                              className={`mt-2 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-space-lg font-label-lg text-label-lg font-semibold transition-all ${
                                isHospitalPassMatching
                                  ? 'bg-primary text-on-primary shadow-sm hover:bg-primary-container cursor-pointer'
                                  : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <span>Create Hospital Account</span>
                              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      /* ===================== SIGN IN FORMS ===================== */
                      <form className="flex flex-col gap-space-md py-space-md" onSubmit={handleAuthSubmit}>
                        {regError && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                            <span>{regError}</span>
                          </div>
                        )}

                        {/* Demo Fast-fill toolbar */}
                        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <span className="material-symbols-outlined text-[15px] text-primary">bolt</span>
                              Instant Demo Login
                            </span>
                            <span>Pre-populates clinical credentials</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRole('patient');
                                setLoginForm({ identifier: 'rajesh.sharma@ekawach.health', password: 'password123', remember: true });
                                setRegError('');
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                                activeRole === 'patient' ? 'bg-teal-100 border-teal-300 text-teal-900 font-semibold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Patient (Rajesh Sharma)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRole('doctor');
                                setLoginForm({ identifier: 'dr.kavitha@apollo.health', password: 'password123', remember: true });
                                setRegError('');
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                                activeRole === 'doctor' ? 'bg-teal-100 border-teal-300 text-teal-900 font-semibold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Doctor (Dr. Kavitha)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRole('hospital');
                                setLoginForm({ identifier: 'admin.nambiar@apollo.health', password: 'password123', remember: true });
                                setRegError('');
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                                activeRole === 'hospital' ? 'bg-teal-100 border-teal-300 text-teal-900 font-semibold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Hospital (Dr. Nambiar)
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center justify-between" htmlFor="login-id">
                            <span>
                              {activeRole === 'patient'
                                ? 'Aadhaar Number / Health ID / Email'
                                : activeRole === 'doctor'
                                ? 'License Number / Clinical ID / Email'
                                : 'Clinical ID / Admin Number / Email'}
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                              {activeRole === 'patient' ? 'ABHA Linked' : activeRole === 'doctor' ? 'NMC Registered' : 'Hospital Supercluster'}
                            </span>
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-[20px] text-on-surface-variant pointer-events-none">
                              {activeRole === 'patient' ? 'badge' : activeRole === 'doctor' ? 'clinical_notes' : 'domain'}
                            </span>
                            <input
                              id="login-id"
                              type="text"
                              value={loginForm.identifier}
                              onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-space-sm font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                              placeholder={
                                activeRole === 'patient'
                                  ? 'e.g. 9824-8819-3320 or Aadhaar / Email'
                                  : activeRole === 'doctor'
                                  ? 'e.g. DOC-9082-IND or NMC-44912'
                                  : 'e.g. ADM-2210-HSP or Node ID'
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="login-password">
                              Password
                            </label>
                            <span className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors font-medium cursor-pointer">
                              Forgot?
                            </span>
                          </div>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-[20px] text-on-surface-variant pointer-events-none">key</span>
                            <input
                              id="login-password"
                              type="password"
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-space-sm font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                              placeholder="••••••••••••"
                            />
                          </div>
                        </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              id="remember-device"
                              type="checkbox"
                              checked={loginForm.remember}
                              onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-secondary cursor-pointer"
                            />
                            <label className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer select-none" htmlFor="remember-device">
                              Remember this workstation for 12 hours
                            </label>
                          </div>

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-space-lg font-label-lg text-label-lg font-semibold text-on-primary shadow-sm hover:bg-primary-container transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">login</span>
                            <span>Sign In to {activeRole === 'patient' ? 'Patient Portal' : activeRole === 'doctor' ? 'Doctor Console' : 'Admin Console'}</span>
                          </button>

                          <div className="flex items-center gap-2 my-1">
                            <div className="h-px bg-surface-container flex-1" />
                            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">or fast-track</span>
                            <div className="h-px bg-surface-container flex-1" />
                          </div>

                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                            className="inline-flex items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 py-2.5 px-space-lg font-label-lg text-label-lg font-semibold text-slate-800 shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                          >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                              />
                            </svg>
                            <span>{googleLoading ? 'Connecting...' : 'Continue with Google (ABDM Single Sign-On)'}</span>
                          </button>
                        </form>
                      )}
                  </div>

                  {/* Toggle Mode Footer */}
                  <div className="flex items-center justify-center pt-3 text-center border-t border-surface-container mt-2">
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      {authMode === 'register' ? (
                        <>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setAuthMode('login')}
                            className="font-semibold text-secondary hover:text-primary transition-colors inline-flex items-center gap-0.5 ml-1 cursor-pointer"
                          >
                            Sign In <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        </>
                      ) : (
                        <>
                          Don't have an ID?{' '}
                          <button
                            type="button"
                            onClick={() => setAuthMode('register')}
                            className="font-semibold text-secondary hover:text-primary transition-colors inline-flex items-center gap-0.5 ml-1 cursor-pointer"
                          >
                            Register for Access <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Shared Bottom Strip with Real-Time Telemetry */}
                  <div className="pt-2 mt-2 border-t border-surface-container flex items-center justify-between font-label-sm text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${telemetry.connected ? 'bg-emerald-500 animate-pulse' : 'bg-secondary'}`}></span>
                      <span className="font-semibold text-on-surface">
                        {telemetry.connected ? 'ABDM Real-Time Gateway' : 'ABDM Gateway Active'}
                      </span>
                    </span>
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-secondary">sensors</span>
                      Live Latency: {telemetry.latencyMs || 84}ms
                    </span>
                  </div>
                </div>

                {/* Floating Doctor Note Overlay */}
                <div className="hidden sm:flex absolute -bottom-6 -left-4 z-20 items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-sm shadow-lg ring-1 ring-outline-variant/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                    <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                  </div>
                  <div>
                    <p className="font-label-md text-xs font-semibold text-on-surface">Dr. Kavitha Menon, ER Lead</p>
                    <p className="font-body-sm text-xs text-on-surface-variant">"Zero lag on drug interactions before intubation."</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PROBLEM / CONTEXT STRIP & REAL-TIME BACKEND TELEMETRY BAR */}
      <section className="w-full bg-surface-container py-space-xl px-grid-margin">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-space-xs">
          <div className="flex items-center justify-center gap-2 text-secondary mb-space-2xs">
            <div className="h-px w-12 bg-secondary/40"></div>
            <svg className="h-6 w-20 text-secondary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 100 24">
              <polyline points="0,12 30,12 40,2 48,22 56,8 64,16 72,12 100,12"></polyline>
            </svg>
            <div className="h-px w-12 bg-secondary/40"></div>
          </div>
          <p className="font-headline-lg text-headline-lg font-semibold text-primary max-w-3xl leading-snug">
            Every year, critical minutes are lost collecting information paramedics could already have.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
            In high-acuity trauma cases, the "Golden Hour" often evaporates in paperwork. E-KAVACH eliminates the data void.
          </p>

          {/* Real-time backend telemetry grid status */}
          <div className="mt-space-md w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-left">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-primary">REAL-TIME TRAUMA GRID:</span>
              <span className="text-on-surface font-semibold">{telemetry.hospital || 'Apollo Greams Trauma Hub'}</span>
              <span className="text-on-surface-variant hidden md:inline">({telemetry.node || 'AP-HSP-842-TN'})</span>
            </div>
            <div className="flex flex-wrap items-center gap-3.5 text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">hotel</span>
                <span>ICU: <strong className="text-on-surface">{telemetry.icuTelemetry?.occupied || 46}/{telemetry.icuTelemetry?.total || 50}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">air</span>
                <span>O₂ Reserve: <strong className="text-on-surface">{telemetry.oxygenReserveHours || 96}h</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-error">emergency</span>
                <span>Code Red: <strong className="text-on-surface">{telemetry.triageStatus?.red || 1} Active</strong></span>
              </span>
              <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px] tracking-wider uppercase border border-emerald-200">
                {telemetry.networkStatus || 'SYNCHRONIZED'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US / HOW IT WORKS */}
      <section id="about-us" className="w-full py-space-2xl px-grid-margin bg-surface scroll-mt-24 relative">
        <div id="how-it-works" className="absolute -top-24 left-0 pointer-events-none"></div>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center mb-space-2xl">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider text-secondary uppercase mb-space-2xs">
              Process Architecture
            </span>
            <h2 className="font-headline-xl text-headline-xl font-bold text-primary">How It Works</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-xs">
              Built for zero-friction adoption by citizens and millisecond-level retrieval by trauma staff.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-grid-gutter">
            {/* Step 1 */}
            <div className="group relative flex flex-col rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-headline-md text-headline-md font-bold text-primary-container">01</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                  <span className="material-symbols-outlined text-[26px]">assignment_turned_in</span>
                </div>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">
                Pre-register your health profile
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Store allergies, blood type, conditions, and emergency contacts securely in under 2 minutes with simple biometric verification.
              </p>
              <div className="mt-space-lg pt-space-sm border-t border-surface-container flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-secondary text-[16px]">lock_clock</span>
                <span>Takes &lt; 120 seconds</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative flex flex-col rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-headline-md text-headline-md font-bold text-primary-container">02</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                  <span className="material-symbols-outlined text-[26px]">qr_code_scanner</span>
                </div>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">
                Get your scannable QR/NFC ID
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Access via smartphone lock screen, physical card, or wearable band. Always ready, even if the device is uncharged or offline.
              </p>
              <div className="mt-space-lg pt-space-sm border-t border-surface-container flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-secondary text-[16px]">contactless</span>
                <span>Universal NFC &amp; Offline QR</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative flex flex-col rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-headline-md text-headline-md font-bold text-primary-container">03</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                  <span className="material-symbols-outlined text-[26px]">medical_services</span>
                </div>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">
                Instant, accurate context
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                One scan at any participating hospital gives doctors instant, accurate context before the gurney even reaches the trauma bay.
              </p>
              <div className="mt-space-lg pt-space-sm border-t border-surface-container flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-secondary text-[16px]">bolt</span>
                <span>&lt; 300ms EHR sync latency</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES / WHO IT'S FOR (Continuum of Care) */}
      <section id="services" className="w-full bg-surface-container-low py-space-2xl px-grid-margin scroll-mt-24 relative">
        <div id="continuum-care" className="absolute -top-24 left-0 pointer-events-none"></div>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center mb-space-2xl">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider text-secondary uppercase mb-space-2xs">
              Ecosystem Alignment
            </span>
            <h2 className="font-headline-xl text-headline-xl font-bold text-primary">
              Designed for the entire emergency care continuum.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-xs">
              Built to align patients, clinicians, and administrative infrastructure without workflow disruption.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-gutter">
            {/* Card 1: Patients */}
            <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col gap-space-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-[28px]">person</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">Patients</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Pre-register once, be known everywhere. Ensure your life-saving medical data speaks for you when you cannot.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-surface-container flex flex-col gap-space-2xs">
                <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                  <span>100% data consent control</span>
                </div>
                <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                  <span>Automatic SOS alerts to family</span>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToRegisterCard('patient')}
                  className="mt-3 text-left font-semibold text-secondary hover:text-primary text-xs flex items-center gap-1 cursor-pointer"
                >
                  Register as Patient <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Card 2: Doctors */}
            <div id="for-doctors" className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col gap-space-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-[28px]">cardiology</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">Doctors</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Treat strangers with confidence. Instant access to verified allergies, medications, and chronic conditions in critical golden hours.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-surface-container flex flex-col gap-space-2xs">
                <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                  <span>Critical contraindication warnings</span>
                </div>
                <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                  <span>Sub-second biometric identification</span>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToRegisterCard('doctor')}
                  className="mt-3 text-left font-semibold text-secondary hover:text-primary text-xs flex items-center gap-1 cursor-pointer"
                >
                  Join Doctor Network <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Card 3: Hospitals & Admins */}
            <div id="for-hospitals" className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col gap-space-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-[28px]">domain</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">Hospitals &amp; Admins</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Run beds, staff, ICU, and pharmacy on one live data backbone. Eliminate manual intake bottlenecks and expedite triage.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-surface-container flex flex-col gap-space-2xs">
                <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                  <span>Seamless HL7 / FHIR integration</span>
                </div>
                <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                  <span>Zero intake desk administrative drag</span>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToRegisterCard('hospital')}
                  className="mt-3 text-left font-semibold text-secondary hover:text-primary text-xs flex items-center gap-1 cursor-pointer"
                >
                  Onboard Hospital Cluster <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & IMPACT STRIP */}
      <section className="w-full bg-surface py-space-2xl px-grid-margin border-y border-surface-container">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-gutter divide-y md:divide-y-0 md:divide-x divide-surface-container">
            <div className="flex flex-col items-center md:items-start text-center md:text-left py-space-md md:py-0 md:pr-space-lg">
              <span className="font-headline-xl text-headline-xl font-bold text-primary mb-space-2xs">Scan once.</span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Instant biometric or QR verification compatible with ambulance handhelds and hospital triage kiosks.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left py-space-md md:py-0 md:px-space-lg">
              <span className="font-headline-xl text-headline-xl font-bold text-secondary mb-space-2xs">Save minutes.</span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Up to 90% reduction in emergency intake latency, giving trauma physicians immediate life-critical context.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left py-space-md md:py-0 md:pl-space-lg">
              <span className="font-headline-xl text-headline-xl font-bold text-primary mb-space-2xs">Save lives.</span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Zero miscommunicated drug interactions during high-pressure trauma resuscitation and surgical prep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLINICAL COMPLIANCE & PROTOCOLS */}
      <section className="w-full bg-surface-container-lowest py-space-lg px-grid-margin">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-space-md text-on-surface-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[24px]">verified_user</span>
            <div>
              <h4 className="font-label-md text-label-md font-bold text-on-surface">Universal Triage Standard</h4>
              <p className="font-body-sm text-body-sm">Conforms to Manchester Triage System &amp; Emergency Severity Index (ESI)</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary"></span>ISO 27001 Security</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary"></span>HIPAA &amp; ABDM Ready</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary"></span>256-Bit Hardware Encryption</span>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION / HELP & SUPPORT */}
      <section id="help-support" className="w-full bg-surface py-space-2xl px-grid-margin">
        <div className="mx-auto max-w-5xl rounded-3xl bg-surface-container p-space-xl lg:p-space-2xl text-center shadow-sm">
          <div className="mx-auto max-w-2xl flex flex-col items-center gap-space-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[32px]">health_and_safety</span>
            </div>
            <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight">
              Your medical history, ready before you are.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Equip paramedics and trauma teams with the critical details that matter most. Setup takes less than two minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-space-md pt-space-xs">
              <a
                href="#registration-card"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToRegisterCard('patient');
                  window.history.pushState(null, '', '#registration-card');
                }}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-space-xl py-space-sm font-label-lg text-label-lg text-on-primary shadow-sm hover:bg-primary-container transition-all no-underline"
              >
                <span className="material-symbols-outlined mr-2 text-[20px]">add_moderator</span>
                Create Your Digital Health ID
              </a>
              <a
                href="tel:+13029887308"
                className="inline-flex items-center font-label-lg text-label-lg text-primary hover:text-secondary transition-colors group no-underline"
              >
                Schedule a hospital pilot demo
                <span className="material-symbols-outlined ml-1 text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </a>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Available nationwide across all participating emergency grids and public trauma networks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
