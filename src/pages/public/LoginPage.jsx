import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoImg from '../../assets/images/Logo.jpg';

const DEMO_ACCOUNTS = {
  patient: {
    role: 'patient',
    roleLabel: 'Citizen Patient',
    portalName: 'Patient Health Portal',
    badge: 'ABHA Linked Citizen',
    identifier: 'rajesh.sharma@ekawach.health',
    password: 'password123',
    hint: 'ABHA: 9824-8819-3320-TN',
    icon: 'person',
    accentColor: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    description: 'Access your health records, ABHA emergency pass, appointments, and tele-consultations.',
  },
  doctor: {
    role: 'doctor',
    roleLabel: 'Registered Clinician',
    portalName: 'Doctor Clinical Console',
    badge: 'NMC Registered Specialist',
    identifier: 'dr.kavitha@apollo.health',
    password: 'password123',
    hint: 'NMC: MD-44912-TN',
    icon: 'stethoscope',
    accentColor: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/20',
    description: 'Scan patient emergency QR passes, review triage queues, issue e-prescriptions, and verify records.',
  },
  hospital: {
    role: 'hospital',
    roleLabel: 'Hospital Administrator',
    portalName: 'Hospital Operations Hub',
    badge: 'State Trauma Supercluster',
    identifier: 'admin.nambiar@apollo.health',
    password: 'password123',
    hint: 'Clinical Node: AP-HSP-842-TN',
    icon: 'domain',
    accentColor: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'Monitor real-time bed telemetry, ICU occupancy, critical pharmacy inventory, and medical staff.',
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signInWithGoogle, currentUser } = useAuth();

  // Determine initial role from URL query param or default to patient
  const roleParam = searchParams.get('role');
  const initialRole = roleParam && DEMO_ACCOUNTS[roleParam] ? roleParam : 'patient';
  const redirectParam = searchParams.get('redirect');

  const [activeRole, setActiveRole] = useState(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already authenticated and matches role, redirect
  useEffect(() => {
    if (currentUser && currentUser.dashboardRoute) {
      const dest = redirectParam || currentUser.dashboardRoute;
      navigate(dest, { replace: true });
    }
  }, [currentUser, navigate, redirectParam]);

  // Sync role when URL param changes
  useEffect(() => {
    if (roleParam && DEMO_ACCOUNTS[roleParam]) {
      setActiveRole(roleParam);
      setErrorMessage('');
    }
  }, [roleParam]);

  const activeAccount = DEMO_ACCOUNTS[activeRole] || DEMO_ACCOUNTS.patient;

  // 1-Click Demo Fill
  const handleQuickDemoFill = (roleKey) => {
    const acc = DEMO_ACCOUNTS[roleKey];
    setActiveRole(roleKey);
    setIdentifier(acc.identifier);
    setPassword(acc.password);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email, ABHA Health ID, or registration number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const destination = await login(activeRole, {
        identifier: identifier.trim(),
        password,
      });

      const finalDest = redirectParam || destination || activeAccount.dashboardRoute || '/';
      navigate(finalDest, { replace: true });
    } catch (err) {
      console.error('Login submission failed:', err);
      setErrorMessage(
        err.message || 'Authentication failed. Please verify your credentials or click "Quick Demo Fill" below.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setErrorMessage('');
    setGoogleLoading(true);
    try {
      const destination = await signInWithGoogle(activeRole);
      const finalDest = redirectParam || destination || '/patient/dashboard';
      navigate(finalDest, { replace: true });
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      setErrorMessage(err.message || 'Google Sign-In failed. Please try credentials login.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] pt-24 pb-12 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-surface via-surface to-surface-container-low">
      <div className="w-full max-w-lg">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <img src={LogoImg} alt="E-KAWACH Logo" className="h-10 w-auto rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-headline-sm text-2xl font-bold tracking-tight text-primary">
              E-KAWACH
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Sign In to Clinical Operating System
          </h1>
          <p className="mt-1.5 text-sm text-on-surface-variant max-w-md mx-auto">
            Choose your role to access emergency triage, ABHA citizen records, or hospital telemetry.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden backdrop-blur-sm">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 p-1.5 bg-surface-container-low border-b border-outline-variant/40 gap-1">
            {Object.keys(DEMO_ACCOUNTS).map((key) => {
              const item = DEMO_ACCOUNTS[key];
              const isSelected = activeRole === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveRole(key);
                    setErrorMessage('');
                  }}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-black/5'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] mb-0.5 ${isSelected ? item.accentColor : ''}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.roleLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Role Banner */}
          <div className={`px-6 py-3.5 border-b ${activeAccount.borderColor} ${activeAccount.bgColor} flex items-center justify-between`}>
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[22px] ${activeAccount.accentColor}`}>
                {activeAccount.icon}
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {activeAccount.portalName}
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {activeAccount.badge}
                </div>
              </div>
            </div>

            {/* Quick Demo Fill Button */}
            <button
              type="button"
              onClick={() => handleQuickDemoFill(activeRole)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-primary border border-outline-variant/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="Click to fill verified test credentials"
            >
              <span className="material-symbols-outlined text-[14px] text-amber-500">bolt</span>
              <span>Demo Fill</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">
                  error
                </span>
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-on-error-container/70 hover:text-on-error-container"
                  aria-label="Dismiss error"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="login-identifier">
                  {activeRole === 'patient'
                    ? 'Aadhaar Number / Health ID / Email'
                    : activeRole === 'doctor'
                    ? 'NMC License / Doctor Email'
                    : 'Hospital Clinical ID / Admin Email'}
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">
                    {activeRole === 'patient' ? 'badge' : activeRole === 'doctor' ? 'clinical_notes' : 'corporate_fare'}
                  </span>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={activeAccount.identifier}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
                <p className="mt-1 text-[11px] text-on-surface-variant/80 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-emerald-600">verified</span>
                  <span>Demo: <strong className="font-mono text-on-surface">{activeAccount.identifier}</strong></span>
                </p>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-on-surface" htmlFor="login-password-field">
                    Password
                  </label>
                  <span className="text-[11px] text-secondary hover:text-primary transition-colors cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant pointer-events-none">
                    key
                  </span>
                  <input
                    id="login-password-field"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-on-surface-variant hover:text-on-surface p-0.5 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-on-surface-variant/80">
                  Demo password: <strong className="font-mono text-on-surface">{activeAccount.password}</strong>
                </p>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Keep me signed in on this workstation</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container shadow-md shadow-primary/10 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    <span>Sign In to {activeAccount.portalName}</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/60" />
              </div>
              <span className="relative px-3 bg-surface-container-lowest text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Or Fast-Track
              </span>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full inline-flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
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
              <span>{googleLoading ? 'Connecting to ABDM...' : 'Continue with Google (ABDM Single Sign-On)'}</span>
            </button>
          </div>

          {/* Footer Registration Link */}
          <div className="py-4 px-6 bg-surface-container-low border-t border-outline-variant/40 text-center">
            <p className="text-xs text-on-surface-variant">
              Don't have an ABHA Health ID or Clinical Node?{' '}
              <Link
                to="/#registration-card"
                onClick={() => {
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('ekawach:scroll-to-register'));
                    window.dispatchEvent(new CustomEvent('ekavach:scroll-to-register'));
                  }, 100);
                }}
                className="font-semibold text-secondary hover:text-primary transition-colors inline-flex items-center gap-0.5 ml-1"
              >
                Register Online <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </p>
          </div>
        </div>

        {/* Help Notice */}
        <div className="mt-6 text-center text-xs text-on-surface-variant/80">
          <span>Need mission-critical support? </span>
          <a href="tel:+13029887308" className="font-medium text-primary hover:underline">
            Contact 24/7 Command Center (1066)
          </a>
        </div>
      </div>
    </div>
  );
}
