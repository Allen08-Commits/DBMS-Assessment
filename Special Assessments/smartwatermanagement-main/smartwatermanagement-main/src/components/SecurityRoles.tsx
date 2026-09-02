import React, { useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  FileCode2,
  Users,
  ShieldCheck,
  Zap,
  Terminal
} from 'lucide-react';
import { SdgFooter } from './SdgFooter';

export const SecurityRoles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rbac' | 'sqli'>('rbac');

  // SQLi Interactive Chamber state
  const [inputPayload, setInputPayload] = useState("' OR '1'='1");
  const [sqliResult, setSqliResult] = useState<{
    vulnerableSql: string;
    vulnerableRows: number;
    parameterizedSql: string;
    parameterizedRows: number;
  }>({
    vulnerableSql: "SELECT * FROM connection WHERE connection_id = '' OR '1'='1';",
    vulnerableRows: 24,
    parameterizedSql: "PREPARE stmt FROM 'SELECT * FROM connection WHERE connection_id = ?';\nSET @param = \"' OR '1'='1\";\nEXECUTE stmt USING @param;",
    parameterizedRows: 0
  });

  const handleTestPayload = (payload: string) => {
    setInputPayload(payload);
    const isInjection = payload.includes("' OR") || payload.includes("OR 1=1") || payload.includes("UNION SELECT");
    setSqliResult({
      vulnerableSql: `SELECT * FROM connection WHERE connection_id = '${payload}';`,
      vulnerableRows: isInjection ? 24 : payload === 'CON10001' ? 1 : 0,
      parameterizedSql: `PREPARE stmt FROM 'SELECT * FROM connection WHERE connection_id = ?';\nSET @param = "${payload.replace(/"/g, '\\"')}";\nEXECUTE stmt USING @param;`,
      parameterizedRows: payload === 'CON10001' ? 1 : 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-600" />
            Database Security, Roles & Privilege Matrix
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Demonstrating SQL Data Control Language (DCL: GRANT / REVOKE), Role-Based Access Control (RBAC), and Prepared Statements against SQL Injection.
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'rbac' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            RBAC & DCL Grants
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sqli')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'sqli' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SQLi Defense Chamber
          </button>
        </div>
      </div>

      {activeTab === 'rbac' ? (
        <>
          {/* RBAC Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600" />
                Role-Based Access Control (RBAC) Permission Matrix
              </h3>
              <span className="text-[10px] font-mono text-cyan-800 font-bold">Principle of Least Privilege</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">User Role</th>
                    <th className="px-4 py-3 font-bold">CONNECTION</th>
                    <th className="px-4 py-3 font-bold">METER_READING</th>
                    <th className="px-4 py-3 font-bold">BILL & PAYMENT</th>
                    <th className="px-4 py-3 font-bold">COMPLAINT</th>
                    <th className="px-4 py-3 font-bold">AUDIT_LOG</th>
                    <th className="px-4 py-3 font-bold">DDL (Schema)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-cyan-800 font-sans">
                      Administrator (DBA)
                    </td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">ALL PRIVILEGES</td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">ALL PRIVILEGES</td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">ALL PRIVILEGES</td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">ALL PRIVILEGES</td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">ALL PRIVILEGES</td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">CREATE / ALTER / DROP</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-indigo-800 font-sans">Billing Clerk</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">SELECT, INSERT, UPDATE</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-rose-700 font-bold">NONE (DENIED)</td>
                    <td className="px-4 py-3.5 text-rose-700 font-bold">NONE (DENIED)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-amber-800 font-sans">Meter Reader</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">SELECT, INSERT</td>
                    <td className="px-4 py-3.5 text-rose-700 font-bold">NONE (DENIED)</td>
                    <td className="px-4 py-3.5 text-rose-700 font-bold">NONE (DENIED)</td>
                    <td className="px-4 py-3.5 text-rose-700 font-bold">NONE (DENIED)</td>
                    <td className="px-4 py-3.5 text-rose-700 font-bold">NONE (DENIED)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-teal-800 font-sans">Support Agent</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">SELECT, INSERT, UPDATE</td>
                    <td className="px-4 py-3.5 text-rose-700 font-bold">NONE (DENIED)</td>
                    <td className="px-4 py-3.5 text-rose-700 font-bold">NONE (DENIED)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-purple-800 font-sans">Auditor</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-slate-600">SELECT</td>
                    <td className="px-4 py-3.5 text-rose-700 font-bold">NONE (DENIED)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* DCL Scripts Container */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              Standard MySQL DCL (Data Control Language) Script Implementation
            </h3>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-cyan-200 overflow-x-auto space-y-2">
              <div>
                <span className="text-slate-400 font-semibold">-- 1. Create Granular DB Users</span>
                <br />
                <span className="text-purple-400">CREATE USER</span> 'billing_clerk'@'%' <span className="text-purple-400">IDENTIFIED BY</span> 'ClerkSecurePass!2026';
                <br />
                <span className="text-purple-400">CREATE USER</span> 'meter_reader'@'%' <span className="text-purple-400">IDENTIFIED BY</span> 'MeterSecurePass!2026';
              </div>

              <div>
                <span className="text-slate-400 font-semibold">-- 2. Grant Least-Privilege DCL Permissions</span>
                <br />
                <span className="text-purple-400">GRANT SELECT, INSERT, UPDATE ON</span> smart_water.bill <span className="text-purple-400">TO</span> 'billing_clerk'@'%';
                <br />
                <span className="text-purple-400">GRANT SELECT, INSERT ON</span> smart_water.payment <span className="text-purple-400">TO</span> 'billing_clerk'@'%';
                <br />
                <span className="text-purple-400">GRANT SELECT, INSERT ON</span> smart_water.meter_reading <span className="text-purple-400">TO</span> 'meter_reader'@'%';
              </div>

              <div>
                <span className="text-slate-400 font-semibold">-- 3. Explicit Revocation of Destructive DDL & Deletes</span>
                <br />
                <span className="text-rose-400">REVOKE DELETE, DROP ON</span> smart_water.* <span className="text-purple-400">FROM</span> 'billing_clerk'@'%';
                <br />
                <span className="text-purple-400">FLUSH PRIVILEGES;</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* SQL Injection Chamber */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              SQL Injection Defense Chamber (Prepared Statements vs Dynamic SQL)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test common SQL injection attack payloads and contrast raw string concatenation with pre-compiled parameterized queries.
            </p>

            {/* Quick payload buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                "' OR '1'='1",
                "CON10001' OR '1'='1' --",
                "' UNION SELECT bill_id, amount, NULL FROM bill --",
                "CON10001"
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleTestPayload(p)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                    inputPayload === p
                      ? 'bg-cyan-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Custom User Input Parameter:
              </label>
              <input
                type="text"
                value={inputPayload}
                onChange={(e) => handleTestPayload(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Side-by-side Result Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vulnerable Concatenation */}
            <div className="bg-white border border-rose-300 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Vulnerable Dynamic String Concatenation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                  HIGH SEVERITY
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto whitespace-pre-wrap">
                {sqliResult.vulnerableSql}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-mono py-1 border-b border-slate-200">
                  <span className="text-slate-600">Rows Leaked / Returned:</span>
                  <span className="text-rose-600 font-bold text-sm">
                    {sqliResult.vulnerableRows} records (DATA LEAKED)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  The SQL parser treats injected tautology <code className="text-rose-700 font-mono font-bold">'1'='1'</code> as executable boolean logic, bypassing authentication.
                </p>
              </div>
            </div>

            {/* Safe Parameterized PreparedStatement */}
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Pre-compiled Prepared Statement (Safe)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  SECURE
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                {sqliResult.parameterizedSql}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-mono py-1 border-b border-slate-200">
                  <span className="text-slate-600">Rows Returned:</span>
                  <span className="text-emerald-600 font-bold text-sm">
                    {sqliResult.parameterizedRows} records (SAFE)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  The input is treated strictly as literal string data, not executable SQL syntax tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <SdgFooter />
    </div>
  );
};
