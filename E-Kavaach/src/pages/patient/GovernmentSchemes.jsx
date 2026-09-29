import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function GovernmentSchemes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApply = (name) => {
    showToast(`Instant ABDM digital e-Voucher linked for ${name}. Verification token updated.`);
  };

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm bg-primary text-on-primary rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">verified</span>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg font-semibold">Government Health Portal</span>
            <span className="font-body-sm text-body-sm text-surface-variant">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-space-md text-surface-variant hover:text-on-primary transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
                <h3 className="font-headline-sm text-base font-bold text-primary">{selectedScheme.title}</h3>
              </div>
              <button onClick={() => setSelectedScheme(null)} className="text-on-surface-variant hover:text-on-surface p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2 font-body-md text-sm text-on-surface">
              <div className="flex justify-between py-1 border-b border-surface-container-low">
                <span className="text-on-surface-variant">Coverage Authority:</span>
                <span className="font-semibold text-right">{selectedScheme.authority}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container-low">
                <span className="text-on-surface-variant">Beneficiary ID / Smart Card:</span>
                <span className="font-mono text-secondary font-semibold">{selectedScheme.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container-low">
                <span className="text-on-surface-variant">Annual Entitlement:</span>
                <span className="font-bold text-primary">{selectedScheme.coverage}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low mt-2">
                <span className="font-semibold text-primary block mb-1">Entitlement Details:</span>
                <p className="text-on-surface-variant text-xs leading-relaxed">{selectedScheme.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => {
                  setSelectedScheme(null);
                  showToast(`ABDM Smart Card credentials exported for ${selectedScheme.title}.`);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-sm font-semibold hover:bg-primary-container transition-colors"
                type="button"
              >
                Export Smart Card
              </button>
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-sm transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full">
<div className="flex flex-col gap-space-xl">
{/* Top Live ABDM Verification Status Bar */}
<div className="flex flex-wrap items-center justify-between gap-space-sm px-space-md py-space-xs bg-surface-container-low rounded-xl text-on-surface-variant">
<div className="flex items-center gap-space-sm">
<div className="flex items-center gap-2">
<span className="relative flex h-2.5 w-2.5">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary-container"></span>
</span>
<span className="font-label-md text-label-md font-semibold text-on-surface">Ayushman Bharat Digital Mission (ABDM) Sync Active</span>
</div>
<span className="text-outline-variant">•</span>
<span className="font-mono text-label-sm font-medium text-secondary">Latency 28ms</span>
</div>
<div className="flex items-center gap-space-sm font-label-md text-label-md">
<div className="flex items-center gap-1.5 text-primary">
<span className="material-symbols-outlined text-[16px]">verified_user</span>
<span className="font-medium">National Health Records Vault Linked</span>
</div>
<span className="text-outline-variant">•</span>
<span className="text-on-surface-variant">Token Refreshed: Just Now</span>
</div>
</div>
{/* Page Header Block with Identity Badges */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm tracking-wide uppercase font-semibold">
<span className="material-symbols-outlined text-[15px]">assured_workload</span>
<span>National Health Protection • ABHA Linked</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Government Health Schemes</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          View public health entitlements you are actively enrolled in or eligible for based on your verified ABHA demographic and clinical records.
        </p>
</div>
<div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container-lowest px-space-md py-2 rounded-xl shadow-sm">
<div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface-variant">Combined Annual Cover</span>
<span className="font-headline-sm text-headline-sm text-primary font-bold">₹10,00,000 / yr</span>
</div>
</div>
</div>
{/* Minimal Filter & Quick Search Toolbar */}
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md pt-space-xs">
<div className="relative flex-1 max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
<input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-space-md py-2 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg focus:outline-none shadow-sm transition-all" id="schemeSearchInput" placeholder="Search by scheme name, keyword, or benefits..." type="text" />
</div>
{/* Segmented State Chips */}
<div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-lg">
<button onClick={() => setFilterStatus("all")} className={`filter-chip px-space-md py-1.5 rounded font-label-md text-label-md transition-all font-semibold cursor-pointer ${filterStatus === "all" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"}`} id="btn-all" type="button">
          All Schemes (5)
        </button>
<button onClick={() => setFilterStatus("enrolled")} className={`filter-chip px-space-md py-1.5 rounded font-label-md text-label-md transition-all font-semibold cursor-pointer ${filterStatus === "enrolled" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"}`} id="btn-enrolled" type="button">
          Enrolled (2)
        </button>
<button onClick={() => setFilterStatus("eligible")} className={`filter-chip px-space-md py-1.5 rounded font-label-md text-label-md transition-all font-semibold cursor-pointer ${filterStatus === "eligible" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"}`} id="btn-eligible" type="button">
          Eligible (3)
        </button>
</div>
</div>
{/* Single Clean Schemes List Container (No nested boxed cards) */}
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
{/* Row 1: PM-JAY (Enrolled) */}
{(filterStatus === "all" || filterStatus === "enrolled") && "ayushman bharat pmjay central".includes(searchQuery.toLowerCase()) && (
<div className="scheme-row flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md py-space-lg px-space-lg hover:bg-surface-container-low transition-colors" data-status="enrolled">
<div className="flex items-start gap-space-md flex-1">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[26px]">shield_with_heart</span>
</div>
<div className="flex flex-col gap-1 min-w-0">
<div className="flex flex-wrap items-center gap-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Ayushman Bharat – PM-JAY</h3>
<span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-medium">National / Central</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
              Health insurance coverage up to ₹5 lakh per family per year for secondary and tertiary hospital care across impaneled hospitals nationwide.
            </p>
<div className="flex flex-wrap items-center gap-space-sm pt-1">
<div className="flex items-center gap-1 font-mono text-label-md font-medium text-secondary">
<span className="material-symbols-outlined text-[14px]">badge</span>
<span>Beneficiary ID: PMJAY-TN-902188</span>
</div>
<span className="text-outline-variant">•</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Linked to ABHA: 9824-8819-TN</span>
<span className="text-outline-variant">•</span>
<span className="font-label-sm text-label-sm text-tertiary-container font-semibold">Cashless Settlement Available</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-lg self-end md:self-center shrink-0">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
            Enrolled
          </span>
<button onClick={() => setSelectedScheme({ title: 'Ayushman Bharat – PM-JAY', authority: 'National / Central Government (NHA)', id: 'PMJAY-TN-902188', coverage: '₹5,00,000 per family/year', description: 'Health insurance coverage up to ₹5 lakh per family per year for secondary and tertiary care across impaneled hospitals nationwide.' })} className="group flex items-center gap-1 font-label-lg text-label-lg text-primary hover:text-secondary font-semibold transition-colors cursor-pointer" type="button">
<span>View Details</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
</button>
</div>
</div>
)}
{/* Row 2: TN-CMCHIS (Enrolled) */}
{(filterStatus === "all" || filterStatus === "enrolled") && "chief minister comprehensive health insurance cmchis tamil nadu state".includes(searchQuery.toLowerCase()) && (
<div className="scheme-row flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md py-space-lg px-space-lg hover:bg-surface-container-low transition-colors" data-status="enrolled">
<div className="flex items-start gap-space-md flex-1">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[26px]">health_and_safety</span>
</div>
<div className="flex flex-col gap-1 min-w-0">
<div className="flex flex-wrap items-center gap-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Chief Minister's Comprehensive Health Insurance Scheme (TN-CMCHIS)</h3>
<span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-medium">State Government</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
              State government catastrophic health cover offering up to ₹5 lakh cashless hospitalization per year across recognized state medical college hospitals and network providers.
            </p>
<div className="flex flex-wrap items-center gap-space-sm pt-1">
<div className="flex items-center gap-1 font-mono text-label-md font-medium text-secondary">
<span className="material-symbols-outlined text-[14px]">badge</span>
<span>Smart Card: CMCHIS-CH-481920</span>
</div>
<span className="text-outline-variant">•</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Valid thru Dec 2026</span>
<span className="text-outline-variant">•</span>
<span className="font-label-sm text-label-sm text-tertiary-container font-semibold">Pre-authorized Network Access</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-lg self-end md:self-center shrink-0">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
            Enrolled
          </span>
<button onClick={() => setSelectedScheme({ title: 'TN-CMCHIS (Chief Minister Comprehensive)', authority: 'State Government of Tamil Nadu', id: 'CMCHIS-CH-481920', coverage: '₹5,00,000 per year', description: 'State government catastrophic health cover offering cashless hospitalization across recognized state medical colleges and impaneled hospitals.' })} className="group flex items-center gap-1 font-label-lg text-label-lg text-primary hover:text-secondary font-semibold transition-colors cursor-pointer" type="button">
<span>View Details</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
</button>
</div>
</div>
)}
<div className="h-[1px] bg-surface-container w-full"></div>
{/* Row 3: NHM Free Diagnostics & Drugs (Eligible) */}
{(filterStatus === "all" || filterStatus === "eligible") && "national health mission nhm free drugs diagnostics primary".includes(searchQuery.toLowerCase()) && (
<div className="scheme-row flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md py-space-lg px-space-lg hover:bg-surface-container-low transition-colors" data-status="eligible">
<div className="flex items-start gap-space-md flex-1">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[26px]">medication</span>
</div>
<div className="flex flex-col gap-1 min-w-0">
<div className="flex flex-wrap items-center gap-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">National Health Mission — Free Essential Drugs &amp; Diagnostics</h3>
<span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-medium">NHM Entitlement</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
              100% cashless generic pharmaceutical drugs, baseline biochemical profiles, and pathology scans across all public Primary Health Centres and district facilities.
            </p>
<div className="flex flex-wrap items-center gap-space-sm pt-1">
<span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Criteria met via NFSA / SECC database</span>
<span className="text-outline-variant">•</span>
<span className="font-label-sm text-label-sm text-secondary font-semibold">Instant e-Voucher Eligible</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-lg self-end md:self-center shrink-0">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            Eligible
          </span>
<button onClick={() => handleApply('National Health Mission — Free Drugs')} className="group flex items-center gap-1 font-label-lg text-label-lg text-primary hover:text-secondary font-semibold transition-colors cursor-pointer" type="button">
<span>Apply / Link</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
</button>
</div>
</div>
)}
{/* Row 4: Rashtriya Vayoshri Yojana (Eligible) */}
{(filterStatus === "all" || filterStatus === "eligible") && "rashtriya vayoshri yojana rvy senior wellness mobility".includes(searchQuery.toLowerCase()) && (
<div className="scheme-row flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md py-space-lg px-space-lg hover:bg-surface-container-low transition-colors" data-status="eligible">
<div className="flex items-start gap-space-md flex-1">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[26px]">elderly</span>
</div>
<div className="flex flex-col gap-1 min-w-0">
<div className="flex flex-wrap items-center gap-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Rashtriya Vayoshri Yojana (RVY — Senior Wellness &amp; Mobility)</h3>
<span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-medium">Social Justice &amp; Empowerment</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
              Physical assisted-living devices, sensory corrective aids, and orthopedic mobility supports for qualifying senior household members.
            </p>
<div className="flex flex-wrap items-center gap-space-sm pt-1">
<span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Auto-qualified via Senior Age Marker (Family Member Linked)</span>
<span className="text-outline-variant">•</span>
<span className="font-label-sm text-label-sm text-secondary font-semibold">Free Distribution Camp Access</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-lg self-end md:self-center shrink-0">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            Eligible
          </span>
<button onClick={() => handleApply('Rashtriya Vayoshri Yojana')} className="group flex items-center gap-1 font-label-lg text-label-lg text-primary hover:text-secondary font-semibold transition-colors cursor-pointer" type="button">
<span>Apply / Link</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
</button>
</div>
</div>
)}
{/* Row 5: PMSMA (Eligible) */}
{(filterStatus === "all" || filterStatus === "eligible") && "pradhan mantri surakshit matritva abhiyan pmsma maternal".includes(searchQuery.toLowerCase()) && (
<div className="scheme-row flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md py-space-lg px-space-lg hover:bg-surface-container-low transition-colors" data-status="eligible">
<div className="flex items-start gap-space-md flex-1">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[26px]">pregnant_woman</span>
</div>
<div className="flex flex-col gap-1 min-w-0">
<div className="flex flex-wrap items-center gap-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)</h3>
<span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-medium">Maternal Health</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
              Guaranteed, comprehensive antenatal clinical care on the 9th of every month with OB/GYN specialist consults and routine ultrasound screenings.
            </p>
<div className="flex flex-wrap items-center gap-space-sm pt-1">
<span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Applicable for primary household dependents</span>
<span className="text-outline-variant">•</span>
<span className="font-label-sm text-label-sm text-secondary font-semibold">Dedicated Nodal Clinic Support</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-lg self-end md:self-center shrink-0">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            Eligible
          </span>
<button onClick={() => handleApply('Pradhan Mantri Surakshit Matritva Abhiyan')} className="group flex items-center gap-1 font-label-lg text-label-lg text-primary hover:text-secondary font-semibold transition-colors cursor-pointer" type="button">
<span>Apply / Link</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
</button>
</div>
</div>
)}
</div>
{/* Supporting ABDM Automated Trust & Guidance Banner */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-sm">
<div className="flex items-center gap-space-md">
<div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">hub</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-primary font-semibold">ABDM Automated Eligibility Engine</span>
<p className="font-body-md text-body-md text-on-surface-variant">
            Your entitlements are continuously verified against your verified ABHA record. No physical paperwork is required for hospital desk empanelment.
          </p>
</div>
</div>
<div className="flex items-center gap-space-md shrink-0">
<a className="font-label-lg text-label-lg text-primary hover:text-secondary font-semibold flex items-center gap-1 underline underline-offset-4" href="https://cgrms.pmjay.gov.in/" target="_blank" rel="noopener noreferrer">
<span>Central Grievance Redressal (CGRMS)</span>
<span className="material-symbols-outlined text-[16px]">open_in_new</span>
</a>
</div>
</div>
</div>
</div>

    </div>
  );
}
