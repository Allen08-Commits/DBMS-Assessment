import React, { useState } from 'react';
import {
  GitFork,
  Play,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

type LabScenario = 'lost-update-locked' | 'lost-update-unlocked' | 'duplicate-bill' | 'occ-conflict';

interface TimelineEvent {
  step: number;
  time: string;
  session1?: string;
  session2?: string;
  lockStatus?: string;
  dbState: string;
}

export const ConcurrencySimulation: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<LabScenario>('lost-update-locked');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Scenarios timeline data
  const scenariosData: Record<LabScenario, { title: string; desc: string; events: TimelineEvent[] }> = {
    'lost-update-locked': {
      title: 'Scenario 1: Lost Update Prevention via Row-Level Exclusive Lock (SELECT ... FOR UPDATE)',
      desc: 'Two concurrent cashiers attempt to deduct partial payments from Bill #BIL-10001 (Initial Due: ₹1,500). Cashier 1 pays ₹500, Cashier 2 pays ₹300. With row locks, Cashier 2 blocks until Cashier 1 commits.',
      events: [
        {
          step: 1,
          time: 'T1',
          session1: 'START TRANSACTION; SELECT due_amount FROM bill WHERE bill_id = "BIL-10001" FOR UPDATE;',
          session2: 'Idle',
          lockStatus: 'X-Lock acquired on BIL-10001 by Session 1',
          dbState: 'due_amount = ₹1,500 (Locked)'
        },
        {
          step: 2,
          time: 'T2',
          session1: 'Session 1 processing payment calculations...',
          session2: 'START TRANSACTION; SELECT due_amount FROM bill WHERE bill_id = "BIL-10001" FOR UPDATE;',
          lockStatus: 'Session 2 BLOCKED (Waiting for lock release on BIL-10001)...',
          dbState: 'due_amount = ₹1,500 (Locked by S1)'
        },
        {
          step: 3,
          time: 'T3',
          session1: 'UPDATE bill SET due_amount = 1000 WHERE bill_id = "BIL-10001"; COMMIT;',
          session2: 'Waiting...',
          lockStatus: 'Session 1 COMMITTED! Lock released.',
          dbState: 'due_amount = ₹1,000 (Committed)'
        },
        {
          step: 4,
          time: 'T4',
          session1: 'Transaction Completed.',
          session2: 'Lock granted! Reads fresh due_amount = ₹1,000; UPDATE due_amount = 700; COMMIT;',
          lockStatus: 'Session 2 COMMITTED! All locks released.',
          dbState: 'due_amount = ₹700 (Correct final balance!)'
        }
      ]
    },
    'lost-update-unlocked': {
      title: 'Scenario 1B: The Lost Update Anomaly (Without Locks / Race Condition)',
      desc: 'Simulating the catastrophic database race condition when non-locking reads occur without synchronization. Cashier 1 reads 1500, Cashier 2 reads 1500, Cashier 2 blindly overwrites Cashier 1.',
      events: [
        {
          step: 1,
          time: 'T1',
          session1: 'SELECT due_amount FROM bill WHERE bill_id = "BIL-10001"; (Reads 1500)',
          session2: 'Idle',
          lockStatus: 'No Locks',
          dbState: 'due_amount = ₹1,500'
        },
        {
          step: 2,
          time: 'T2',
          session1: 'In memory: 1500 - 500 = 1000',
          session2: 'SELECT due_amount FROM bill WHERE bill_id = "BIL-10001"; (Reads 1500 stale!)',
          lockStatus: 'No Locks',
          dbState: 'due_amount = ₹1,500'
        },
        {
          step: 3,
          time: 'T3',
          session1: 'UPDATE bill SET due_amount = 1000; COMMIT;',
          session2: 'In memory: 1500 - 300 = 1200',
          lockStatus: 'No Locks',
          dbState: 'due_amount = ₹1,000'
        },
        {
          step: 4,
          time: 'T4',
          session1: 'Done.',
          session2: 'UPDATE bill SET due_amount = 1200; COMMIT; (OVERWROTE ₹500 PAYMENT!)',
          lockStatus: 'No Locks',
          dbState: 'due_amount = ₹1,200 (LOST UPDATE CORRUPTION!)'
        }
      ]
    },
    'duplicate-bill': {
      title: 'Scenario 2: Duplicate Record Prevention via UNIQUE(connection_id, billing_month)',
      desc: 'Two billing operators run monthly invoice generators for connection CON10001 for cycle 2026-08 at the same second.',
      events: [
        {
          step: 1,
          time: 'T1',
          session1: 'START TRANSACTION; INSERT INTO bill (id, conn, month...) VALUES ("BIL-01", "CON10001", "2026-08");',
          session2: 'Idle',
          lockStatus: 'Exclusive index lock on ("CON10001", "2026-08")',
          dbState: 'Row inserted in uncommitted buffer'
        },
        {
          step: 2,
          time: 'T2',
          session1: 'Session 1 committing...',
          session2: 'START TRANSACTION; INSERT INTO bill (id, conn, month...) VALUES ("BIL-02", "CON10001", "2026-08");',
          lockStatus: 'Duplicate key conflict detected on uk_connection_month!',
          dbState: 'Duplicate check triggered'
        },
        {
          step: 3,
          time: 'T3',
          session1: 'COMMIT; (Invoice BIL-01 created successfully)',
          session2: 'ERROR 1062 (23000): Duplicate entry "CON10001-2026-08" for key "uk_connection_month"',
          lockStatus: 'Session 2 Error raised',
          dbState: 'BIL-01 active; BIL-02 blocked'
        },
        {
          step: 4,
          time: 'T4',
          session1: 'Done.',
          session2: 'ROLLBACK; (Zero duplicate records written to disk)',
          lockStatus: 'No duplicate bills exist.',
          dbState: 'Total Bills for month = 1 (Integrity preserved!)'
        }
      ]
    },
    'occ-conflict': {
      title: 'Scenario 3: Optimistic Concurrency Control (OCC) Version Conflict',
      desc: 'Operator A and Operator B open Complaint ticket CMP-101 (Version 1) simultaneously in their browsers.',
      events: [
        {
          step: 1,
          time: 'T1',
          session1: 'Operator A loads CMP-101 (Status: Pending, Version: 1)',
          session2: 'Operator B loads CMP-101 (Status: Pending, Version: 1)',
          lockStatus: 'No row locks held (Optimistic model)',
          dbState: 'CMP-101 version = 1'
        },
        {
          step: 2,
          time: 'T2',
          session1: 'Operator A submits: SET status = "In Progress", version = 2 WHERE id = "CMP-101" AND version = 1;',
          session2: 'Operator B typing resolution notes...',
          lockStatus: 'Version check matched (version 1 == 1)',
          dbState: 'CMP-101 version = 2 (Committed by Operator A)'
        },
        {
          step: 3,
          time: 'T3',
          session1: 'Done (Changes visible).',
          session2: 'Operator B submits: SET status = "Resolved", version = 2 WHERE id = "CMP-101" AND version = 1;',
          lockStatus: 'Version check failed (DB is v2, query asked for v1)',
          dbState: '0 rows updated!'
        },
        {
          step: 4,
          time: 'T4',
          session1: 'Done.',
          session2: 'OCC ABORT: "Stale data conflict! Ticket was modified by another operator. Reloading..."',
          lockStatus: 'Conflict caught gracefully.',
          dbState: 'Operator A changes protected without lock waits!'
        }
      ]
    }
  };

  const activeData = scenariosData[activeScenario];

  const handleRunSimulation = () => {
    setCurrentStep(1);
    setIsSimulating(true);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step <= activeData.events.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 1500);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <GitFork className="w-5 h-5 text-cyan-400" />
          Concurrency Control & Race Condition Simulation Lab
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Hands-on demonstration of multi-session transaction interactions: Pessimistic Locking (`FOR UPDATE`), Lost Updates, Unique Constraints, and Optimistic Versioning.
        </p>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            id: 'lost-update-locked' as LabScenario,
            label: '1. Lost Update Prevention',
            sub: 'SELECT ... FOR UPDATE',
            icon: Lock
          },
          {
            id: 'lost-update-unlocked' as LabScenario,
            label: '2. Lost Update Race',
            sub: 'Unlocked (Data Corruption)',
            icon: AlertTriangle
          },
          {
            id: 'duplicate-bill' as LabScenario,
            label: '3. Duplicate Prevention',
            sub: 'UNIQUE Key Rollback',
            icon: ShieldCheck
          },
          {
            id: 'occ-conflict' as LabScenario,
            label: '4. Optimistic Concurrency',
            sub: 'Version Mismatch Abort',
            icon: Layers
          }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeScenario === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveScenario(item.id);
                setCurrentStep(0);
                setIsSimulating(false);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-slate-200">{item.label}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">{item.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Overview & Play Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">{activeData.title}</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">{activeData.desc}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Executing Interleaving...' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dual Session Timeline Table (Session 1 vs Session 2) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Concurrent Execution Timeline (Time Slot T1 → T4)
          </h3>
          <span className="text-[10px] font-mono text-cyan-400">
            Step {currentStep} of {activeData.events.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-3 py-3 font-semibold w-16 text-center">Time</th>
                <th className="px-4 py-3 font-semibold text-cyan-300 w-1/3">Session 1 (Client A)</th>
                <th className="px-4 py-3 font-semibold text-indigo-300 w-1/3">Session 2 (Client B)</th>
                <th className="px-4 py-3 font-semibold text-amber-300">Lock Engine / Database State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {activeData.events.map((evt) => {
                const isReached = currentStep >= evt.step;
                const isCurrent = currentStep === evt.step;

                return (
                  <tr
                    key={evt.step}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-cyan-950/40 text-white font-bold'
                        : isReached
                        ? 'bg-slate-900/80'
                        : 'opacity-40 bg-slate-950/50'
                    }`}
                  >
                    <td className="px-3 py-4 text-center text-cyan-400 font-bold">{evt.time}</td>
                    <td className="px-4 py-4 text-slate-200">
                      <div className="break-words leading-relaxed">{evt.session1 || '—'}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-200">
                      <div className="break-words leading-relaxed">{evt.session2 || '—'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="text-[11px] text-amber-300 font-bold">{evt.lockStatus}</div>
                        <div className="text-[10px] text-emerald-400">State: {evt.dbState}</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
