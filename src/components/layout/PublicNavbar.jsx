import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoImg from '../../assets/images/Logo.jpg';
import { useAuth } from '../../context/AuthContext';

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const navLinks = [
    { label: 'Home', id: 'hero', path: '/#hero' },
    { label: 'Process', id: 'about-us', path: '/#about-us' },
    { label: 'Care Continuum', id: 'services', path: '/#services' },
    { label: 'Help & Support', id: 'help-support', path: '/#help-support' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setPortalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e, link) => {
    if (location.pathname === '/') {
      e.preventDefault();
      if (link.id === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
      } else {
        const elem = document.getElementById(link.id);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${link.id}`);
        }
      }
    }
  };

  const handlePortalNavigate = async (role, path) => {
    setPortalDropdownOpen(false);
    setMobileOpen(false);
    await login(role);
    navigate(path);
  };

  return (
    <header className="fixed top-7 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full px-grid-margin flex items-center justify-between gap-space-lg">
        <Link to="/" className="flex items-center gap-space-sm no-underline">
          <img alt="E-KAWACH Logo" className="h-9 w-auto object-contain rounded-md" src={LogoImg} />
          <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-semibold">
            E-KAWACH
          </span>
          <span className="hidden xl:inline-flex items-center gap-space-2xs px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            Emergency OS
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-space-md xl:gap-space-lg">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === '/' &&
              ((!location.hash && link.id === 'hero') || location.hash === `#${link.id}`);
            return (
              <a
                key={link.label}
                href={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`px-space-sm py-space-xs font-label-lg text-label-lg rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {link.label}
              </a>
            );
          })}

          {/* Portals Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
              className="inline-flex items-center gap-1 px-space-sm py-space-xs font-label-lg text-label-lg rounded-lg text-primary hover:bg-primary-fixed/30 transition-colors font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">hub</span>
              <span>Portals</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {portalDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-xl bg-white shadow-xl ring-1 ring-black/5 p-2 z-50 flex flex-col gap-1 text-xs">
                <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400 border-b border-slate-100">
                  Select Access Node
                </div>
                <button
                  type="button"
                  onClick={() => handlePortalNavigate('patient', '/patient/dashboard')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                  <div>
                    <div className="font-semibold text-slate-900">Patient Portal</div>
                    <div className="text-[11px] text-slate-400">Health ID, Records &amp; SOS</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePortalNavigate('doctor', '/doctor/dashboard')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-secondary text-[18px]">stethoscope</span>
                  <div>
                    <div className="font-semibold text-slate-900">Doctor Console</div>
                    <div className="text-[11px] text-slate-400">Emergency Scan &amp; Clinical Records</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePortalNavigate('hospital', '/admin/dashboard')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">domain</span>
                  <div>
                    <div className="font-semibold text-slate-900">Hospital Admin</div>
                    <div className="text-[11px] text-slate-400">Staff, Doctors &amp; Operations</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePortalNavigate('hospital', '/admin/emergency-ward')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 text-red-700 text-left transition-colors cursor-pointer border-t border-slate-100"
                >
                  <span className="material-symbols-outlined text-red-600 text-[18px]">emergency</span>
                  <div>
                    <div className="font-semibold text-red-900">Emergency Ward (ICU)</div>
                    <div className="text-[11px] text-red-500">Live Bed Grid &amp; Trauma Telemetry</div>
                  </div>
                </button>
                <div className="pt-1 border-t border-slate-100 mt-1">
                  <Link
                    to="/login"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors no-underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>Sign In with Credentials</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-space-sm">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 px-space-md py-space-xs rounded-lg border border-primary/30 text-primary font-label-lg text-label-lg hover:bg-primary/5 transition-colors no-underline font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Sign In</span>
          </Link>
          <a
            href="/#registration-card"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('ekawach:scroll-to-register'));
                window.history.pushState(null, '', '#registration-card');
              }
            }}
            className="inline-flex items-center justify-center px-space-lg py-space-xs rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors shadow-[0_1px_4px_rgba(0,53,76,0.12)] no-underline font-semibold"
          >
            Get Your Health ID
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-b border-surface-container px-grid-margin py-4 flex flex-col gap-2">
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 no-underline"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Sign In to Any Portal</span>
          </Link>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={(e) => {
                setMobileOpen(false);
                handleNavClick(e, link);
              }}
              className="px-3 py-2 rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="border-t border-slate-200/80 my-2 pt-2 flex flex-col gap-1">
            <span className="px-3 font-semibold uppercase text-[10px] text-slate-400">Direct Portals</span>
            <button
              type="button"
              onClick={() => handlePortalNavigate('patient', '/patient/dashboard')}
              className="text-left px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-label-lg text-sm flex items-center justify-between"
            >
              <span>Patient Portal</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => handlePortalNavigate('doctor', '/doctor/dashboard')}
              className="text-left px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-label-lg text-sm flex items-center justify-between"
            >
              <span>Doctor Console</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => handlePortalNavigate('hospital', '/admin/dashboard')}
              className="text-left px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-label-lg text-sm flex items-center justify-between"
            >
              <span>Hospital Admin</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => handlePortalNavigate('hospital', '/admin/emergency-ward')}
              className="text-left px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 font-label-lg text-sm flex items-center justify-between"
            >
              <span>Emergency Ward (ICU Grid)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
