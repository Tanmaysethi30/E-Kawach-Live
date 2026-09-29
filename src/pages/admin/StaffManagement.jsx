import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function StaffManagement() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaffId, setDeletingStaffId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  // New staff form state
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Critical Care Nurse',
    dept: 'ICU',
    phone: '',
    email: '',
    ext: 'Ext. 4105 • Shift A',
    status: 'On Duty',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch('/api/admin/staff', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.staff)) {
          const mapped = data.staff.map((s) => ({
            id: s.id,
            initials: s.initials || s.name?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'ST',
            name: s.name,
            role: s.role || 'Staff',
            dept: s.department || s.dept || 'General Ward',
            status: s.status === 'ON_DUTY' || s.status === 'On Duty' ? 'On Duty' : 'Off Duty',
            ext: s.extension || s.ext || 'Ext. 1000 • Shift A',
            phone: s.phone || '+91 98401 00000',
            email: s.email || `${(s.name || 'staff').toLowerCase().replace(/\s+/g, '.')}@apollo.ekawach.in`,
            shift: s.shift || 'Shift A (08:00 - 16:00)',
          }));
          setStaffList(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
      showToast('Could not sync staff list from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (!newStaff.name.trim()) {
      showToast('Please enter the staff member name.');
      return;
    }

    try {
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newStaff.name,
          role: newStaff.role,
          department: newStaff.dept,
          extension: newStaff.ext,
          phone: newStaff.phone,
          email: newStaff.email,
          status: newStaff.status,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowAddModal(false);
        setNewStaff({
          name: '',
          role: 'Critical Care Nurse',
          dept: 'ICU',
          phone: '',
          email: '',
          ext: 'Ext. 4105 • Shift A',
          status: 'On Duty',
        });
        showToast(`Staff member ${newStaff.name} registered successfully.`);
        fetchStaff();
      } else {
        showToast('Failed to save staff member to server.');
      }
    } catch (err) {
      console.error('Error adding staff:', err);
      showToast('Error saving staff member.');
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;

    try {
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`/api/admin/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: editingStaff.name,
          role: editingStaff.role,
          department: editingStaff.dept,
          extension: editingStaff.ext,
          phone: editingStaff.phone,
          email: editingStaff.email,
          status: editingStaff.status,
        }),
      });

      if (res.ok) {
        setEditingStaff(null);
        showToast(`Updated profile for ${editingStaff.name}.`);
        fetchStaff();
      } else {
        showToast('Failed to update staff member.');
      }
    } catch (err) {
      console.error('Error updating staff:', err);
      showToast('Error updating staff member.');
    }
  };

  const handleToggleDutyStatus = async (staffMember) => {
    const newStatus = staffMember.status === 'On Duty' ? 'Off Duty' : 'On Duty';
    try {
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`/api/admin/staff/${staffMember.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`${staffMember.name} is now marked ${newStatus}.`);
        fetchStaff();
      }
    } catch (err) {
      console.error('Error updating duty status:', err);
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      const token = localStorage.getItem('ekawach_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setDeletingStaffId(null);
        if (selectedStaffProfile?.id === id) setSelectedStaffProfile(null);
        showToast('Staff member record deleted.');
        fetchStaff();
      } else {
        showToast('Failed to delete staff member.');
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
      showToast('Error deleting staff member.');
    }
  };

  const handleExportRoster = () => {
    const csvHeader = 'Staff ID,Name,Role,Department,Status,Extension,Phone,Email\n';
    const csvRows = staffList.map(
      (s) => `"${s.id}","${s.name}","${s.role}","${s.dept}","${s.status}","${s.ext}","${s.phone}","${s.email}"`
    ).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hospital_Staff_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Staff roster exported to CSV.');
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'On Duty') return s.status === 'On Duty';
    if (activeFilter === 'Off Duty') return s.status === 'Off Duty';
    if (activeFilter === 'ICU') return s.dept.toLowerCase().includes('icu');
    if (activeFilter === 'General Ward') return s.dept.toLowerCase().includes('general');
    if (activeFilter === 'Pharmacy') return s.dept.toLowerCase().includes('pharmacy');
    if (activeFilter === 'Emergency & Trauma') return s.dept.toLowerCase().includes('er') || s.dept.toLowerCase().includes('trauma');
    return true;
  });

  const onDutyCount = staffList.filter((s) => s.status === 'On Duty').length;
  const offDutyCount = staffList.filter((s) => s.status === 'Off Duty').length;

  return (
    <div className="w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#004d6c] text-white rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-xl text-[#02C39A]">badge</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Staff Management Update</span>
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

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Add Hospital Staff Member</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Clinical Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior ICU Staff Nurse"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Department
                  </label>
                  <select
                    value={newStaff.dept}
                    onChange={(e) => setNewStaff({ ...newStaff, dept: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ICU">ICU &amp; Critical Care</option>
                    <option value="ER Bay">Emergency Trauma Bay</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Pharmacy">Hospital Pharmacy</option>
                    <option value="Surgical Wing">Surgical OT</option>
                    <option value="Diagnostic Bay">Diagnostic &amp; CT</option>
                    <option value="NICU / PICU">NICU / PICU</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Duty Status
                  </label>
                  <select
                    value={newStaff.status}
                    onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="On Duty">On Duty (Active Roster)</option>
                    <option value="Off Duty">Off Duty (Standby)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98401 23456"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Extension &amp; Shift
                  </label>
                  <input
                    type="text"
                    placeholder="Ext. 4105 • Shift A"
                    value={newStaff.ext}
                    onChange={(e) => setNewStaff({ ...newStaff, ext: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  Register Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">edit</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Edit Staff Profile</h3>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Clinical Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Duty Status
                  </label>
                  <select
                    value={editingStaff.status}
                    onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editingStaff.dept}
                    onChange={(e) => setEditingStaff({ ...editingStaff, dept: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-1">
                    Extension &amp; Shift
                  </label>
                  <input
                    type="text"
                    value={editingStaff.ext}
                    onChange={(e) => setEditingStaff({ ...editingStaff, ext: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 border border-surface-container text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStaffId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-surface-container text-center">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">delete</span>
            </div>
            <h3 className="font-headline-sm text-base text-primary font-bold">Remove Staff Member</h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-2">
              Are you sure you want to remove this staff member record? This will revoke workstation and duty credentials.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingStaffId(null)}
                className="px-4 py-2 border border-surface-container text-on-surface-variant text-xs font-semibold rounded-lg hover:bg-surface-container cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStaff(deletingStaffId)}
                className="px-4 py-2 bg-error text-on-error text-xs font-semibold rounded-lg hover:bg-error/90 shadow-sm cursor-pointer"
                type="button"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Profile Drawer / Modal */}
      {selectedStaffProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">badge</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Staff Credential Profile</h3>
              </div>
              <button
                onClick={() => setSelectedStaffProfile(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-primary font-bold text-2xl flex items-center justify-center shadow-inner">
                {selectedStaffProfile.initials}
              </div>
              <div className="flex-1">
                <h4 className="font-headline-sm text-lg text-primary font-bold">{selectedStaffProfile.name}</h4>
                <div className="text-xs text-on-surface-variant">Staff ID #{selectedStaffProfile.id} • Apollo Greams Command Node</div>
                <div className="text-xs font-semibold text-secondary mt-1">{selectedStaffProfile.role}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedStaffProfile.status === 'On Duty'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {selectedStaffProfile.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
                <div className="text-[11px] font-semibold text-on-surface-variant uppercase">Department</div>
                <div className="text-sm font-bold text-primary mt-0.5">{selectedStaffProfile.dept}</div>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
                <div className="text-[11px] font-semibold text-on-surface-variant uppercase">Extension / Shift</div>
                <div className="text-sm font-bold text-primary mt-0.5">{selectedStaffProfile.ext}</div>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
                <div className="text-[11px] font-semibold text-on-surface-variant uppercase">Phone Contact</div>
                <div className="text-sm font-bold text-primary mt-0.5">{selectedStaffProfile.phone || '+91 98401 22819'}</div>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
                <div className="text-[11px] font-semibold text-on-surface-variant uppercase">Institutional Email</div>
                <div className="text-xs font-bold text-primary mt-0.5 truncate">{selectedStaffProfile.email || 'staff@apollo.ekawach.in'}</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Security Clearance Level:</span>
              <span className="font-semibold text-primary">Level-2 Clinical Workstation &amp; EMR Verified</span>
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => {
                  setDeletingStaffId(selectedStaffProfile.id);
                }}
                className="text-error hover:text-error/80 font-label-md text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete</span> Delete Record
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleDutyStatus(selectedStaffProfile)}
                  className="px-3 py-2 bg-surface-container-high text-primary font-label-md text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Toggle Duty Status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingStaff(selectedStaffProfile);
                    setSelectedStaffProfile(null);
                  }}
                  className="px-4 py-2 bg-primary text-on-primary font-label-md text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>
            </div>
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
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> COMMAND NODE 01
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">• Staff Operations &amp; Live Roster</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Staff Management</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Real-time registry of on-duty nurses, ward technicians, clinical pharmacists, and emergency specialists.
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
              <button
                onClick={handleExportRoster}
                className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-all font-label-lg text-label-lg font-medium cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Roster
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-all font-label-lg text-label-lg font-semibold cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                + Add Staff Member
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-semibold">Total Staff Registered</span>
                <div className="text-2xl font-bold text-primary mt-1">{staffList.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">badge</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-semibold">Currently On Duty</span>
                <div className="text-2xl font-bold text-[#008774] mt-1">{onDutyCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-semibold">Off Duty / Standby</span>
                <div className="text-2xl font-bold text-on-surface-variant mt-1">{offDutyCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">schedule</span>
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
                placeholder="Search staff by name, ID, role or department..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['All', 'On Duty', 'Off Duty', 'ICU', 'General Ward', 'Pharmacy', 'Emergency & Trauma'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-xs font-semibold whitespace-nowrap shadow-sm transition-colors cursor-pointer ${
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

          {/* Staff Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-2">progress_activity</span>
                <p className="text-sm">Loading staff roster from database...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">person_off</span>
                <p className="text-sm font-semibold">No staff members found matching your search</p>
                <p className="text-xs mt-1">Try resetting filters or adding a new staff member.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase tracking-wider border-b border-surface-container">
                      <th className="px-space-md py-3.5">STAFF MEMBER</th>
                      <th className="px-space-md py-3.5">ROLE</th>
                      <th className="px-space-md py-3.5">DEPARTMENT</th>
                      <th className="px-space-md py-3.5">SHIFT STATUS</th>
                      <th className="px-space-md py-3.5">CONTACT / EXT</th>
                      <th className="px-space-md py-3.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {filteredStaff.map((s) => (
                      <tr key={s.id} className="hover:bg-surface-container-low/70 transition-colors">
                        <td className="px-space-md py-4">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary font-label-md font-bold flex items-center justify-center shrink-0">
                              {s.initials}
                            </div>
                            <div>
                              <div className="font-label-lg text-label-lg font-semibold text-primary">{s.name}</div>
                              <div className="font-label-sm text-xs text-on-surface-variant">ID #{s.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-space-md py-4 text-on-surface font-medium">{s.role}</td>
                        <td className="px-space-md py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-semibold">
                            {s.dept}
                          </span>
                        </td>
                        <td className="px-space-md py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleDutyStatus(s)}
                            title="Click to toggle duty status"
                            className={`inline-flex items-center px-2.5 py-1 rounded-full ${
                              s.status === 'On Duty'
                                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                                : 'bg-surface-container-high text-on-surface-variant'
                            } font-label-sm text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
                            type="button"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              s.status === 'On Duty' ? 'bg-tertiary mr-1.5 animate-pulse' : 'bg-outline mr-1.5'
                            }`}></span>
                            {s.status}
                          </button>
                        </td>
                        <td className="px-space-md py-4 text-on-surface-variant font-label-sm">{s.ext}</td>
                        <td className="px-space-md py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedStaffProfile(s)}
                            className="text-primary hover:text-secondary font-label-sm text-xs font-semibold mr-3 transition-colors cursor-pointer"
                            type="button"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => setEditingStaff(s)}
                            className="text-secondary hover:text-primary font-label-sm text-xs font-semibold mr-3 transition-colors cursor-pointer"
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingStaffId(s.id)}
                            className="text-error hover:text-error/80 font-label-sm text-xs font-semibold transition-colors cursor-pointer"
                            type="button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            <div className="px-space-md py-space-sm bg-surface-container-low border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm">
              <span className="font-body-sm text-xs text-on-surface-variant">
                Showing {filteredStaff.length} of {staffList.length} staff records
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchStaff()}
                  className="px-3 py-1 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> Refresh List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
