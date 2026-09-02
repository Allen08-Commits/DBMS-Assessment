import React, { useState, useEffect } from 'react';
import { RotateCcw, Menu, Database, ShieldCheck, Clock, Activity } from 'lucide-react';
import { WaterUtilityDatabaseEngine } from '../db/dbEngine';

interface HeaderProps {
  db?: WaterUtilityDatabaseEngine;
  onResetDatabase?: () => void;
  onOpenMobileMenu?: () => void;
  operator?: {
    operator_id: string;
    role: string;
  };
  onResetDb?: () => void;
  onLogout?: () => void;
  currentTabName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  db,
  onResetDatabase,
  onOpenMobileMenu,
  onResetDb
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    if (onResetDatabase) {
      onResetDatabase();
    } else if (onResetDb) {
      onResetDb();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-20">
      {/* Left: Mobile trigger & App Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            Utility Management & Database Console
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Smart Water Grid Telemetry, Billing Ledger & ACID Transactions
          </p>
        </div>
      </div>

      {/* Right: Engine Status Badges & Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Status badges matching Bento Design */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold border border-green-200/80 flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>DB ENGINE: ONLINE</span>
          </div>

          <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 shadow-2xs hidden md:inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-slate-500" />
            <span>ISOLATION: SERIALIZABLE</span>
          </div>
        </div>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-mono text-[11px]">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{time}</span>
        </div>

        {/* Reset Database Button */}
        <button
          type="button"
          onClick={handleReset}
          title="Reset database to clean initial state"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Reset DB</span>
        </button>
      </div>
    </header>
  );
};
