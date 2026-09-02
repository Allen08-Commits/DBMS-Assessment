import React, { useState } from 'react';
import { Droplets, Shield, Lock, User, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Operator } from '../types';

interface LoginProps {
  onLogin: (operator: Operator) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('ADMIN001');
  const [password, setPassword] = useState('water123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (employeeId.trim().toUpperCase() === 'ADMIN001' && password === 'water123') {
        onLogin({
          operator_id: 'ADMIN001',
          operator_name: 'Dr. S. K. Narayana (Chief Engineer)',
          zone: 'All Zones',
          role: 'ADMIN',
          email: 'admin.narayana@waterboard.gov.in'
        });
      } else if (employeeId.trim().toUpperCase() === 'BILL001' && password === 'water123') {
        onLogin({
          operator_id: 'BILL001',
          operator_name: 'Ramesh Varma',
          zone: 'Zone A',
          role: 'BILLING_OPERATOR',
          email: 'ramesh.billing@waterboard.gov.in'
        });
      } else if (employeeId.trim().toUpperCase() === 'CMP001' && password === 'water123') {
        onLogin({
          operator_id: 'CMP001',
          operator_name: 'Anita Sen',
          zone: 'All Zones',
          role: 'COMPLAINT_OPERATOR',
          email: 'anita.complaints@waterboard.gov.in'
        });
      } else {
        setError('Invalid Employee ID or Password. Use Demo Account (ADMIN001 / water123)');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoFill = (id: string) => {
    setEmployeeId(id);
    setPassword('water123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100 relative overflow-hidden">
      {/* Background ambient water glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 shadow-inner">
            <Droplets className="w-9 h-9 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Smart Water Utility Management System
          </h1>
          <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mt-2">
            Consumption Monitoring • Billing • Payments • Complaints
          </p>
          <div className="inline-block mt-3 px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-xs text-slate-300">
            Municipal Water Supply & Sewerage Board Console
          </div>
        </div>

        {/* Demo Credentials Box */}
        <div className="mb-6 p-3.5 bg-cyan-950/40 border border-cyan-800/50 rounded-xl">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Authorized Demo Staff Access:
            </span>
            <span className="text-[10px] bg-cyan-900/60 px-2 py-0.5 rounded text-cyan-200">1-Click Fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('ADMIN001')}
              className={`text-xs py-1.5 px-2 rounded font-mono transition-all text-center border ${
                employeeId === 'ADMIN001'
                  ? 'bg-cyan-600 text-white border-cyan-400 font-bold shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              ADMIN001
              <span className="block text-[9px] font-sans opacity-80">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('BILL001')}
              className={`text-xs py-1.5 px-2 rounded font-mono transition-all text-center border ${
                employeeId === 'BILL001'
                  ? 'bg-cyan-600 text-white border-cyan-400 font-bold shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              BILL001
              <span className="block text-[9px] font-sans opacity-80">Billing</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('CMP001')}
              className={`text-xs py-1.5 px-2 rounded font-mono transition-all text-center border ${
                employeeId === 'CMP001'
                  ? 'bg-cyan-600 text-white border-cyan-400 font-bold shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              CMP001
              <span className="block text-[9px] font-sans opacity-80">Complaints</span>
            </button>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Demo Password: <code className="text-cyan-300 font-mono font-bold">water123</code></span>
            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Employee ID / Operator ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. ADMIN001"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Utility Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Database Management Systems Academic Project
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            MySQL Relational Engine • B+ Tree Indexing • ACID Serializable
          </p>
        </div>
      </div>
    </div>
  );
};
