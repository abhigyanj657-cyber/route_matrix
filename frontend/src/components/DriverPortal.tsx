import React, { useState } from 'react';
import { useSaathiStore } from '../store/useSaathiStore';
import { Truck, Plus, ShieldCheck, IndianRupee, Navigation, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

const CITIES = [
  'Patna', 'Muzaffarpur', 'Darbhanga', 'Samastipur', 
  'Madhubani', 'Begusarai', 'Purnea', 'Siliguri', 'Bhagalpur', 'Gaya'
];

export const DriverPortal: React.FC = () => {
  const { activeTrips, publishNewTrip, users, consolidatedTrip } = useSaathiStore();

  const [originCity, setOriginCity] = useState('Patna');
  const [destCity, setDestCity] = useState('Madhubani');
  const [vehicleNo, setVehicleNo] = useState('BR-01-GB-4592');
  const [totalCapacity, setTotalCapacity] = useState<number>(10.0);
  const [currentLoad, setCurrentLoad] = useState<number>(6.0);
  const [detourPct, setDetourPct] = useState<number>(15.0);
  const [baseFarePerKm, setBaseFarePerKm] = useState<number>(32.0);
  const [selectedDriverId, setSelectedDriverId] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const drivers = users.filter(u => u.role === 'driver');
  const econ = consolidatedTrip?.dynamic_pricing_breakdown;

  const handlePublishTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await publishNewTrip({
        driver_id: selectedDriverId,
        vehicle_number: vehicleNo,
        origin_city: originCity,
        destination_city: destCity,
        origin_coords: [25.5941, 85.1376],
        dest_coords: [26.3549, 86.0717],
        total_capacity_tonnes: Number(totalCapacity),
        current_load_tonnes: Number(currentLoad),
        detour_threshold_pct: Number(detourPct),
        base_fare_per_km: Number(baseFarePerKm),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            FLEET & DRIVER PORTAL
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Publish Spare Capacity & Guaranteed 120% Revenue Runs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monetize empty space on primary runs. LastMileSaathi guarantees at least 120% of your baseline fare.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Publish Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <form onSubmit={handlePublishTrip} className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              Vehicle Trip & Route Declaration
            </h3>

            {/* Driver Profile */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Driver / Transporter Profile</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone}) • Rating: ⭐{d.rating}
                  </option>
                ))}
                {drivers.length === 0 && (
                  <option value={4}>Ramesh Kumar (Maa Vaishno Logistics)</option>
                )}
              </select>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Commercial Vehicle Number</label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. BR-01-GB-4592"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Origin Hub</label>
                <select
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {CITIES.map((c) => (
                    <option key={`orig-${c}`} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Final Destination Hub</label>
                <select
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {CITIES.filter(c => c !== originCity).map((c) => (
                    <option key={`dest-${c}`} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Capacities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Truck Capacity (Tonnes)</label>
                <input
                  type="number"
                  step="0.5"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(parseFloat(e.target.value) || 10.0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Base Load (Tonnes)</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentLoad}
                  onChange={(e) => setCurrentLoad(parseFloat(e.target.value) || 0.0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Detour & Base Fare */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Max Detour Threshold (%)</label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="25"
                  value={detourPct}
                  onChange={(e) => setDetourPct(parseFloat(e.target.value) || 15.0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Hard constraint: 15% standard limit</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Base Rate (₹/km)</label>
                <input
                  type="number"
                  step="1"
                  value={baseFarePerKm}
                  onChange={(e) => setBaseFarePerKm(parseFloat(e.target.value) || 32.0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Spare capacity indicator */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-medium">Calculated Spare Capacity Available:</span>
              <span className="text-base font-bold text-emerald-300 font-mono">
                {Math.max(0, totalCapacity - currentLoad).toFixed(1)} Tonnes
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 transition text-sm flex items-center justify-center space-x-2"
            >
              {isSubmitting ? <span>Publishing Trip...</span> : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish Spare Capacity to Route Matrix</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Driver Earnings & Guarantee Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                Driver Earnings Guarantee
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Guaranteed Floor
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-300">Baseline Trip Revenue:</span>
                <span className="text-sm font-mono text-slate-300">₹{econ?.driver_baseline_revenue || 4915.52}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-purple-300 font-semibold">120% Guaranteed Floor:</span>
                <span className="text-base font-mono font-bold text-purple-300">₹{econ?.driver_min_guaranteed_floor || 5898.62}</span>
              </div>
              <div className="border-t border-purple-500/20 pt-3 flex justify-between items-baseline">
                <span className="text-xs text-emerald-400 font-bold">Optimized Total Payout:</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">
                  ₹{econ?.driver_final_payout || 5906.88}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gain over single run: <strong className="text-emerald-400">+{econ?.driver_gain_over_baseline_pct || 20.2}% (₹{econ?.driver_extra_earnings_inr || 991.36})</strong></span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero empty-run risk on return corridors.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Immediate settlement via UPI upon OTP delivery verification.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated GST Part-B E-Way Bill dynamic assignment.</span>
              </div>
            </div>
          </div>

          {/* Active Registered Fleet */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white">Active Trucks in Corridor ({activeTrips.length})</h3>
            <div className="space-y-2">
              {activeTrips.map((t) => (
                <div key={`act-t-${t.id}`} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-white font-mono font-bold">{t.vehicle_number}</div>
                    <div className="text-slate-400">{t.origin_city} ➔ {t.destination_city}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-semibold">{t.available_capacity_tonnes}t Spare</div>
                    <div className="text-[10px] text-slate-400">₹{t.base_fare_per_km}/km</div>
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
