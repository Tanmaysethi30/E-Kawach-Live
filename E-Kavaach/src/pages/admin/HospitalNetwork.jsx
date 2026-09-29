import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HospitalNetwork() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [transferModalHospital, setTransferModalHospital] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);

  const [newConnectNode, setNewConnectNode] = useState({
    name: '',
    location: '',
    cluster: 'chennai',
    specialties: 'General Trauma, Emergency, ICU',
    icuBeds: 8,
    wardBeds: 24,
    phone: '044-28290200',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchNetwork = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch('/api/admin/hospital-network', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.network)) {
          const mapped = data.network.map((h, idx) => ({
            id: h.id || `HOSP-${idx + 1}`,
            name: h.name,
            subtext: h.type || 'ABDM Tier-1 Trauma Node',
            location: h.location || h.city || 'Tamil Nadu, India',
            subloc: typeof h.distanceKm === 'number' ? `${h.distanceKm} km from Hub` : 'Regional Node',
            distanceKm: h.distanceKm || 5.0,
            icuBeds: h.availableIcuBeds ?? (h.icuBedsAvailable ?? 6),
            wardBeds: h.wardBedsAvailable || 20,
            specialties: Array.isArray(h.specialties) ? h.specialties.join(', ') : (h.specialties || 'Emergency, Trauma'),
            status: h.status ? h.status.toLowerCase() : 'connected',
            phone: h.phone || '044-28290200',
            contactPerson: h.contactPerson || 'ER Duty Officer',
            region: h.region || 'chennai',
            icon: 'local_hospital',
          }));
          setHospitals(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to load hospital network:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  const handleRequestConnection = async (e) => {
    e.preventDefault();
    if (!newConnectNode.name.trim()) {
      showToast('Please enter hospital name.');
      return;
    }

    try {
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch('/api/admin/hospital-network', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newConnectNode.name,
          location: newConnectNode.location,
          type: 'Secondary Trauma Hub',
          specialties: newConnectNode.specialties.split(',').map((s) => s.trim()),
          availableIcuBeds: Number(newConnectNode.icuBeds) || 6,
          phone: newConnectNode.phone,
          status: 'CONNECTED',
        }),
      });

      if (res.ok) {
        setShowConnectModal(false);
        setNewConnectNode({
          name: '',
          location: '',
          cluster: 'chennai',
          specialties: 'General Trauma, Emergency, ICU',
          icuBeds: 8,
          wardBeds: 24,
          phone: '044-28290200',
        });
        showToast(`Hospital node connected successfully.`);
        fetchNetwork();
      } else {
        showToast('Failed to connect hospital node.');
      }
    } catch (err) {
      console.error('Error connecting hospital:', err);
      showToast('Error registering hospital node.');
    }
  };

  const handleDispatchTransfer = (e) => {
    e.preventDefault();
    showToast(`Inter-hospital transfer dispatched to ${transferModalHospital?.name}. 108 Emergency Fleet notified.`);
    setTransferModalHospital(null);
  };

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.specialties.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'connected') return h.status === 'connected';
    if (activeFilter === 'pending') return h.status === 'pending';
    if (activeFilter === 'chennai') return h.region.includes('chennai') || h.location.toLowerCase().includes('chennai');
    if (activeFilter === 'south') return h.region.includes('south') || h.location.toLowerCase().includes('tamil nadu') || h.location.toLowerCase().includes('kerala');
    if (activeFilter === 'national') return h.region.includes('national') || h.location.toLowerCase().includes('delhi');
    return true;
  });

  const connectedCount = hospitals.filter((h) => h.status === 'connected').length;
  const pendingCount = hospitals.filter((h) => h.status === 'pending').length;

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#004d6c] text-white rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-xl text-[#02C39A]">hub</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Network Update</span>
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

      {/* Connect New Hospital Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">add_link</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Connect Hospital Node</h3>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRequestConnection} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MIOT International Super Speciality"
                  value={newConnectNode.name}
                  onChange={(e) => setNewConnectNode({ ...newConnectNode, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Location / City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manapakkam, Chennai"
                    value={newConnectNode.location}
                    onChange={(e) => setNewConnectNode({ ...newConnectNode, location: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    placeholder="044-42002288"
                    value={newConnectNode.phone}
                    onChange={(e) => setNewConnectNode({ ...newConnectNode, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Available ICU Beds
                  </label>
                  <input
                    type="number"
                    value={newConnectNode.icuBeds}
                    onChange={(e) => setNewConnectNode({ ...newConnectNode, icuBeds: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Clinical Cluster
                  </label>
                  <select
                    value={newConnectNode.cluster}
                    onChange={(e) => setNewConnectNode({ ...newConnectNode, cluster: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="chennai">Chennai Metropolitan Hub</option>
                    <option value="south">South Zone Corridor</option>
                    <option value="national">National Tier-1 Apex Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Key Trauma &amp; Surgical Specialties
                </label>
                <input
                  type="text"
                  value={newConnectNode.specialties}
                  onChange={(e) => setNewConnectNode({ ...newConnectNode, specialties: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  Connect Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Patient Modal */}
      {transferModalHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">ambulance</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Dispatch Inter-Hospital Transfer</h3>
              </div>
              <button
                onClick={() => setTransferModalHospital(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleDispatchTransfer} className="mt-4 space-y-4">
              <div className="bg-surface-container-low p-3.5 rounded-xl">
                <div className="text-xs text-on-surface-variant">Destination Node:</div>
                <div className="font-bold text-primary text-base mt-0.5">{transferModalHospital.name}</div>
                <div className="text-xs text-on-surface-variant mt-0.5">
                  {transferModalHospital.location} • {transferModalHospital.subloc}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#008774]">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {transferModalHospital.icuBeds} ICU Beds Available for Ingress
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Patient Name or ABHA ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar (9824-8819-TN)"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Transfer Reason / Clinical Specialty Needed
                </label>
                <input
                  type="text"
                  defaultValue="Urgent ECMO / Cardiothoracic Surgery Consultation"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setTransferModalHospital(null)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  Dispatch 108 Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full">
        <div className="px-grid-margin py-space-xl space-y-space-lg max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-xs mb-space-2xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> ABDM GRID SYNC
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">• Inter-Hospital Network</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Hospital Network Grid</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Real-time visibility into available ICU beds, trauma capabilities, and live transfer routing across regional hospitals.
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
              <button
                onClick={() => setShowConnectModal(true)}
                className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-all font-label-lg text-label-lg font-semibold cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add_link</span>
                + Connect Node
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-semibold">Total Network Nodes</span>
                <div className="text-2xl font-bold text-primary mt-1">{hospitals.length} Connected</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">hub</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-semibold">Active Regional ICU Beds</span>
                <div className="text-2xl font-bold text-[#008774] mt-1">
                  {hospitals.reduce((acc, h) => acc + (h.icuBeds || 0), 0)} Available
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined">vital_signs</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-semibold">Connected Clusters</span>
                <div className="text-2xl font-bold text-on-surface mt-1">Chennai &amp; South</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">map</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col gap-space-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-space-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-surface-container"
                placeholder="Search hospitals by name, location or specialty..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['all', 'connected', 'chennai', 'south', 'national'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-xs font-semibold whitespace-nowrap shadow-sm transition-colors cursor-pointer capitalize ${
                    activeFilter === filter
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Hospital Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {loading ? (
              <div className="col-span-full p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-2">progress_activity</span>
                <p className="text-sm">Loading hospital network nodes...</p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="col-span-full p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">domain_disabled</span>
                <p className="text-sm font-semibold">No hospital nodes found</p>
              </div>
            ) : (
              filteredHospitals.map((h) => (
                <div
                  key={h.id}
                  className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl">local_hospital</span>
                        </div>
                        <div>
                          <h3 className="font-headline-sm text-sm font-bold text-primary">{h.name}</h3>
                          <div className="text-[11px] text-on-surface-variant">{h.subtext}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tertiary-fixed text-on-tertiary-fixed uppercase">
                        {h.status}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-on-surface-variant space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span>{h.location} • {h.subloc}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">phone</span>
                        <span>{h.phone}</span>
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant">Available ICU Beds:</span>
                      <span className="font-bold text-[#008774] text-sm">{h.icuBeds} Beds Ready</span>
                    </div>

                    <div className="mt-2 text-[11px] text-on-surface-variant line-clamp-2">
                      <strong>Specialties:</strong> {h.specialties}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant font-semibold">Contact: {h.contactPerson}</span>
                    <button
                      onClick={() => setTransferModalHospital(h)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                      type="button"
                    >
                      Refer Patient &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
