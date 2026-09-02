import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Receipt,
  Smartphone,
  Landmark,
  Banknote,
  RotateCcw,
  Layers,
  ArrowRight,
  TrendingDown,
  Clock,
  User,
  Hash,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Payment, Bill, Connection, PaymentMethod, BillStatus } from '../types';
import { WaterUtilityDatabaseEngine } from '../db/dbEngine';
import { SdgFooter } from './SdgFooter';
import { NavTab } from './Sidebar';

interface PaymentsProps {
  payments: Payment[];
  bills: Bill[];
  connections?: Connection[];
  db: WaterUtilityDatabaseEngine;
  onNavigate?: (tab: NavTab) => void;
  onRefresh: () => void;
}

export const Payments: React.FC<PaymentsProps> = ({
  payments = [],
  bills = [],
  connections = [],
  db,
  onNavigate,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [simulateRollback, setSimulateRollback] = useState(false);

  // Settlement Form State
  const unpaidBills = bills.filter((b) => (b.due_amount || 0) > 0);
  const [selectedBillId, setSelectedBillId] = useState<string>(unpaidBills[0]?.bill_id || bills[0]?.bill_id || '');
  const [payAmount, setPayAmount] = useState<number>(unpaidBills[0]?.due_amount || bills[0]?.due_amount || 0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [txnResult, setTxnResult] = useState<{
    success: boolean;
    message: string;
    logs?: any[];
  } | null>(null);

  // Compute live summary stats from shared dataset
  const totalOutstanding = bills
    .filter((b) => (b.bill_status === 'UNPAID' || b.bill_status === 'PARTIALLY PAID') && (b.due_amount || 0) > 0)
    .reduce((acc, b) => acc + (Number(b.due_amount) || 0), 0);
  const unpaidCount = bills.filter(
    (b) => (b.bill_status === 'UNPAID' || b.bill_status === 'PARTIALLY PAID') && (b.due_amount || 0) > 0
  ).length;
  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount || p.amount_paid) || 0), 0);

  // Helper lookups
  const getConnection = (connId: string) => connections.find((c) => c.connection_id === connId);
  const getBill = (billId: string) => bills.find((b) => b.bill_id === billId);

  // When selected bill changes in modal, update default amount
  const handleBillSelect = (billId: string) => {
    setSelectedBillId(billId);
    const b = bills.find((item) => item.bill_id === billId);
    if (b) {
      setPayAmount(b.due_amount > 0 ? b.due_amount : b.amount);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const bill = getBill(p.bill_id);
    const conn = getConnection(p.connection_id || bill?.connection_id || '');
    const consumerName = conn?.consumer_name || '';
    const refNumber = p.transaction_reference || p.reference_number || '';
    const method = p.payment_method || p.payment_mode || '';
    const billStatus = bill?.bill_status || 'PAID';

    const matchesSearch =
      p.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bill_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.connection_id && p.connection_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = selectedMethod === 'ALL' || method === selectedMethod;
    const matchesStatus = selectedStatusFilter === 'ALL' || billStatus === selectedStatusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTxnResult(null);

    const targetBill = bills.find((b) => b.bill_id === selectedBillId);
    if (!targetBill) {
      setTxnResult({
        success: false,
        message: 'Please select a valid bill for settlement.'
      });
      return;
    }

    const res = db.recordPaymentTransaction(
      selectedBillId,
      Number(payAmount),
      payMethod,
      simulateRollback
    );

    setTxnResult({
      success: res.success,
      message: res.message,
      logs: res.logs
    });

    if (res.success) {
      onRefresh();
    }
  };

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'UPI':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCard className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Net Banking':
        return <Landmark className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Cash':
        return <Banknote className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status?: BillStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            PAID
          </span>
        );
      case 'PARTIALLY PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
            <Clock className="w-3 h-3 text-amber-600" />
            PARTIALLY PAID
          </span>
        );
      case 'UNPAID':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            UNPAID
          </span>
        );
    }
  };

  const currentBillObj = bills.find((b) => b.bill_id === selectedBillId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Payments & Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Relational schema: <code className="text-emerald-700 font-semibold font-mono">PAYMENT</code> synchronizing{' '}
                <code className="text-cyan-700 font-semibold font-mono">BILL.due_amount</code> and{' '}
                <code className="text-cyan-700 font-semibold font-mono">BILL.bill_status</code> via ACID Transactions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('billing')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>Billing Ledger</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setTxnResult(null);
              setSimulateRollback(false);
              const target = unpaidBills.length > 0 ? unpaidBills[0] : bills[0];
              if (target) {
                setSelectedBillId(target.bill_id);
                setPayAmount(target.due_amount > 0 ? target.due_amount : target.amount);
              }
              setIsPayModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment (Txn)</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Balance */}
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Outstanding Balance
              </p>
              <TrendingDown className="w-4 h-4 text-amber-500" />
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
            {unpaidCount} {unpaidCount === 1 ? 'Bill' : 'Bills'} with pending dues
          </p>
        </div>

        {/* Total Collections */}
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Revenue Collected
              </p>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
              ₹{totalCollected.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-3">
            Persisted across {payments.length} settled payments
          </p>
        </div>

        {/* Total Settlements */}
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Settlement Transactions
              </p>
              <Layers className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
              {payments.length}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-3">
            Atomic commit logs active
          </p>
        </div>

        {/* Database Integrity Guarantee */}
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ACID Isolation
              </p>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-sm font-bold text-indigo-700 mt-2 font-mono">
              SERIALIZABLE + FOR UPDATE
            </p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-3">
            Zero lost updates guaranteed
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Payment ID, Bill ID, Connection ID, Consumer, Ref..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Bill Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PARTIALLY PAID">PARTIALLY PAID</option>
            <option value="UNPAID">UNPAID</option>
          </select>
        </div>
      </div>

      {/* Main Payments & Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Settlement Ledger</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
              {filteredPayments.length} Records
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Shared synchronized state across all modules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold">Payment ID</th>
                <th className="px-4 py-3 font-bold">Bill ID</th>
                <th className="px-4 py-3 font-bold">Connection ID</th>
                <th className="px-4 py-3 font-bold">Consumer</th>
                <th className="px-4 py-3 font-bold">Payment Date</th>
                <th className="px-4 py-3 font-bold">Amount Paid</th>
                <th className="px-4 py-3 font-bold">Payment Method</th>
                <th className="px-4 py-3 font-bold">Transaction Ref</th>
                <th className="px-4 py-3 font-bold">Original Amount</th>
                <th className="px-4 py-3 font-bold">Due Amount</th>
                <th className="px-4 py-3 font-bold">Bill Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.map((pay) => {
                const bill = getBill(pay.bill_id);
                const connId = pay.connection_id || bill?.connection_id || 'N/A';
                const conn = getConnection(connId);
                const consumerName = conn?.consumer_name || 'Consumer ' + connId.replace('CON', '');
                const originalAmount = bill ? bill.amount : pay.amount || pay.amount_paid || 0;
                const dueAmount = bill ? bill.due_amount : 0;
                const billStatus = bill ? bill.bill_status : 'PAID';
                const method = pay.payment_method || pay.payment_mode || 'UPI';
                const ref = pay.transaction_reference || pay.reference_number || 'N/A';
                const amountPaid = pay.amount || pay.amount_paid || 0;

                return (
                  <tr key={pay.payment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                      {pay.payment_id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-cyan-700 font-medium">
                      {pay.bill_id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">
                      {connId}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {consumerName}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {pay.payment_date}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-700 text-sm">
                      ₹{amountPaid.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                        {getMethodIcon(method)}
                        <span>{method}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">
                      {ref}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      ₹{originalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold">
                      {dueAmount === 0 ? (
                        <span className="text-emerald-600 font-bold">₹0</span>
                      ) : (
                        <span className="text-amber-600 font-bold">₹{dueAmount.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(billStatus)}
                    </td>
                  </tr>
                );
              })}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-slate-500 font-medium">
                    No payment records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Settle Payment Transaction */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ACID Payment Settlement Transaction
              </h3>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {txnResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  txnResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {txnResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{txnResult.message}</span>
                </div>
                {txnResult.logs && txnResult.logs.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 font-mono text-[10px] space-y-1 text-slate-700 max-h-36 overflow-y-auto bg-slate-900 text-emerald-400 p-2.5 rounded-lg">
                    {txnResult.logs.map((log: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-500 select-none">&gt;</span>
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

            <form onSubmit={handlePaySubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Bill / Invoice for Settlement
                </label>
                <select
                  value={selectedBillId}
                  onChange={(e) => handleBillSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {unpaidBills.length > 0 && (
                    <optgroup label="Unpaid & Partially Paid Bills">
                      {unpaidBills.map((b) => {
                        const conn = getConnection(b.connection_id);
                        return (
                          <option key={b.bill_id} value={b.bill_id}>
                            {b.bill_id} – {b.connection_id} ({conn?.consumer_name || 'Consumer'}) • Due: ₹{b.due_amount}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                  <optgroup label="All Invoices">
                    {bills.map((b) => {
                      const conn = getConnection(b.connection_id);
                      return (
                        <option key={b.bill_id} value={b.bill_id}>
                          {b.bill_id} – {b.connection_id} ({conn?.consumer_name || 'Consumer'}) • Status: {b.bill_status} (Due: ₹{b.due_amount})
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>

              {currentBillObj && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TOTAL INVOICE</span>
                    <span className="text-slate-800 font-bold">₹{currentBillObj.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CURRENT DUE</span>
                    <span className={`font-bold ${currentBillObj.due_amount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      ₹{currentBillObj.due_amount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">STATUS</span>
                    <span className="text-slate-800 font-bold">{currentBillObj.bill_status}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payment Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="UPI">UPI (Instant Settlement)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash (Counter Deposit)</option>
                  </select>
                </div>
              </div>

              {/* Simulate Rollback option */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={simulateRollback}
                    onChange={(e) => setSimulateRollback(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-rose-700">Simulate Gateway Error (Test ACID Rollback)</span>
                </label>
                <p className="text-[10px] text-slate-500 mt-1 pl-5">
                  If checked, simulated network error triggers a clean ROLLBACK leaving balance unchanged.
                </p>
              </div>

              <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <strong>DBMS Validation:</strong> Settle payment executes inside an ACID transaction with{' '}
                <code className="text-emerald-700 font-mono font-bold">SELECT ... FOR UPDATE</code> lock on the target bill. If amount &gt; due amount or &lt;= 0, transaction triggers a ROLLBACK.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedBillId}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {simulateRollback ? 'Execute & Test Rollback' : 'Settle & COMMIT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SdgFooter />
    </div>
  );
};
