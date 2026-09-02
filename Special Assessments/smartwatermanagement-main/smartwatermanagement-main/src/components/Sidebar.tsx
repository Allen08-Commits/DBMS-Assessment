import React from 'react';
import {
  LayoutDashboard,
  Users,
  Gauge,
  History,
  AlertTriangle,
  Receipt,
  CreditCard,
  MessageSquareWarning,
  Zap,
  SearchCode,
  Network,
  Binary,
  FolderTree,
  ShieldCheck,
  GitFork,
  Sliders,
  BarChart3,
  CheckCircle2,
  Lock,
  Workflow,
  X,
  Droplets
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'connections'
  | 'meter-readings'
  | 'consumption-history'
  | 'leak-detection'
  | 'file-organization'
  | 'btree-visualizer'
  | 'hashing-demo'
  | 'billing'
  | 'bill-transaction'
  | 'payments'
  | 'complaints'
  | 'query-optimization'
  | 'execution-plan'
  | 'acid-sandbox'
  | 'concurrency'
  | 'isolation-levels'
  | 'performance'
  | 'validation-tests'
  | 'security-roles';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  leakCount?: number;
  openComplaintsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen = false,
  onCloseMobile,
  leakCount = 14,
  openComplaintsCount = 2
}) => {
  const navSections = [
    {
      title: 'Navigation',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'connections' as NavTab, label: 'Connections', icon: Users },
        { id: 'meter-readings' as NavTab, label: 'Meter Readings', icon: Gauge },
        { id: 'consumption-history' as NavTab, label: 'Consumption History', icon: History },
        {
          id: 'leak-detection' as NavTab,
          label: 'Leak Detection',
          icon: AlertTriangle,
          badge: leakCount > 0 ? `${leakCount} Active` : undefined,
          badgeColor: 'bg-rose-500 text-white'
        },
        { id: 'billing' as NavTab, label: 'Billing Module', icon: Receipt },
        { id: 'payments' as NavTab, label: 'Payments & Ledger', icon: CreditCard },
        {
          id: 'complaints' as NavTab,
          label: 'Complaints',
          icon: MessageSquareWarning,
          badge: openComplaintsCount > 0 ? `${openComplaintsCount}` : undefined,
          badgeColor: 'bg-amber-500 text-slate-900 font-bold'
        }
      ]
    },
    {
      title: 'DBMS Storage & Indexing',
      items: [
        { id: 'file-organization' as NavTab, label: 'File Organization', icon: FolderTree },
        { id: 'btree-visualizer' as NavTab, label: 'B+ Tree Indexing', icon: Network },
        { id: 'hashing-demo' as NavTab, label: 'Modulo 10 Hashing', icon: Binary },
        { id: 'query-optimization' as NavTab, label: 'Query Optimization', icon: Zap },
        { id: 'execution-plan' as NavTab, label: 'Execution Plan Analyzer', icon: SearchCode }
      ]
    },
    {
      title: 'ACID & Concurrency',
      items: [
        { id: 'acid-sandbox' as NavTab, label: 'Transactions (ACID)', icon: ShieldCheck },
        { id: 'bill-transaction' as NavTab, label: 'Bill Generation Txn', icon: Workflow },
        { id: 'concurrency' as NavTab, label: 'Concurrency Lab', icon: GitFork },
        { id: 'isolation-levels' as NavTab, label: 'Isolation Levels', icon: Sliders }
      ]
    },
    {
      title: 'Security & Audit',
      items: [
        { id: 'performance' as NavTab, label: 'Performance Lab', icon: BarChart3 },
        { id: 'validation-tests' as NavTab, label: 'Validation Suite', icon: CheckCircle2 },
        { id: 'security-roles' as NavTab, label: 'Security & RBAC', icon: Lock }
      ]
    }
  ];

  const sidebarContent = (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col h-full shrink-0 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center shadow-xs">
            <Droplets className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm tracking-tight text-white block">
              SMART WATER UTILITY
            </span>
            <span className="text-[10px] text-cyan-400 font-mono block">DBMS Management</span>
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 text-xs font-medium space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="text-slate-400 px-3 py-1.5 uppercase text-[10px] tracking-widest font-bold">
              {section.title}
            </div>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all text-left ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Operator Card at Bottom */}
      <div className="p-3 m-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-cyan-300">
            A1
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Employee ID
            </p>
            <p className="text-xs font-bold text-white truncate">ADMIN001</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full shrink-0">{sidebarContent}</div>

      {/* Mobile Sidebar Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0F172A]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
