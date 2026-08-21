import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSaathiStore } from '../store/useSaathiStore';
import { useLanguageStore } from '../store/languageStore';
import { 
  Sparkles, Play, Pause, RotateCcw, FastForward, 
  Layers, IndianRupee, ShieldCheck, CheckCircle2, 
  Clock, Route, Leaf, Zap, Activity, Weight, MapPin,
  Phone, UserCheck, Truck, ArrowRight, FileText, Navigation,
  ChevronRight, ExternalLink, Radio, AlertCircle, Eye,
  Compass, Gauge, KeyRound, Check
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { generateRoutePoints } from '../services/telematics';

// Auto-Fit Map Bounds
const ChangeView: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [coords, map]);
  return null;
};

// Custom Leaflet Icons
const createMarkerIcon = (type: 'truck' | 'pickup' | 'drop' | 'depot' | 'moving_truck', seq?: number, heading?: number, vehicleNum?: string) => {
  if (type === 'moving_truck') {
    return L.divIcon({
      className: 'custom-moving-truck-pin',
      html: `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0284c7, #2563eb); border: 2px solid #38bdf8; border-radius: 50%; box-shadow: 0 0 16px rgba(56, 189, 248, 0.8); transform: rotate(${heading || 0}deg);">
          <span style="font-size: 16px;">🚛</span>
        </div>
        <div style="font-size: 10px; font-weight: 700; color: #38bdf8; background: rgba(15,23,42,0.9); padding: 2px 6px; border-radius: 4px; border: 1px solid #0284c7; margin-top: 3px; white-space: nowrap; text-align: center;">
          ${vehicleNum || 'BR-01-GB-4592'} (LIVE)
        </div>
      `,
      iconSize: [38, 52],
      iconAnchor: [19, 26],
    });
  }

  let bgClass = 'bg-emerald-500 text-slate-900 border-2 border-white shadow-lg font-bold';
  let iconText = `P${seq || ''}`;

  if (type === 'drop') {
    bgClass = 'bg-rose-500 text-white border-2 border-white shadow-lg font-bold';
    iconText = `D${seq || ''}`;
  } else if (type === 'depot') {
    bgClass = 'bg-amber-500 text-slate-900 border-2 border-white shadow-lg font-bold';
    iconText = '🏁';
  } else if (type === 'truck') {
    bgClass = 'bg-blue-600 text-white border-2 border-white shadow-lg font-bold';
    iconText = '🚀';
  }

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%;" class="${bgClass}">
        <span style="font-size: 12px;">${iconText}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const DispatcherDashboard: React.FC = () => {
  const { 
    selectedTrip, 
    consolidatedTrip, 
    pendingDemands, 
    driverRosters,
    optimizeSelectedTrip, 
    isOptimizing,
    showToast
  } = useSaathiStore();

  const { t, bilingual, isBilingualMode, currentLanguage } = useLanguageStore();

  // Sub-tabs: 'matrix' vs 'roster'
  const [activeTab, setActiveTab] = useState<'matrix' | 'roster'>('matrix');

  // Modals
  const [callModalDriver, setCallModalDriver] = useState<any | null>(null);
  const [ewayModalDemand, setEwayModalDemand] = useState<any | null>(null);
  const [inspectOrder, setInspectOrder] = useState<any | null>(null);

  const econ = consolidatedTrip?.dynamic_pricing_breakdown;

  // --- Telematics Simulation State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [simStep, setSimStep] = useState<number>(0);

  // Generate sub-points for smooth vehicle movement along waypoints
  const routePoints = useMemo(() => {
    if (!consolidatedTrip?.optimized_waypoints) return [];
    return generateRoutePoints(
      consolidatedTrip.optimized_waypoints.map(w => ({
        location_coords: [w.location_coords[0], w.location_coords[1]] as [number, number],
        stop_name: w.stop_name,
        action: w.action
      })),
      25
    );
  }, [consolidatedTrip]);

  const currentPoint = routePoints[simStep] || (routePoints.length > 0 ? routePoints[0] : null);

  // Simulation timer loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && routePoints.length > 0) {
      timer = setInterval(() => {
        setSimStep((prev) => {
          if (prev >= routePoints.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / (20 * playbackSpeed));
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed, routePoints.length]);

  // All Coordinates for map fitting
  const allMapCoords = useMemo(() => {
    const coords: [number, number][] = [];
    if (selectedTrip) {
      coords.push(selectedTrip.origin_coords);
      coords.push(selectedTrip.dest_coords);
    }
    if (consolidatedTrip?.optimized_waypoints) {
      consolidatedTrip.optimized_waypoints.forEach((w) => coords.push(w.location_coords));
    } else {
      pendingDemands.forEach((d) => {
        coords.push(d.pickup_coords);
        coords.push(d.drop_coords);
      });
    }
    return coords;
  }, [selectedTrip, consolidatedTrip, pendingDemands]);

  const polylineCoords = useMemo(() => {
    if (consolidatedTrip?.optimized_waypoints) {
      return consolidatedTrip.optimized_waypoints.map(w => w.location_coords);
    }
    if (selectedTrip) {
      return [selectedTrip.origin_coords, selectedTrip.dest_coords];
    }
    return [];
  }, [consolidatedTrip, selectedTrip]);

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {bilingual('dispatcherNav').primary}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live Pan-India Grid
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBilingualMode && currentLanguage !== 'en' 
              ? 'कंट्रोल सेंटर व बैकहॉल ऑप्टिमाइज़ेशन • Consolidation Control Center & Backhaul Optimization'
              : 'Consolidation Control Center & Backhaul Optimization Engine'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'matrix'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>{bilingual('routeMatrixTab').primary}</span>
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'roster'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{bilingual('activeFleetTab').primary}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-700 text-emerald-400 font-bold">
              {driverRosters.length || 4}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ROUTE MATRIX & AI CONSOLIDATION */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <>
          {/* Main Grid: Left Map + Right OR-Tools Engine Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Interactive Leaflet Map & Telematics Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[520px]">
                {/* Map Control Bar */}
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-200">
                      {selectedTrip?.vehicle_number || 'BR-01-GB-4592'} • {selectedTrip?.origin_city || 'Patna'} ➔ {selectedTrip?.destination_city || 'Madhubani'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {selectedTrip?.vehicle_model || 'Tata Prima 10T MCV'}
                    </span>
                  </div>

                  {/* Telematics Playback Controls */}
                  {consolidatedTrip && (
                    <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded-xl text-xs">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1 rounded hover:bg-slate-800 text-emerald-400 transition"
                        title={isPlaying ? "Pause GPS Simulation" : "Start Live GPS Telematics"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setSimStep(0);
                        }}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Reset GPS Simulation"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <div className="h-3 w-px bg-slate-700 mx-1" />

                      {[1, 2, 5].map((speed) => (
                        <button
                          key={`speed-${speed}`}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            playbackSpeed === speed
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Leaflet Canvas Container */}
                <div className="flex-1 relative z-0">
                  <MapContainer
                    center={[23.50, 77.50]}
                    zoom={5}
                    className="w-full h-full"
                    style={{ background: '#090d16' }}
                  >
                    <ChangeView coords={allMapCoords} />
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />

                    {/* Baseline / Consolidated Route Polyline */}
                    {polylineCoords.length > 1 && (
                      <Polyline
                        positions={polylineCoords}
                        color={consolidatedTrip ? "#10b981" : "#3b82f6"}
                        weight={5}
                        opacity={0.85}
                        dashArray={consolidatedTrip ? undefined : "6, 8"}
                      />
                    )}

                    {/* Start Depot Marker */}
                    {selectedTrip && (
                      <Marker
                        position={selectedTrip.origin_coords}
                        icon={createMarkerIcon('truck')}
                      >
                        <Popup>
                          <div className="text-slate-900 font-sans p-1">
                            <strong className="text-sm font-bold text-blue-700">Trip Origin Hub</strong>
                            <p className="text-xs">{selectedTrip.origin_city}</p>
                            <p className="text-[11px] text-slate-500">Base Payload: {selectedTrip.current_load_tonnes} Tonnes</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Destination Depot Marker */}
                    {selectedTrip && (
                      <Marker
                        position={selectedTrip.dest_coords}
                        icon={createMarkerIcon('depot')}
                      >
                        <Popup>
                          <div className="text-slate-900 font-sans p-1">
                            <strong className="text-sm font-bold text-amber-700">Trip Destination</strong>
                            <p className="text-xs">{selectedTrip.destination_city}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Waypoint Markers (Pickups & Drops) */}
                    {consolidatedTrip?.optimized_waypoints.map((wp, idx) => {
                      if (wp.action === 'START' || wp.action === 'END') return null;
                      const isPickup = wp.action === 'PICKUP';
                      return (
                        <Marker
                          key={`wp-map-${idx}`}
                          position={wp.location_coords}
                          icon={createMarkerIcon(isPickup ? 'pickup' : 'drop', wp.sequence)}
                        >
                          <Popup>
                            <div className="text-slate-900 font-sans p-1">
                              <strong className={`text-xs font-bold ${isPickup ? 'text-emerald-700' : 'text-rose-700'}`}>
                                #{wp.sequence} {wp.action}: {wp.stop_name}
                              </strong>
                              <div className="text-[11px] mt-1 space-y-0.5">
                                <p>Load Delta: <b>{wp.tonnes_delta > 0 ? `+${wp.tonnes_delta}` : wp.tonnes_delta} Tonnes</b></p>
                                <p>Cumulative Load: <b>{wp.cumulative_load_tonnes} / 10T</b></p>
                                <p>ETA: ~{wp.eta_mins} mins</p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}

                    {/* Animated Moving Truck Pin */}
                    {currentPoint && isPlaying && (
                      <Marker
                        position={currentPoint.coord}
                        icon={createMarkerIcon('moving_truck', undefined, currentPoint.heading, selectedTrip?.vehicle_number)}
                      />
                    )}
                  </MapContainer>

                  {/* Telematics Floating Telemetry HUD */}
                  {currentPoint && (
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl p-3 shadow-2xl flex items-center justify-between z-[400] text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                          🛰️
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white flex items-center space-x-1.5">
                            <span>{currentPoint.stopName || 'In-Transit on Corridor'}</span>
                            <span className="text-[10px] text-emerald-400 font-mono">LIVE GPS</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Coords: {currentPoint.coord[0].toFixed(4)}°N, {currentPoint.coord[1].toFixed(4)}°E • Heading: {currentPoint.heading}°
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Current Speed</div>
                          <div className="font-bold text-emerald-400 font-mono">{isPlaying ? '48 km/h' : '0 km/h (Halt)'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Truck Load</div>
                          <div className="font-bold text-white font-mono">8.0 T / 10.0 T</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: AI Consolidation Workbench & Pricing Model */}
            <div className="lg:col-span-5 space-y-4">
              {/* OR-Tools Action Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-sm font-bold text-white">
                      {bilingual('runOptimizerBtn').primary}
                    </h2>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    VRPPD Engine
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-4">
                  Multi-stop backhaul insertion with hard capacity cap (&le; 10 Tonnes) and detour threshold (&le; 15%).
                </p>

                <button
                  onClick={() => optimizeSelectedTrip()}
                  disabled={isOptimizing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                  <span>{isOptimizing ? 'Solving with Google OR-Tools...' : bilingual('runOptimizerBtn').primary}</span>
                </button>
              </div>

              {/* Optimization KPI Summary */}
              {consolidatedTrip && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{bilingual('emptyKmSaved').primary}</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">+{consolidatedTrip.empty_km_saved} km</div>
                    <div className="text-[10px] text-slate-500">{consolidatedTrip.detour_pct}% Detour</div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{bilingual('msmeSavings').primary}</div>
                    <div className="text-base font-bold text-cyan-400 mt-1">₹{econ?.total_msme_savings_inr || 440}</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">25% Pooling Cut</div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{bilingual('co2Saved').primary}</div>
                    <div className="text-base font-bold text-teal-400 mt-1">-{consolidatedTrip.co2_cut_kg} kg</div>
                    <div className="text-[10px] text-slate-500">Diesel Saved</div>
                  </div>
                </div>
              )}

              {/* Driver Revenue Floor & Fair-Share Breakdown */}
              {econ && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Driver Guaranteed Minimum Floor (120% Rule)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      +{econ.driver_gain_over_baseline_pct}% Over Solo
                    </span>
                  </div>

                    <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Baseline Direct Solo Run ({selectedTrip?.origin_city || 'Delhi NCR'} ➔ {selectedTrip?.destination_city || 'Mumbai'}):</span>
                      <span className="font-mono text-white">₹{econ.driver_baseline_revenue}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Guaranteed Minimum Floor (120% Factor):</span>
                      <span className="font-mono text-emerald-400 font-bold">₹{econ.driver_min_guaranteed_floor}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 font-bold pt-1 border-t border-slate-800/80">
                      <span>Final Consolidated Driver Payout:</span>
                      <span className="text-sm font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/40">
                        ₹{econ.driver_final_payout}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LIVE CONSIGNMENTS & ORDERS QUEUE TABLE */}
          {/* ========================================================================= */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2.5">
                <Layers className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {bilingual('liveConsignmentsTitle').primary}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Consolidated Pan-India Orders, Assigned Trucks & Live Telematics Tracking
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  {pendingDemands.length} Consignments Active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Order ID</th>
                    <th className="py-3 px-4 font-semibold">Shipper Business</th>
                    <th className="py-3 px-4 font-semibold">Origin ➔ Destination</th>
                    <th className="py-3 px-4 font-semibold">Assigned Vehicle</th>
                    <th className="py-3 px-4 font-semibold">Cargo & Weight</th>
                    <th className="py-3 px-4 font-semibold">Delivery Mode</th>
                    <th className="py-3 px-4 font-semibold">Status Badge</th>
                    <th className="py-3 px-4 font-semibold">Total (incl. GST)</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pendingDemands.map((dem) => {
                    const isMatched = dem.status === 'matched';
                    const isDelivered = dem.status === 'delivered';
                    const isExpress = dem.urgency === 'express';
                    const assignedTruck = isMatched ? 'BR-01-GB-4592' : 'Pending Allocation';
                    const totalWithTax = Math.round((dem.quoted_price || 984) * 1.05 + 60);

                    return (
                      <tr key={`dem-row-${dem.id}`} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          #ORD-{100 + dem.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{dem.shipper?.name || `Shipper #${dem.shipper_id}`}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{dem.shipper?.gst_number || '10AAACM4928P1Z3'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
                            <span>{dem.pickup_city}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span>{dem.drop_city}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">Corridor Route</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                            isMatched ? 'bg-slate-800 text-emerald-300 font-bold border border-slate-700' : 'text-slate-500'
                          }`}>
                            {assignedTruck}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{dem.weight_tonnes} Tonnes</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{dem.cargo_type}</div>
                        </td>
                        <td className="py-3 px-4">
                          {isExpress ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-fit">
                              <span>⚡</span>
                              <span>EXPRESS SAME-DAY</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-fit">
                              <span>🟢</span>
                              <span>STANDARD POOLED</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${
                            isMatched
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isDelivered
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {isMatched ? 'Matched / In-Transit' : dem.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          ₹{totalWithTax}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setEwayModalDemand(dem)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                              title="View E-Way Bill"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setInspectOrder(dem)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition flex items-center space-x-1 shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect & Track</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE FLEET & DRIVER ROSTERS */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div>
              <h2 className="text-base font-bold text-white">
                {bilingual('activeFleetTab').primary}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified Transporter Identities, Commercial Driving Licenses & Live GPS Telematics Stream
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              4 Drivers On-Grid • 100% DL Verified
            </span>
          </div>

          {/* Driver Roster Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {driverRosters.map((driver) => (
              <div
                key={`driver-card-${driver.id}`}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4 transition"
              >
                {/* Driver Photo & Identity Header */}
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src={driver.avatar_url}
                      alt={driver.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/40 shadow"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[9px] text-slate-900 font-bold" title="Verified Driver">
                      ✓
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                      <span>{driver.name}</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span>★ {driver.rating} Safety Rating</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      DL: {driver.driving_license_no}
                    </div>
                  </div>
                </div>

                {/* Truck & Route Details */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Truck Plate:</span>
                    <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {driver.vehicle_number}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Model:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[140px]">{driver.vehicle_model}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Assigned Route:</span>
                    <span className="text-emerald-400 font-semibold truncate max-w-[130px]">{driver.assigned_route}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-slate-400">GST E-Way Part-B:</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                      {driver.eway_bill_status}
                    </span>
                  </div>
                </div>

                {/* Direct Actions: Call Driver & View Telematics */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setCallModalDriver(driver)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center space-x-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Driver</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('matrix');
                      showToast(`Streaming Live GPS for ${driver.vehicle_number} (${driver.assigned_route})`, 'info');
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-900/20"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Live GPS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE GPS LOCATION & LIVE ORDER STATUS MODAL */}
      {/* ========================================================================= */}
      {inspectOrder && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Live Telematics & Order Tracker</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      #ORD-{100 + inspectOrder.id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {inspectOrder.pickup_city} ➔ {inspectOrder.drop_city} ({inspectOrder.weight_tonnes}T • {inspectOrder.cargo_type})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectOrder(null)}
                className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* 5-Step Order Progression Stepper */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consignment Lifecycle Progress</div>
              <div className="flex items-center justify-between relative pt-2">
                {[
                  { step: 1, title: 'Order Placed', done: true },
                  { step: 2, title: 'Assigned Truck', done: true },
                  { step: 3, title: 'Cargo Loaded', done: true },
                  { step: 4, title: 'In-Transit', done: true, active: true },
                  { step: 5, title: 'e-POD Verified', done: inspectOrder.status === 'delivered' },
                ].map((s, idx) => (
                  <div key={s.title} className="flex flex-col items-center z-10 space-y-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      s.active 
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 animate-pulse'
                        : s.done 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {s.done ? '✓' : s.step}
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium text-center">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live GPS & Landmark Telematics Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Current GPS Coordinates & Highway</span>
                </div>
                <div className="font-mono text-emerald-300 font-bold text-sm">
                  25.8630° N, 85.7810° E
                </div>
                <div className="text-slate-300 text-[11px]">
                  📍 <b>NH-27 Highway</b> near Muzaffarpur-Samastipur Toll Plaza
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span>Vehicle & Telematics Telemetry</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Cruising Speed:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">54 km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Assigned Truck:</span>
                  <span className="font-mono text-white font-bold">BR-01-GB-4592</span>
                </div>
              </div>
            </div>

            {/* Delivery Security OTP Card */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-white">Consignee Delivery Security OTP</div>
                  <div className="text-[11px] text-slate-400">Share with driver upon physical offloading</div>
                </div>
              </div>

              <span className="font-mono font-bold text-base bg-amber-500/20 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/40 tracking-wider">
                784920
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  showToast('E-Way Bill & Telematics stream refreshed.', 'info');
                  setInspectOrder(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
              >
                Close & Return to Grid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CALL DRIVER SIMULATION MODAL */}
      {/* ========================================================================= */}
      {callModalDriver && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Phone className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Direct Driver Dispatch Call</h3>
                <p className="text-xs text-slate-400">Telematics Voice Dispatch Gateway</p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Driver Name:</span>
                <span className="font-bold text-white">{callModalDriver.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-mono text-emerald-400 font-bold">{callModalDriver.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Truck Assigned:</span>
                <span className="font-mono text-white">{callModalDriver.vehicle_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driving License (DL):</span>
                <span className="font-mono text-slate-300">{callModalDriver.driving_license_no}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <a
                href={`tel:${callModalDriver.phone}`}
                onClick={() => {
                  showToast(`Connecting voice dispatch to ${callModalDriver.phone}...`, 'success');
                  setCallModalDriver(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition"
              >
                Dial Now ({callModalDriver.phone})
              </a>
              <button
                onClick={() => setCallModalDriver(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GST E-WAY BILL PREVIEW MODAL */}
      {/* ========================================================================= */}
      {ewayModalDemand && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">GST e-Way Bill — Form GST EWB-01</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                PART-B ATTACHED
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">e-Way Bill No:</span>
                <span className="font-mono text-white font-bold">EWB-24{ewayModalDemand.id}892109</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consignor (Shipper):</span>
                <span className="text-white font-medium">{ewayModalDemand.shipper?.name || 'Maa Janaki Agro Mills'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shipper GSTIN:</span>
                <span className="font-mono text-emerald-400">{ewayModalDemand.shipper?.gst_number || '10AAACM4928P1Z3'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Route Corridor:</span>
                <span className="text-white font-bold">{ewayModalDemand.pickup_city} ➔ {ewayModalDemand.drop_city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cargo Weight & Segment:</span>
                <span className="text-white">{ewayModalDemand.weight_tonnes} Tonnes ({ewayModalDemand.cargo_segment || 'LCV'})</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Part-B Assigned Vehicle:</span>
                <span className="font-mono text-emerald-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                  {selectedTrip?.vehicle_number || 'BR-01-GB-4592'}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  showToast('E-Way Bill Form GST EWB-01 PDF generated for printing.', 'success');
                  setEwayModalDemand(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Print / Download PDF
              </button>
              <button
                onClick={() => setEwayModalDemand(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
