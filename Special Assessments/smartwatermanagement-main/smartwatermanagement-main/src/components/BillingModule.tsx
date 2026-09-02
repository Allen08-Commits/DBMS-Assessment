import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Eye,
  FileText,
  DollarSign,
  X,
  Workflow
} from 'lucide-react';
import { Bill, Connection } from '../types';
import { WaterUtilityDatabaseEngine } from '../db/dbEngine';
import { SdgFooter } from './SdgFooter';
import { NavTab } from './Sidebar';

interface BillingModuleProps {
  bills: Bill[];
  connections: Connection[];
  db: WaterUtilityDatabaseEngine;
  onNavigate: (tab: NavTab) => void;
  onRefresh: () => void;
}

export const BillingModule: React.FC<BillingModuleProps> = ({
  bills = [],
  connections = [],
  db,
  onNavigate,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Bill | null>(null);

  // Generate Bill Form State
  const [formConnId, setFormConnId] = useState(connections[0]?.connection_id || 'CON10001');
  const [formMonth, setFormMonth] = useState('2026-09');
  const [formUnits, setFormUnits] = useState(28);
  const [formOperator, setFormOperator] = useState('BILL001');
  const [genResult, setGenResult] = useState<{
    success: boolean;
    message: string;
    bill?: Bill;
    logs?: any[];
  } | null>(null);

  // Quick Tariff Calculation
  const calculateTariff = (units: number): number => {
    let amt = 0;
    if (units <= 20) {
      amt = units * 15;
    } else if (units <= 50) {
      amt = 20 * 15 + (units - 20) * 25;
    } else {
      amt = 20 * 15 + 30 * 25 + (units - 50) * 40;
    }
    return amt;
  };

  const filteredBills = (bills || []).filter((b) => {
    const matchesSearch =
      b.bill_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.connection_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || b.bill_status === selectedStatus;
    const matchesMonth = selectedMonth === 'ALL' || b.billing_month === selectedMonth;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGenResult(null);

    const res = db.generateBillTransaction(formConnId, formMonth, Number(formUnits), formOperator);
    setGenResult(res);

    if (res.success) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-cyan-400" />
            Billing & Invoicing Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Relational table: <code className="text-cyan-300 font-mono">BILL</code> with integrity constraint{' '}
            <code className="text-cyan-300 font-mono">UNIQUE(connection_id, billing_month)</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('bill-transaction')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-semibold rounded-xl transition-all"
          >
            <Workflow className="w-4 h-4" />
            <span>Step-by-Step ACID Walkthrough</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGenResult(null);
              setIsGenerateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Bill (Txn)</span>
          </button>
        </div>
      </div>

      {/* Tiered Tariff Structure Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Municipal Tiered Tariff Schedule (Water Slabs)
          </h3>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
            Volumetric Billing Model
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Tier 1: Essential</span>
            <div className="text-lg font-mono font-bold text-white">₹15 <span className="text-xs font-normal text-slate-400">/ kL</span></div>
            <div className="text-xs text-slate-400">Consumption: 0 to 20 units (kilo-litres)</div>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Tier 2: Standard</span>
            <div className="text-lg font-mono font-bold text-white">₹25 <span className="text-xs font-normal text-slate-400">/ kL</span></div>
            <div className="text-xs text-slate-400">Consumption: 21 to 50 units (kilo-litres)</div>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Tier 3: High Demand</span>
            <div className="text-lg font-mono font-bold text-white">₹40 <span className="text-xs font-normal text-slate-400">/ kL</span></div>
            <div className="text-xs text-slate-400">Consumption: Above 50 units (kilo-litres)</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Bill ID, Connection ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PARTIALLY PAID">PARTIALLY PAID</option>
            <option value="UNPAID">UNPAID</option>
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Billing Months</option>
            {Array.from(
              new Set([
                '2026-09',
                '2026-08',
                '2026-07',
                '2026-06',
                '2026-05',
                ...(bills || []).map((b) => b.billing_month)
              ])
            )
              .filter(Boolean)
              .sort()
              .reverse()
              .map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Total Invoices: <strong className="text-cyan-400 font-mono">{filteredBills.length}</strong>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            InnoDB ACID Engine Protected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Bill ID</th>
                <th className="px-4 py-3 font-semibold">Connection ID</th>
                <th className="px-4 py-3 font-semibold">Month</th>
                <th className="px-4 py-3 font-semibold">Units Consumed</th>
                <th className="px-4 py-3 font-semibold">Billed Amount</th>
                <th className="px-4 py-3 font-semibold">Due Balance</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredBills.map((bill) => (
                <tr key={bill.bill_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-300">{bill.bill_id}</td>
                  <td className="px-4 py-3 font-mono text-white">{bill.connection_id}</td>
                  <td className="px-4 py-3 font-mono">{bill.billing_month}</td>
                  <td className="px-4 py-3 font-mono">{bill.units_consumed} kL</td>
                  <td className="px-4 py-3 font-mono font-bold text-white">₹{bill.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-400">
                    ₹{bill.due_amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        bill.bill_status === 'PAID'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : bill.bill_status === 'PARTIALLY PAID'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {bill.bill_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(bill)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
                        title="View Invoice Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {bill.due_amount > 0 && (
                        <button
                          type="button"
                          onClick={() => onNavigate('payments')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate Bill Transaction */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Atomic Bill Generation Transaction
              </h3>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {genResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  genResult.success
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-800 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {genResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{genResult.message}</span>
                </div>
                {genResult.logs && genResult.logs.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 font-mono text-[10px] space-y-1 text-slate-300 max-h-36 overflow-y-auto bg-slate-950 p-2.5 rounded-lg">
                    {genResult.logs.map((log: any, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 select-none">&gt;</span>
                        <span>
                          {typeof log === 'string'
                            ? log
                            : `[${log?.action || 'TXN'}] ${log?.detail || ''}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleGenerateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Select Target Connection ID
                </label>
                <select
                  value={formConnId}
                  onChange={(e) => setFormConnId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
                >
                  {connections.map((c) => (
                    <option key={c.connection_id} value={c.connection_id}>
                      {c.connection_id} – {c.consumer_name} ({c.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Billing Cycle Month (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    required
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Consumption (Units / kL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formUnits}
                    onChange={(e) => setFormUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono flex justify-between">
                <span className="text-slate-400">Calculated Tariff:</span>
                <span className="text-cyan-300 font-bold">₹{calculateTariff(formUnits).toLocaleString()}</span>
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed">
                <strong>DBMS Test:</strong> If a bill for <code className="text-cyan-300">{formConnId}</code> on month <code className="text-cyan-300">{formMonth}</code> already exists, the database transaction will trigger a ROLLBACK due to the <code className="text-cyan-300 font-mono">UNIQUE(connection_id, billing_month)</code> constraint!
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow"
                >
                  START TRANSACTION & COMMIT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Invoice Details */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Official Invoice</span>
                <h3 className="text-base font-bold text-white">{selectedInvoice.bill_id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Connection ID:</span>
                <span className="text-cyan-300 font-bold">{selectedInvoice.connection_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Billing Cycle:</span>
                <span className="text-white">{selectedInvoice.billing_month}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Units Consumed:</span>
                <span className="text-white">{selectedInvoice.units_consumed} kL</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Billed Amount:</span>
                <span className="text-white font-bold">₹{selectedInvoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Outstanding Due:</span>
                <span className="text-amber-400 font-bold">₹{selectedInvoice.due_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Invoice Due Date:</span>
                <span className="text-slate-300">{selectedInvoice.due_date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Optimistic Lock Version:</span>
                <span className="text-emerald-400">v{selectedInvoice.version}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <SdgFooter />
    </div>
  );
};
