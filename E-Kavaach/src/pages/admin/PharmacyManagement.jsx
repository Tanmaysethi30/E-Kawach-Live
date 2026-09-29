import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PharmacyManagement() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All Disciplines');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);

  const [newDrug, setNewDrug] = useState({
    name: '',
    generic: '',
    category: 'Cardiovascular',
    lot: 'Lot #MD-9041',
    location: 'Main Dispensary (Rack A-01)',
    qty: 500,
    unit: 'Tablets',
    status: 'In Stock'
  });

  const initialInventory = [
    {
      id: 1,
      name: 'Metformin 500mg',
      generic: 'Generic: Metformin Hydrochloride • Oral Tablet',
      category: 'Diabetes',
      lot: 'Lot #MT-8819',
      location: 'Main Dispensary (Rack B-04)',
      qty: 4200,
      unit: 'units',
      status: 'In Stock',
      icon: 'pill'
    },
    {
      id: 2,
      name: 'Epinephrine 1mg/mL',
      generic: 'Emergency Crash-Cart Reserve • 1:1000 IV',
      category: 'Emergency Resuscitation',
      lot: 'Lot #EP-4401',
      location: 'ER Bay 1-3 & Trauma Crash Cart',
      qty: 320,
      unit: 'Amps',
      status: 'In Stock',
      icon: 'vaccines'
    },
    {
      id: 3,
      name: 'Cefotaxime 1g IV',
      generic: 'Broad-spectrum Cephalosporin Antibiotic',
      category: 'Antibiotics',
      lot: 'Lot #CF-9921',
      location: 'Inpatient Central Stock',
      qty: 42,
      unit: 'Vials',
      status: 'Low Stock',
      icon: 'science'
    },
    {
      id: 4,
      name: 'Atropine Sulfate 0.6mg',
      generic: 'Bradycardia Anticholinergic • Schedule-H',
      category: 'Emergency Resuscitation',
      lot: 'Lot #AT-1102',
      location: 'Trauma Hub Central Vault',
      qty: 0,
      unit: 'Amps',
      status: 'Out of Stock',
      icon: 'warning'
    },
    {
      id: 5,
      name: 'Rosuvastatin 10mg',
      generic: 'Lipid Lowering HMG-CoA Reductase Inhibitor',
      category: 'Cardiovascular',
      lot: 'Lot #RS-3304',
      location: 'Main Dispensary (Rack C-12)',
      qty: 85,
      unit: 'Tablets',
      status: 'Low Stock',
      icon: 'pill'
    },
    {
      id: 6,
      name: 'Glimepiride 1mg',
      generic: 'Sulfonylurea Antidiabetic',
      category: 'Diabetes',
      lot: 'Lot #GL-7741',
      location: 'Main Dispensary (Rack B-08)',
      qty: 92,
      unit: 'Tablets',
      status: 'Low Stock',
      icon: 'pill'
    },
    {
      id: 7,
      name: 'Enoxaparin 40mg / 0.4mL',
      generic: 'Low Molecular Weight Heparin (LMWH)',
      category: 'Cardiovascular',
      lot: 'Lot #EX-5509',
      location: 'Cold Storage Unit 02 (2-8°C)',
      qty: 210,
      unit: 'Syringes',
      status: 'In Stock',
      icon: 'vaccines'
    },
    {
      id: 8,
      name: 'Salbutamol Inhaler 100mcg',
      generic: 'Beta-2 Agonist Bronchodilator',
      category: 'Respiratory',
      lot: 'Lot #SB-6612',
      location: 'Pulmonology Ward Satellite',
      qty: 140,
      unit: 'Canisters',
      status: 'In Stock',
      icon: 'air'
    }
  ];

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('ekawach_pharmacy_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });

  React.useEffect(() => {
    const token = localStorage.getItem('ekawach_token');
    if (!token) return;
    fetch('/api/admin/pharmacy', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          const mapped = data.items.map((item, idx) => ({
            id: item.id || idx + 1,
            name: item.name,
            generic: item.dosage ? `${item.name} • ${item.dosage}` : item.name,
            category: item.category || 'General',
            lot: item.batchNumber ? `Lot #${item.batchNumber}` : `Lot #MD-${1000 + idx}`,
            location: item.location || 'Main Dispensary',
            qty: item.stockQty !== undefined ? item.stockQty : 100,
            unit: 'units',
            status: item.status === 'LOW_STOCK' ? 'Low Stock' : (item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'In Stock'),
            icon: 'medication',
          }));
          setInventory(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBatchSync = () => {
    showToast('Batch synced 1,420 formulations across CDSCO & ABDM dispensary nodes.');
  };

  const handleExportStockAudit = () => {
    let csvContent = `E-KAWACH PHARMACY MANAGEMENT - FORMULARY STOCK AUDIT
Generated: ${new Date().toLocaleString()}
Facility: Apollo Greams Central Pharmacy & Crash-Cart Node #01

Brand Name,Generic Formulation,Category,Lot Number,Location,Stock Quantity,Unit,Status\n`;

    inventory.forEach(item => {
      csvContent += `"${item.name}","${item.generic}","${item.category}","${item.lot}","${item.location}",${item.qty},"${item.unit}","${item.status}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `E-KAWACH_Pharmacy_Stock_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Stock audit CSV generated and downloaded.');
  };

  const handleAddMedicineSubmit = (e) => {
    e.preventDefault();
    if (!newDrug.name.trim()) {
      showToast('Please enter medicine name.');
      return;
    }
    const drug = {
      id: Date.now(),
      name: newDrug.name,
      generic: newDrug.generic || 'Formula Registered • ABDM Form-20B',
      category: newDrug.category,
      lot: newDrug.lot || `Lot #MD-${Math.floor(1000 + Math.random() * 9000)}`,
      location: newDrug.location,
      qty: parseInt(newDrug.qty, 10) || 100,
      unit: newDrug.unit,
      status: parseInt(newDrug.qty, 10) === 0 ? 'Out of Stock' : parseInt(newDrug.qty, 10) < 100 ? 'Low Stock' : 'In Stock',
      icon: 'pill'
    };

    const updated = [drug, ...inventory];
    setInventory(updated);
    localStorage.setItem('ekawach_pharmacy_inventory', JSON.stringify(updated));
    setShowAddModal(false);
    setNewDrug({
      name: '',
      generic: '',
      category: 'Cardiovascular',
      lot: 'Lot #MD-9041',
      location: 'Main Dispensary (Rack A-01)',
      qty: 500,
      unit: 'Tablets',
      status: 'In Stock'
    });
    showToast(`${drug.name} added to pharmacy formulary inventory.`);
  };

  const handleReorder = (drug) => {
    const poNum = Math.floor(1000 + Math.random() * 9000);
    showToast(`Restock PO #PO-${poNum} dispatched for ${drug.name}. Delivery in 24-48h.`);
    // Optimistically update stock
    const updated = inventory.map(i => {
      if (i.id === drug.id) {
        return { ...i, qty: i.qty + 200, status: 'In Stock' };
      }
      return i;
    });
    setInventory(updated);
    localStorage.setItem('ekawach_pharmacy_inventory', JSON.stringify(updated));
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.generic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.lot.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeStatusFilter === 'In Stock' && item.status !== 'In Stock') return false;
    if (activeStatusFilter === 'Low Stock' && item.status !== 'Low Stock') return false;
    if (activeStatusFilter === 'Out of Stock' && item.status !== 'Out of Stock') return false;

    if (activeCategoryFilter !== 'All Disciplines') {
      if (!item.category.toLowerCase().includes(activeCategoryFilter.toLowerCase().replace('emergency resuscitation', 'emergency'))) {
        return false;
      }
    }
    return true;
  });

  const lowStockCount = inventory.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'Out of Stock').length;
  const inStockCount = inventory.filter(i => i.status === 'In Stock').length;

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#004d6c] text-white rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-xl text-[#02C39A]">medication</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Pharmacy Dispensary Sync</span>
            <span className="text-xs text-slate-200">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-4 text-slate-300 hover:text-white transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">add_circle</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Add Medicine Formulation</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMedicineSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Brand Name &amp; Dosage
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 650mg IV"
                  value={newDrug.name}
                  onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Generic Composition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acetaminophen Infusion • Analgesic"
                  value={newDrug.generic}
                  onChange={(e) => setNewDrug({ ...newDrug, generic: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Formulary Category
                  </label>
                  <select
                    value={newDrug.category}
                    onChange={(e) => setNewDrug({ ...newDrug, category: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Emergency Resuscitation">Emergency Resuscitation</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Controlled Schedule-H">Controlled Schedule-H</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Unit Type
                  </label>
                  <select
                    value={newDrug.unit}
                    onChange={(e) => setNewDrug({ ...newDrug, unit: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Amps">Amps</option>
                    <option value="Vials">Vials</option>
                    <option value="Syringes">Syringes</option>
                    <option value="Canisters">Canisters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newDrug.qty}
                    onChange={(e) => setNewDrug({ ...newDrug, qty: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Batch / Lot #
                  </label>
                  <input
                    type="text"
                    value={newDrug.lot}
                    onChange={(e) => setNewDrug({ ...newDrug, lot: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                  Storage Location / Bin
                </label>
                <input
                  type="text"
                  value={newDrug.location}
                  onChange={(e) => setNewDrug({ ...newDrug, location: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Register Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drug Details Modal */}
      {selectedDrug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">medication</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Medication Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedDrug(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <h4 className="font-headline-sm text-base text-primary font-bold">{selectedDrug.name}</h4>
                <div className="text-xs text-on-surface-variant">{selectedDrug.generic}</div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Batch / Lot Number:</span>
                  <span className="font-mono font-bold text-on-surface">{selectedDrug.lot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Storage Location:</span>
                  <span className="font-semibold text-on-surface">{selectedDrug.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Stock Quantity:</span>
                  <span className="font-bold text-primary">{selectedDrug.qty} {selectedDrug.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Regulatory Track:</span>
                  <span className="font-semibold text-[#008774]">CDSCO &amp; ABDM e-Prescription Verified</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const item = selectedDrug;
                  setSelectedDrug(null);
                  handleReorder(item);
                }}
                className="px-4 py-2 bg-surface-container text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors"
              >
                Trigger Reorder
              </button>
              <button
                type="button"
                onClick={() => setSelectedDrug(null)}
                className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full pb-space-2xl">
        {/* Top Breadcrumb & Operational Node Info */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-md mb-space-sm">
          <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="tracking-wider uppercase font-semibold">COMMAND NODE 01 • CENTRAL PHARMACY &amp; CRASH-CART DISPENSARY</span>
          </div>
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline">
            <span className="material-symbols-outlined text-[15px]">sync_alt</span>
            <span className="">ABDM Gateway Sync: <strong className="text-on-surface font-semibold">Live (42ms)</strong></span>
          </div>
        </div>

        {/* Page Header & Global Actions */}
        <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Pharmaceutical Management</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Track medicine inventory, formulations, and stock levels across the hospital network.</p>
          </div>
          {/* Header Stat Pills & Actions */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef3c7] text-[#b45309] font-label-md text-label-md font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#b45309]"></span>
              <span className="">{lowStockCount} Low Stock</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-semibold">
              <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
              <span className="">{outOfStockCount} Out of Stock</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ede9fe] text-primary font-label-md text-label-md font-medium">
              <span className="material-symbols-outlined text-[16px] text-primary">medication</span>
              <span className="">1,420 Total Formulations</span>
            </div>
            <div className="h-6 w-px bg-surface-variant mx-1 hidden sm:block"></div>
            {/* Secondary Action: Barcode Sync */}
            <button
              onClick={handleBatchSync}
              className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
              <span className="">Batch Sync</span>
            </button>
            {/* Primary Outline: + Add Medicine */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="">Add Medicine</span>
            </button>
          </div>
        </section>

        {/* KPI Metric Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
              <span className="font-label-md text-label-md font-semibold uppercase tracking-wider">Total Active Stock</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">148,250</div>
              <div className="flex items-center gap-1 mt-1 font-body-sm text-body-sm text-[#008774]">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>
                <span className="">94.2% optimal fill rate</span>
              </div>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
              <span className="font-label-md text-label-md font-semibold uppercase tracking-wider">Crash-Cart Reserves</span>
              <div className="w-8 h-8 rounded-lg bg-[#e6f7f4] flex items-center justify-center text-[#008774]">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md font-bold text-[#008774] tracking-tight">100% Armed</div>
              <div className="flex items-center gap-1 mt-1 font-body-sm text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px] text-[#008774]">check_circle</span>
                <span className="">All 14 crash bays verified</span>
              </div>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
              <span className="font-label-md text-label-md font-semibold uppercase tracking-wider">Low Stock Alerts</span>
              <div className="w-8 h-8 rounded-lg bg-[#fef3c7] flex items-center justify-center text-[#b45309]">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md font-bold text-[#b45309] tracking-tight">{lowStockCount} Items</div>
              <div className="flex items-center gap-1 mt-1 font-body-sm text-body-sm text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]"></span>
                <span className="">Reorder suggested (Lead: 48h)</span>
              </div>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
              <span className="font-label-md text-label-md font-semibold uppercase tracking-wider">Stockouts</span>
              <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined text-[18px]">block</span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md font-bold text-error tracking-tight">{outOfStockCount} Item</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant truncate mt-1" title="Atropine Sulfate 0.6mg • Expedited">
                Atropine 0.6mg • <span className="font-semibold text-error">Expedited</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Bar */}
        <section className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm mb-space-lg space-y-space-md">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-surface-container-low text-on-surface placeholder-outline font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors shadow-inner"
                placeholder="Search medicine by brand name, generic formula, batch or NDC..."
                type="search"
              />
            </div>
            {/* Quick Status Filters */}
            <div className="flex items-center flex-wrap gap-1.5">
              {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-semibold transition-colors cursor-pointer ${
                    activeStatusFilter === st
                      ? 'bg-primary text-on-primary shadow-sm'
                      : st === 'Low Stock'
                      ? 'bg-[#fef3c7] text-[#b45309] hover:bg-[#fde68a]'
                      : st === 'Out of Stock'
                      ? 'bg-error-container text-on-error-container hover:bg-error-container/80'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                  type="button"
                >
                  {st} {st === 'All' ? '(1,420)' : st === 'In Stock' ? '(1,416)' : st === 'Low Stock' ? `(${lowStockCount})` : `(${outOfStockCount})`}
                </button>
              ))}
            </div>
            {/* CSV Export Action */}
            <div className="flex items-center">
              <button
                onClick={handleExportStockAudit}
                className="inline-flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span className="">Export Stock Audit (CSV)</span>
              </button>
            </div>
          </div>

          {/* Category Pill Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <span className="font-semibold uppercase tracking-wider text-outline text-[11px] whitespace-nowrap">Formulary Category:</span>
            {['All Disciplines', 'Emergency Resuscitation', 'Cardiovascular', 'Antibiotics', 'Diabetes', 'Controlled Schedule-H', 'Respiratory', 'Analgesics'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-[#ede9fe] text-primary font-bold shadow-xs'
                    : 'bg-surface-container hover:bg-[#ede9fe] hover:text-primary'
                }`}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Medicine Inventory Table Module */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                  <th className="py-3.5 px-space-lg font-semibold">Drug Name &amp; Formula</th>
                  <th className="py-3.5 px-space-md font-semibold">Category</th>
                  <th className="py-3.5 px-space-md font-semibold">Batch &amp; Location</th>
                  <th className="py-3.5 px-space-md font-semibold">Stock Quantity</th>
                  <th className="py-3.5 px-space-md font-semibold">Status</th>
                  <th className="py-3.5 px-space-lg text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-4 px-space-lg">
                      <div className="flex items-center gap-space-sm">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.status === 'Out of Stock'
                            ? 'bg-error-container text-on-error-container'
                            : item.status === 'Low Stock'
                            ? 'bg-[#fef3c7] text-[#b45309]'
                            : 'bg-surface-container text-primary'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-label-lg text-label-lg font-semibold text-on-surface truncate">{item.name}</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{item.generic}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-space-md whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#ede9fe] text-primary font-label-sm text-label-sm font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-space-md">
                      <div className="font-body-sm text-body-sm text-on-surface font-medium">{item.lot}</div>
                      <div className="font-label-sm text-label-sm text-outline truncate">{item.location}</div>
                    </td>
                    <td className="py-4 px-space-md whitespace-nowrap">
                      <span className={`font-label-lg text-label-lg font-semibold ${
                        item.status === 'Out of Stock' ? 'text-error font-bold' : item.status === 'Low Stock' ? 'text-[#b45309] font-bold' : 'text-on-surface'
                      }`}>
                        {item.qty}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant"> {item.unit}</span>
                    </td>
                    <td className="py-4 px-space-md whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                        item.status === 'Out of Stock'
                          ? 'bg-error-container text-on-error-container'
                          : item.status === 'Low Stock'
                          ? 'bg-[#fef3c7] text-[#b45309]'
                          : 'bg-[#e6f7f4] text-[#008774]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Out of Stock' ? 'bg-error' : item.status === 'Low Stock' ? 'bg-[#b45309]' : 'bg-[#008774]'
                        }`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-space-lg text-right whitespace-nowrap">
                      {item.status === 'Out of Stock' ? (
                        <button
                          onClick={() => handleReorder(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold shadow-sm transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">priority_high</span>
                          <span className="">Expedite Reorder</span>
                        </button>
                      ) : item.status === 'Low Stock' ? (
                        <button
                          onClick={() => handleReorder(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-medium shadow-sm transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">sync</span>
                          <span className="">Reorder</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedDrug(item)}
                          className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer"
                          type="button"
                        >
                          <span className="">View Details</span>
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm p-space-md bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container">
            <div className="">
              Showing <span className="font-semibold text-on-surface">{filteredInventory.length > 0 ? 1 : 0}–{filteredInventory.length}</span> of <span className="font-semibold text-on-surface">1,420</span> registered formulations
            </div>
            <div className="inline-flex items-center gap-1">
              <button
                onClick={() => {
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                  showToast('Navigated to previous formulary page.');
                }}
                className="px-2.5 py-1.5 rounded bg-surface-container-lowest text-outline hover:text-on-surface transition-colors disabled:opacity-50 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] align-middle">chevron_left</span>
                <span className="font-label-sm text-label-sm">Prev</span>
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded font-label-sm text-label-sm font-bold flex items-center justify-center transition-colors ${
                  currentPage === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                }`}
                type="button"
              >
                1
              </button>
              <button
                onClick={() => {
                  setCurrentPage(2);
                  showToast('Page 2 of pharmacy formulary loaded.');
                }}
                className={`w-8 h-8 rounded font-label-sm text-label-sm hover:bg-surface-container transition-colors flex items-center justify-center ${
                  currentPage === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface'
                }`}
                type="button"
              >
                2
              </button>
              <button
                onClick={() => {
                  setCurrentPage(3);
                  showToast('Page 3 of pharmacy formulary loaded.');
                }}
                className={`w-8 h-8 rounded font-label-sm text-label-sm hover:bg-surface-container transition-colors flex items-center justify-center ${
                  currentPage === 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface'
                }`}
                type="button"
              >
                3
              </button>
              <span className="px-1 text-outline font-label-sm text-label-sm">...</span>
              <button
                onClick={() => {
                  setCurrentPage(178);
                  showToast('Page 178 of pharmacy formulary loaded.');
                }}
                className={`w-8 h-8 rounded font-label-sm text-label-sm hover:bg-surface-container transition-colors flex items-center justify-center ${
                  currentPage === 178 ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface'
                }`}
                type="button"
              >
                178
              </button>
              <button
                onClick={() => {
                  setCurrentPage(Math.min(178, currentPage + 1));
                  showToast('Navigated to next formulary page.');
                }}
                className="px-2.5 py-1.5 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors flex items-center gap-0.5 cursor-pointer"
                type="button"
              >
                <span className="font-label-sm text-label-sm">Next</span>
                <span className="material-symbols-outlined text-[16px] align-middle">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Compliance and ABDM Verification Note Footer Strip */}
        <footer className="p-space-md rounded-xl bg-surface-container text-on-surface-variant flex flex-col md:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm">
          <div className="flex items-center gap-2 text-center md:text-left">
            <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0">verified_user</span>
            <span className="">E-KAWACH Automated Formulary Sync • Integrated with Central Drugs Standard Control Organisation (CDSCO) &amp; ABDM e-Prescription Gateway • Real-time Batch Traceability Enabled</span>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0 font-mono text-[11px] text-outline">
            <span className="">AUDIT HASH: #EKV-CDSCO-2025</span>
            <span className="inline-flex items-center gap-1 text-[#008774] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-[#008774]"></span>ENCRYPTED</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
