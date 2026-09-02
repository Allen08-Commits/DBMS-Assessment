import React, { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  CheckCircle,
  AlertCircle,
  Building,
  Home,
  Factory,
  GraduationCap,
  Eye,
  X,
  Gauge,
  Receipt
} from 'lucide-react';
import { Connection, Zone, ConnectionType, ConnectionStatus, MeterReading, Bill } from '../types';
import { SdgFooter } from './SdgFooter';
import { WaterUtilityDatabaseEngine } from '../db/dbEngine';

interface ConnectionManagementProps {
  connections: Connection[];
  readings?: MeterReading[];
  bills?: Bill[];
  db?: WaterUtilityDatabaseEngine;
  onRefresh?: () => void;
  onAddConnection?: (conn: Omit<Connection, 'created_at'>) => { success: boolean; message: string };
}

export const ConnectionManagement: React.FC<ConnectionManagementProps> = ({
  connections = [],
  readings = [],
  bills = [],
  db,
  onRefresh,
  onAddConnection
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  // Form State for Add Connection
  const [formData, setFormData] = useState({
    connection_id: '',
    consumer_name: '',
    connection_type: 'Household' as ConnectionType,
    zone: 'Zone A' as Zone,
    address: '',
    meter_number: '',
    status: 'Active' as ConnectionStatus
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Filtering
  const filteredConnections = (connections || []).filter((conn) => {
    const matchesSearch =
      conn.connection_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.consumer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.meter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesZone = selectedZone === 'ALL' || conn.zone === selectedZone;
    const matchesType = selectedType === 'ALL' || conn.connection_type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || conn.status === selectedStatus;

    return matchesSearch && matchesZone && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    const nextNum = (connections.length + 10001).toString();
    setFormData({
      connection_id: `CON${nextNum}`,
      consumer_name: '',
      connection_type: 'Household',
      zone: 'Zone A',
      address: '',
      meter_number: `MTR-A-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Active'
    });
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.connection_id || !formData.consumer_name || !formData.address || !formData.meter_number) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (onAddConnection) {
      const res = onAddConnection(formData);
      if (!res.success) {
        setFormError(res.message);
        return;
      }
    } else if (db) {
      const res = db.insertConnection(formData);
      if (!res.success) {
        setFormError(res.message);
        return;
      }
      if (onRefresh) onRefresh();
    }

    setFormSuccess('Connection inserted successfully into relational database.');
    setTimeout(() => {
      setIsAddModalOpen(false);
    }, 900);
  };

  const getTypeIcon = (type: ConnectionType) => {
    switch (type) {
      case 'Household':
        return <Home className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Commercial':
        return <Building className="w-3.5 h-3.5 text-amber-600" />;
      case 'Industrial':
        return <Factory className="w-3.5 h-3.5 text-purple-600" />;
      case 'Institutional':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Suspended
          </span>
        );
      case 'Disconnected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Disconnected
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Pending
          </span>
        );
    }
  };

  // Connected records for detail modal
  const effectiveReadings = (db ? db.meterReadings : readings) || [];
  const effectiveBills = (db ? db.bills : bills) || [];

  const connReadings = selectedConnection
    ? (effectiveReadings || []).filter((r) => r.connection_id === selectedConnection.connection_id)
    : [];
  const connBills = selectedConnection
    ? (effectiveBills || []).filter((b) => b.connection_id === selectedConnection.connection_id)
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            Water Connection Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relational table: <code className="text-cyan-700 font-mono font-semibold">CONNECTION</code> with Primary Key <code className="text-cyan-700 font-mono font-semibold">connection_id</code>
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Connection (INSERT)</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Consumer Name, Meter #, Address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
          />
        </div>

        {/* Zone Filter */}
        <div>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Zones</option>
            <option value="Zone A">Zone A</option>
            <option value="Zone B">Zone B</option>
            <option value="Zone C">Zone C</option>
            <option value="Zone D">Zone D</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Connection Types</option>
            <option value="Household">Household</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Institutional">Institutional</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Disconnected">Disconnected</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Connections Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <span className="text-xs font-semibold text-slate-600">
            Showing <strong className="text-cyan-700 font-mono">{filteredConnections.length}</strong> of{' '}
            <strong className="text-slate-800 font-mono">{connections.length}</strong> loaded connections
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Engine: Index on PRIMARY (connection_id)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Connection ID</th>
                <th className="px-4 py-3 font-semibold">Consumer Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Zone</th>
                <th className="px-4 py-3 font-semibold">Meter Number</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredConnections.map((conn) => (
                <tr
                  key={conn.connection_id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedConnection(conn)}
                >
                  <td className="px-4 py-3 font-mono font-bold text-cyan-700 whitespace-nowrap">
                    {conn.connection_id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {conn.consumer_name}
                    <div className="text-[10px] text-slate-500 truncate max-w-xs">{conn.address}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {getTypeIcon(conn.connection_type)}
                      {conn.connection_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">{conn.zone}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                    {conn.meter_number}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(conn.status)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConnection(conn);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200 text-slate-600 transition-all cursor-pointer"
                      title="View relational details & linked telemetry"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredConnections.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No water connections found matching your search query or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Connection (INSERT) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-600" />
                Register New Water Connection (SQL INSERT)
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Connection ID (PK)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.connection_id}
                    onChange={(e) => setFormData({ ...formData, connection_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-cyan-700 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Meter Number (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.meter_number}
                    onChange={(e) => setFormData({ ...formData, meter_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Consumer / Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra / Tech Space"
                  value={formData.consumer_name}
                  onChange={(e) => setFormData({ ...formData, consumer_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Connection Type
                  </label>
                  <select
                    value={formData.connection_type}
                    onChange={(e) =>
                      setFormData({ ...formData, connection_type: e.target.value as ConnectionType })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Household">Household</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Institutional">Institutional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) =>
                      setFormData({ ...formData, zone: e.target.value as Zone })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                    <option value="Zone D">Zone D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Service Address
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Plot / Flat, Building, Street, Landmark"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs"
                >
                  Execute INSERT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Relational Details for Selected Connection */}
      {selectedConnection && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[10px] font-mono text-cyan-600 font-bold">1 → MANY Relational Inspection</div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  {selectedConnection.consumer_name}
                  <span className="font-mono text-xs text-cyan-700 font-normal">
                    ({selectedConnection.connection_id})
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConnection(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection Spec Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Zone / District</span>
                <span className="font-bold text-slate-800 font-mono">{selectedConnection.zone}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Connection Type</span>
                <span className="font-bold text-slate-800">{selectedConnection.connection_type}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Meter Serial Number</span>
                <span className="font-bold text-cyan-700 font-mono">{selectedConnection.meter_number}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Account Status</span>
                <span className="font-bold text-emerald-600">{selectedConnection.status}</span>
              </div>
            </div>

            {/* Linked Telemetry Readings (1 -> Many) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-600" />
                Linked Meter Readings (METER_READING 1 → MANY)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-mono">
                    <tr>
                      <th className="px-3 py-1.5">Reading ID</th>
                      <th className="px-3 py-1.5">Timestamp</th>
                      <th className="px-3 py-1.5">Consumption (L)</th>
                      <th className="px-3 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {connReadings.slice(0, 5).map((r) => (
                      <tr key={r.reading_id} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-mono text-cyan-700">{r.reading_id}</td>
                        <td className="px-3 py-1.5 font-mono text-[11px]">{r.reading_timestamp}</td>
                        <td className="px-3 py-1.5 font-mono font-bold text-slate-900">{r.consumption_litres} L</td>
                        <td className="px-3 py-1.5">{r.meter_status}</td>
                      </tr>
                    ))}
                    {connReadings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-center text-slate-400 text-xs">
                          No meter readings logged yet for this connection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Linked Invoices (1 -> Many) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Linked Invoices & Bills (BILL 1 → MANY)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-mono">
                    <tr>
                      <th className="px-3 py-1.5">Bill ID</th>
                      <th className="px-3 py-1.5">Month</th>
                      <th className="px-3 py-1.5">Units (kL)</th>
                      <th className="px-3 py-1.5">Amount</th>
                      <th className="px-3 py-1.5">Due Amount</th>
                      <th className="px-3 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {connBills.map((b) => (
                      <tr key={b.bill_id} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-mono text-indigo-600">{b.bill_id}</td>
                        <td className="px-3 py-1.5 font-mono">{b.billing_month}</td>
                        <td className="px-3 py-1.5 font-mono">{b.units_consumed}</td>
                        <td className="px-3 py-1.5 font-mono font-bold text-slate-900">₹{b.amount}</td>
                        <td className="px-3 py-1.5 font-mono text-amber-600">₹{b.due_amount}</td>
                        <td className="px-3 py-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              b.bill_status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {b.bill_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {connBills.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-center text-slate-400 text-xs">
                          No bills generated yet for this connection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedConnection(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-semibold"
              >
                Close Relational View
              </button>
            </div>
          </div>
        </div>
      )}

      <SdgFooter />
    </div>
  );
};
