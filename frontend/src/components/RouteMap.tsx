import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSaathiStore } from '../store/useSaathiStore';
import { Navigation } from 'lucide-react';

// Custom Map Bounds Auto-Fitter
const ChangeView: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    }
  }, [coords, map]);
  return null;
};

// Custom SVG Icons using Leaflet DivIcon
const createCustomIcon = (type: 'truck' | 'pickup' | 'drop' | 'depot', label?: string, seq?: number) => {
  let bgClass = 'bg-emerald-500 text-white';
  let iconSvg = '📍';

  if (type === 'truck') {
    bgClass = 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50';
    iconSvg = '🚛';
  } else if (type === 'pickup') {
    bgClass = 'bg-emerald-500 text-slate-900 border-2 border-white shadow-lg shadow-emerald-500/50 font-bold';
    iconSvg = `P${seq || ''}`;
  } else if (type === 'drop') {
    bgClass = 'bg-rose-500 text-white border-2 border-white shadow-lg shadow-rose-500/50 font-bold';
    iconSvg = `D${seq || ''}`;
  } else if (type === 'depot') {
    bgClass = 'bg-amber-500 text-slate-900 border-2 border-white shadow-lg shadow-amber-500/50 font-bold';
    iconSvg = '🏁';
  }

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%;" class="${bgClass}">
        <span style="font-size: 13px; font-weight: bold;">${iconSvg}</span>
      </div>
      ${label ? `<div style="font-size: 10px; font-weight: 600; color: #f8fafc; background: rgba(15,23,42,0.85); padding: 2px 6px; border-radius: 4px; border: 1px solid #334155; margin-top: 2px; white-space: nowrap; text-align: center;">${label}</div>` : ''}
    `,
    iconSize: [32, 48],
    iconAnchor: [16, 24],
  });
};

export const RouteMap: React.FC = () => {
  const { selectedTrip, consolidatedTrip } = useSaathiStore();

  // Coordinates array for map auto-fit
  const allCoordinates: [number, number][] = useMemo(() => {
    const list: [number, number][] = [];
    if (selectedTrip) {
      list.push([selectedTrip.origin_coords[0], selectedTrip.origin_coords[1]]);
      list.push([selectedTrip.dest_coords[0], selectedTrip.dest_coords[1]]);
    }
    if (consolidatedTrip?.optimized_waypoints) {
      consolidatedTrip.optimized_waypoints.forEach((wp) => {
        list.push([wp.location_coords[0], wp.location_coords[1]]);
      });
    }
    return list.length > 0 ? list : [[25.5941, 85.1376], [26.3549, 86.0717]];
  }, [selectedTrip, consolidatedTrip]);

  // Baseline direct path
  const baselinePath: [number, number][] = useMemo(() => {
    if (selectedTrip) {
      return [
        [selectedTrip.origin_coords[0], selectedTrip.origin_coords[1]],
        [selectedTrip.dest_coords[0], selectedTrip.dest_coords[1]]
      ];
    }
    return [];
  }, [selectedTrip]);

  // Optimized polyline path
  const optimizedPath: [number, number][] = useMemo(() => {
    if (consolidatedTrip?.optimized_waypoints && consolidatedTrip.optimized_waypoints.length > 0) {
      return consolidatedTrip.optimized_waypoints.map(wp => [wp.location_coords[0], wp.location_coords[1]] as [number, number]);
    }
    return [];
  }, [consolidatedTrip]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700 shadow-md">
        <div className="flex items-center space-x-2 text-xs font-semibold text-white">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>Bihar Corridor Matrix</span>
          <span className="text-slate-400">•</span>
          <span className="text-emerald-400 font-mono">
            {selectedTrip ? `${selectedTrip.origin_city} ➔ ${selectedTrip.destination_city}` : 'Patna ➔ Madhubani'}
          </span>
        </div>
        <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-slate-500 inline-block border-b border-dashed border-slate-300"></span> Direct Baseline ({consolidatedTrip?.baseline_direct_km || 153.6} km)
          </span>
          <span className="flex items-center gap-1 text-emerald-300 font-medium">
            <span className="w-2.5 h-1 bg-emerald-400 inline-block rounded"></span> OR-Tools Optimized ({consolidatedTrip?.total_trip_km || 154.2} km)
          </span>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow text-[11px] space-y-1">
        <div className="text-slate-400 font-semibold uppercase text-[10px]">Legend</div>
        <div className="flex items-center space-x-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
          <span>Truck Depot / Origin</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Pickup Stop (MSME)</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span>Delivery Stop (Consignee)</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={[25.95, 85.60]}
        zoom={9}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
        />

        <ChangeView coords={allCoordinates} />

        {/* Direct Baseline Path (Dashed gray) */}
        {baselinePath.length > 0 && (
          <Polyline
            positions={baselinePath}
            pathOptions={{
              color: '#64748b',
              weight: 2.5,
              dashArray: '6, 8',
              opacity: 0.7,
            }}
          />
        )}

        {/* OR-Tools Optimized Multi-Stop Path (Glow Emerald) */}
        {optimizedPath.length > 0 && (
          <>
            <Polyline
              positions={optimizedPath}
              pathOptions={{
                color: '#10b981',
                weight: 5,
                opacity: 0.9,
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={optimizedPath}
              pathOptions={{
                color: '#6ee7b7',
                weight: 2,
                opacity: 1.0,
              }}
            />
          </>
        )}

        {/* Origin Depo Marker */}
        {selectedTrip && (
          <Marker
            position={[selectedTrip.origin_coords[0], selectedTrip.origin_coords[1]]}
            icon={createCustomIcon('truck', selectedTrip.origin_city)}
          >
            <Popup>
              <div className="p-2 space-y-1 text-slate-100">
                <div className="font-bold text-sm text-emerald-400">Truck Origin: {selectedTrip.origin_city}</div>
                <div className="text-xs">Vehicle: <span className="font-mono text-cyan-300">{selectedTrip.vehicle_number}</span></div>
                <div className="text-xs">Initial Load: {selectedTrip.current_load_tonnes} tonnes</div>
                <div className="text-xs">Spare Capacity: <span className="text-emerald-400 font-bold">{selectedTrip.available_capacity_tonnes} tonnes</span></div>
                <div className="text-xs">Driver: {selectedTrip.driver?.name || 'Ramesh Kumar'}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Depo Marker */}
        {selectedTrip && (
          <Marker
            position={[selectedTrip.dest_coords[0], selectedTrip.dest_coords[1]]}
            icon={createCustomIcon('depot', selectedTrip.destination_city)}
          >
            <Popup>
              <div className="p-2 space-y-1 text-slate-100">
                <div className="font-bold text-sm text-amber-400">Final Destination: {selectedTrip.destination_city}</div>
                <div className="text-xs">Direct Baseline: {consolidatedTrip?.baseline_direct_km || 153.6} km</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Optimized Waypoint Markers */}
        {consolidatedTrip?.optimized_waypoints && consolidatedTrip.optimized_waypoints.map((wp) => {
          if (wp.action === 'START' || wp.action === 'END') return null;
          const isPickup = wp.action === 'PICKUP';
          return (
            <Marker
              key={`wp-${wp.sequence}-${wp.action}`}
              position={[wp.location_coords[0], wp.location_coords[1]]}
              icon={createCustomIcon(isPickup ? 'pickup' : 'drop', wp.stop_name, wp.sequence)}
            >
              <Popup>
                <div className="p-2 space-y-1.5 text-slate-100 min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${isPickup ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                      Stop #{wp.sequence}: {wp.action}
                    </span>
                    <span className="text-xs text-slate-400">ETA: {wp.eta_mins} mins</span>
                  </div>
                  <div className="font-semibold text-sm">{wp.stop_name}</div>
                  <div className="text-xs text-slate-300">
                    Payload Change: <span className={isPickup ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {isPickup ? `+${wp.tonnes_delta}` : `${wp.tonnes_delta}`} tonnes
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Truck Payload Onboard: <span className="text-cyan-300 font-mono">{wp.cumulative_load_tonnes} / 10.0 tonnes</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Leg Distance: +{wp.distance_from_prev_km} km
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
