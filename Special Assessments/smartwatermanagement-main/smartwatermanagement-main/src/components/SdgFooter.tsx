import React from 'react';
import { Droplet, Award, Cpu, TrendingUp } from 'lucide-react';

export const SdgFooter: React.FC = () => {
  return (
    <footer className="mt-8 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs text-slate-600 text-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-600" />
            <span>DBMS Special Assessment – Smart Water Utility Management System v2.0</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Relational Schemas, B+ Tree Indexes, Modulo 10 Hashing, Execution Plans, and Serializable ACID Concurrency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-semibold shadow-2xs">
            <Droplet className="w-3 h-3 text-cyan-600" />
            SDG 6: Clean Water
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold shadow-2xs">
            <TrendingUp className="w-3 h-3 text-blue-600" />
            SDG 8: Decent Work
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold shadow-2xs">
            <Cpu className="w-3 h-3 text-indigo-600" />
            SDG 9: Innovation
          </span>
        </div>
      </div>
    </footer>
  );
};
