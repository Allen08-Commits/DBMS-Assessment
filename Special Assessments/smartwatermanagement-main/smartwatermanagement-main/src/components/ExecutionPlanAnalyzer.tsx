import React, { useState } from 'react';
import {
  SearchCode,
  FileCode2,
  Layers,
  Zap,
  Info,
  CheckCircle,
  AlertTriangle,
  Database
} from 'lucide-react';
import { ExplainRow } from '../types';
import { SdgFooter } from './SdgFooter';

interface QueryOption {
  id: string;
  title: string;
  sql: string;
  category: string;
  explain: ExplainRow[];
  commentary: string;
}

export const ExecutionPlanAnalyzer: React.FC = () => {
  const queryOptions: QueryOption[] = [
    {
      id: 'q1',
      title: 'Query 1: Consumption History 7-Day Range Scan',
      category: 'Indexed Range Scan',
      sql: `EXPLAIN SELECT * FROM meter_reading 
WHERE connection_id = 'CON10001' 
  AND reading_timestamp BETWEEN '2026-08-01' AND '2026-08-07';`,
      explain: [
        {
          id: 1,
          select_type: 'SIMPLE',
          table: 'meter_reading',
          type: 'range',
          possible_keys: 'idx_meter_connection_time, idx_meter_reading_date',
          key: 'idx_meter_connection_time',
          key_len: '74',
          ref: 'const, const',
          rows: 168,
          filtered: 100.0,
          Extra: 'Using index condition; Using MRR'
        }
      ],
      commentary:
        "The Cost-Based Optimizer selects 'idx_meter_connection_time' with 'range' access. Multi-Range Read (MRR) minimizes random disk seeks by sorting row pointers before data block access."
    },
    {
      id: 'q2',
      title: 'Query 2: Leak Detection Telemetry Grouping & Anomaly Filter',
      category: 'Aggregation & Index Pushdown',
      sql: `EXPLAIN SELECT connection_id, AVG(consumption_litres), MAX(consumption_litres)
FROM meter_reading
WHERE reading_timestamp >= NOW() - INTERVAL 7 DAY
GROUP BY connection_id
HAVING MAX(consumption_litres) > 1.4 * AVG(consumption_litres);`,
      explain: [
        {
          id: 1,
          select_type: 'SIMPLE',
          table: 'meter_reading',
          type: 'range',
          possible_keys: 'idx_meter_reading_date, idx_meter_connection_time',
          key: 'idx_meter_reading_date',
          key_len: '8',
          ref: 'const',
          rows: 1240,
          filtered: 100.0,
          Extra: 'Using index condition; Using temporary; Using filesort'
        }
      ],
      commentary:
        "MySQL uses 'idx_meter_reading_date' to filter recent 7-day readings first, then constructs an in-memory hash temporary table to compute AVG and MAX aggregates per group before applying the HAVING clause."
    },
    {
      id: 'q3',
      title: 'Query 3: Duplicate Monthly Invoicing Uniqueness Check',
      category: 'Unique Point Lookup',
      sql: `EXPLAIN SELECT bill_id, due_amount FROM bill 
WHERE connection_id = 'CON10001' AND billing_month = '2026-08';`,
      explain: [
        {
          id: 1,
          select_type: 'SIMPLE',
          table: 'bill',
          type: 'const',
          possible_keys: 'uk_connection_month, idx_bill_connection_month',
          key: 'uk_connection_month',
          key_len: '38',
          ref: 'const, const',
          rows: 1,
          filtered: 100.0,
          Extra: 'Using index'
        }
      ],
      commentary:
        "Optimal 'const' lookup. The UNIQUE constraint 'uk_connection_month' guarantees at most 1 matching row in the B+ Tree index. Reading completes with zero table access (Covering Index)."
    },
    {
      id: 'q4',
      title: 'Query 4: Unindexed Wildcard Filter (Worst Case)',
      category: 'Full Table Scan (Degraded)',
      sql: `EXPLAIN SELECT * FROM connection 
WHERE address LIKE '%Main Road%';`,
      explain: [
        {
          id: 1,
          select_type: 'SIMPLE',
          table: 'connection',
          type: 'ALL',
          possible_keys: 'NULL',
          key: 'NULL',
          key_len: 'NULL',
          ref: 'NULL',
          rows: 2000000,
          filtered: 11.11,
          Extra: 'Using where'
        }
      ],
      commentary:
        "Leading wildcard '%Main Road%' prevents B+ Tree prefix traversal, forcing the storage engine into an expensive 'ALL' Full Table Scan across all 2M connection records."
    }
  ];

  const [activeQueryId, setActiveQueryId] = useState('q1');
  const activeQuery = queryOptions.find((q) => q.id === activeQueryId) || queryOptions[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <SearchCode className="w-5 h-5 text-cyan-600" />
          MySQL Query Execution Plan Analyzer (EXPLAIN Engine)
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Standard relational diagnostic tool: Inspecting join types, chosen index keys, row estimates, and optimizer filter efficiency.
        </p>
      </div>

      {/* Query Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {queryOptions.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setActiveQueryId(q.id)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeQueryId === q.id
                ? 'bg-cyan-50 border-cyan-400 text-slate-900 shadow-2xs font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span
              className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                q.category.includes('Degraded')
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : q.category.includes('Unique')
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
              }`}
            >
              {q.category}
            </span>
            <div className="text-xs font-bold text-slate-900 mt-1.5">{q.title}</div>
          </button>
        ))}
      </div>

      {/* Active Query SQL Statement */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-600" />
            Active Relational SQL Statement
          </span>
          <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded font-bold">
            MySQL 8.0 InnoDB Plan
          </span>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap">
          {activeQuery.sql}
        </div>
      </div>

      {/* Official MySQL EXPLAIN Output Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            EXPLAIN Tabular Diagnostic Matrix
          </h3>
          <span className="text-[10px] font-mono text-slate-500 font-bold">1 Row in Plan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 font-bold">id</th>
                <th className="px-3 py-3 font-bold">select_type</th>
                <th className="px-3 py-3 font-bold">table</th>
                <th className="px-3 py-3 font-bold">type</th>
                <th className="px-3 py-3 font-bold">possible_keys</th>
                <th className="px-3 py-3 font-bold">key</th>
                <th className="px-3 py-3 font-bold">key_len</th>
                <th className="px-3 py-3 font-bold">ref</th>
                <th className="px-3 py-3 font-bold">rows</th>
                <th className="px-3 py-3 font-bold">filtered</th>
                <th className="px-3 py-3 font-bold">Extra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeQuery.explain.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 text-cyan-800 font-bold">{row.id}</td>
                  <td className="px-3 py-3">{row.select_type}</td>
                  <td className="px-3 py-3 font-bold text-slate-900">{row.table}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        row.type === 'ALL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : row.type === 'const'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-500 text-[11px] truncate max-w-[150px]">
                    {row.possible_keys}
                  </td>
                  <td className="px-3 py-3 font-bold text-cyan-800">{row.key}</td>
                  <td className="px-3 py-3 text-slate-500">{row.key_len}</td>
                  <td className="px-3 py-3 text-slate-500">{row.ref}</td>
                  <td className="px-3 py-3 font-bold text-emerald-700">{row.rows.toLocaleString()}</td>
                  <td className="px-3 py-3 text-slate-700">{row.filtered}%</td>
                  <td className="px-3 py-3 text-slate-600 text-[11px]">{row.Extra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimizer Expert Commentary */}
      <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl text-xs space-y-1.5 shadow-2xs">
        <span className="font-bold text-cyan-900 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-cyan-700" />
          Database Engine Optimizer Analysis
        </span>
        <p className="text-slate-700 leading-relaxed font-sans">{activeQuery.commentary}</p>
      </div>

      {/* EXPLAIN Column Definitions Guide */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          DBMS Core Terminology Reference
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-mono font-bold text-cyan-800">type (Join/Access Type)</span>
            <p className="text-slate-600 text-[11px]">
              Critical indicator. Ranked best to worst: <code className="text-emerald-700 font-bold">system &gt; const &gt; eq_ref &gt; ref &gt; range &gt; index &gt; ALL</code>. <code className="text-rose-700 font-bold">ALL</code> implies full table scan.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-mono font-bold text-cyan-800">key & possible_keys</span>
            <p className="text-slate-600 text-[11px]">
              <code className="text-slate-800 font-semibold font-mono">possible_keys</code> indicates candidate indexes; <code className="text-cyan-800 font-semibold font-mono">key</code> indicates the actual winning index chosen based on page cost math.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-mono font-bold text-cyan-800">rows & filtered</span>
            <p className="text-slate-600 text-[11px]">
              Estimated rows engine must examine. <code className="text-cyan-800 font-semibold font-mono">filtered</code> is percentage of examined rows passing where condition (higher is better, ideally 100%).
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-mono font-bold text-cyan-800">Extra (Optimization Flags)</span>
            <p className="text-slate-600 text-[11px]">
              Shows specialized execution mechanics such as <code className="text-emerald-700 font-bold font-mono">Using index</code> (Covering index), <code className="text-cyan-800 font-bold font-mono">Using MRR</code>, or <code className="text-rose-700 font-bold font-mono">Using filesort</code>.
            </p>
          </div>
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
