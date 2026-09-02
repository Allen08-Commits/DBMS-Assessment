import React, { useState } from 'react';
import {
  FolderTree,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Layers,
  Binary,
  ArrowRight,
  Database,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

export const FileOrganization: React.FC = () => {
  const [activeSimulation, setActiveSimulation] = useState<'exact' | 'range' | 'batch'>('range');

  const fileOrgComparison = [
    {
      method: 'Sequential File Organization',
      mechanism: 'Linear scan of data blocks from head to tail until target record or EOF is reached.',
      complexity: 'O(n) for search; O(1) append',
      complexityBadge: 'text-rose-400 bg-rose-950/70 border-rose-800',
      advantages: 'Simple structure, zero indexing storage overhead, high efficiency for complete sequential batch processing.',
      disadvantages: 'Prohibitively slow random lookups on large volumes (5M records require 5M block scans); expensive random insertions/deletions.',
      bestUse: 'Audit log append files, monthly bulk payroll/billing dumps, raw archived sensor streams.'
    },
    {
      method: 'Indexed Sequential File Organization',
      mechanism: 'Multi-level ordered index (B+ Tree) pointing to ordered data pages on disk, linked via leaf pointers.',
      complexity: 'O(log n) for single key; O(log n + k) for range scans',
      complexityBadge: 'text-cyan-400 bg-cyan-950/70 border-cyan-800 font-bold',
      advantages: 'Supports both rapid single-record point search AND high-speed ordered range traversals via sequential leaf node pointers.',
      disadvantages: 'Requires index maintenance overhead on INSERT/UPDATE; additional disk space for internal index nodes.',
      bestUse: 'Time-series smart meter readings, consumption history, financial transaction ledgers with date range filters.'
    },
    {
      method: 'Direct / Hashed File Organization',
      mechanism: 'Mathematical hash function maps primary key directly to bucket/block address on disk.',
      complexity: 'Average O(1) for exact key lookup; Worst case O(n) on collisions',
      complexityBadge: 'text-emerald-400 bg-emerald-950/70 border-emerald-800 font-bold',
      advantages: 'Instantaneous direct record retrieval with zero index traversal depth; optimal for point-query caching.',
      disadvantages: 'Completely incapable of range queries (e.g. `BETWEEN date1 AND date2`); requires collision resolution (separate chaining / open addressing).',
      bestUse: 'Consumer master record cache, latest meter reading lookup, active session tokens.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-cyan-400" />
          File Organization Comparison & Storage Strategy
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Evaluating physical file structures: Sequential vs. Indexed-Sequential (B+ Tree) vs. Direct/Hashed storage engines.
        </p>
      </div>

      {/* Selected Storage Strategy Callout Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Selected Storage Strategy
            </div>
            <h3 className="text-xl font-bold text-white">
              Indexed-Sequential File Organization (B+ Tree Engine)
            </h3>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              <strong className="text-cyan-300 font-semibold">Architectural Rationale:</strong> Smart-water utility operations require both 
              <span className="text-white font-semibold"> connection-wise retrieval</span> (e.g., fetching a consumer's ledger) and 
              <span className="text-white font-semibold"> timestamp range queries</span> (e.g., past 7 days consumption, monthly billing cycles, and leak detection intervals). 
              Hashed files fail on range queries, while Sequential files are too slow at $O(n)$. Indexed-Sequential provides the optimal balance of $O(\log n)$ random lookup and ordered leaf scan.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-cyan-800 rounded-xl p-3 text-xs font-mono text-cyan-200 shrink-0 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Composite Index Deployed</div>
            <div className="font-bold text-white">idx_meter_connection_time</div>
            <div className="text-emerald-400 text-[11px]">(connection_id, reading_timestamp)</div>
          </div>
        </div>
      </div>

      {/* Comprehensive Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            DBMS Storage Methodology Matrix
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Complexity & Trade-off Evaluation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold w-48">Method</th>
                <th className="px-4 py-3 font-semibold">Search Mechanism</th>
                <th className="px-4 py-3 font-semibold w-40">Typical Complexity</th>
                <th className="px-4 py-3 font-semibold">Advantages</th>
                <th className="px-4 py-3 font-semibold">Disadvantages</th>
                <th className="px-4 py-3 font-semibold">Best Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {fileOrgComparison.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors align-top">
                  <td className="px-4 py-3.5 font-bold text-white">
                    {item.method}
                    {item.method.includes('Indexed') && (
                      <span className="block mt-1 text-[10px] text-cyan-400 font-mono font-normal">
                        ★ Selected Engine
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 leading-relaxed">{item.mechanism}</td>
                  <td className="px-4 py-3.5 font-mono">
                    <span className={`px-2 py-0.5 rounded border text-[11px] ${item.complexityBadge}`}>
                      {item.complexity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-emerald-300/90 leading-relaxed">{item.advantages}</td>
                  <td className="px-4 py-3.5 text-rose-300/90 leading-relaxed">{item.disadvantages}</td>
                  <td className="px-4 py-3.5 text-slate-300 leading-relaxed">{item.bestUse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Workload Suitability Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Interactive Workload Simulator: Why Strategy Matters
            </h3>
            <p className="text-xs text-slate-400">
              Select a municipal database query workload to inspect the physical I/O cost under each file structure:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSimulation('exact')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSimulation === 'exact'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              1. Point Lookup (Single ID)
            </button>
            <button
              type="button"
              onClick={() => setActiveSimulation('range')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSimulation === 'range'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              2. Date Range Query (7-Day Log)
            </button>
            <button
              type="button"
              onClick={() => setActiveSimulation('batch')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSimulation === 'batch'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              3. Full Batch Billing Export
            </button>
          </div>
        </div>

        {/* Results for Active Workload */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Sequential */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Sequential File</span>
              <span className="text-[10px] font-mono text-rose-400">O(n)</span>
            </div>
            <div className="text-xs text-slate-400">
              {activeSimulation === 'exact' && 'Scans 2,500,000 blocks on average before finding key. Extremely high disk latency.'}
              {activeSimulation === 'range' && 'Must read all 5,000,000 blocks to filter timestamp window. Completely impractical for real-time dashboards.'}
              {activeSimulation === 'batch' && 'Optimal throughput! Reads blocks contiguously without index traversal overhead.'}
            </div>
            <div className="pt-2 font-mono text-xs text-slate-300">
              Est. Disk Cost:{' '}
              <strong className={activeSimulation === 'batch' ? 'text-emerald-400' : 'text-rose-400'}>
                {activeSimulation === 'exact' ? '2.5M I/O (~2.5s)' : activeSimulation === 'range' ? '5.0M I/O (~2.84s)' : '100k Contiguous I/O (~0.8s)'}
              </strong>
            </div>
          </div>

          {/* Indexed Sequential */}
          <div className="p-4 bg-slate-950/70 border border-cyan-800/80 rounded-xl space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300">Indexed Sequential (B+ Tree)</span>
              <span className="text-[10px] font-mono text-cyan-400">O(log n + k)</span>
            </div>
            <div className="text-xs text-slate-400">
              {activeSimulation === 'exact' && 'Traverses 3 index tree levels to reach leaf node. Fast and predictable (~3-4 page reads).'}
              {activeSimulation === 'range' && 'BEST FIT: Locates starting date in 3 reads, then traverses ordered leaf sibling pointers directly to end date.'}
              {activeSimulation === 'batch' && 'Very efficient: Leaf linked list allows contiguous scanning of entire dataset in sorted order.'}
            </div>
            <div className="pt-2 font-mono text-xs text-slate-300">
              Est. Disk Cost:{' '}
              <strong className="text-emerald-400">
                {activeSimulation === 'exact' ? '3 Tree Reads + 1 Data Read (~0.008s)' : activeSimulation === 'range' ? '3 Tree Reads + 42 Leaf Reads (~0.018s)' : 'Ordered Leaf Traversal (~0.9s)'}
              </strong>
            </div>
          </div>

          {/* Direct / Hashed */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300">Direct / Hashed</span>
              <span className="text-[10px] font-mono text-emerald-400">O(1) Avg</span>
            </div>
            <div className="text-xs text-slate-400">
              {activeSimulation === 'exact' && 'FASTEST: Computes hash(ID) MOD 10 and jumps directly to bucket address. Single I/O operation.'}
              {activeSimulation === 'range' && 'FATAL FLAW: Hash functions randomize key positions; impossible to perform range scans without scanning all buckets.'}
              {activeSimulation === 'batch' && 'Requires full bucket sweep; data is unordered so sorting is required.'}
            </div>
            <div className="pt-2 font-mono text-xs text-slate-300">
              Est. Disk Cost:{' '}
              <strong className={activeSimulation === 'range' ? 'text-rose-400' : 'text-emerald-400'}>
                {activeSimulation === 'exact' ? '1 Direct Bucket Read (~0.004s)' : activeSimulation === 'range' ? 'NOT SUPPORTED (Requires Full Scan)' : 'Full Hash Bucket Sweep (~1.2s)'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
