import React from 'react';
import { Truck, Layers, Leaf, Route, IndianRupee, Zap } from 'lucide-react';
import { useSaathiStore } from '../store/useSaathiStore';

export const StatsBar: React.FC = () => {
  const { activeTrips, pendingDemands, consolidatedTrip } = useSaathiStore();

  const emptyKmSaved = consolidatedTrip?.empty_km_saved || 153.6;
  const co2Cut = consolidatedTrip?.co2_cut_kg || 104.5;
  const detourPct = consolidatedTrip?.detour_pct || 0.38;
  const msmeSavings = consolidatedTrip?.dynamic_pricing_breakdown?.total_msme_savings_inr || 440.6;
  const driverExtra = consolidatedTrip?.dynamic_pricing_breakdown?.driver_extra_earnings_inr || 991.4;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Active Trucks */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Active Trucks</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">{activeTrips.length}</span>
          <span className="text-xs text-blue-400 font-mono">10t Payload</span>
        </div>
      </div>

      {/* LTL Demand Pool */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Pending Demands</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">{pendingDemands.length} Loads</span>
          <span className="text-xs text-amber-400 font-mono">
            {pendingDemands.filter(d => d.status === 'matched').length} Matched
          </span>
        </div>
      </div>

      {/* Detour Ratio Constraint */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Route Detour</span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Route className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">+{detourPct}%</span>
          <span className="text-xs text-emerald-400 font-mono">≤ 15% Cap</span>
        </div>
      </div>

      {/* Empty KM Saved */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Empty KM Saved</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">{emptyKmSaved} km</span>
          <span className="text-xs text-indigo-400 font-mono">Backhaul Co-load</span>
        </div>
      </div>

      {/* CO2 Emissions Cut */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">CO2 Emissions Cut</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Leaf className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-emerald-400">{co2Cut} kg</span>
          <span className="text-xs text-emerald-500 font-mono">Diesel Saved</span>
        </div>
      </div>

      {/* MSME & Driver Gain */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Driver Bonus Floor</span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">+₹{driverExtra}</span>
          <span className="text-xs text-emerald-400 font-mono">≥ 120% Payout</span>
        </div>
      </div>
    </div>
  );
};
