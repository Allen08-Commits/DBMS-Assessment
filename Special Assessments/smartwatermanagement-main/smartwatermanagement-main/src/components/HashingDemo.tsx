import React, { useState } from 'react';
import {
  Binary,
  Layers,
  ArrowRight,
  Plus,
  AlertTriangle,
  CheckCircle,
  Hash,
  Database,
  RefreshCw,
  Zap,
  Sparkles
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

interface HashEntry {
  connection_id: string;
  consumer_name: string;
  zone: string;
}

interface HashingDemoProps {
  hashIndex?: any;
  onRefresh?: () => void;
}

export const HashingDemo: React.FC<HashingDemoProps> = () => {
  // Hash Buckets 0 to 9 with initial collision demonstration
  const [buckets, setBuckets] = useState<Record<number, HashEntry[]>>({
    0: [{ connection_id: 'CON10000', consumer_name: 'Metro Water Depot', zone: 'Zone A' }],
    1: [
      { connection_id: 'CON10001', consumer_name: 'Arjun Kumar', zone: 'Zone A' },
      { connection_id: 'CON10011', consumer_name: 'Vikram Mehta', zone: 'Zone B' }, // Collision
      { connection_id: 'CON10021', consumer_name: 'Sunrise Apartments', zone: 'Zone C' } // Collision
    ],
    2: [
      { connection_id: 'CON10002', consumer_name: 'Priya Sharma', zone: 'Zone B' },
      { connection_id: 'CON10012', consumer_name: 'Sunita Roy', zone: 'Zone A' } // Collision
    ],
    3: [{ connection_id: 'CON10003', consumer_name: 'Green Mall', zone: 'Zone A' }],
    4: [{ connection_id: 'CON10004', consumer_name: 'City Hospital', zone: 'Zone C' }],
    5: [{ connection_id: 'CON10005', consumer_name: 'Rohan Das', zone: 'Zone D' }],
    6: [{ connection_id: 'CON10006', consumer_name: 'Apex Industrial Estate', zone: 'Zone B' }],
    7: [{ connection_id: 'CON10007', consumer_name: 'Ananya Roy', zone: 'Zone A' }],
    8: [{ connection_id: 'CON10008', consumer_name: 'Heritage High School', zone: 'Zone C' }],
    9: [{ connection_id: 'CON10009', consumer_name: 'Kavita Nair', zone: 'Zone B' }]
  });

  const [inputConnId, setInputConnId] = useState('CON10031');
  const [inputName, setInputName] = useState('Central Library');
  const [inputZone, setInputZone] = useState('Zone D');
  const [searchKey, setSearchKey] = useState('CON10011');
  const [searchResult, setSearchResult] = useState<{
    bucket: number;
    steps: number;
    found: boolean;
    entry?: HashEntry;
  } | null>(null);

  // Compute hash helper
  const computeHash = (connId: string): { numPart: number; bucket: number } => {
    const digits = connId.replace(/\D/g, '');
    const numPart = digits ? parseInt(digits, 10) : 0;
    const bucket = numPart % 10;
    return { numPart, bucket };
  };

  // Metrics
  const entriesCount = Object.keys(buckets).reduce((sum, key) => sum + (buckets[Number(key)]?.length || 0), 0);
  const totalBuckets = 10;
  const loadFactor = (entriesCount / totalBuckets).toFixed(2);
  const maxChainLength = Object.keys(buckets).reduce((max, key) => Math.max(max, buckets[Number(key)]?.length || 0), 0);

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputConnId) return;

    const { bucket } = computeHash(inputConnId);
    const newEntry: HashEntry = {
      connection_id: inputConnId.toUpperCase(),
      consumer_name: inputName || 'Registered Consumer',
      zone: inputZone
    };

    setBuckets((prev) => ({
      ...prev,
      [bucket]: [...(prev[bucket] || []), newEntry]
    }));

    // Reset input with next suggested key
    const nextNum = parseInt(inputConnId.replace(/\D/g, '') || '10000', 10) + 10;
    setInputConnId(`CON${nextNum}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey) return;

    const { bucket } = computeHash(searchKey.toUpperCase());
    const chain = buckets[bucket] || [];
    let steps = 1; // 1 step to hash to bucket
    let found = false;
    let foundEntry: HashEntry | undefined;

    for (let i = 0; i < chain.length; i++) {
      steps++;
      if (chain[i].connection_id === searchKey.toUpperCase()) {
        found = true;
        foundEntry = chain[i];
        break;
      }
    }

    setSearchResult({
      bucket,
      steps,
      found,
      entry: foundEntry
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Binary className="w-5 h-5 text-cyan-600" />
          Direct Hashing & Collision Resolution (Modulo 10 & Separate Chaining)
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Demonstrating static hash indexing: h(numeric_part) = numeric_part MOD 10 with linked-list overflow bucket chaining.
        </p>
      </div>

      {/* Formula & Metrics Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 p-3.5 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-cyan-800 font-bold uppercase">
              Hash Function Definition
            </span>
            <div className="text-sm font-mono text-slate-900 font-bold">
              h(CON_ID) = extract_digits(CON_ID) MOD 10
            </div>
            <div className="text-xs text-slate-600">
              Example: <code className="text-cyan-800 font-bold font-mono">CON10001</code> → 10001 MOD 10 = 1 |{' '}
              <code className="text-amber-800 font-bold font-mono">CON10011</code> → 10011 MOD 10 = 1 (Collision)
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Load Factor (α = N / M)</span>
            <div className="text-xl font-mono font-bold text-emerald-600">{loadFactor}</div>
            <div className="text-[10px] text-slate-500">{entriesCount} entries across {totalBuckets} buckets</div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Max Chain Depth</span>
            <div className="text-xl font-mono font-bold text-amber-600">{maxChainLength} Nodes</div>
            <div className="text-[10px] text-slate-500">Separate chaining active</div>
          </div>
        </div>
      </div>

      {/* Interactive Controls: Search + Insert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Exact Key Search Test */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-600" />
            1. Search Key with Hash Lookup
          </h3>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              required
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="e.g. CON10011"
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Hash & Fetch
            </button>
          </form>

          {searchResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                searchResult.found
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-center justify-between font-mono font-bold">
                <span>
                  {searchResult.found ? '✓ Record Located via Hash Engine' : '✕ Key Not Found in Hash Table'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                  Target Bucket #{searchResult.bucket}
                </span>
              </div>
              {searchResult.found && searchResult.entry && (
                <div className="pt-1 text-[11px] text-slate-700 font-mono">
                  <div>Consumer: <strong className="text-slate-900 font-sans">{searchResult.entry.consumer_name}</strong></div>
                  <div>Zone: <strong className="text-slate-900 font-sans">{searchResult.entry.zone}</strong></div>
                  <div>Total Traversal Steps: <strong className="text-cyan-800">{searchResult.steps}</strong> (1 Hash Jump + {searchResult.steps - 1} Chain Link Ptrs)</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 2: Live Insert into Hash Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            2. Insert New Key (Trigger Collision Demo)
          </h3>

          <form onSubmit={handleInsert} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                required
                value={inputConnId}
                onChange={(e) => setInputConnId(e.target.value)}
                placeholder="CON10031"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
              />
            </div>
            <div>
              <input
                type="text"
                required
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Consumer Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Insert & Hash
              </button>
            </div>
          </form>

          <div className="text-[11px] text-slate-500">
            Tip: Inserting <code className="text-cyan-800 font-mono font-bold">CON10031</code> or <code className="text-cyan-800 font-mono font-bold">CON10041</code> will calculate hash 1, causing a separate-chain overflow link at Bucket 1!
          </div>
        </div>
      </div>

      {/* Visual Hash Bucket Table with Separate Chaining Linked Lists */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Hash className="w-4 h-4 text-cyan-600" />
            Hash Directory & Separate Chaining Linked List Visualization
          </h3>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            10 Primary Bucket Slots
          </span>
        </div>

        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, bucketIdx) => {
            const chain = buckets[bucketIdx] || [];

            return (
              <div
                key={bucketIdx}
                className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto"
              >
                {/* Bucket Header */}
                <div className="w-24 shrink-0 flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono">
                  <span className="font-bold text-cyan-800">Bucket #{bucketIdx}</span>
                  <span className="text-[10px] text-slate-500 font-bold">[{chain.length}]</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                {/* Linked Nodes in Separate Chain */}
                <div className="flex items-center gap-2 flex-1">
                  {chain.map((entry, nodeIdx) => (
                    <React.Fragment key={entry.connection_id}>
                      <div
                        className={`px-3 py-2 rounded-lg border text-xs font-mono shrink-0 transition-all ${
                          nodeIdx > 0
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-800">{entry.connection_id}</span>
                          {nodeIdx > 0 && (
                            <span className="text-[9px] px-1 rounded bg-amber-200 text-amber-900 font-sans font-bold">
                              Collision #{nodeIdx}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-600 truncate max-w-[140px] font-sans">
                          {entry.consumer_name} ({entry.zone})
                        </div>
                      </div>

                      {nodeIdx < chain.length - 1 && (
                        <span className="text-slate-400 font-mono text-xs shrink-0">→ link →</span>
                      )}
                    </React.Fragment>
                  ))}

                  {chain.length === 0 && (
                    <span className="text-xs text-slate-400 font-mono italic">NULL (Empty bucket slot)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison: B+ Tree Indexing vs. Hash Indexing */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            DBMS Comparative Analysis: B+ Tree vs. Hash Indexing
          </h3>
          <span className="text-[10px] font-mono text-slate-500 font-bold">Architectural Decision Factors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold w-48">Feature / Metric</th>
                <th className="px-4 py-3 font-bold text-cyan-800">B+ Tree Indexing</th>
                <th className="px-4 py-3 font-bold text-emerald-800">Hash Indexing</th>
                <th className="px-4 py-3 font-bold">Water Utility Application Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900">Exact Point Query (=)</td>
                <td className="px-4 py-3 font-mono text-cyan-800">O(log n) - Fast (3-4 I/Os)</td>
                <td className="px-4 py-3 font-mono text-emerald-700 font-bold">O(1) Avg - Instant (1 I/O)</td>
                <td className="px-4 py-3 text-slate-600">Hash is slightly faster for single consumer profile lookup.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900">Range Queries (&gt;, &lt;, BETWEEN)</td>
                <td className="px-4 py-3 font-mono text-cyan-800 font-bold">O(log n + k) - Highly Optimal</td>
                <td className="px-4 py-3 font-mono text-rose-700">O(N) - Inefficient / Unsupported</td>
                <td className="px-4 py-3 text-slate-600">B+ Tree is mandatory for time-series readings and billing intervals.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900">Ordering & Sorting (ORDER BY)</td>
                <td className="px-4 py-3 font-mono text-cyan-800">Natural (Leaf nodes are sorted)</td>
                <td className="px-4 py-3 font-mono text-rose-700">Requires Full Table Sort</td>
                <td className="px-4 py-3 text-slate-600">Eliminates explicit filesort overhead in MySQL engine.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900">Disk Storage Overhead</td>
                <td className="px-4 py-3 font-mono text-slate-600">Balanced tree nodes (moderate)</td>
                <td className="px-4 py-3 font-mono text-slate-600">Bucket directory + overflow chains</td>
                <td className="px-4 py-3 text-slate-600">B+ Tree handles dynamic growth gracefully without rehashing.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
