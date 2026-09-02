import React, { useState } from 'react';
import {
  AlertTriangle,
  Play,
  FileCode2,
  Send,
  MessageSquareWarning,
  PlusCircle,
  CheckCircle,
  Activity,
  Zap
} from 'lucide-react';
import { Connection, MeterReading, LeakAlert } from '../types';
import { WaterUtilityDatabaseEngine } from '../db/dbEngine';
import { SdgFooter } from './SdgFooter';

interface LeakDetectionProps {
  db: WaterUtilityDatabaseEngine;
  connections?: Connection[];
  readings?: MeterReading[];
  onRefresh?: () => void;
  onDispatchCrew?: (alert: LeakAlert) => void;
  onCreateComplaintFromLeak?: (alert: LeakAlert) => void;
  onNavigate?: (tab: any) => void;
}

export const LeakDetection: React.FC<LeakDetectionProps> = ({
  db,
  connections = [],
  readings = [],
  onRefresh,
  onDispatchCrew,
  onCreateComplaintFromLeak,
  onNavigate
}) => {
  const [alerts, setAlerts] = useState<LeakAlert[]>(() => db.detectLeaks());
  const [isRunning, setIsRunning] = useState(false);
  const [lastExecuted, setLastExecuted] = useState<string>(new Date().toLocaleTimeString());
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);
  const [ticketCreatedId, setTicketCreatedId] = useState<string | null>(null);

  // Simulation State
  const [simConnId, setSimConnId] = useState<string>(connections.length > 0 ? connections[0].connection_id : 'CON10001');
  const [simLitres, setSimLitres] = useState<number>(2400);
  const [simStatusMsg, setSimStatusMsg] = useState<string | null>(null);

  const handleRunQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      const freshAlerts = db.detectLeaks();
      setAlerts(freshAlerts);
      setIsRunning(false);
      setLastExecuted(new Date().toLocaleTimeString());
    }, 350);
  };

  const handleInjectSpike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simConnId || simLitres <= 0) return;

    const res = db.insertMeterReading(simConnId, simLitres, 'SIMULATOR', 'Leak Suspected');
    if (res.success) {
      setSimStatusMsg(`Successfully injected ${simLitres}L spike on ${simConnId}.`);
      if (onRefresh) onRefresh();
      // Immediately re-evaluate
      setTimeout(() => {
        const freshAlerts = db.detectLeaks();
        setAlerts(freshAlerts);
        setLastExecuted(new Date().toLocaleTimeString());
      }, 150);
      setTimeout(() => setSimStatusMsg(null), 4000);
    } else {
      setSimStatusMsg(`Error: ${res.message}`);
    }
  };

  const handleDispatch = (alert: LeakAlert) => {
    if (onDispatchCrew) {
      onDispatchCrew(alert);
    }
    setDispatchedId(alert.connection_id);
    setTimeout(() => setDispatchedId(null), 3000);
  };

  const handleCreateTicket = (alert: LeakAlert) => {
    if (onCreateComplaintFromLeak) {
      onCreateComplaintFromLeak(alert);
    } else {
      db.createComplaint({
        connection_id: alert.connection_id,
        complaint_type: 'Leak',
        description: `Automated Leak Detection Alert: Peak flow ${alert.current_consumption} L (${alert.increase_percent}% above baseline ${alert.avg_consumption} L). High priority field inspection requested.`,
        priority: alert.risk_level === 'Critical' ? 'Critical' : 'High',
        status: 'Open'
      });
      setTicketCreatedId(alert.connection_id);
      setTimeout(() => setTicketCreatedId(null), 3000);
      if (onRefresh) onRefresh();
      if (onNavigate) {
        onNavigate('complaints');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Automated Leak Detection & Anomaly Pipeline
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            SQL Aggregation & Filtering Engine: Combining <code className="text-cyan-800 font-mono font-bold">AVG()</code>,{' '}
            <code className="text-cyan-800 font-mono font-bold">MAX()</code>, <code className="text-cyan-800 font-mono font-bold">GROUP BY</code>, and{' '}
            <code className="text-cyan-800 font-mono font-bold">HAVING</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunQuery}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Executing HAVING Query...' : 'Run Leak Detection Query'}</span>
        </button>
      </div>

      {/* Interactive Anomaly Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Simulate Smart Meter Telemetry Spike
          </span>
          <span className="text-[10px] font-mono text-slate-500">Injects real reading into DBMS</span>
        </div>

        <form onSubmit={handleInjectSpike} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Connection</label>
            <select
              value={simConnId}
              onChange={(e) => setSimConnId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              {(connections.length > 0 ? connections : db.getAllConnections()).map((c) => (
                <option key={c.connection_id} value={c.connection_id}>
                  {c.connection_id} - {c.consumer_name} ({c.zone})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Spike Consumption (Litres)</label>
            <input
              type="number"
              min="100"
              max="50000"
              value={simLitres}
              onChange={(e) => setSimLitres(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inject Spike & Re-evaluate</span>
            </button>
          </div>
        </form>

        {simStatusMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{simStatusMsg}</span>
          </div>
        )}
      </div>

      {/* SQL Specification & Concept Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-600" />
            Active Relational Aggregation Query
          </span>
          <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded font-bold">
            Last Executed: {lastExecuted}
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
          <span className="text-purple-400">SELECT</span> <br />
          &nbsp;&nbsp;connection_id, <br />
          &nbsp;&nbsp;<span className="text-amber-300">AVG</span>(consumption_litres) <span className="text-purple-400">AS</span> avg_consumption, <br />
          &nbsp;&nbsp;<span className="text-amber-300">MAX</span>(consumption_litres) <span className="text-purple-400">AS</span> peak_consumption, <br />
          &nbsp;&nbsp;<span className="text-amber-300">SUM</span>(consumption_litres) <span className="text-purple-400">AS</span> total_consumption <br />
          <span className="text-purple-400">FROM</span> meter_reading <br />
          <span className="text-purple-400">WHERE</span> reading_timestamp &gt;= <span className="text-emerald-300">NOW</span>() - <span className="text-purple-400">INTERVAL</span> 7 <span className="text-purple-400">DAY</span> <br />
          <span className="text-purple-400">GROUP BY</span> connection_id <br />
          <span className="text-purple-400 font-bold">HAVING</span> peak_consumption &gt; 1.4 * avg_consumption;
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-semibold">DBMS Concept:</strong> <code className="text-cyan-800 font-semibold font-mono">WHERE</code> filters rows *before* aggregation, pruning telemetry older than 7 days using the composite index. Then, <code className="text-cyan-800 font-semibold font-mono">GROUP BY</code> groups telemetry by consumer. Finally, <code className="text-cyan-800 font-semibold font-mono">HAVING</code> filters the aggregated groups, isolating any connection whose peak consumption exceeds 140% of their 7-day average baseline.
        </p>
      </div>

      {/* Leak Alerts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Identified Leak & Burst Anomalies ({alerts.length} Flagged)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold">
            Threshold: &gt; 1.4x Baseline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold">Connection ID</th>
                <th className="px-4 py-3 font-bold">Consumer</th>
                <th className="px-4 py-3 font-bold">Zone</th>
                <th className="px-4 py-3 font-bold">Avg Baseline</th>
                <th className="px-4 py-3 font-bold">Peak Flow</th>
                <th className="px-4 py-3 font-bold">Anomaly Spike</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {alerts.map((alert) => (
                <tr key={alert.connection_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-cyan-800">
                    {alert.connection_id}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">{alert.consumer_name}</td>
                  <td className="px-4 py-3.5">{alert.zone}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">
                    {alert.avg_consumption} L
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-rose-600">
                    {alert.current_consumption} L
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        +{alert.increase_percent}%
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          alert.risk_level === 'Critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : alert.risk_level === 'High'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                        }`}
                      >
                        {alert.risk_level}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCreateTicket(alert)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                        title="Auto-generate service complaint ticket"
                      >
                        <MessageSquareWarning className="w-3.5 h-3.5 text-amber-600" />
                        <span>{ticketCreatedId === alert.connection_id ? 'Ticket Created' : 'Ticket'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDispatch(alert)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{dispatchedId === alert.connection_id ? 'Dispatched!' : 'Dispatch Crew'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No active leak anomalies detected. All meters operating within standard moving averages.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
