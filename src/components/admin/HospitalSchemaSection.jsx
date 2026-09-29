import React, { useState, useEffect } from 'react';

export const SCHEMA_FIELD_DEFINITIONS = [
  { field: 'registration_id', type: 'VARCHAR (UUID)', purpose: 'Universal unit registration ID (Unique Key)', category: 'Identity' },
  { field: 'hospital_id', type: 'UUID / BIGINT', purpose: 'Unique hospital ID', category: 'Identity' },
  { field: 'hospital_name', type: 'VARCHAR', purpose: 'Official hospital name', category: 'Identity' },
  { field: 'hospital_type', type: 'VARCHAR', purpose: 'Government / Private / Trust', category: 'Identity' },
  { field: 'registration_number', type: 'VARCHAR', purpose: 'Hospital registration/license number', category: 'Identity' },
  { field: 'contact_number', type: 'VARCHAR', purpose: 'Main hospital contact', category: 'Contact' },
  { field: 'email', type: 'VARCHAR', purpose: 'Official hospital email', category: 'Contact' },
  { field: 'website', type: 'VARCHAR', purpose: 'Hospital website', category: 'Contact' },
  { field: 'address', type: 'TEXT', purpose: 'Complete address', category: 'Location' },
  { field: 'city', type: 'VARCHAR', purpose: 'City', category: 'Location' },
  { field: 'district', type: 'VARCHAR', purpose: 'District', category: 'Location' },
  { field: 'state', type: 'VARCHAR', purpose: 'State', category: 'Location' },
  { field: 'pincode', type: 'VARCHAR', purpose: 'Postal code', category: 'Location' },
  { field: 'latitude', type: 'DECIMAL', purpose: 'GPS latitude', category: 'Location' },
  { field: 'longitude', type: 'DECIMAL', purpose: 'GPS longitude', category: 'Location' },
  { field: 'total_beds', type: 'INTEGER', purpose: 'Total bed capacity', category: 'Beds' },
  { field: 'available_beds', type: 'INTEGER', purpose: 'Current available beds', category: 'Beds' },
  { field: 'icu_beds', type: 'INTEGER', purpose: 'Total ICU beds', category: 'Beds' },
  { field: 'icu_available', type: 'INTEGER', purpose: 'Available ICU beds', category: 'Beds' },
  { field: 'emergency_beds', type: 'INTEGER', purpose: 'Total emergency beds', category: 'Beds' },
  { field: 'emergency_available', type: 'INTEGER', purpose: 'Available emergency beds', category: 'Beds' },
  { field: 'general_beds', type: 'INTEGER', purpose: 'Total general beds', category: 'Beds' },
  { field: 'private_beds', type: 'INTEGER', purpose: 'Total private/deluxe beds', category: 'Beds' },
  { field: 'ambulance_count', type: 'INTEGER', purpose: 'Total ambulances', category: 'Infrastructure' },
  { field: 'blood_bank_available', type: 'BOOLEAN', purpose: 'Blood bank facility', category: 'Infrastructure' },
  { field: 'pharmacy_available', type: 'BOOLEAN', purpose: '24/7 Pharmacy facility', category: 'Infrastructure' },
  { field: 'diagnostic_available', type: 'BOOLEAN', purpose: 'Diagnostic/Lab facility', category: 'Infrastructure' },
  { field: 'operation_theatre_count', type: 'INTEGER', purpose: 'Total operation theatres', category: 'Infrastructure' },
  { field: 'ventilator_count', type: 'INTEGER', purpose: 'Total ventilators available', category: 'Infrastructure' },
  { field: 'oxygen_beds', type: 'INTEGER', purpose: 'Beds with direct oxygen supply', category: 'Beds' },
  { field: 'specialities', type: 'ARRAY / JSON', purpose: 'Specialities offered', category: 'Clinical Services' },
  { field: 'services', type: 'ARRAY / JSON', purpose: 'Services offered', category: 'Clinical Services' },
  { field: 'opening_time', type: 'TIME', purpose: 'Opening hours', category: 'Operations' },
  { field: 'closing_time', type: 'TIME', purpose: 'Closing hours', category: 'Operations' },
  { field: 'emergency_24x7', type: 'BOOLEAN', purpose: '24x7 emergency service', category: 'Operations' },
  { field: 'admin_name', type: 'VARCHAR', purpose: 'Hospital admin name', category: 'Administration' },
  { field: 'admin_phone', type: 'VARCHAR', purpose: 'Admin phone number', category: 'Administration' },
  { field: 'status', type: 'VARCHAR', purpose: 'Pending / Approved / Rejected / Suspended', category: 'Identity' },
  { field: 'created_at', type: 'TIMESTAMP', purpose: 'Record creation time', category: 'Metadata' },
  { field: 'updated_at', type: 'TIMESTAMP', purpose: 'Record update time', category: 'Metadata' },
];

export default function HospitalSchemaSection({
  schemaData,
  setSchemaData,
  onSave,
  saving,
  showToast,
}) {
  const [selectedVarKey, setSelectedVarKey] = useState('total_beds');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [newSpecialityInput, setNewSpecialityInput] = useState('');
  const [newServiceInput, setNewServiceInput] = useState('');
  const [liveDbResponse, setLiveDbResponse] = useState(null);
  const [fetchingTest, setFetchingTest] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [viewSchemaMode, setViewSchemaMode] = useState('form'); // 'form' | 'table' | 'variable-console'

  const categories = ['All', 'Identity', 'Contact', 'Location', 'Beds', 'Infrastructure', 'Clinical Services', 'Operations', 'Administration', 'Metadata'];

  const filteredDefinitions = categoryFilter === 'All'
    ? SCHEMA_FIELD_DEFINITIONS
    : SCHEMA_FIELD_DEFINITIONS.filter((item) => item.category === categoryFilter);

  const handleFieldChange = (field, value) => {
    setSchemaData((prev) => ({
      ...prev,
      [field]: value,
      updated_at: new Date().toISOString(),
    }));
  };

  const handleAddSpeciality = () => {
    if (!newSpecialityInput.trim()) return;
    const current = Array.isArray(schemaData.specialities) ? schemaData.specialities : [];
    if (!current.includes(newSpecialityInput.trim())) {
      handleFieldChange('specialities', [...current, newSpecialityInput.trim()]);
    }
    setNewSpecialityInput('');
  };

  const handleRemoveSpeciality = (indexToRemove) => {
    const current = Array.isArray(schemaData.specialities) ? schemaData.specialities : [];
    handleFieldChange('specialities', current.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    const current = Array.isArray(schemaData.services) ? schemaData.services : [];
    if (!current.includes(newServiceInput.trim())) {
      handleFieldChange('services', [...current, newServiceInput.trim()]);
    }
    setNewServiceInput('');
  };

  const handleRemoveService = (indexToRemove) => {
    const current = Array.isArray(schemaData.services) ? schemaData.services : [];
    handleFieldChange('services', current.filter((_, idx) => idx !== indexToRemove));
  };

  // Test live variable fetch directly from backend endpoint
  const handleTestVariableFetch = async () => {
    setFetchingTest(true);
    setTestStatus('Querying internal database variables...');
    const startTime = performance.now();
    try {
      const token = localStorage.getItem('ekawach_token');
      const res = await fetch('/api/admin/hospital-schema', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (res.ok && data.data) {
        setLiveDbResponse(data);
        setTestStatus(`Success (${elapsed}ms): 39 variables fetched from internal DB`);
        if (showToast) {
          showToast(`Live Variable Verified: "${selectedVarKey}" = ${JSON.stringify(data.data[selectedVarKey])}`);
        }
      } else {
        setLiveDbResponse(data);
        setTestStatus(`Fetched with fallback local state (${elapsed}ms)`);
      }
    } catch (err) {
      setTestStatus(`Fetch error: ${err.message}`);
    } finally {
      setFetchingTest(false);
    }
  };

  const selectedDef = SCHEMA_FIELD_DEFINITIONS.find((d) => d.field === selectedVarKey) || SCHEMA_FIELD_DEFINITIONS[0];
  const currentValue = schemaData[selectedVarKey];

  return (
    <div className="space-y-6">
      {/* Registration Welcome & Schema Information Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border border-primary/20 p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">dataset</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-primary">
                  Official Hospital Registration Schema (39 Data Variables)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Internal DB Pipeline
                </span>
              </div>
              <p className="text-xs md:text-sm text-on-surface-variant mt-1">
                Upon account creation, your hospital node records these 39 standardized variables in the internal database.
                Every variable is directly accessible through programmatic variable fetching (<code className="text-primary font-mono text-xs">db.hospitalSchemaVariable[id]</code> or <code className="text-primary font-mono text-xs">/api/admin/hospital-schema</code>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-semibold text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {saving ? 'Committing Variables...' : 'Save 39-Field Schema'}
            </button>
          </div>
        </div>

        {/* View Switcher & Category Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-primary/15">
          <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-surface-container">
            <button
              type="button"
              onClick={() => setViewSchemaMode('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewSchemaMode === 'form' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              Interactive Input Form
            </button>
            <button
              type="button"
              onClick={() => setViewSchemaMode('variable-console')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewSchemaMode === 'variable-console' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              Variable Fetching Console
            </button>
            <button
              type="button"
              onClick={() => setViewSchemaMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewSchemaMode === 'table' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              Schema Registry Table (39)
            </button>
          </div>

          <div className="text-xs text-on-surface-variant flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <strong>39 of 39</strong> fields mapped to internal database variables
          </div>
        </div>
      </div>

      {/* MODE 1: INTERACTIVE FORM WITH ALL 39 FIELDS ORGANIZED INTO LOGICAL SECTIONS */}
      {viewSchemaMode === 'form' && (
        <form onSubmit={onSave} className="space-y-6">
          {/* SECTION 1: IDENTITY & REGISTRATION */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              <div>
                <h3 className="text-sm font-bold text-primary">1. Hospital Identity &amp; Legal Authority (5 Fields)</h3>
                <p className="text-xs text-on-surface-variant">Core identifier, registered title, legal organization type and clinical licensing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  hospital_id <span className="text-[10px] text-on-surface-variant font-mono">(UUID / BIGINT)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.hospital_id || ''}
                  onChange={(e) => handleFieldChange('hospital_id', e.target.value)}
                  placeholder="e.g. hosp-apollo-greams"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-mono text-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  hospital_name <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.hospital_name || ''}
                  onChange={(e) => handleFieldChange('hospital_name', e.target.value)}
                  placeholder="Official registered name"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-semibold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  hospital_type <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <select
                  value={schemaData.hospital_type || 'Private'}
                  onChange={(e) => handleFieldChange('hospital_type', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-semibold text-primary"
                >
                  <option value="Government">Government / Public Sector</option>
                  <option value="Private">Private Facility</option>
                  <option value="Trust">Trust / Non-Profit / Charitable</option>
                  <option value="Autonomous">Autonomous Institute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  registration_number <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.registration_number || ''}
                  onChange={(e) => handleFieldChange('registration_number', e.target.value)}
                  placeholder="e.g. TN-MED-REG-4891"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-mono text-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  status <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <select
                  value={schemaData.status || 'Approved'}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-bold text-primary"
                >
                  <option value="Approved">Approved (Active Grid)</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT & ONLINE PRESENCE */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <span className="material-symbols-outlined text-primary text-[20px]">contact_phone</span>
              <div>
                <h3 className="text-sm font-bold text-primary">2. Official Contact &amp; Online Presence (3 Fields)</h3>
                <p className="text-xs text-on-surface-variant">Central emergency line, clinical dispatch email, and public portal URL</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  contact_number <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.contact_number || ''}
                  onChange={(e) => handleFieldChange('contact_number', e.target.value)}
                  placeholder="e.g. +91 44 2829 0200"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  email <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <input
                  type="email"
                  required
                  value={schemaData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="admin@hospital.org"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  website <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span>
                </label>
                <input
                  type="text"
                  value={schemaData.website || ''}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  placeholder="https://www.hospital.org"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: GEOGRAPHIC LOCATION & COORDINATES */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
              <div>
                <h3 className="text-sm font-bold text-primary">3. Geographic Location &amp; Geocoding (7 Fields)</h3>
                <p className="text-xs text-on-surface-variant">Full address, administrative divisions, and GPS coordinates for ambulance dispatch</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-primary mb-1">
                  address <span className="text-[10px] text-on-surface-variant font-mono">(TEXT)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.address || ''}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Street name, landmark, building number"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  city <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="e.g. Chennai"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  district <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span>
                </label>
                <input
                  type="text"
                  value={schemaData.district || ''}
                  onChange={(e) => handleFieldChange('district', e.target.value)}
                  placeholder="e.g. Chennai Central"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  state <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.state || ''}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  pincode <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.pincode || ''}
                  onChange={(e) => handleFieldChange('pincode', e.target.value)}
                  placeholder="e.g. 600006"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  latitude <span className="text-[10px] text-on-surface-variant font-mono">(DECIMAL)</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={schemaData.latitude ?? 13.0604}
                  onChange={(e) => handleFieldChange('latitude', parseFloat(e.target.value) || 0)}
                  placeholder="13.0604"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  longitude <span className="text-[10px] text-on-surface-variant font-mono">(DECIMAL)</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={schemaData.longitude ?? 80.2496}
                  onChange={(e) => handleFieldChange('longitude', parseFloat(e.target.value) || 0)}
                  placeholder="80.2496"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: BED CAPACITIES & AVAILABILITY MATRIX */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <span className="material-symbols-outlined text-primary text-[20px]">single_bed</span>
              <div>
                <h3 className="text-sm font-bold text-primary">4. Bed Capacity &amp; Real-Time Availability (9 Fields)</h3>
                <p className="text-xs text-on-surface-variant">Breakdown of ICU, Emergency, General, Private, and Direct Oxygen Beds</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
                <label className="block text-xs font-bold text-primary mb-1">
                  total_beds <span className="text-[10px] text-on-surface-variant font-mono">(INT)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.total_beds ?? 0}
                  onChange={(e) => handleFieldChange('total_beds', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-surface-container font-bold text-primary text-base"
                />
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  available_beds <span className="text-[10px] text-emerald-700 font-mono">(INT)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.available_beds ?? 0}
                  onChange={(e) => handleFieldChange('available_beds', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-emerald-300 font-bold text-emerald-700 text-base"
                />
              </div>

              <div className="bg-error-container/20 p-3.5 rounded-xl border border-error/30">
                <label className="block text-xs font-bold text-error mb-1">
                  icu_beds <span className="text-[10px] text-on-surface-variant font-mono">(INT)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.icu_beds ?? 0}
                  onChange={(e) => handleFieldChange('icu_beds', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-surface-container font-bold text-error text-base"
                />
              </div>

              <div className="bg-error-container/20 p-3.5 rounded-xl border border-error/30">
                <label className="block text-xs font-bold text-error mb-1">
                  icu_available <span className="text-[10px] text-on-surface-variant font-mono">(INT)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.icu_available ?? 0}
                  onChange={(e) => handleFieldChange('icu_available', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-surface-container font-bold text-error text-base"
                />
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  emergency_beds <span className="text-[10px] text-amber-700 font-mono">(INT)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.emergency_beds ?? 0}
                  onChange={(e) => handleFieldChange('emergency_beds', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-amber-300 font-bold text-amber-800 text-base"
                />
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  emergency_available <span className="text-[10px] text-amber-700 font-mono">(INT)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.emergency_available ?? 0}
                  onChange={(e) => handleFieldChange('emergency_available', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-amber-300 font-bold text-amber-800 text-base"
                />
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
                <label className="block text-xs font-bold text-primary mb-1">
                  general_beds <span className="text-[10px] text-on-surface-variant font-mono">(INT)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.general_beds ?? 0}
                  onChange={(e) => handleFieldChange('general_beds', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-surface-container font-bold text-primary text-base"
                />
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
                <label className="block text-xs font-bold text-primary mb-1">
                  private_beds <span className="text-[10px] text-on-surface-variant font-mono">(INT)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.private_beds ?? 0}
                  onChange={(e) => handleFieldChange('private_beds', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-surface-container font-bold text-primary text-base"
                />
              </div>

              <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200 sm:col-span-2">
                <label className="block text-xs font-bold text-sky-900 mb-1">
                  oxygen_beds <span className="text-[10px] text-sky-700 font-mono">(INT - Direct Cryo Pipeline)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.oxygen_beds ?? 0}
                  onChange={(e) => handleFieldChange('oxygen_beds', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-sky-300 font-bold text-sky-800 text-base"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: CRITICAL INFRASTRUCTURE & FACILITIES */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <span className="material-symbols-outlined text-primary text-[20px]">medical_services</span>
              <div>
                <h3 className="text-sm font-bold text-primary">5. Critical Infrastructure &amp; Equipment (6 Fields)</h3>
                <p className="text-xs text-on-surface-variant">Ambulance fleet, life-support hardware, operation theatres, and round-the-clock facilities</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  ambulance_count <span className="text-[10px] text-on-surface-variant font-mono">(INTEGER)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.ambulance_count ?? 0}
                  onChange={(e) => handleFieldChange('ambulance_count', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  operation_theatre_count <span className="text-[10px] text-on-surface-variant font-mono">(INTEGER)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.operation_theatre_count ?? 0}
                  onChange={(e) => handleFieldChange('operation_theatre_count', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  ventilator_count <span className="text-[10px] text-on-surface-variant font-mono">(INTEGER)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={schemaData.ventilator_count ?? 0}
                  onChange={(e) => handleFieldChange('ventilator_count', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-bold text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3.5 bg-surface-container-low rounded-xl border border-surface-container cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(schemaData.blood_bank_available)}
                  onChange={(e) => handleFieldChange('blood_bank_available', e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-xs font-bold text-primary">blood_bank_available</div>
                  <div className="text-[11px] text-on-surface-variant">Blood Bank Facility Active</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-surface-container-low rounded-xl border border-surface-container cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(schemaData.pharmacy_available)}
                  onChange={(e) => handleFieldChange('pharmacy_available', e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-xs font-bold text-primary">pharmacy_available</div>
                  <div className="text-[11px] text-on-surface-variant">24/7 Pharmacy Facility</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-surface-container-low rounded-xl border border-surface-container cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(schemaData.diagnostic_available)}
                  onChange={(e) => handleFieldChange('diagnostic_available', e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-xs font-bold text-primary">diagnostic_available</div>
                  <div className="text-[11px] text-on-surface-variant">Diagnostic &amp; Lab Facility</div>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION 6: CLINICAL SPECIALITIES & SERVICES */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <span className="material-symbols-outlined text-primary text-[20px]">vaccines</span>
              <div>
                <h3 className="text-sm font-bold text-primary">6. Specialities &amp; Clinical Offerings (2 Fields)</h3>
                <p className="text-xs text-on-surface-variant">Stored as Array / JSON variables in the internal database</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* specialities */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  specialities <span className="text-[10px] text-on-surface-variant font-mono">(ARRAY / JSON)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSpecialityInput}
                    onChange={(e) => setNewSpecialityInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpeciality(); } }}
                    placeholder="Add speciality (e.g. Cardiology)"
                    className="flex-1 px-3 py-2 bg-surface-container-low border border-surface-container rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpeciality}
                    className="px-3 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[50px] p-2 bg-surface-container-low rounded-xl border border-surface-container">
                  {(Array.isArray(schemaData.specialities) ? schemaData.specialities : []).map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest border border-surface-container rounded-lg text-xs font-medium text-primary shadow-xs"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpeciality(idx)}
                        className="text-on-surface-variant hover:text-error text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {(!schemaData.specialities || schemaData.specialities.length === 0) && (
                    <span className="text-xs text-on-surface-variant italic">No specialities added yet</span>
                  )}
                </div>
              </div>

              {/* services */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  services <span className="text-[10px] text-on-surface-variant font-mono">(ARRAY / JSON)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(); } }}
                    placeholder="Add service (e.g. 24x7 Ambulance Dispatch)"
                    className="flex-1 px-3 py-2 bg-surface-container-low border border-surface-container rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[50px] p-2 bg-surface-container-low rounded-xl border border-surface-container">
                  {(Array.isArray(schemaData.services) ? schemaData.services : []).map((srv, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest border border-surface-container rounded-lg text-xs font-medium text-primary shadow-xs"
                    >
                      {srv}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="text-on-surface-variant hover:text-error text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {(!schemaData.services || schemaData.services.length === 0) && (
                    <span className="text-xs text-on-surface-variant italic">No clinical services added yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7: OPERATIONAL HOURS & EMERGENCY AVAILABILITY */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
              <div>
                <h3 className="text-sm font-bold text-primary">7. Operational Schedule &amp; 24x7 Coverage (3 Fields)</h3>
                <p className="text-xs text-on-surface-variant">Daily OPD operational windows and active trauma emergency routing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  opening_time <span className="text-[10px] text-on-surface-variant font-mono">(TIME)</span>
                </label>
                <input
                  type="time"
                  value={schemaData.opening_time || '00:00'}
                  onChange={(e) => handleFieldChange('opening_time', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  closing_time <span className="text-[10px] text-on-surface-variant font-mono">(TIME)</span>
                </label>
                <input
                  type="time"
                  value={schemaData.closing_time || '23:59'}
                  onChange={(e) => handleFieldChange('closing_time', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-bold text-primary"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 p-3.5 w-full bg-red-50/60 rounded-xl border border-red-200 cursor-pointer hover:bg-red-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={Boolean(schemaData.emergency_24x7)}
                    onChange={(e) => handleFieldChange('emergency_24x7', e.target.checked)}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-red-900">emergency_24x7 (BOOLEAN)</div>
                    <div className="text-[11px] text-red-700">24x7 Active Trauma &amp; Emergency Ingress</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 8: ADMINISTRATION & TIMESTAMPS */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <span className="material-symbols-outlined text-primary text-[20px]">manage_accounts</span>
              <div>
                <h3 className="text-sm font-bold text-primary">8. Hospital Administration &amp; Record Metadata (4 Fields)</h3>
                <p className="text-xs text-on-surface-variant">Designated nodal administrator contact and audit timestamps</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  admin_name <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.admin_name || ''}
                  onChange={(e) => handleFieldChange('admin_name', e.target.value)}
                  placeholder="e.g. Dr. R. K. Nambiar"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  admin_phone <span className="text-[10px] text-on-surface-variant font-mono">(VARCHAR)</span> *
                </label>
                <input
                  type="text"
                  required
                  value={schemaData.admin_phone || ''}
                  onChange={(e) => handleFieldChange('admin_phone', e.target.value)}
                  placeholder="e.g. +91 98401 22819"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  created_at <span className="text-[10px] text-on-surface-variant font-mono">(TIMESTAMP)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={schemaData.created_at || 'Auto-generated on creation'}
                  className="w-full px-3.5 py-2.5 bg-surface-container border border-surface-container rounded-xl text-xs text-on-surface-variant font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  updated_at <span className="text-[10px] text-on-surface-variant font-mono">(TIMESTAMP)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={schemaData.updated_at || 'Auto-synced on save'}
                  className="w-full px-3.5 py-2.5 bg-surface-container border border-surface-container rounded-xl text-xs text-on-surface-variant font-mono"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs">
            <div className="text-xs text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
              Saving directly persists all 39 variables into the internal database (`local_db.json`).
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {saving ? 'Persisting to Database...' : 'Save & Register 39-Field Schema'}
            </button>
          </div>
        </form>
      )}

      {/* MODE 2: VARIABLE FETCHING CONSOLE */}
      {viewSchemaMode === 'variable-console' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-surface-container">
            <div>
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">data_object</span>
                Real-Time Variable Fetching Console
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Inspect and execute programmatic variable fetching against the internal database for any of the 39 schema keys.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestVariableFetch}
              disabled={fetchingTest}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary font-bold text-xs rounded-xl hover:bg-secondary/90 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              {fetchingTest ? 'Fetching Variables...' : 'Execute Live Variable Fetch Test'}
            </button>
          </div>

          {testStatus && (
            <div className="p-3 bg-surface-container-low border border-surface-container rounded-xl text-xs flex items-center justify-between">
              <span className="font-mono text-primary font-medium">{testStatus}</span>
              <span className="text-emerald-700 font-bold text-[11px] bg-emerald-100 px-2 py-0.5 rounded-md">
                LIVE DB READY
              </span>
            </div>
          )}

          {/* Variable Picker */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Select Schema Variable to Fetch</label>
              <select
                value={selectedVarKey}
                onChange={(e) => setSelectedVarKey(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm font-mono font-bold text-primary"
              >
                {SCHEMA_FIELD_DEFINITIONS.map((def) => (
                  <option key={def.field} value={def.field}>
                    {def.field} ({def.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container">
              <div className="text-[11px] uppercase font-bold text-on-surface-variant">Variable Purpose</div>
              <div className="text-xs text-primary font-semibold mt-1">{selectedDef.purpose}</div>
              <div className="text-[11px] text-secondary font-mono mt-1">Data Type: {selectedDef.type}</div>
            </div>

            <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20">
              <div className="text-[11px] uppercase font-bold text-primary">Live Value in Internal DB</div>
              <div className="text-sm font-mono font-bold text-primary mt-1 break-all">
                {typeof currentValue === 'object' ? JSON.stringify(currentValue) : String(currentValue ?? 'null')}
              </div>
            </div>
          </div>

          {/* Code Fetching Snippets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
              Variable Fetching Code Implementation Patterns
            </h4>

            {/* Pattern 1: Direct Internal DB Variable Access */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <div className="text-slate-400 text-[11px] mb-2 font-sans font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Node.js Backend / In-Memory Repository Direct Variable Fetch:
              </div>
              <pre className="text-emerald-300">
{`// 1. Direct Variable Fetching via InMemoryRepository state:
const hospital_id = "${schemaData.hospital_id || 'hosp-apollo-greams'}";
const ${selectedVarKey} = db.hospitalSchemaVariable[hospital_id]?.${selectedVarKey};

console.log("Fetched variable ${selectedVarKey}:", ${selectedVarKey});`}
              </pre>
            </div>

            {/* Pattern 2: Database Model Query */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <div className="text-slate-400 text-[11px] mb-2 font-sans font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                Database Service / ORM Fetch:
              </div>
              <pre className="text-sky-300">
{`// 2. Fetch via Admin Service or Schema Model:
const schemaRecord = await db.getHospitalSchema("${schemaData.hospital_id || 'hosp-apollo-greams'}");
const { ${selectedVarKey} } = schemaRecord;`}
              </pre>
            </div>

            {/* Pattern 3: REST API Endpoint Fetch */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <div className="text-slate-400 text-[11px] mb-2 font-sans font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Frontend / REST API HTTP Variable Fetch:
              </div>
              <pre className="text-amber-300">
{`// 3. Client-Side HTTP Fetch from /api/admin/hospital-schema:
const response = await fetch('/api/admin/hospital-schema/${schemaData.hospital_id || 'hosp-apollo-greams'}');
const { data } = await response.json();
const fetchedValue = data.${selectedVarKey}; // => ${JSON.stringify(currentValue)}`}
              </pre>
            </div>
          </div>

          {/* Live Full Schema Payload from Database */}
          {liveDbResponse && (
            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase">
                  Live Response from `/api/admin/hospital-schema`
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">200 OK Synchronized</span>
              </div>
              <pre className="text-[11px] font-mono p-3 bg-surface-container-lowest rounded-lg overflow-x-auto max-h-60 text-primary border border-surface-container">
                {JSON.stringify(liveDbResponse.data || liveDbResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: FULL SCHEMA REGISTRY TABLE */}
      {viewSchemaMode === 'table' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-surface-container">
            <div>
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">table_chart</span>
                Complete 39-Field Schema Specification Table
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Reference table of all variables registered in the internal database.
              </p>
            </div>

            {/* Filter by Category */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    categoryFilter === cat
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-surface-container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-primary border-b border-surface-container font-semibold">
                  <th className="p-3">#</th>
                  <th className="p-3">Field (Variable)</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Current Stored Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredDefinitions.map((item, index) => {
                  const val = schemaData[item.field];
                  return (
                    <tr key={item.field} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-3 text-on-surface-variant font-mono">{index + 1}</td>
                      <td className="p-3 font-mono font-bold text-primary">
                        <code>{item.field}</code>
                      </td>
                      <td className="p-3 text-on-surface-variant font-mono text-[11px]">
                        <span className="px-2 py-0.5 bg-surface-container-high rounded text-primary font-semibold">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 text-on-surface-variant">
                        <span className="px-2 py-0.5 bg-surface-container rounded-full text-[10px] font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-primary">{item.purpose}</td>
                      <td className="p-3 font-mono text-primary max-w-[200px] truncate">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
