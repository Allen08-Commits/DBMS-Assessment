import React, { useState } from 'react';
import {
  Zap,
  Play,
  Layers,
  Database,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Clock,
  CheckCircle2,
  FileCode2
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

export const QueryOptimization: React.FC = () => {
  const [selectedConn, setSelectedConn] = useState('CON10001');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-07');
  const [isIndexEnabled, setIsIndexEnabled] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastStats, setLastStats] = useState<{
    method: string;
    type: string;
    keyUsed: string;
    rowsScanned: number;
    rowsReturned: number;
    timeSec: number;
    cost: number;
  }>({
    method: 'B+ Tree Composite Range Scan',
    type: 'range',
    keyUsed: 'idx_meter_connection_time',
    rowsScanned: 168,
    rowsReturned: 168,
    timeSec: 0.018,
    cost: 34.2
  });

  const handleExecuteQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      if (isIndexEnabled) {
        setLastStats({
          method: 'B+ Tree Composite Range Scan',
          type: 'range',
          keyUsed: 'idx_meter_connection_time',
          rowsScanned: 168,
          rowsReturned: 168,
          timeSec: 0.018,
          cost: 34.2
        });
      } else {
        setLastStats({
          method: 'Sequential Full Table Scan',
          type: 'ALL',
          keyUsed: 'NULL (None)',
          rowsScanned: 5000000,
          rowsReturned: 168,
          timeSec: 2.84,
          cost: 512400.0
        });
      }
      setIsExecuting(false);
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-600" />
            Query Processing & Optimization Engine
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Relational Cost-Based Optimizer (CBO): Evaluating index selectivity, page I/O, and buffer-pool scan heuristics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExecuteQuery}
          disabled={isExecuting}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
          <span>{isExecuting ? 'Optimizing & Running...' : 'Execute & Analyze Plan'}</span>
        </button>
      </div>

      {/* Query Formulation Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-600" />
            Benchmark Query
          </span>

          {/* Toggle Index */}
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-700 font-medium">B+ Tree Index:</span>
            <button
              type="button"
              onClick={() => setIsIndexEnabled(!isIndexEnabled)}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                isIndexEnabled
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {isIndexEnabled ? 'ENABLED (idx_meter_connection_time)' : 'DISABLED (Force Full Table Scan)'}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-200 overflow-x-auto">
          <span className="text-purple-400">SELECT</span> * <br />
          <span className="text-purple-400">FROM</span> meter_reading <br />
          <span className="text-purple-400">WHERE</span> connection_id = <span className="text-emerald-300">'{selectedConn}'</span> <br />
          &nbsp;&nbsp;<span className="text-purple-400">AND</span> reading_timestamp &gt;= <span className="text-emerald-300">'{startDate} 00:00:00'</span> <br />
          &nbsp;&nbsp;<span className="text-purple-400">AND</span> reading_timestamp &lt;= <span className="text-emerald-300">'{endDate} 23:59:59'</span>;
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Connection ID</label>
            <input
              type="text"
              value={selectedConn}
              onChange={(e) => setSelectedConn(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Execution Results Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Without Index */}
        <div className={`p-5 rounded-xl border transition-all ${!isIndexEnabled ? 'bg-white border-rose-300 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-80'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <span>Without Composite Index</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold">
              Access Type: ALL (Full Table Scan)
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Index Used:</span>
              <span className="text-rose-600 font-bold">NULL (None)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Total Database Rows:</span>
              <span className="text-slate-900 font-semibold">5,000,000</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Rows Scanned:</span>
              <span className="text-rose-600 font-bold">5,000,000 (100%)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Filter Selectivity:</span>
              <span className="text-rose-600">0.00336% (Extremely Wasteful)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Optimizer Cost Estimate:</span>
              <span className="text-rose-600 font-bold">512,400.00 units</span>
            </div>
            <div className="flex justify-between py-2 pt-3">
              <span className="text-slate-800 font-sans font-bold">Execution Time:</span>
              <span className="text-rose-600 font-bold text-base">2.840 seconds</span>
            </div>
          </div>
        </div>

        {/* With B+ Tree Composite Index */}
        <div className={`p-5 rounded-xl border transition-all ${isIndexEnabled ? 'bg-white border-cyan-400 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-80'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-cyan-800 flex items-center gap-1.5">
              <span>With B+ Tree Composite Index</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold">
              Access Type: range (Indexed B+ Tree)
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Index Used:</span>
              <span className="text-cyan-800 font-bold">idx_meter_connection_time</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Total Database Rows:</span>
              <span className="text-slate-900 font-semibold">5,000,000</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Rows Scanned:</span>
              <span className="text-emerald-600 font-bold">168 (0.00336%)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Filter Selectivity:</span>
              <span className="text-emerald-600 font-bold">100.0% (Zero Wasted I/O)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-sans">Optimizer Cost Estimate:</span>
              <span className="text-emerald-600 font-bold">34.20 units (14,982x lower)</span>
            </div>
            <div className="flex justify-between py-2 pt-3">
              <span className="text-slate-800 font-sans font-bold">Execution Time:</span>
              <span className="text-emerald-600 font-bold text-base">0.018 seconds (157.7x Faster)</span>
            </div>
          </div>
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
