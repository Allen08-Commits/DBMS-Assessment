import React, { useState, useEffect } from 'react';
import { dbEngine } from './db/dbEngine';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ConnectionManagement } from './components/ConnectionManagement';
import { MeterReadings } from './components/MeterReadings';
import { ConsumptionHistory } from './components/ConsumptionHistory';
import { LeakDetection } from './components/LeakDetection';
import { FileOrganization } from './components/FileOrganization';
import { BPlusTreeVisualizer } from './components/BPlusTreeVisualizer';
import { HashingDemo } from './components/HashingDemo';
import { BillingModule } from './components/BillingModule';
import { BillTransactionDemo } from './components/BillTransactionDemo';
import { Payments } from './components/Payments';
import { Complaints } from './components/Complaints';
import { QueryOptimization } from './components/QueryOptimization';
import { ExecutionPlanAnalyzer } from './components/ExecutionPlanAnalyzer';
import { TransactionSandbox } from './components/TransactionSandbox';
import { ConcurrencySimulation } from './components/ConcurrencySimulation';
import { IsolationLevels } from './components/IsolationLevels';
import { PerformanceAnalysis } from './components/PerformanceAnalysis';
import { ValidationTests } from './components/ValidationTests';
import { SecurityRoles } from './components/SecurityRoles';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Read data from in-memory engine
  const [connections, setConnections] = useState(dbEngine.connections);
  const [meterReadings, setMeterReadings] = useState(dbEngine.meterReadings);
  const [bills, setBills] = useState(dbEngine.bills);
  const [payments, setPayments] = useState(dbEngine.payments);
  const [complaints, setComplaints] = useState(dbEngine.complaints);

  const refreshData = () => {
    setConnections([...dbEngine.connections]);
    setMeterReadings([...dbEngine.meterReadings]);
    setBills([...dbEngine.bills]);
    setPayments([...dbEngine.payments]);
    setComplaints([...dbEngine.complaints]);
    setRefreshKey((prev) => prev + 1);
  };

  const handleResetDatabase = () => {
    dbEngine.resetToDefaults();
    refreshData();
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          db={dbEngine}
          onResetDatabase={handleResetDatabase}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              db={dbEngine}
              connections={connections}
              meterReadings={meterReadings}
              bills={bills}
              complaints={complaints}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'connections' && (
            <ConnectionManagement
              connections={connections}
              db={dbEngine}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'meter-readings' && (
            <MeterReadings
              meterReadings={meterReadings}
              connections={connections}
              db={dbEngine}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'consumption-history' && (
            <ConsumptionHistory
              connections={connections}
              meterReadings={meterReadings}
              db={dbEngine}
            />
          )}

          {activeTab === 'leak-detection' && (
            <LeakDetection
              db={dbEngine}
              connections={connections}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'file-organization' && <FileOrganization />}

          {activeTab === 'btree-visualizer' && (
            <BPlusTreeVisualizer
              bTree={dbEngine.bTree}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'hashing-demo' && (
            <HashingDemo
              hashIndex={dbEngine.hashIndex}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'billing' && (
            <BillingModule
              bills={bills}
              connections={connections}
              db={dbEngine}
              onNavigate={setActiveTab}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'bill-transaction' && <BillTransactionDemo />}

          {activeTab === 'payments' && (
            <Payments
              payments={payments}
              bills={bills}
              connections={connections}
              db={dbEngine}
              onNavigate={setActiveTab}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'complaints' && (
            <Complaints
              complaints={complaints}
              connections={connections}
              db={dbEngine}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'query-optimization' && <QueryOptimization />}

          {activeTab === 'execution-plan' && <ExecutionPlanAnalyzer />}

          {activeTab === 'acid-sandbox' && <TransactionSandbox />}

          {activeTab === 'concurrency' && <ConcurrencySimulation />}

          {activeTab === 'isolation-levels' && <IsolationLevels />}

          {activeTab === 'performance' && <PerformanceAnalysis />}

          {activeTab === 'validation-tests' && <ValidationTests db={dbEngine} />}

          {activeTab === 'security-roles' && <SecurityRoles />}
        </main>
      </div>
    </div>
  );
}
