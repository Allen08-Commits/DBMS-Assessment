import React, { useState } from 'react';
import {
  Gauge,
  Search,
  Plus,
  Zap,
  AlertTriangle,
  X
} from 'lucide-react';
import { MeterReading, MeterStatus, Connection } from '../types';
import { WaterUtilityDatabaseEngine } from '../db/dbEngine';
import { SdgFooter } from './SdgFooter';

interface MeterReadingsProps {
  readings?: MeterReading[];
  meterReadings?: MeterReading[];
  connections?: Connection[];
  db?: WaterUtilityDatabaseEngine;
  onRefresh?: () => void;
  onAddReading?: (reading: Omit<MeterReading, 'reading_id' | 'reading_timestamp'>) => void;
}

export const MeterReadings: React.FC<MeterReadingsProps> = ({
  readings = [],
  meterReadings = [],
  connections = [],
  db,
  onRefresh,
  onAddReading
}) => {
  const activeReadings = (meterReadings && meterReadings.length > 0)
    ? meterReadings
    : (readings && readings.length > 0)
    ? readings
    : (db ? db.meterReadings : []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Simulated Reading Form
  const [formConnId, setFormConnId] = useState(connections[0]?.connection_id || 'CON10001');
  const [formLitres, setFormLitres] = useState(260);
  const [formStatus, setFormStatus] = useState<MeterStatus>('Normal');

  // Filter Readings
  const startTime = performance.now();
  const filteredReadings = (activeReadings || []).filter((r) => {
    const matchesSearch =
      r.connection_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reading_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'ALL' || r.zone === selectedZone;
    const matchesStatus = selectedStatus === 'ALL' || r.meter_status === selectedStatus;
    const matchesDate = !selectedDate || r.reading_timestamp.startsWith(selectedDate);
    return matchesSearch && matchesZone && matchesStatus && matchesDate;
  });
  const executionTimeMs = Number((performance.now() - startTime).toFixed(3));

  // Query performance indicators
  const totalRecordsInDb = 5000000; // Simulated large database
  const recordsScanned = searchTerm ? filteredReadings.length + 8 : (activeReadings?.length || 0);
  const executionTimeSec = (0.008 + (recordsScanned / 100000)).toFixed(4);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const conn = (connections || []).find((c) => c.connection_id === formConnId);
    const readingData = {
      connection_id: formConnId,
      consumption_litres: Number(formLitres),
      meter_status: formStatus,
      zone: conn ? conn.zone : 'Zone A'
    };

    if (onAddReading) {
      onAddReading(readingData);
    } else if (db) {
      db.insertMeterReading(readingData);
      if (onRefresh) onRefresh();
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-600" />
            Smart-Meter Hourly Telemetry Readings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relational table: <code className="text-cyan-700 font-mono font-semibold">METER_READING</code> with Composite Index{' '}
            <code className="text-cyan-700 font-mono font-semibold">idx_meter_connection_time (connection_id, reading_timestamp)</code>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Simulate Meter Reading</span>
        </button>
      </div>

      {/* Query Execution Metrics Banner (Bento Metric Strip) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border-r border-slate-100 pr-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
            Total Telemetry Records
          </span>
          <span className="text-base font-bold text-slate-900 font-mono">
            {totalRecordsInDb.toLocaleString()}
          </span>
          <span className="text-[10px] text-cyan-700 font-medium block mt-0.5">{readings.length} Active in Buffer</span>
        </div>

        <div className="border-r border-slate-100 pr-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
            Records Scanned
          </span>
          <span className="text-base font-bold text-emerald-600 font-mono">
            {recordsScanned}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">B+ Tree Index Scan</span>
        </div>

        <div className="border-r border-slate-100 pr-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
            Query Execution Time
          </span>
          <span className="text-base font-bold text-cyan-700 font-mono">
            {executionTimeSec}s
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Client Latency: {executionTimeMs}ms</span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
            Active Index Scan
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-indigo-700 font-semibold truncate">
            <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">idx_meter_connection_time</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Connection ID (e.g. CON10001)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          />
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
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

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Meter Statuses</option>
            <option value="Normal">Normal</option>
            <option value="Leak Suspected">Leak Suspected</option>
            <option value="Faulty">Faulty</option>
            <option value="High Flow">High Flow</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <span className="text-xs font-semibold text-slate-600">
            Displaying <strong className="text-cyan-700 font-mono">{filteredReadings.length}</strong> smart readings
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Composite Index Scan Active
          </span>
        </div>

        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 sticky top-0 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">Reading ID</th>
                <th className="px-4 py-3 font-semibold">Connection ID</th>
                <th className="px-4 py-3 font-semibold">Zone</th>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Consumption</th>
                <th className="px-4 py-3 font-semibold">Meter Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReadings.map((reading) => (
                <tr key={reading.reading_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-700 font-semibold">{reading.reading_id}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{reading.connection_id}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{reading.zone}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {reading.reading_timestamp}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {reading.consumption_litres.toLocaleString()} Litres
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        reading.meter_status === 'Normal'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : reading.meter_status === 'Leak Suspected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                          : reading.meter_status === 'High Flow'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {reading.meter_status === 'Leak Suspected' && <AlertTriangle className="w-2.5 h-2.5" />}
                      {reading.meter_status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredReadings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No meter readings match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Simulate Meter Reading Insertion */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-600" />
                Simulate Telemetry Insertion
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Connection ID
                </label>
                <select
                  value={formConnId}
                  onChange={(e) => setFormConnId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-cyan-700 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {connections.map((c) => (
                    <option key={c.connection_id} value={c.connection_id}>
                      {c.connection_id} – {c.consumer_name} ({c.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Consumption (Litres)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formLitres}
                  onChange={(e) => setFormLitres(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Meter Status Flag
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as MeterStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Leak Suspected">Leak Suspected (High Spike)</option>
                  <option value="High Flow">High Flow</option>
                  <option value="Faulty">Faulty (Zero flow anomaly)</option>
                </select>
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
                  Insert Reading
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
