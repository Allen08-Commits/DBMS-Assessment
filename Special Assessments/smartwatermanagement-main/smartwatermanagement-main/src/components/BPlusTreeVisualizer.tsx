import React, { useState } from 'react';
import {
  Network,
  Layers,
  ArrowRight,
  ArrowDown,
  Database,
  Search,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

interface BPlusTreeVisualizerProps {
  bTree?: any;
  onRefresh?: () => void;
}

export const BPlusTreeVisualizer: React.FC<BPlusTreeVisualizerProps> = () => {
  const [selectedKey, setSelectedKey] = useState<string>('CON10003');
  const [isTraversing, setIsTraversing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const sampleKeys = ['CON10001', 'CON10002', 'CON10003', 'CON10004', 'CON10005', 'CON10006', 'CON10007', 'CON10008'];

  const secondaryIndexes = [
    {
      name: 'idx_meter_zone_time',
      sql: 'CREATE INDEX idx_meter_zone_time ON meter_reading(zone, reading_timestamp);',
      purpose: 'Geographic and zone-wide telemetry aggregation & leak detection queries within 7-day windows.'
    },
    {
      name: 'idx_bill_connection_month',
      sql: 'CREATE INDEX idx_bill_connection_month ON bill(connection_id, billing_month);',
      purpose: 'Accelerates duplicate billing cycle checks and previous-reading lookups during month-end invoicing.'
    },
    {
      name: 'idx_complaint_connection',
      sql: 'CREATE INDEX idx_complaint_connection ON complaint(connection_id);',
      purpose: 'Enables instant retrieval of open service tickets and history for customer support operators.'
    }
  ];

  const handleSimulateTraversal = (key: string) => {
    setSelectedKey(key);
    setIsTraversing(true);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 600);
    setTimeout(() => setActiveStep(3), 1200);
    setTimeout(() => {
      setActiveStep(4);
      setIsTraversing(false);
    }, 1800);
  };

  // Determine active nodes based on selected key
  const isLeftSubtree = ['CON10001', 'CON10002', 'CON10003', 'CON10004'].includes(selectedKey);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          B+ Tree Composite Indexing Architecture
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Deep visual inspection of the multi-level balanced B+ Tree structure powering time-series meter telemetry.
        </p>
      </div>

      {/* Main Composite Index Header Card */}
      <div className="bg-slate-900 border border-cyan-800/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Primary Telemetry Index Specification
            </span>
            <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">
              CREATE INDEX idx_meter_connection_time ON meter_reading(connection_id, reading_timestamp);
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select key to traverse:</span>
            <select
              value={selectedKey}
              onChange={(e) => handleSimulateTraversal(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {sampleKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleSimulateTraversal(selectedKey)}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Trace Path</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white font-semibold">Why B+ Tree?</strong> In a standard B-Tree, keys and data pointers reside at all levels. In a 
          <strong className="text-cyan-400"> B+ Tree</strong>, all real data pointers are strictly stored in the 
          <strong className="text-white"> leaf nodes</strong>, while internal nodes store only routing keys. Furthermore, leaf nodes are linked in a continuous 
          <strong className="text-emerald-400"> doubly linked list</strong>. This enables $O(\log n)$ tree traversal to find the start of a date window, followed by fast sequential pointer traversal for range scans.
        </p>
      </div>

      {/* Visual B+ Tree Node Representation */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8 relative overflow-hidden">
        {/* Tree Traversal Status Indicator */}
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
          <span className="text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            B+ Tree Height: <strong className="text-white font-mono">3 Levels (Root → Internal → Leaves)</strong>
          </span>
          <span className="text-cyan-300 font-mono">
            {activeStep === 0 && 'Select a key above to trace traversal path'}
            {activeStep === 1 && `Step 1: Inspecting ROOT NODE router for '${selectedKey}'...`}
            {activeStep === 2 && `Step 2: Routing to ${isLeftSubtree ? 'LEFT' : 'RIGHT'} INTERNAL NODE...`}
            {activeStep === 3 && `Step 3: Pointing to ordered LEAF PAGE containing '${selectedKey}'...`}
            {activeStep === 4 && `Step 4: Target located! Traversing sibling pointers for range query.`}
          </span>
        </div>

        {/* Level 1: Root Node */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
            Level 1: Root Node
          </span>
          <div
            className={`px-6 py-3 rounded-xl border-2 transition-all duration-500 text-center font-mono ${
              activeStep >= 1
                ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 scale-105'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-[10px] text-cyan-400 font-bold mb-1">Router Key: [ CON10005 ]</div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className={isLeftSubtree && activeStep >= 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                &lt; CON10005 (Left)
              </span>
              <span className="text-slate-600">|</span>
              <span className={!isLeftSubtree && activeStep >= 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                ≥ CON10005 (Right)
              </span>
            </div>
          </div>

          {/* Connector arrow */}
          <div className="text-slate-600 flex items-center justify-center">
            <ArrowDown className="w-5 h-5 text-cyan-500/70" />
          </div>
        </div>

        {/* Level 2: Internal Routing Nodes */}
        <div className="space-y-2">
          <div className="text-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
              Level 2: Internal Index Nodes (Branching Factor: 2)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Internal Node Left */}
            <div
              className={`p-3.5 rounded-xl border-2 transition-all duration-500 font-mono text-center space-y-1.5 ${
                isLeftSubtree && activeStep >= 2
                  ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-md scale-105'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-70'
              }`}
            >
              <div className="text-[10px] text-cyan-400 font-bold">Internal Node A [ CON10003 ]</div>
              <div className="flex justify-around text-xs">
                <span className={selectedKey <= 'CON10002' && activeStep >= 2 ? 'text-cyan-300 font-bold' : ''}>
                  [&lt; CON10003]
                </span>
                <span className="text-slate-600">|</span>
                <span className={selectedKey >= 'CON10003' && selectedKey < 'CON10005' && activeStep >= 2 ? 'text-cyan-300 font-bold' : ''}>
                  [≥ CON10003]
                </span>
              </div>
            </div>

            {/* Internal Node Right */}
            <div
              className={`p-3.5 rounded-xl border-2 transition-all duration-500 font-mono text-center space-y-1.5 ${
                !isLeftSubtree && activeStep >= 2
                  ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-md scale-105'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-70'
              }`}
            >
              <div className="text-[10px] text-cyan-400 font-bold">Internal Node B [ CON10007 ]</div>
              <div className="flex justify-around text-xs">
                <span className={selectedKey >= 'CON10005' && selectedKey <= 'CON10006' && activeStep >= 2 ? 'text-cyan-300 font-bold' : ''}>
                  [&lt; CON10007]
                </span>
                <span className="text-slate-600">|</span>
                <span className={selectedKey >= 'CON10007' && activeStep >= 2 ? 'text-cyan-300 font-bold' : ''}>
                  [≥ CON10007]
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level 3: Leaf Nodes (Ordered Linked List) */}
        <div className="space-y-3 pt-2">
          <div className="text-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
              Level 3: Leaf Nodes (Ordered Data Pages Linked with Next/Prev Pointers)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Leaf 1 */}
            <div
              className={`p-3 rounded-xl border-2 transition-all duration-500 font-mono space-y-2 relative ${
                ['CON10001', 'CON10002'].includes(selectedKey) && activeStep >= 3
                  ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-lg scale-105'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Leaf Page #101</span>
                <span className="text-cyan-400">→ #102</span>
              </div>
              <div className="space-y-1">
                {['CON10001', 'CON10002'].map((k) => (
                  <div
                    key={k}
                    className={`px-2 py-1 rounded text-xs flex justify-between ${
                      selectedKey === k && activeStep >= 3
                        ? 'bg-emerald-500 text-slate-950 font-bold animate-pulse'
                        : 'bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span>{k}</span>
                    <span className="text-[10px] opacity-75">RowID Ptr</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaf 2 */}
            <div
              className={`p-3 rounded-xl border-2 transition-all duration-500 font-mono space-y-2 relative ${
                ['CON10003', 'CON10004'].includes(selectedKey) && activeStep >= 3
                  ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-lg scale-105'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Leaf Page #102</span>
                <span className="text-cyan-400">→ #103</span>
              </div>
              <div className="space-y-1">
                {['CON10003', 'CON10004'].map((k) => (
                  <div
                    key={k}
                    className={`px-2 py-1 rounded text-xs flex justify-between ${
                      selectedKey === k && activeStep >= 3
                        ? 'bg-emerald-500 text-slate-950 font-bold animate-pulse'
                        : 'bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span>{k}</span>
                    <span className="text-[10px] opacity-75">RowID Ptr</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaf 3 */}
            <div
              className={`p-3 rounded-xl border-2 transition-all duration-500 font-mono space-y-2 relative ${
                ['CON10005', 'CON10006'].includes(selectedKey) && activeStep >= 3
                  ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-lg scale-105'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Leaf Page #103</span>
                <span className="text-cyan-400">→ #104</span>
              </div>
              <div className="space-y-1">
                {['CON10005', 'CON10006'].map((k) => (
                  <div
                    key={k}
                    className={`px-2 py-1 rounded text-xs flex justify-between ${
                      selectedKey === k && activeStep >= 3
                        ? 'bg-emerald-500 text-slate-950 font-bold animate-pulse'
                        : 'bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span>{k}</span>
                    <span className="text-[10px] opacity-75">RowID Ptr</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaf 4 */}
            <div
              className={`p-3 rounded-xl border-2 transition-all duration-500 font-mono space-y-2 relative ${
                ['CON10007', 'CON10008'].includes(selectedKey) && activeStep >= 3
                  ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-lg scale-105'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Leaf Page #104</span>
                <span className="text-slate-600">EOF (Null)</span>
              </div>
              <div className="space-y-1">
                {['CON10007', 'CON10008'].map((k) => (
                  <div
                    key={k}
                    className={`px-2 py-1 rounded text-xs flex justify-between ${
                      selectedKey === k && activeStep >= 3
                        ? 'bg-emerald-500 text-slate-950 font-bold animate-pulse'
                        : 'bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span>{k}</span>
                    <span className="text-[10px] opacity-75">RowID Ptr</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Range scans traverse the green leaf node arrows directly without returning to root.
            </span>
            <span className="font-mono text-[11px] text-emerald-400 font-bold">O(log n + k) Range Cost</span>
          </div>
        </div>
      </div>

      {/* Secondary Indexes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Other Supporting Secondary B+ Tree Indexes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {secondaryIndexes.map((idxItem, i) => (
            <div key={i} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono">{idxItem.name}</div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-300 break-words">
                {idxItem.sql}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{idxItem.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
