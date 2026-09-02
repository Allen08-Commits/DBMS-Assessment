import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  Edit3,
  X,
  Lock
} from 'lucide-react';
import {
  Complaint,
  ComplaintType,
  ComplaintPriority,
  ComplaintStatus,
  Connection
} from '../types';
import { WaterUtilityDatabaseEngine } from '../db/dbEngine';
import { SdgFooter } from './SdgFooter';

interface ComplaintsProps {
  complaints: Complaint[];
  connections: Connection[];
  db: WaterUtilityDatabaseEngine;
  onRefresh: () => void;
}

export const Complaints: React.FC<ComplaintsProps> = ({
  complaints = [],
  connections = [],
  db,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);

  // Add Complaint Form
  const [formConnId, setFormConnId] = useState(connections[0]?.connection_id || 'CON10001');
  const [formType, setFormType] = useState<ComplaintType>('Leak');
  const [formPriority, setFormPriority] = useState<ComplaintPriority>('High');
  const [formDesc, setFormDesc] = useState('');
  const [addResult, setAddResult] = useState<{ success: boolean; message: string } | null>(null);

  // Update Status Form (OCC simulation)
  const [updateStatus, setUpdateStatus] = useState<ComplaintStatus>('In Progress');
  const [updateOperator, setUpdateOperator] = useState('CMP001');
  const [updateResolutionNotes, setUpdateResolutionNotes] = useState('');
  const [simulateOccConflict, setSimulateOccConflict] = useState(false);
  const [updateResult, setUpdateResult] = useState<{ success: boolean; message: string } | null>(null);

  const filteredComplaints = (complaints || []).filter((c) => {
    const matchesSearch =
      c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.connection_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || c.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc) return;

    const res = db.registerComplaint(formConnId, formType, formPriority, formDesc);
    setAddResult(res);
    if (res.success) {
      onRefresh();
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormDesc('');
      }, 1000);
    }
  };

  const handleOpenUpdate = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setUpdateStatus(complaint.status);
    setUpdateOperator(complaint.assigned_to || 'CMP001');
    setUpdateResolutionNotes(complaint.resolution_notes || '');
    setSimulateOccConflict(false);
    setUpdateResult(null);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    // If simulating OCC conflict, pass a stale version number
    const targetVersion = simulateOccConflict ? editingComplaint.version - 1 : editingComplaint.version;

    const res = db.updateComplaintStatus(
      editingComplaint.complaint_id,
      updateStatus,
      targetVersion,
      updateOperator,
      updateResolutionNotes
    );

    setUpdateResult(res);
    if (res.success) {
      onRefresh();
      setTimeout(() => {
        setEditingComplaint(null);
      }, 1000);
    }
  };

  const getPriorityBadge = (p: ComplaintPriority) => {
    switch (p) {
      case 'Critical':
      case 'Urgent':
        return 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse';
      case 'High':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Medium':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'Low':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (s: ComplaintStatus) => {
    switch (s) {
      case 'Resolved':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'In Progress':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Open':
      case 'Pending':
      default:
        return 'bg-amber-950 text-amber-300 border-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-amber-400" />
            Complaint & Service Incident Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Relational table: <code className="text-cyan-300 font-mono">COMPLAINT</code> protected by Optimistic Concurrency Control (<code className="text-cyan-300 font-mono">version</code> checking).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddResult(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Complaint (INSERT)</span>
        </button>
      </div>

      {/* OCC Concept Callout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white">
              Optimistic Concurrency Control (OCC) Active
            </div>
            <div className="text-[11px] text-slate-400">
              Updates execute: <code className="font-mono text-cyan-300">UPDATE complaint SET status = ?, version = version + 1 WHERE complaint_id = ? AND version = ?;</code>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-1 rounded">
          Prevents Lost Updates on Concurrent Support Staff Edits
        </span>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Connection ID, description..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Total Tickets: <strong className="text-amber-400 font-mono">{filteredComplaints.length}</strong>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Index: <code className="text-cyan-400">idx_complaint_connection</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Complaint ID</th>
                <th className="px-4 py-3 font-semibold">Connection ID</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Assigned Operator</th>
                <th className="px-4 py-3 font-semibold">Version (OCC)</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredComplaints.map((c) => (
                <tr key={c.complaint_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-amber-300">
                    {c.complaint_id}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-cyan-300 font-semibold">{c.connection_id}</td>
                  <td className="px-4 py-3.5 text-white">
                    {c.complaint_type}
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{c.description}</div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(c.priority)}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">{c.assigned_to || 'Unassigned'}</td>
                  <td className="px-4 py-3.5 font-mono text-cyan-400 font-bold">v{c.version}</td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenUpdate(c)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-cyan-400" />
                      <span>Update</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No complaint records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Complaint */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Register New Complaint Ticket
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  addResult.success
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-800 text-rose-200'
                }`}
              >
                {addResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{addResult.message}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Target Water Connection
                </label>
                <select
                  value={formConnId}
                  onChange={(e) => setFormConnId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
                >
                  {connections.map((c) => (
                    <option key={c.connection_id} value={c.connection_id}>
                      {c.connection_id} – {c.consumer_name} ({c.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Issue Category
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ComplaintType)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Leak">Leak</option>
                    <option value="Meter Fault">Meter Fault</option>
                    <option value="Low Water Pressure">Low Water Pressure</option>
                    <option value="Billing Dispute">Billing Dispute</option>
                    <option value="Supply Interruption">Supply Interruption</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as ComplaintPriority)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Incident Description & Location Details
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe leak location, pressure drop severity, or meter error message..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow"
                >
                  Register Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Complaint Status with OCC Demonstration */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400">Optimistic Concurrency Control</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Update Ticket: {editingComplaint.complaint_id}
                  <span className="text-xs font-mono font-normal text-amber-400">(v{editingComplaint.version})</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingComplaint(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  updateResult.success
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-800 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {updateResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{updateResult.message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Ticket Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Assign Operator ID
                </label>
                <input
                  type="text"
                  required
                  value={updateOperator}
                  onChange={(e) => setUpdateOperator(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Resolution / Field Inspection Notes
                </label>
                <textarea
                  rows={2}
                  value={updateResolutionNotes}
                  onChange={(e) => setUpdateResolutionNotes(e.target.value)}
                  placeholder="Notes on valve replacement, pipe patch, or meter recalibration..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* OCC Conflict Simulation Toggle */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateOccConflict}
                    onChange={(e) => setSimulateOccConflict(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-semibold text-rose-300 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Simulate Stale Version Conflict (OCC Abort)
                  </span>
                </label>
                <p className="text-[10px] text-slate-400">
                  Sends version <code>v{editingComplaint.version - 1}</code> instead of <code>v{editingComplaint.version}</code> to test lost-update prevention.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow"
                >
                  Save & Increment Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SdgFooter />
    </div>
  );
};
