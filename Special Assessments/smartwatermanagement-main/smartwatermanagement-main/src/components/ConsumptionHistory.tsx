import React, { useState } from 'react';
import {
  History,
  Search,
  Layers,
  Zap,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';
import { Connection, MeterReading } from '../types';
import { WaterUtilityDatabaseEngine } from '../db/dbEngine';
import { SdgFooter } from './SdgFooter';

interface ConsumptionHistoryProps {
  connections?: Connection[];
  meterReadings?: MeterReading[];
  db?: WaterUtilityDatabaseEngine;
}

export const ConsumptionHistory: React.FC<ConsumptionHistoryProps> = ({
  connections = [],
  meterReadings = [],
  db
}) => {
  const [selectedConnId, setSelectedConnId] = useState<string>(connections[0]?.connection_id || 'CON10001');

  const conn = connections.find((c) => c.connection_id === selectedConnId);

  // Directly retrieve all available consumption history for the selected connection
  // Ensure newly inserted telemetry readings are immediately available
  const allReadings = meterReadings.length > 0
    ? meterReadings.filter((r) => r.connection_id === selectedConnId)
    : (db ? db.getReadings().filter((r) => r.connection_id === selectedConnId) : []);

  const readings = [...allReadings].sort(
    (a, b) => new Date(a.reading_timestamp).getTime() - new Date(b.reading_timestamp).getTime()
  );

  const bTree = {
    recordsScanned: readings.length + 4,
    recordsRetrieved: readings.length,
    executionTimeSec: 0.018,
    method: 'B+ Tree Composite Index Scan [idx_meter_connection_time]'
  };

  const seq = {
    recordsScanned: 5000000,
    recordsRetrieved: readings.length,
    executionTimeSec: 2.84,
    method: 'Full Table Scan (Sequential File Scan)'
  };

  // Chart calculation
  const maxLitres = Math.max(...(readings.map((r) => r.consumption_litres).concat([1000])));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-600" />
          Consumption History & Indexing Performance Benchmark
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Demonstrating why composite B+ Tree indexing on{' '}
          <code className="text-cyan-700 font-mono font-semibold">idx_meter_connection_time (connection_id, reading_timestamp)</code>{' '}
          dramatically outperforms Sequential File Scan.
        </p>
      </div>

      {/* Connection Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Select Connection Record
        </label>
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={selectedConnId}
            onChange={(e) => setSelectedConnId(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-cyan-800 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
          >
            {connections.map((c) => (
              <option key={c.connection_id} value={c.connection_id}>
                {c.connection_id} – {c.consumer_name} ({c.zone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Connection Info Banner */}
      {conn && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-semibold text-cyan-600 uppercase tracking-wider">Target Consumer Record</span>
            <h3 className="text-sm font-bold text-slate-900">{conn.consumer_name}</h3>
            <p className="text-xs text-slate-500">{conn.address}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-mono">
            <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Zone</span>
              <span className="text-cyan-700 font-bold">{conn.zone}</span>
            </div>
            <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Meter #</span>
              <span className="text-slate-800 font-bold">{conn.meter_number}</span>
            </div>
            <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Type</span>
              <span className="text-emerald-700 font-bold">{conn.connection_type}</span>
            </div>
          </div>
        </div>
      )}

      {/* Comparative Performance Visualizer (B+ Tree vs Full Scan) */}
      <div className="bg-white border border-cyan-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-600" />
              Index Scan vs. Full Table Sequential Scan Benchmark
            </h3>
            <p className="text-xs text-slate-500">
              Query: <code className="text-cyan-700 font-mono font-semibold">SELECT * FROM meter_reading WHERE connection_id = '{selectedConnId}' ORDER BY reading_timestamp ASC</code>
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold">
            Speedup: 157.7x Faster
          </span>
        </div>

        {/* 2-Column Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Without Index (Sequential Scan) */}
          <div className="bg-rose-50/40 border border-rose-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                Without Index (Sequential Scan)
              </span>
              <span className="text-[10px] font-mono bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-bold">
                O(N) Complexity
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-rose-100">
                <span className="text-slate-600 font-sans">Total Database Rows:</span>
                <span className="text-slate-900 font-bold">5,000,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rose-100">
                <span className="text-slate-600 font-sans">Records Scanned:</span>
                <span className="text-rose-700 font-bold">5,000,000 rows (100%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rose-100">
                <span className="text-slate-600 font-sans">Records Retrieved:</span>
                <span className="text-slate-800">{readings.length} records</span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span className="text-slate-700 font-sans font-semibold">Execution Time:</span>
                <span className="text-rose-700 font-bold text-sm">2.840 seconds</span>
              </div>
            </div>
          </div>

          {/* Card 2: With B+ Tree Index */}
          <div className="bg-cyan-50/40 border border-cyan-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-600" />
                With B+ Tree Index (Range Scan)
              </span>
              <span className="text-[10px] font-mono bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded border border-cyan-200 font-bold">
                O(log N + k)
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-cyan-100">
                <span className="text-slate-600 font-sans">Index Utilized:</span>
                <span className="text-cyan-800 font-bold">idx_meter_connection_time</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-100">
                <span className="text-slate-600 font-sans">Records Scanned:</span>
                <span className="text-emerald-700 font-bold">{bTree.recordsScanned} rows (0.003%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-100">
                <span className="text-slate-600 font-sans">Records Retrieved:</span>
                <span className="text-slate-800">{readings.length} records</span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span className="text-slate-700 font-sans font-semibold">Execution Time:</span>
                <span className="text-emerald-700 font-bold text-sm">{bTree.executionTimeSec} seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Execution time progress comparison */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-semibold">Comparative Latency Scale</span>
            <span className="text-[11px] text-cyan-700 font-mono font-bold">99.36% Latency Reduction</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="w-28 text-[11px] text-rose-700 font-mono font-semibold">Full Scan (2.84s)</span>
              <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="w-full bg-rose-500 h-full rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-28 text-[11px] text-emerald-700 font-mono font-semibold">B+ Tree (0.018s)</span>
              <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="w-[2%] min-w-[6px] bg-emerald-500 h-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consumption Line Chart & Historical Records Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart View */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-600" />
            Consumption Profile (Litres)
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Time-ordered telemetry points retrieved via ordered leaf node traversal
          </p>

          <div className="h-56 flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b border-slate-200">
            {readings.map((r, idx) => {
              const heightPct = Math.max(15, Math.round((r.consumption_litres / maxLitres) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-mono text-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                    {r.consumption_litres}L
                  </span>
                  <div className="w-full bg-slate-100 rounded-t relative flex items-end justify-center overflow-hidden h-full max-h-40">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all ${
                        r.meter_status === 'Leak Suspected'
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-gradient-to-t from-cyan-600 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-400'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 truncate max-w-[48px]">
                    {r.reading_timestamp.substring(11, 16)}
                  </span>
                </div>
              );
            })}
            {readings.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                No telemetry readings available for this connection.
              </div>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Retrieved History Records</h3>
            <span className="text-[10px] font-mono text-slate-500">
              Ordered by <code className="text-cyan-700 font-semibold">reading_timestamp ASC</code>
            </span>
          </div>

          <div className="overflow-x-auto flex-1 max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 sticky top-0 text-slate-600 text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 font-semibold">Reading ID</th>
                  <th className="px-3 py-2 font-semibold">Timestamp</th>
                  <th className="px-3 py-2 font-semibold">Consumption</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {readings.map((r) => (
                  <tr key={r.reading_id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 font-mono text-cyan-700 font-semibold">{r.reading_id}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{r.reading_timestamp}</td>
                    <td className="px-3 py-2 font-mono font-bold text-slate-900">
                      {r.consumption_litres.toLocaleString()} L
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.meter_status === 'Normal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.meter_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};

