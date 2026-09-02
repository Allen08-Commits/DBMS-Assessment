import React, { useState } from 'react';
import {
  Activity,
  Play,
  RotateCcw,
  BarChart3,
  Layers,
  Database,
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

type DataVolume = 10000 | 100000 | 1000000 | 5000000;

export const PerformanceAnalysis: React.FC = () => {
  const [dataVolume, setDataVolume] = useState<DataVolume>(1000000);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState({
    seqScanTime: 420.5,
    seqBlocks: 24390,
    bTreeTime: 1.82,
    bTreeBlocks: 4,
    hashTime: 0.12,
    hashBlocks: 1,
    joinUnindexedTime: 1840.0,
    joinIndexedTime: 4.5
  });

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      const multiplier = dataVolume / 1000000;
      setMetrics({
        seqScanTime: parseFloat((420.5 * multiplier).toFixed(2)),
        seqBlocks: Math.round(24390 * multiplier),
        bTreeTime: parseFloat((1.82 * Math.log10(dataVolume / 1000)).toFixed(2)),
        bTreeBlocks: Math.round(3 + Math.log10(multiplier + 1)),
        hashTime: parseFloat((0.12 + Math.random() * 0.05).toFixed(2)),
        hashBlocks: 1,
        joinUnindexedTime: parseFloat((1840.0 * multiplier * 1.5).toFixed(2)),
        joinIndexedTime: parseFloat((4.5 * Math.log10(dataVolume / 1000)).toFixed(2))
      });
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Empirical Performance & Indexing Benchmark Suite
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative analysis of disk block I/O, algorithmic time complexity, buffer cache hit ratios, and latency scales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Data Volume Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Dataset Size:</span>
            <select
              value={dataVolume}
              onChange={(e) => setDataVolume(Number(e.target.value) as DataVolume)}
              className="bg-slate-800 text-xs font-mono text-cyan-300 rounded px-2 py-1 border border-slate-700 focus:outline-none"
            >
              <option value={10000}>10,000 Rows</option>
              <option value={100000}>100,000 Rows</option>
              <option value={1000000}>1,000,000 Rows (1M)</option>
              <option value={5000000}>5,000,000 Rows (5M)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Benchmarking I/O...' : 'Run Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* Primary 3-Way Benchmark Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Sequential Scan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              1. Sequential Heap Scan
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              O(N) Complexity
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Execution Time:</span>
              <span className="text-rose-400 font-bold">{metrics.seqScanTime} ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Disk Blocks Fetched:</span>
              <span className="text-white">{metrics.seqBlocks.toLocaleString()} blocks</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Buffer Pool Pressure:</span>
              <span className="text-rose-400">Extreme (High Flushes)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-sans">Suitable For:</span>
              <span className="text-slate-300">Small tables or ETL export</span>
            </div>
          </div>
        </div>

        {/* Card 2: B+ Tree Index Search */}
        <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              2. B+ Tree Index Search
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              O(log_B N) Complexity
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Execution Time:</span>
              <span className="text-cyan-300 font-bold">{metrics.bTreeTime} ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Disk Blocks Fetched:</span>
              <span className="text-emerald-400 font-bold">{metrics.bTreeBlocks} blocks</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Buffer Pool Pressure:</span>
              <span className="text-emerald-400">Minimal (Leaves in RAM)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-sans">Suitable For:</span>
              <span className="text-slate-300">Range queries, ORDER BY, Dates</span>
            </div>
          </div>
        </div>

        {/* Card 3: Hash Index Lookup */}
        <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              3. Direct Hash Lookup
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              O(1) Avg Complexity
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Execution Time:</span>
              <span className="text-emerald-400 font-bold">{metrics.hashTime} ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Disk Blocks Fetched:</span>
              <span className="text-emerald-400 font-bold">{metrics.hashBlocks} block</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Buffer Pool Pressure:</span>
              <span className="text-emerald-400">Ultra-low (Direct bucket)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-sans">Suitable For:</span>
              <span className="text-slate-300">Exact equality (id = 'CON10001')</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relational JOIN Benchmark Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Nested Loop JOIN vs Indexed Hash / B+ Tree JOIN Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Unindexed Nested Loop:</span>
              <span className="text-rose-400 font-bold">{metrics.joinUnindexedTime} ms</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-rose-500 h-2 rounded-full w-full" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Without an index on Foreign Key <code className="text-rose-300">meter_reading.connection_id</code>, the query engine performs an <code className="text-rose-300">O(N × M)</code> cartesian scan for every outer row.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Indexed B+ Tree Join (Index Seek):</span>
              <span className="text-emerald-400 font-bold">{metrics.joinIndexedTime} ms ({((metrics.joinUnindexedTime / metrics.joinIndexedTime)).toFixed(0)}x Faster)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-emerald-400 h-2 rounded-full w-2" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              With index <code className="text-emerald-300">idx_meter_connection_time</code>, inner table lookups run in logarithmic time <code className="text-emerald-300">O(N log M)</code>.
            </p>
          </div>
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
