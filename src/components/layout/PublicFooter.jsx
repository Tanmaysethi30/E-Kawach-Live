import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PublicFooter() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePortalClick = async (e, role, path) => {
    e.preventDefault();
    await login(role);
    navigate(path);
  };

  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_6px_rgba(0,0,0,0.02)] mt-space-2xl">
      <div className="w-full px-grid-margin py-space-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-grid-gutter mb-space-2xl">
          <div className="lg:col-span-2 flex flex-col gap-space-sm pr-space-lg">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                E-KAWACH
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              Next-generation emergency-first clinical operating system connecting triage, trauma infrastructure, and critical diagnostics in real-time.
            </p>
            <div className="flex items-center gap-space-xs mt-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                verified_user
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                ISO 27799 &amp; ABDM Compliant Mission-Critical Infrastructure
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold">
              Platform
            </h3>
            <ul className="flex flex-col gap-space-xs font-body-md text-body-md text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="/#about-us">Process Architecture</a></li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePortalClick(e, 'hospital', '/admin/emergency-ward')}
                  className="hover:text-primary transition-colors text-left cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
                >
                  Emergency Triage OS (ICU)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePortalClick(e, 'doctor', '/doctor/dashboard')}
                  className="hover:text-primary transition-colors text-left cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
                >
                  Doctor Console
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePortalClick(e, 'patient', '/patient/dashboard')}
                  className="hover:text-primary transition-colors text-left cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
                >
                  Patient Portal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePortalClick(e, 'patient', '/patient/abha')}
                  className="hover:text-primary transition-colors text-left cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
                >
                  Health ID Gateway
                </button>
              </li>
              <li>
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign In Portal
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold">
              Legal &amp; Safety
            </h3>
            <ul className="flex flex-col gap-space-xs font-body-md text-body-md text-on-surface-variant">
              <li><Link className="hover:text-primary transition-colors" to="/patient/privacy">Privacy Policy</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/patient/privacy">Terms of Service</Link></li>
              <li><span className="text-on-surface-variant/70">Clinical Compliance</span></li>
              <li><span className="text-on-surface-variant/70">Security Protocols</span></li>
            </ul>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold">
              Emergency Ops
            </h3>
            <ul className="flex flex-col gap-space-xs font-body-md text-body-md text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="tel:+13029887308">Command Center Helpline</a></li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePortalClick(e, 'hospital', '/admin/network')}
                  className="hover:text-primary transition-colors text-left cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
                >
                  Hospital Integration Desk
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePortalClick(e, 'doctor', '/doctor/network')}
                  className="hover:text-primary transition-colors text-left cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
                >
                  Clinician Network
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md bg-surface-container-low px-space-lg py-space-md rounded-xl">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2026 E-KAWACH Health Systems (Team Nexus, Build with Bharat 2.0). All rights reserved.
          </p>
          <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
              Active Trauma Grid Status: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
