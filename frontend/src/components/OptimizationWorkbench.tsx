import React from 'react';
import { useSaathiStore } from '../store/useSaathiStore';
import { 
  Play, Sparkles, TrendingUp, ShieldCheck, CheckCircle2, 
  Clock, ArrowRight, IndianRupee, Layers, AlertCircle, Weight 
} from 'lucide-react';

export const OptimizationWorkbench: React.FC = () => {
  const { 
    selectedTrip, 
    consolidatedTrip, 
    pendingDemands, 
    optimizeSelectedTrip, 
    isOptimizing 
  } = useSaathiStore();

  const econ = consolidatedTrip?.dynamic_pricing_breakdown;

  return (
    <div className="space-y-6">
      {/* Top Banner: Trip Selector & Optimization Action */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE TRUCK #{selectedTrip?.id || 1}
              </span>
              <span className="text-slate-400 font-mono text-xs">{selectedTrip?.vehicle_number}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300">Driver: {selectedTrip?.driver?.name || 'Ramesh Kumar'}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Corridor Run: {selectedTrip?.origin_city} ➔ {selectedTrip?.destination_city}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              10-Tonne Multi-Axle • Initial Base Cargo: <span className="text-cyan-400 font-semibold">{selectedTrip?.current_load_tonnes} tonnes</span> • Spare Capacity: <span className="text-emerald-400 font-bold">{selectedTrip?.available_capacity_tonnes} tonnes</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => optimizeSelectedTrip()}
              disabled={isOptimizing}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running OR-Tools VRPPD...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Consolidate & Optimize Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Capacity Progression Bar */}
        {consolidatedTrip?.optimized_waypoints && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Weight className="w-3.5 h-3.5 text-cyan-400" />
                Dynamic Payload Progression (Max 10.0 Tonnes Hard Constraint)
              </span>
              <span className="text-emerald-400 font-mono font-semibold">
                Peak Load: 9.0t / 10.0t (90% Utilization)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {consolidatedTrip.optimized_waypoints.map((wp) => (
                <div 
                  key={`load-bar-${wp.sequence}`} 
                  className={`p-2.5 rounded-xl border ${
                    wp.cumulative_load_tonnes > 8.5 
                      ? 'bg-amber-950/20 border-amber-500/30' 
                      : 'bg-slate-800/50 border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Stop {wp.sequence}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      wp.action === 'PICKUP' ? 'bg-emerald-500/20 text-emerald-400' :
                      wp.action === 'DROP' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {wp.action}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">
                    {wp.cumulative_load_tonnes} <span className="text-xs font-normal text-slate-400">tonnes</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        wp.cumulative_load_tonnes > 8.5 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${(wp.cumulative_load_tonnes / 10.0) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Grid: Route Waypoints Timeline & Fair-Share Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Optimized Route Waypoints Sequence (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Optimized Multi-Stop Route Itinerary
            </h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
              Solver: Google OR-Tools VRPPD
            </span>
          </div>

          <div className="space-y-3">
            {consolidatedTrip?.optimized_waypoints ? (
              consolidatedTrip.optimized_waypoints.map((wp, idx) => (
                <div
                  key={`waypoint-row-${wp.sequence}`}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    wp.action === 'START' ? 'bg-blue-600 text-white' :
                    wp.action === 'PICKUP' ? 'bg-emerald-600 text-white' :
                    wp.action === 'DROP' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {wp.sequence}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white truncate">{wp.stop_name}</h4>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> ETA +{wp.eta_mins}m
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        Action: <strong className={wp.action === 'PICKUP' ? 'text-emerald-400' : wp.action === 'DROP' ? 'text-rose-400' : 'text-slate-200'}>{wp.action}</strong>
                      </span>
                      {wp.tonnes_delta !== 0 && (
                        <span>
                          Load Delta: <strong className={wp.tonnes_delta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {wp.tonnes_delta > 0 ? `+${wp.tonnes_delta}` : wp.tonnes_delta}t
                          </strong>
                        </span>
                      )}
                      <span>Cumulative: <strong className="text-cyan-300">{wp.cumulative_load_tonnes}t</strong></span>
                      {wp.distance_from_prev_km > 0 && (
                        <span className="text-slate-500 font-mono">+{wp.distance_from_prev_km} km leg</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Click "Consolidate & Optimize Route" above to generate the VRPPD multi-stop route.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fair-Share Dynamic Pricing & Driver Revenue Floor (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Driver Guarantee & Economics Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                Fair-Share Pricing & Floor
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                120% Floor Guarantee
              </span>
            </div>

            {econ ? (
              <div className="space-y-3.5 text-xs">
                {/* Driver Baseline vs Final Payout */}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Baseline Solo Truck Run (153.6 km @ ₹32/km):</span>
                    <span className="font-mono text-slate-400">₹{econ.driver_baseline_revenue}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Driver Guaranteed Floor (≥120%):</span>
                    <span className="font-mono text-purple-300 font-semibold">₹{econ.driver_min_guaranteed_floor}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold border-t border-slate-700 pt-2 text-sm">
                    <span>Final Driver Payout:</span>
                    <span className="font-mono text-base font-bold">₹{econ.driver_final_payout} (+{econ.driver_gain_over_baseline_pct}%)</span>
                  </div>
                  <div className="text-[11px] text-emerald-300/80">
                    Driver earns an extra <strong>₹{econ.driver_extra_earnings_inr}</strong> with only <strong>{econ.detour_km} km</strong> detour!
                  </div>
                </div>

                {/* Shippers Revenue & Pooling Discount */}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                  <div className="font-semibold text-white text-xs">Pooled MSME Shippers Breakdown</div>
                  {econ.shipper_breakdowns?.map((s) => (
                    <div key={`s-bk-${s.demand_id}`} className="flex items-center justify-between border-b border-slate-700/50 pb-1.5">
                      <div>
                        <div className="text-slate-200 font-medium">{s.shipper_name}</div>
                        <div className="text-[11px] text-slate-400">{s.pickup_city} ➔ {s.drop_city} ({s.weight_tonnes}t)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-mono font-bold">₹{s.final_pooled_price}</div>
                        <div className="text-[10px] text-slate-400 line-through">₹{s.raw_solo_price} (Save {s.savings_pct}%)</div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between text-slate-300 pt-1">
                    <span>Total MSME Freight Savings:</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{econ.total_msme_savings_inr}</span>
                  </div>
                </div>

                {/* Platform Margin */}
                <div className="flex justify-between text-slate-400 px-1">
                  <span>Platform Routing Margin:</span>
                  <span className="font-mono text-slate-300">₹{econ.platform_fee_inr}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Run optimization to calculate real-time fair share payouts.
              </div>
            )}
          </div>

          {/* Pending Demands Pool in Corridor */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Active LTL Load Pool in Corridor
              </h3>
              <span className="text-xs text-slate-400">{pendingDemands.length} available</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {pendingDemands.map((dem) => (
                <div
                  key={`dem-${dem.id}`}
                  className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="text-white font-medium flex items-center gap-1.5">
                      <span>{dem.pickup_city} ➔ {dem.drop_city}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                        dem.urgency === 'express' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {dem.urgency}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {dem.cargo_type} • <span className="text-cyan-300 font-semibold">{dem.weight_tonnes} tonnes</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      dem.status === 'matched' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {dem.status.toUpperCase()}
                    </span>
                    <div className="text-slate-300 font-mono mt-0.5">₹{dem.quoted_price || 1200}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
