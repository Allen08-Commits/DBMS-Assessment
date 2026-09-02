import React from 'react';
import {
  Users,
  AlertTriangle,
  Receipt,
  CreditCard,
  MessageSquareWarning,
  Activity,
  Droplets,
  Layers,
  ShieldCheck,
  Zap,
  TrendingUp,
  Gauge,
  CheckCircle2,
  ArrowUpRight,
  Terminal,
  Cpu,
  SearchCode,
  FileCode2,
  GitFork,
  Sliders,
  BarChart3
} from 'lucide-react';
import { Connection, MeterReading, Bill, Payment, Complaint } from '../types';
import { NavTab } from './Sidebar';
import { SdgFooter } from './SdgFooter';
import { WaterUtilityDatabaseEngine } from '../db/dbEngine';

interface DashboardProps {
  db?: WaterUtilityDatabaseEngine;
  connections: Connection[];
  meterReadings?: MeterReading[];
  readings?: MeterReading[];
  bills: Bill[];
  payments?: Payment[];
  complaints: Complaint[];
  leaksCount?: number;
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  db,
  connections = [],
  meterReadings = [],
  readings = [],
  bills = [],
  payments = [],
  complaints = [],
  leaksCount = 14,
  onNavigate
}) => {
  const activeReadings = meterReadings.length > 0 ? meterReadings : readings;
  const totalActive = connections.filter((c) => c.status === 'Active').length || 19;
  const totalOutstanding = bills
    .filter((b) => (b.bill_status === 'UNPAID' || b.bill_status === 'PARTIALLY PAID') && (b.due_amount || 0) > 0)
    .reduce((acc, b) => acc + (Number(b.due_amount) || 0), 0);
  const unpaidCount = bills.filter((b) => (b.bill_status === 'UNPAID' || b.bill_status === 'PARTIALLY PAID') && (b.due_amount || 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* 4 Primary Top Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Connections */}
        <div
          onClick={() => onNavigate('connections')}
          className="bg-white rounded-xl shadow-2xs border border-slate-200 p-5 transition-all hover:shadow-xs hover:border-cyan-500/50 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Connections
              </p>
              <Users className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">2,045,112</p>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+1.2% this month ({totalActive} active in sample)</span>
          </p>
        </div>

        {/* Card 2: Leak Alerts */}
        <div
          onClick={() => onNavigate('leak-detection')}
          className="bg-white rounded-xl shadow-2xs border border-slate-200 p-5 transition-all hover:shadow-xs hover:border-rose-500/50 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Leak Alerts
              </p>
              <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-rose-600 mt-2">14 Active</p>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-medium">
            Zone A: 4 • Zone C: 10 <span className="text-rose-500 font-semibold">(HAVING &gt; 1.5x)</span>
          </p>
        </div>

        {/* Card 3: Avg Query Time */}
        <div
          onClick={() => onNavigate('query-optimization')}
          className="bg-white rounded-xl shadow-2xs border border-slate-200 p-5 transition-all hover:shadow-xs hover:border-cyan-500/50 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Avg Query Time
              </p>
              <Zap className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-600 mt-2">0.018s</p>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span>Optimized with B+ Tree Index</span>
          </p>
        </div>

        {/* Card 4: Outstanding Invoices */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-white rounded-xl shadow-2xs border border-slate-200 p-5 transition-all hover:shadow-xs hover:border-amber-500/50 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Outstanding Balance
              </p>
              <CreditCard className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
              {totalOutstanding === 0
                ? '₹0'
                : totalOutstanding >= 10000000
                ? `₹${(totalOutstanding / 10000000).toFixed(2)}Cr`
                : totalOutstanding >= 1000000
                ? `₹${(totalOutstanding / 1000000).toFixed(2)}M`
                : `₹${totalOutstanding.toLocaleString()}`}
            </p>
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-3">
            {unpaidCount} {unpaidCount === 1 ? 'Bill' : 'Bills'} unpaid in current cycle
          </p>
        </div>
      </div>

      {/* Middle Bento Grid Section: Performance Analysis (7 Cols) & Live ACID Console (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Query Performance Analysis (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-2xs border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-600" />
                  Query Performance Analysis (B+ Tree vs Full Scan)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Comparative I/O cost over 5,000,000 telemetry records
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('query-optimization')}
                className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700 underline"
              >
                Inspect Plan →
              </button>
            </div>

            <div className="space-y-4">
              {/* Full Scan Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Full Table Scan (Unindexed)</span>
                  <span className="text-rose-600 font-mono">5,000,000 Rows Scanned (2.84s)</span>
                </div>
                <div className="relative h-9 bg-slate-100 rounded-lg border border-dashed border-slate-300 overflow-hidden">
                  <div className="h-full bg-rose-200/90 w-full rounded-lg flex items-center px-3">
                    <span className="text-[10px] font-bold text-rose-800 truncate">
                      Seq Scan on meter_reading • Cost: 124,500.00 disk blocks
                    </span>
                  </div>
                </div>
              </div>

              {/* B+ Tree Index Scan Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>B+ Tree Index Scan (Composite Key)</span>
                  <span className="text-cyan-600 font-mono">180 Rows Examined (0.018s)</span>
                </div>
                <div className="relative h-9 bg-slate-100 rounded-lg border border-dashed border-slate-300 overflow-hidden flex items-center">
                  <div className="h-full bg-cyan-400 w-[8%] min-w-[24px] rounded-lg" />
                  <span className="ml-3 text-[10px] font-bold text-cyan-800">
                    Index Range Scan (idx_meter_conn_time) • 99.3% Latency Reduction
                  </span>
                </div>
              </div>

              {/* EXPLAIN ANALYZE OUTPUT */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  EXPLAIN ANALYZE OUTPUT:
                </p>
                <div className="bg-slate-900 text-cyan-300 font-mono text-[10px] sm:text-[11px] p-3.5 rounded-xl leading-relaxed border border-slate-800 overflow-x-auto">
                  <span className="text-purple-400">-&gt;</span> Index Range Scan using <span className="text-amber-300">idx_meter_connection_time</span> on meter_reading (cost=0.43..8.50 rows=180 width=24)<br />
                  <span className="text-purple-400">-&gt;</span> Filter: (reading_timestamp &gt;= '2026-08-01')<br />
                  <span className="text-emerald-400">-&gt;</span> Rows examined: 180 | Execution time: 18.2ms | Buffer Pool Hits: 100%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live ACID Transaction Console (col-span-5) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl shadow-2xs p-5 text-white overflow-hidden flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live ACID Transaction Console
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                READY
              </span>
            </div>

            <div className="space-y-2 font-mono text-[11px] text-slate-300">
              <div className="text-slate-500">[21:42:01] SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;</div>
              <div className="text-cyan-400">[21:42:01] START TRANSACTION;</div>
              <div className="text-slate-200">
                [21:42:02] SELECT * FROM connection WHERE connection_id = 'CON10001' FOR UPDATE;
              </div>
              <div className="text-amber-400">[21:42:02] SAVEPOINT bill_check;</div>
              <div className="text-slate-200">
                [21:42:03] INSERT INTO bill (conn_id, amount) VALUES ('CON10001', 450.00);
              </div>
              <div className="text-emerald-400 font-bold">[21:42:03] COMMIT;</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Concurrency Shield Active
            </p>
            <p className="text-[11px] text-slate-300 italic">
              Duplicate bill generation prevented via <code className="text-cyan-300 font-mono">UNIQUE(connection_id, billing_month)</code> and pessimistic row locks.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bento Grid Section: Hash Lookup (4 Cols) & Recent Transactions Table (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hash Lookup Visualization (col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-2xs border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-600" />
                Hash Lookup Visualization
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('hashing-demo')}
                className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700"
              >
                Open Demo →
              </button>
            </div>

            {/* Buckets Bar Visualization */}
            <div className="flex gap-2 items-end h-20 mb-3 pt-4 px-1">
              <div className="flex-1 bg-slate-100 rounded-t-md h-8 relative flex items-end justify-center">
                <span className="absolute -top-4 text-[9px] font-bold text-slate-500">B0</span>
              </div>
              <div className="flex-1 bg-cyan-500 rounded-t-md h-16 relative flex items-end justify-center shadow-xs">
                <span className="absolute -top-4 text-[9px] font-bold text-cyan-700">B1</span>
              </div>
              <div className="flex-1 bg-slate-100 rounded-t-md h-6 relative flex items-end justify-center">
                <span className="absolute -top-4 text-[9px] font-bold text-slate-500">B2</span>
              </div>
              <div className="flex-1 bg-slate-100 rounded-t-md h-10 relative flex items-end justify-center">
                <span className="absolute -top-4 text-[9px] font-bold text-slate-500">B3</span>
              </div>
              <div className="flex-1 bg-slate-200 rounded-t-md h-5 relative flex items-end justify-center">
                <span className="absolute -top-4 text-[9px] font-bold text-slate-500">B4</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-700 font-mono mt-3">
              Hash(CON10021) = 10021 MOD 10 = Bucket 1
            </p>
            <p className="text-[11px] text-slate-500 italic mt-1">
              Separate Chaining: CON10001 → CON10011 → CON10021
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Load Factor (α):</span>
            <span className="font-mono font-bold text-emerald-600">0.80 (Optimal)</span>
          </div>
        </div>

        {/* Right: Recent Billing Operations History Table (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-2xs border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-600" />
                Recent Billing Operations (Transaction History)
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('billing')}
                className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700"
              >
                View Ledger →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase">
                    <th className="pb-2.5">CONN_ID</th>
                    <th className="pb-2.5">BILL_MONTH</th>
                    <th className="pb-2.5">AMOUNT</th>
                    <th className="pb-2.5">ACCESS METHOD</th>
                    <th className="pb-2.5">ISOLATION</th>
                    <th className="pb-2.5 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-cyan-600">CON10001</td>
                    <td className="py-2.5">2026-08</td>
                    <td className="py-2.5 font-mono font-semibold">₹450.00</td>
                    <td className="py-2.5 text-slate-500">Index-Sequential</td>
                    <td className="py-2.5 font-mono text-[11px]">Serializable</td>
                    <td className="py-2.5 text-right">
                      <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        COMMITTED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-cyan-600">CON10005</td>
                    <td className="py-2.5">2026-08</td>
                    <td className="py-2.5 font-mono font-semibold">₹2,100.00</td>
                    <td className="py-2.5 text-slate-500">Full Scan</td>
                    <td className="py-2.5 font-mono text-[11px]">Read Committed</td>
                    <td className="py-2.5 text-right">
                      <span className="bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        ROLLED BACK
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-cyan-600">CON10012</td>
                    <td className="py-2.5">2026-08</td>
                    <td className="py-2.5 font-mono font-semibold">₹120.00</td>
                    <td className="py-2.5 text-slate-500">Hash Lookup</td>
                    <td className="py-2.5 font-mono text-[11px]">Repeatable Read</td>
                    <td className="py-2.5 text-right">
                      <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        COMMITTED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Bento Navigation Grid for all Academic DBMS Modules */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600" />
            DBMS Interactive Exploration Modules
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Special Academic Assessment</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('btree-visualizer')}
            className="p-3.5 bg-slate-50 hover:bg-cyan-50/60 border border-slate-200 hover:border-cyan-300 rounded-xl text-left transition-all group"
          >
            <div className="text-[10px] font-mono text-cyan-600 font-bold uppercase">Index Tree</div>
            <div className="text-xs font-bold text-slate-800 mt-1 group-hover:text-cyan-700">
              B+ Tree Indexing
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Order-4 Leaf Traversal</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('hashing-demo')}
            className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group"
          >
            <div className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Direct Access</div>
            <div className="text-xs font-bold text-slate-800 mt-1 group-hover:text-emerald-700">
              Modulo 10 Hash
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Separate Chaining</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('query-optimization')}
            className="p-3.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group"
          >
            <div className="text-[10px] font-mono text-indigo-600 font-bold uppercase">Query Engine</div>
            <div className="text-xs font-bold text-slate-800 mt-1 group-hover:text-indigo-700">
              Optimization
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Scan vs Range Index</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('concurrency')}
            className="p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-all group"
          >
            <div className="text-[10px] font-mono text-amber-600 font-bold uppercase">Locking Lab</div>
            <div className="text-xs font-bold text-slate-800 mt-1 group-hover:text-amber-700">
              Concurrency Lab
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Lost Updates & Races</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('acid-sandbox')}
            className="p-3.5 bg-slate-50 hover:bg-rose-50/60 border border-slate-200 hover:border-rose-300 rounded-xl text-left transition-all group"
          >
            <div className="text-[10px] font-mono text-rose-600 font-bold uppercase">ACID Controls</div>
            <div className="text-xs font-bold text-slate-800 mt-1 group-hover:text-rose-700">
              ACID Sandbox
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Savepoints & Rollback</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('validation-tests')}
            className="p-3.5 bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all group"
          >
            <div className="text-[10px] font-mono text-teal-600 font-bold uppercase">Test Suite</div>
            <div className="text-xs font-bold text-slate-800 mt-1 group-hover:text-teal-700">
              Validation Suite
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Automated Test Cases</div>
          </button>
        </div>
      </div>

      {/* Universal Bento Footer */}
      <SdgFooter />
    </div>
  );
};
