import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorSettings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('ekavach_doctor_profile');
    return saved
      ? JSON.parse(saved)
      : {
          fullName: 'Dr. Kavitha Menon',
          dob: '14 April 1982',
          phone: '+91 98401 22819',
          email: 'kavitha.menon@apollo.org',
          address: 'Flat 4B, Shanthi Niketan, Greams Road, Chennai, TN 600006',
          language: 'English (UK / India)',
        };
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('sec-profile');

  const handleSave = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('ekavach_doctor_profile', JSON.stringify(profile));
    setToastMessage('Configuration synced with NDHM Cloud repository');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDiscard = () => {
    const defaults = {
      fullName: 'Dr. Kavitha Menon',
      dob: '14 April 1982',
      phone: '+91 98401 22819',
      email: 'kavitha.menon@apollo.org',
      address: 'Flat 4B, Shanthi Niketan, Greams Road, Chennai, TN 600006',
      language: 'English (UK / India)',
    };
    setProfile(defaults);
    localStorage.setItem('ekavach_doctor_profile', JSON.stringify(defaults));
    setToastMessage('Preferences reverted to defaults');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        {/* Notification Toast (Fixed Minimal Feedback) */}
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-primary text-on-primary px-space-lg py-space-sm rounded-xl shadow-xl transition-all duration-300 ${
            toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'
          }`}
          id="save-toast"
        >
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">check_circle</span>
          <span className="font-label-md text-label-md">{toastMessage || 'Configuration synced with NDHM Cloud repository'}</span>
        </div>

        {/* Page Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl">
          <div>
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Citizen Control Hub</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">NDHM Specification 2.4</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Settings</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-2xs">Manage your profile, verified health ID, and clinical sharing preferences.</p>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-space-sm self-start md:self-auto">
            {/* Sync Status Pill */}
            <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-container/15 text-tertiary shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="font-label-md text-label-md font-medium text-secondary">ABDM Cloud Sync: Active</span>
            </div>

            {/* Quick Save All Button */}
            <button
              onClick={handleSave}
              type="button"
              className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-lg py-space-xs rounded-lg shadow-sm transition-all duration-150 active:scale-95"
              id="save-all-btn"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span className="font-label-lg text-label-lg">Save All Preferences</span>
            </button>
          </div>
        </div>

        {/* Master Layout: Mini Navigation + Dynamic Settings Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* LEFT MINI-NAVIGATION */}
          <div className="lg:col-span-3 flex flex-col gap-space-lg sticky top-24">
            <nav className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col gap-space-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('sec-profile')}
                className={`settings-nav-btn w-full flex items-center justify-between px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-all text-left ${
                  activeTab === 'sec-profile'
                    ? 'bg-surface-container text-on-surface font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
                data-tab-target="sec-profile"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                  <span className="truncate">Profile</span>
                </div>
                <span
                  className={`nav-active-dot w-1.5 h-1.5 rounded-full bg-tertiary-fixed transition-opacity ${
                    activeTab === 'sec-profile' ? 'opacity-100' : 'opacity-0'
                  }`}
                ></span>
              </button>

              <Link
                to="/doctor/credentials"
                className="settings-nav-btn w-full flex items-center justify-between px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container font-label-lg text-label-lg transition-all text-left no-underline"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-[20px]">credit_card</span>
                  <span className="truncate">Health ID &amp; ABHA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" title="Verified ID"></span>
                  <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
                </div>
              </Link>

              <Link
                to="/doctor/network"
                className="settings-nav-btn w-full flex items-center justify-between px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container font-label-lg text-label-lg transition-all text-left no-underline"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                  <span className="truncate">Emergency Contacts</span>
                </div>
                <span className="px-space-2xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">2</span>
              </Link>

              <Link
                to="/doctor/notifications"
                className="settings-nav-btn w-full flex items-center justify-between px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container font-label-lg text-label-lg transition-all text-left no-underline"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                  <span className="truncate">Notifications</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-secondary">toggle_on</span>
              </Link>
            </nav>
{/* Trust Card: ABDM & ISO 27799 Compliance */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm shadow-sm relative overflow-hidden">
<div className="flex items-center gap-space-sm text-secondary">
<span className="material-symbols-outlined text-[24px]">verified</span>
<span className="font-headline-sm text-headline-sm text-on-surface">Data Fortress</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
          Protected under Ayushman Bharat Digital Mission (ABDM) guidelines &amp; ISO 27799 Health Informatics standard.
        </p>
<div className="flex items-center gap-space-2xs pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px] text-tertiary-container">enhanced_encryption</span>
<span className="">256-Bit Hardware Keystore</span>
</div>
</div>
</div>
{/* RIGHT MAIN SETTINGS CANVAS (lg:col-span-9) */}
<div className="lg:col-span-9 flex flex-col gap-space-xl">
{/* SECTION 1: PROFILE INFORMATION */}
<section className="settings-section-panel bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg" id="sec-profile">
<div className="flex flex-col md:flex-row md:items-center justify-between pb-space-md border-b-0 gap-space-md">
<div className="flex items-center gap-space-md">
{/* Patient Headshot placeholder / Avatar */}
<div className="relative group">
<div className="w-20 h-20 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center shadow-inner">
<div className="w-full h-full min-h-[44px] rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-xs" title="Professional studio portrait of an Indian gentleman in his early 40s wearing a high-collared navy blue linen shirt, subtle calm lighting, neutral minimalist background, representing clean medical ID photography.">PS</div>
</div>
<button className="absolute -bottom-1 -right-1 bg-surface-container-lowest text-primary hover:text-secondary rounded-full p-1.5 shadow-md flex items-center justify-center transition-transform hover:scale-105" title="Upload new photo">
<span className="material-symbols-outlined text-[16px]">photo_camera</span>
</button>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<h2 className="font-headline-md text-headline-md text-on-surface">Rajesh V. Sharma</h2>
<span className="material-symbols-outlined text-secondary text-[20px]" title="Authenticated Patient">check_circle</span>
</div>
<div className="flex items-center gap-space-sm mt-0.5">
<span className="font-label-md text-label-md px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-medium">ABDM Tier-1 Citizen Account</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Last synced: 14 mins ago</span>
</div>
</div>
</div>
              <button
                type="button"
                onClick={() => {
                  setToastMessage('Profile photo update service linked with ABDM repository');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="self-start md:self-center px-space-md py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md transition-colors flex items-center gap-space-xs"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span className="">Change Photo</span>
              </button>
            </div>
            {/* Editable Form Grid */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-space-lg" onSubmit={handleSave}>
              {/* Full Name */}
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface font-medium">Full Name (As per Aadhaar)</label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] absolute right-3 pointer-events-none">person</span>
                </div>
              </div>
              {/* Date of Birth */}
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface font-medium">Date of Birth</label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    type="text"
                    value={profile.dob}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant absolute right-3 px-space-xs py-0.5 rounded bg-surface-container">44 Yrs</span>
                </div>
              </div>
              {/* Contact Number */}
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface font-medium">Verified Phone Number</label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                  <div className="absolute right-3 flex items-center gap-1 text-secondary font-label-sm text-label-sm bg-secondary-container/30 px-space-xs py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span className="">OTP Verified</span>
                  </div>
                </div>
              </div>
              {/* Email Address */}
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface font-medium">Official Digital Health Email</label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] absolute right-3 pointer-events-none">mail</span>
                </div>
              </div>
              {/* Residential Address */}
              <div className="md:col-span-2 flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface font-medium">Residential Registered Address</label>
                <input
                  className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>
              {/* Preferred Language & Timezone */}
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface font-medium">Preferred Interface &amp; Prescription Language</label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary appearance-none shadow-sm cursor-pointer"
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  >
                    <option>English (UK / India)</option>
                    <option>Tamil (தமிழ்)</option>
                    <option>Hindi (हिन्दी)</option>
                    <option>Telugu (తెలుగు)</option>
                  </select>
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] absolute right-3 top-3 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface font-medium">National Residency Zone</label>
                <input className="w-full h-11 px-space-md rounded-lg bg-surface-container text-on-surface-variant font-body-md text-body-md shadow-sm cursor-not-allowed" disabled="" type="text" value="Southern Zone (Tamil Nadu / UT Puducherry)" />
              </div>
              {/* Submit Buttons */}
              <div className="md:col-span-2 flex items-center justify-end gap-space-sm pt-space-xs">
                <button
                  onClick={handleDiscard}
                  className="px-space-lg py-space-sm rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors"
                  type="button"
                >
                  Discard
                </button>
                <button className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-xl py-space-sm rounded-lg font-label-lg text-label-lg shadow-sm transition-all duration-150 active:scale-95" type="submit">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span className="">Save Changes</span>
                </button>
              </div>
            </form>
</section>
{/* SECTION 2: HEALTH ID & ABHA LINKING PANEL */}

{/* SECTION 3: EMERGENCY CONTACTS MODULE */}

{/* SECTION 4: NOTIFICATIONS & PRIVACY TOGGLES */}

{/* SECTION 5: PRIVACY & SECURITY DETAILS */}

{/* SECTION 6: CONNECTED DEVICES */}

{/* SECTION 7: ACCOUNT AUDIT & SAFE GUARDS */}

</div>
</div>
</div>
    </div>
  );
}
