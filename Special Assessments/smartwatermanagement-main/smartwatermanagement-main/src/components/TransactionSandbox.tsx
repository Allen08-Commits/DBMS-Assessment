import React, { useState } from 'react';
import {
  ShieldCheck,
  Play,
  RotateCcw,
  Flag,
  CheckCircle,
  AlertTriangle,
  FileCode2,
  Database,
  Layers,
  ArrowRight,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

interface TxnLogEntry {
  time: string;
  command: string;
  type: 'info' | 'dml' | 'savepoint' | 'rollback' | 'commit' | 'lock';
}

export const TransactionSandbox: React.FC = () => {
  const [inTransaction, setInTransaction] = useState(false);
  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const [hasRowLock, setHasRowLock] = useState(false);
  const [savepoints, setSavepoints] = useState<string[]>([]);
  const [hasPaymentInserted, setHasPaymentInserted] = useState(false);
  const [hasBillUpdated, setHasBillUpdated] = useState(false);
  const [uncommittedChanges, setUncommittedChanges] = useState<string[]>([]);
  const [logs, setLogs] = useState<TxnLogEntry[]>([
    {
      time: '21:00:00',
      command: '-- Relational engine initialized. InnoDB ready for ACID transactions.',
      type: 'info'
    }
  ]);

  // Balance state
  const [committedBalance, setCommittedBalance] = useState(1500);
  const [pendingBalance, setPendingBalance] = useState(1500);

  const addLog = (command: string, type: TxnLogEntry['type']) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, command, type }]);
  };

  const handleStartTransaction = () => {
    if (inTransaction) return;
    const txId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
    setInTransaction(true);
    setActiveTxId(txId);
    setHasRowLock(false);
    setSavepoints([]);
    setHasPaymentInserted(false);
    setHasBillUpdated(false);
    setUncommittedChanges([]);
    setPendingBalance(committedBalance);
    addLog(`START TRANSACTION; -- Session allocated ${txId}. Isolation level: REPEATABLE READ.`, 'info');
  };

  const handleSelectForUpdate = () => {
    if (!inTransaction) return;
    setHasRowLock(true);
    addLog("SELECT due_amount, version FROM bill WHERE bill_id = 'BIL202608-10001' FOR UPDATE; -- Acquired Row-Level X-Lock", 'lock');
  };

  const handleCreateSavepoint = (name: string = 'sp_before_payment') => {
    if (!inTransaction) return;
    if (!savepoints.includes(name)) {
      setSavepoints((prev) => [...prev, name]);
    }
    addLog(`SAVEPOINT ${name}; -- Created savepoint checkpoint`, 'savepoint');
  };

  const handleInsertPayment = () => {
    if (!inTransaction) return;
    setHasPaymentInserted(true);
    const statement = "INSERT INTO payment (payment_id, bill_id, amount_paid, payment_mode, payment_timestamp) VALUES ('PAY-TMP-99', 'BIL202608-10001', 450.00, 'UPI', NOW());";
    setUncommittedChanges((prev) => [...prev, statement]);
    addLog(`${statement} -- Staged in dirty buffer (NOT auto-committed)`, 'dml');
  };

  const handleUpdateBill = () => {
    if (!inTransaction) return;
    const newBal = committedBalance - 450;
    setPendingBalance(newBal);
    setHasBillUpdated(true);
    const statement = `UPDATE bill SET due_amount = ${newBal}, version = version + 1 WHERE bill_id = 'BIL202608-10001';`;
    setUncommittedChanges((prev) => [...prev, statement]);
    addLog(`${statement} -- Ledger modified in session memory only`, 'dml');
  };

  const handleRollbackToSavepoint = (name: string) => {
    if (!inTransaction) return;
    addLog(`ROLLBACK TO SAVEPOINT ${name}; -- Reverted uncommitted operations after ${name}`, 'rollback');
    setHasBillUpdated(false);
    setPendingBalance(committedBalance);
    setUncommittedChanges((prev) => prev.filter((s) => s.includes('payment')));
  };

  const handleCommit = () => {
    if (!inTransaction) return;
    setCommittedBalance(pendingBalance);
    setInTransaction(false);
    setActiveTxId(null);
    setHasRowLock(false);
    setSavepoints([]);
    setHasPaymentInserted(false);
    setHasBillUpdated(false);
    setUncommittedChanges([]);
    addLog('COMMIT; -- Redo log flushed to disk. All locks released. Changes are permanent and durable.', 'commit');
  };

  const handleRollback = () => {
    if (!inTransaction) return;
    setPendingBalance(committedBalance);
    setInTransaction(false);
    setActiveTxId(null);
    setHasRowLock(false);
    setSavepoints([]);
    setHasPaymentInserted(false);
    setHasBillUpdated(false);
    setUncommittedChanges([]);
    addLog('ROLLBACK; -- Undo log applied. Uncommitted memory modifications discarded. Locks released.', 'rollback');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-600" />
          Payment Transaction Simulation & Savepoint Sandbox
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Live relational sandbox demonstrating Atomicity, Consistency, Isolation, Durability (ACID), Row-Level X-Locks, Savepoints, and Rollback behavior.
        </p>
      </div>

      {/* Interactive Command Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full ${
                inTransaction ? 'bg-cyan-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold text-slate-900">
              Transaction State: {inTransaction ? `Active Session (${activeTxId})` : 'Idle / Auto-Commit'}
            </span>
            {hasRowLock && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Exclusive X-Lock Acquired
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!inTransaction ? (
              <button
                type="button"
                onClick={handleStartTransaction}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>START TRANSACTION</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCommit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>COMMIT</span>
                </button>
                <button
                  type="button"
                  onClick={handleRollback}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ROLLBACK</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ACID Step Progression Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${inTransaction ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="font-bold flex items-center justify-between">
              <span>1. START TX</span>
              {inTransaction ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px]">Pending</span>}
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${hasRowLock ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="font-bold flex items-center justify-between">
              <span>2. SELECT LOCK</span>
              {hasRowLock ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px]">Pending</span>}
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${savepoints.length > 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="font-bold flex items-center justify-between">
              <span>3. SAVEPOINT</span>
              {savepoints.length > 0 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px]">Pending</span>}
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${hasPaymentInserted ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="font-bold flex items-center justify-between">
              <span>4. INSERT PAY</span>
              {hasPaymentInserted ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px]">Pending</span>}
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${hasBillUpdated ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="font-bold flex items-center justify-between">
              <span>5. UPDATE BILL</span>
              {hasBillUpdated ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px]">Pending</span>}
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${!inTransaction && logs.some((l) => l.type === 'commit') ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="font-bold flex items-center justify-between">
              <span>6. COMMIT</span>
              {!inTransaction && logs.some((l) => l.type === 'commit') ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px]">Pending</span>}
            </div>
          </div>
        </div>

        {/* Step Trigger Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleSelectForUpdate}
            disabled={!inTransaction || hasRowLock}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition-all font-mono cursor-pointer"
          >
            SELECT ... FOR UPDATE
          </button>

          <button
            type="button"
            onClick={() => handleCreateSavepoint('sp_before_payment')}
            disabled={!inTransaction || savepoints.includes('sp_before_payment')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 text-indigo-800 text-xs font-semibold rounded-xl border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer font-mono"
          >
            <Flag className="w-3.5 h-3.5 text-indigo-600" />
            <span>SAVEPOINT sp_before_payment</span>
          </button>

          <button
            type="button"
            onClick={handleInsertPayment}
            disabled={!inTransaction || hasPaymentInserted}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition-all font-mono cursor-pointer"
          >
            INSERT INTO payment (₹450)
          </button>

          <button
            type="button"
            onClick={handleUpdateBill}
            disabled={!inTransaction || hasBillUpdated}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition-all font-mono cursor-pointer"
          >
            UPDATE bill (due_amount - 450)
          </button>

          {savepoints.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => handleRollbackToSavepoint(sp)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-300 transition-all flex items-center gap-1 cursor-pointer font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>ROLLBACK TO {sp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dual Buffer State Inspector (Committed vs Uncommitted) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Committed Disk Storage */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Committed Storage State (Disk / Durable)
            </span>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              Visible to All Sessions
            </span>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 font-mono text-xs text-slate-200">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Target Bill ID:</span>
              <span className="text-cyan-300 font-bold">BIL202608-10001</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Connection ID:</span>
              <span className="text-white">CON10001</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-sans font-semibold">Persisted Due Amount:</span>
              <span className="text-emerald-400 font-bold text-sm">₹{committedBalance.toLocaleString('en-IN')}.00</span>
            </div>
          </div>
        </div>

        {/* Box 2: In-Memory Dirty Buffer (Session Local) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" />
              Uncommitted Dirty Buffer ({activeTxId || 'Idle'})
            </span>
            <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded font-bold">
              Isolated in Memory
            </span>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 font-mono text-xs text-slate-200">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Pending Changes:</span>
              <span className="text-cyan-400 font-bold">{uncommittedChanges.length} statements</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Active Savepoints:</span>
              <span className="text-white">{savepoints.join(', ') || 'None'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-sans font-semibold">Session Shadow Due Amount:</span>
              <span className="text-amber-400 font-bold text-sm">₹{pendingBalance.toLocaleString('en-IN')}.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Redo / Undo Execution Stream Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            InnoDB Transaction Log Stream (WAL / Redo-Undo Log)
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">{logs.length} entries</span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto text-[11px]">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 py-0.5">
              <span className="text-slate-400 shrink-0">[{log.time}]</span>
              <span
                className={`flex-1 break-words ${
                  log.type === 'commit'
                    ? 'text-emerald-400 font-bold'
                    : log.type === 'rollback'
                    ? 'text-rose-400 font-bold'
                    : log.type === 'savepoint'
                    ? 'text-indigo-300 font-bold'
                    : log.type === 'lock'
                    ? 'text-amber-300 font-bold'
                    : log.type === 'dml'
                    ? 'text-cyan-300'
                    : 'text-slate-300'
                }`}
              >
                {log.command}
              </span>
            </div>
          ))}
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
