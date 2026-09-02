import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  Check,
  X,
  Info,
  Layers,
  FileCode2,
  Lock
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

type IsolationLevel = 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
type AnomalyType = 'dirty-read' | 'non-repeatable-read' | 'phantom-read';

export const IsolationLevels: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<IsolationLevel>('REPEATABLE READ');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyType>('dirty-read');
  const [simStep, setSimStep] = useState<number>(0);

  const isolationMatrix = [
    {
      level: 'READ UNCOMMITTED' as IsolationLevel,
      dirtyRead: true,
      nonRepeatable: true,
      phantomRead: true,
      overhead: 'Lowest',
      lockingModel: 'No read locks, reads uncommitted dirty pages directly from buffer pool.'
    },
    {
      level: 'READ COMMITTED' as IsolationLevel,
      dirtyRead: false,
      nonRepeatable: true,
      phantomRead: true,
      overhead: 'Low-Medium',
      lockingModel: 'Creates fresh MVCC Read View for every individual SELECT statement.'
    },
    {
      level: 'REPEATABLE READ' as IsolationLevel,
      dirtyRead: false,
      nonRepeatable: false,
      phantomRead: false, // In MySQL InnoDB via MVCC + Next-Key Locks
      overhead: 'Medium',
      lockingModel: 'MySQL Default. Creates single MVCC Read View at first SELECT; Next-Key Locks prevent phantom inserts.'
    },
    {
      level: 'SERIALIZABLE' as IsolationLevel,
      dirtyRead: false,
      nonRepeatable: false,
      phantomRead: false,
      overhead: 'Highest',
      lockingModel: 'Converts all plain SELECT statements into SELECT ... FOR SHARE locks.'
    }
  ];

  // Anomaly simulation narratives
  const getSimulationSteps = () => {
    if (selectedAnomaly === 'dirty-read') {
      const allowed = selectedLevel === 'READ UNCOMMITTED';
      return [
        {
          time: 'T1',
          s1: 'START TRANSACTION; UPDATE connection SET status = "SUSPENDED" WHERE id = "CON10001"; (Uncommitted)',
          s2: 'Idle',
          res: 'Transaction 1 modifies page in memory.'
        },
        {
          time: 'T2',
          s1: 'Still in progress...',
          s2: allowed
            ? 'SELECT status FROM connection WHERE id = "CON10001"; => Reads "SUSPENDED" (DIRTY READ!)'
            : 'SELECT status FROM connection WHERE id = "CON10001"; => Reads committed "ACTIVE" via MVCC Undo Log snapshot.',
          res: allowed ? 'Dirty page read without commit!' : 'Dirty read blocked by MVCC snapshot.'
        },
        {
          time: 'T3',
          s1: 'ROLLBACK; (Transaction 1 aborts, status reverts to "ACTIVE")',
          s2: allowed
            ? 'Session 2 made business decisions based on data that NEVER existed on disk!'
            : 'Session 2 never saw dirty uncommitted change. Total consistency.',
          res: allowed ? 'Data Inconsistency Anomaly Realized' : 'Anomaly Prevented'
        }
      ];
    } else if (selectedAnomaly === 'non-repeatable-read') {
      const allowed = selectedLevel === 'READ UNCOMMITTED' || selectedLevel === 'READ COMMITTED';
      return [
        {
          time: 'T1',
          s1: 'Idle',
          s2: 'START TRANSACTION; SELECT due_amount FROM bill WHERE bill_id = "BIL-10001"; (Reads ₹1,500)',
          res: 'Session 2 establishes snapshot.'
        },
        {
          time: 'T2',
          s1: 'START TRANSACTION; UPDATE bill SET due_amount = 500 WHERE bill_id = "BIL-10001"; COMMIT;',
          s2: 'Processing transaction...',
          res: 'Session 1 modifies and commits new balance.'
        },
        {
          time: 'T3',
          s1: 'Committed.',
          s2: allowed
            ? 'SELECT due_amount FROM bill WHERE bill_id = "BIL-10001"; => Reads ₹500 (Value changed mid-transaction! NON-REPEATABLE READ)'
            : 'SELECT due_amount FROM bill WHERE bill_id = "BIL-10001"; => Reads ₹1,500 (Same value preserved by REPEATABLE READ snapshot)',
          res: allowed ? 'Non-Repeatable Read Occurred' : 'Repeatable Read Preserved'
        }
      ];
    } else {
      // Phantom Read
      const allowed = selectedLevel === 'READ UNCOMMITTED' || selectedLevel === 'READ COMMITTED';
      return [
        {
          time: 'T1',
          s1: 'Idle',
          s2: 'START TRANSACTION; SELECT COUNT(*) FROM connection WHERE zone = "Zone A"; (Reads 10)',
          res: 'Session 2 performs range scan.'
        },
        {
          time: 'T2',
          s1: 'INSERT INTO connection (connection_id, zone...) VALUES ("CON-NEW", "Zone A"); COMMIT;',
          s2: 'Processing...',
          res: 'Session 1 inserts new connection in Zone A.'
        },
        {
          time: 'T3',
          s1: 'Committed.',
          s2: allowed
            ? 'SELECT COUNT(*) FROM connection WHERE zone = "Zone A"; => Reads 11 (Phantom row appeared!)'
            : 'SELECT COUNT(*) FROM connection WHERE zone = "Zone A"; => Reads 10 (InnoDB Next-Key Locks + MVCC suppress phantom row)',
          res: allowed ? 'Phantom Read Occurred' : 'Phantom Row Prevented'
        }
      ];
    }
  };

  const steps = getSimulationSteps();

  const handleNextStep = () => {
    if (simStep < steps.length) {
      setSimStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setSimStep(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          ANSI SQL & MySQL InnoDB Transaction Isolation Levels
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Evaluating trade-offs between concurrency throughput, read phenomena anomalies, Multi-Version Concurrency Control (MVCC), and Next-Key locking.
        </p>
      </div>

      {/* Isolation Comparison Table Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Standard ANSI SQL Isolation Phenomenon Matrix
          </h3>
          <span className="text-[10px] font-mono text-cyan-400">
            Current Selected Level: <strong className="text-white">{selectedLevel}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Isolation Level</th>
                <th className="px-4 py-3 font-semibold text-center">Dirty Read</th>
                <th className="px-4 py-3 font-semibold text-center">Non-Repeatable Read</th>
                <th className="px-4 py-3 font-semibold text-center">Phantom Read</th>
                <th className="px-4 py-3 font-semibold">Overhead</th>
                <th className="px-4 py-3 font-semibold">InnoDB Implementation Mechanics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {isolationMatrix.map((item) => {
                const isSelected = selectedLevel === item.level;
                return (
                  <tr
                    key={item.level}
                    onClick={() => {
                      setSelectedLevel(item.level);
                      setSimStep(0);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/60 text-white font-bold' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSelected ? 'bg-cyan-400' : 'bg-slate-700'
                          }`}
                        />
                        <span className="text-cyan-300">{item.level}</span>
                        {item.level === 'REPEATABLE READ' && (
                          <span className="text-[9px] font-sans px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                            MySQL Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.dirtyRead ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <X className="w-3.5 h-3.5" /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <Check className="w-3.5 h-3.5" /> Prevented
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.nonRepeatable ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <X className="w-3.5 h-3.5" /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <Check className="w-3.5 h-3.5" /> Prevented
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.phantomRead ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <X className="w-3.5 h-3.5" /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <Check className="w-3.5 h-3.5" /> Prevented
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{item.overhead}</td>
                    <td className="px-4 py-3.5 text-[11px] font-sans text-slate-400">
                      {item.lockingModel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Anomaly Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Interactive Anomaly Verification Chamber
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an anomaly type and test whether the active isolation level (<strong>{selectedLevel}</strong>) allows or prevents it.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={simStep >= steps.length}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Advance Step ({simStep}/{steps.length})</span>
            </button>
          </div>
        </div>

        {/* Anomaly selector pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          {[
            { id: 'dirty-read' as AnomalyType, label: '1. Dirty Read Test' },
            { id: 'non-repeatable-read' as AnomalyType, label: '2. Non-Repeatable Read Test' },
            { id: 'phantom-read' as AnomalyType, label: '3. Phantom Read Test' }
          ].map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setSelectedAnomaly(a.id);
                setSimStep(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedAnomaly === a.id
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Live Step-by-Step Step Box */}
        <div className="space-y-3 pt-2">
          {steps.map((st, idx) => {
            const isReached = simStep >= idx + 1;
            const isCurrent = simStep === idx + 1;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border font-mono text-xs transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/70 border-cyan-400 text-white shadow'
                    : isReached
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/40 text-slate-600 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 font-bold">
                  <span className="text-cyan-400">Time Slot {st.time}</span>
                  <span className="text-[10px] text-slate-400 font-sans">{st.res}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-sans">
                  <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                    <span className="font-mono text-cyan-300 block text-[10px] uppercase font-bold">Session 1</span>
                    <span className="text-slate-200 font-mono text-[11px]">{st.s1}</span>
                  </div>
                  <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                    <span className="font-mono text-indigo-300 block text-[10px] uppercase font-bold">Session 2</span>
                    <span className="text-slate-200 font-mono text-[11px]">{st.s2}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SdgFooter />
    </div>
  );
};
