import React, { useEffect } from 'react';
import { useSaathiStore } from './store/useSaathiStore';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { DispatcherDashboard } from './components/DispatcherDashboard';
import { ShipperPortal } from './components/ShipperPortal';
import { DriverConsole } from './components/DriverConsole';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    activeRole, 
    loadInitialData, 
    toastMessage, 
    toastType, 
    clearToast 
  } = useSaathiStore();

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-900">
      {/* Navigation Header */}
      <Header />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Stats Bar */}
        <StatsBar />

        {/* Dynamic Role Views */}
        {activeRole === 'dispatcher' && <DispatcherDashboard />}
        {activeRole === 'shipper' && <ShipperPortal />}
        {activeRole === 'driver' && <DriverConsole />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">LastMileSaathi</span>
            <span>• AI-Optimized Freight Consolidation & Backhaul Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Powered by Google OR-Tools VRPPD</span>
            <span>Bihar / Eastern India Corridors (NH-27 / NH-31)</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[9999] flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs max-w-md animate-in slide-in-from-bottom-5">
          {toastType === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastType === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toastType === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
          
          <p className="text-slate-200 flex-1">{toastMessage}</p>
          
          <button 
            onClick={clearToast}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
