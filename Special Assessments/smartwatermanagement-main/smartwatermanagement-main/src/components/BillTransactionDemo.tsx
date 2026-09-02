import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Play,
  RotateCcw,
  SkipForward,
  CheckCircle,
  AlertTriangle,
  FileCode2,
  Database,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

export const BillTransactionDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [simulateDuplicate, setSimulateDuplicate] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const steps = [
    {
      num: 1,
      name: 'START TRANSACTION',
      sql: 'START TRANSACTION;',
      description: 'Acquires transaction ID tx_849201, sets isolation level to REPEATABLE READ, and establishes undo log buffer.',
      status: 'active'
    },
    {
      num: 2,
      name: 'Fetch Current Reading',
      sql: "SELECT consumption_litres, reading_timestamp FROM meter_reading WHERE connection_id = 'CON10001' ORDER BY reading_timestamp DESC LIMIT 1;",
      description: 'Uses index idx_meter_connection_time to fetch latest meter reading (Reading: 4,850 L).',
      status: 'pending'
    },
    {
      num: 3,
      name: 'Fetch Previous Cycle Reading',
      sql: "SELECT consumption_litres FROM meter_reading WHERE connection_id = 'CON10001' AND reading_timestamp < '2026-08-01' ORDER BY reading_timestamp DESC LIMIT 1;",
      description: 'Retrieves baseline meter reading from prior cycle (Reading: 4,510 L).',
      status: 'pending'
    },
    {
      num: 4,
      name: 'Calculate Consumption Delta',
      sql: '-- In-Memory Delta Calculation:\n-- consumption = (4850 - 4510) / 10 = 34.0 kL (Units)',
      description: 'Calculates billed units consumed: 34.0 kL.',
      status: 'pending'
    },
    {
      num: 5,
      name: 'Apply Tiered Tariff Schedule',
      sql: '-- Tier 1 (0-20 kL): 20 * ₹15 = ₹300\n-- Tier 2 (21-34 kL): 14 * ₹25 = ₹350\n-- Total Invoiced Amount = ₹650.00',
      description: 'Calculates volumetric charge: Tier 1 (₹300) + Tier 2 (₹350) = Total ₹650.00.',
      status: 'pending'
    },
    {
      num: 6,
      name: 'Duplicate Check (Integrity Guard)',
      sql: "SELECT COUNT(*) FROM bill WHERE connection_id = 'CON10001' AND billing_month = '2026-08';",
      description: 'Checks UNIQUE(connection_id, billing_month) constraint to prevent double-invoicing.',
      status: 'pending'
    },
    {
      num: 7,
      name: simulateDuplicate ? 'Constraint Violation → ROLLBACK' : 'Integrity Passed → Proceed',
      sql: simulateDuplicate
        ? "ROLLBACK; -- Duplicate bill detected (COUNT = 1)! Aborting transaction."
        : "-- COUNT = 0. Unique integrity check passed.",
      description: simulateDuplicate
        ? 'Duplicate invoice found! Rolling back transaction, releasing locks, restoring undo log.'
        : 'Zero duplicate invoices found. Safe to proceed with insertion.',
      status: 'pending'
    },
    {
      num: 8,
      name: 'INSERT INTO bill',
      sql: simulateDuplicate
        ? '-- Skipped due to prior ROLLBACK.'
        : "INSERT INTO bill (bill_id, connection_id, billing_month, units_consumed, amount, due_amount, due_date, bill_status, version)\nVALUES ('BIL202608-10001', 'CON10001', '2026-08', 34, 650.00, 650.00, '2026-09-15', 'UNPAID', 1);",
      description: 'Inserts row into BILL table with status UNPAID and optimistic version 1.',
      status: 'pending'
    },
    {
      num: 9,
      name: 'Log Audit Record',
      sql: simulateDuplicate
        ? '-- Skipped.'
        : "INSERT INTO audit_log (table_name, operation, record_id, changed_by, timestamp)\nVALUES ('bill', 'INSERT', 'BIL202608-10001', 'BILL001', NOW());",
      description: 'Records immutable audit trail of operator invoice creation.',
      status: 'pending'
    },
    {
      num: 10,
      name: simulateDuplicate ? 'TRANSACTION ABORTED' : 'COMMIT',
      sql: simulateDuplicate ? '-- Transaction Terminated via Rollback.' : 'COMMIT;',
      description: simulateDuplicate
        ? 'State remains unchanged. No corrupt or duplicate data written.'
        : 'Flushes redo log buffer to disk. Changes are durable and visible to all sessions.',
      status: 'pending'
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && currentStep < steps.length) {
      timer = setTimeout(() => {
        handleNextStep();
      }, 1200);
    } else if (currentStep >= steps.length) {
      setIsAutoPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStep]);

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      const nextStepIndex = currentStep;
      const stepObj = steps[nextStepIndex];
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Step ${stepObj.num}: ${stepObj.name} => ${stepObj.sql.split('\n')[0]}`
      ]);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsAutoPlaying(false);
    setLogs([]);
  };

  const handleTriggerDuplicate = () => {
    setSimulateDuplicate(true);
    setCurrentStep(0);
    setLogs([]);
    setIsAutoPlaying(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Workflow className="w-5 h-5 text-cyan-400" />
            Bill Generation Step-by-Step ACID Walkthrough
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            10-Step Interactive Execution Simulator showing Atomicity, Consistency, Isolation, and Durability.
          </p>
        </div>

        {/* Control buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSimulateDuplicate(false);
              setIsAutoPlaying(true);
            }}
            disabled={isAutoPlaying || currentStep >= steps.length}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Auto Play</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={currentStep >= steps.length}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition-all"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Next Step ({currentStep + 1}/10)</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerDuplicate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Duplicate (Trigger Rollback)</span>
          </button>
        </div>
      </div>

      {/* State Badge Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep === 0
                ? 'bg-slate-600'
                : currentStep === 10 && !simulateDuplicate
                ? 'bg-emerald-400 animate-pulse'
                : currentStep >= 7 && simulateDuplicate
                ? 'bg-rose-400 animate-pulse'
                : 'bg-cyan-400 animate-ping'
            }`}
          />
          <div>
            <div className="text-xs font-bold text-white">
              {currentStep === 0
                ? 'Transaction Idle (Awaiting Start)'
                : currentStep === 10 && !simulateDuplicate
                ? 'TRANSACTION COMMITTED SUCCESSFULLY'
                : currentStep >= 7 && simulateDuplicate
                ? 'TRANSACTION ROLLED BACK (Integrity Protected)'
                : `Executing Step ${currentStep} of 10...`}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Session TxID: <span className="text-cyan-300">TX-849201</span> | Target:{' '}
              <span className="text-white">CON10001 (Month 2026-08)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {simulateDuplicate && (
            <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 text-xs font-mono font-bold">
              Simulating Duplicate Conflict
            </span>
          )}
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
            Step: {currentStep} / {steps.length}
          </span>
        </div>
      </div>

      {/* Visual Stepper List (1 to 10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Steps 1 to 5 */}
        <div className="space-y-3">
          {steps.slice(0, 5).map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx + 1;

            return (
              <div
                key={step.num}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-lg'
                    : isCompleted
                    ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                    : 'bg-slate-950/60 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isCurrent
                          ? 'bg-cyan-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? '✓' : step.num}
                    </span>
                    <span className="text-xs font-bold text-white">{step.name}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-mono text-cyan-300 uppercase px-2 py-0.5 rounded bg-cyan-900/80 border border-cyan-700">
                      Executing Now
                    </span>
                  )}
                </div>

                <div className="p-2 bg-slate-950/80 rounded border border-slate-800 font-mono text-[11px] text-cyan-300 my-2 overflow-x-auto whitespace-pre-wrap">
                  {step.sql}
                </div>

                <p className="text-[11px] text-slate-400">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Steps 6 to 10 */}
        <div className="space-y-3">
          {steps.slice(5, 10).map((step, idx) => {
            const realIdx = idx + 5;
            const isCompleted = currentStep > realIdx;
            const isCurrent = currentStep === realIdx + 1;
            const isRollback = simulateDuplicate && step.num >= 7;

            return (
              <div
                key={step.num}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? isRollback
                      ? 'bg-rose-950/80 border-rose-400 text-white shadow-lg'
                      : 'bg-cyan-950/70 border-cyan-400 text-white shadow-lg'
                    : isCompleted
                    ? isRollback
                      ? 'bg-slate-900 border-rose-900/40 text-rose-300'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300'
                    : 'bg-slate-950/60 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        isCompleted
                          ? isRollback
                            ? 'bg-rose-500 text-white'
                            : 'bg-emerald-500 text-slate-950'
                          : isCurrent
                          ? isRollback
                            ? 'bg-rose-400 text-slate-950 animate-pulse'
                            : 'bg-cyan-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (isRollback ? '✕' : '✓') : step.num}
                    </span>
                    <span className="text-xs font-bold text-white">{step.name}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-mono text-cyan-300 uppercase px-2 py-0.5 rounded bg-cyan-900/80 border border-cyan-700">
                      Executing Now
                    </span>
                  )}
                </div>

                <div className="p-2 bg-slate-950/80 rounded border border-slate-800 font-mono text-[11px] text-cyan-300 my-2 overflow-x-auto whitespace-pre-wrap">
                  {step.sql}
                </div>

                <p className="text-[11px] text-slate-400">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Transaction Execution Engine Output Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <FileCode2 className="w-4 h-4" />
            MySQL InnoDB Engine Execution Stream (STDERR / STDOUT)
          </span>
          <span className="text-[10px] text-slate-500">{logs.length} operations logged</span>
        </div>

        <div className="space-y-1 max-h-40 overflow-y-auto pt-1 text-slate-300 text-[11px]">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <span className={log.includes('ROLLBACK') ? 'text-rose-400 font-bold' : log.includes('COMMIT') ? 'text-emerald-400 font-bold' : ''}>
                {log}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-600 italic">Click 'Auto Play' or 'Next Step' to begin step-by-step transaction execution...</div>
          )}
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
