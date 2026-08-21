import React, { useState, useEffect, useMemo } from 'react';
import { useSaathiStore } from '../store/useSaathiStore';
import { useLanguageStore } from '../store/languageStore';
import * as api from '../api';
import type { DeliveryEPOD, EWayBill } from '../types';
import { SignatureCanvas } from './SignatureCanvas';
import { 
  Truck, ShieldCheck, KeyRound, CheckCircle2, 
  FileText, IndianRupee, Printer, ArrowRight, 
  Clock, CheckSquare, Square, PenTool, Lock, PlusCircle,
  UserCheck, TrendingUp, Fuel, Award, Phone, MapPin,
  CheckCircle, AlertCircle, X, Navigation, Gauge, Compass,
  Coins, Radio
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Auto-Fit Map Bounds
const ChangeView: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
    }
  }, [coords, map]);
  return null;
};

// Custom Leaflet Icons for Driver Dashboard
const createDriverMarkerIcon = (type: 'driver_truck' | 'pickup' | 'drop' | 'depot', seq?: number) => {
  if (type === 'driver_truck') {
    return L.divIcon({
      className: 'driver-truck-pin',
      html: `
        <div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #10b981, #059669); border: 2px solid #34d399; border-radius: 50%; box-shadow: 0 0 16px rgba(16, 185, 129, 0.8);">
          <span style="font-size: 18px;">🚛</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }

  let bgClass = 'background: #2563eb; color: white; border: 2px solid white;';
  let iconText = `P${seq || ''}`;

  if (type === 'drop') {
    bgClass = 'background: #ea580c; color: white; border: 2px solid white;';
    iconText = `D${seq || ''}`;
  } else if (type === 'depot') {
    bgClass = 'background: #64748b; color: white; border: 2px solid white;';
    iconText = '🏁';
  }

  return L.divIcon({
    className: 'driver-waypoint-pin',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; font-size: 11px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.5); ${bgClass}">
        ${iconText}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface ItineraryStop {
  id: number;
  sequence: number;
  demandId: number;
  type: 'PICKUP' | 'DROP' | 'DEPOT';
  hubName: string;
  city: string;
  coords: [number, number];
  customerName: string;
  customerPhone: string;
  cargoDetails: string;
  weightTonnes: number;
  stopEarningInr: number;
  expectedOtp: string;
  isVerified: boolean;
  status: 'PENDING' | 'VERIFIED' | 'COMPLETED';
}

const SAMPLE_ITINERARY: ItineraryStop[] = [
  {
    id: 1,
    sequence: 1,
    demandId: 1,
    type: 'PICKUP',
    hubName: 'Bharat Heavy Engineering Hub (Delhi NCR)',
    city: 'Delhi NCR',
    coords: [28.7041, 77.1025],
    customerName: 'Sanjay Mishra (Consignor)',
    customerPhone: '+91-9835012345',
    cargoDetails: 'Precision Machine Components & Auto Spares (2.0 Tonnes)',
    weightTonnes: 2.0,
    stopEarningInr: 4850.00,
    expectedOtp: '419820',
    isVerified: true,
    status: 'VERIFIED'
  },
  {
    id: 2,
    sequence: 2,
    demandId: 2,
    type: 'PICKUP',
    hubName: 'Sabarmati Cotton & Denim Logistics Park (Ahmedabad)',
    city: 'Ahmedabad',
    coords: [23.0225, 72.5714],
    customerName: 'Anand Thakur (Consignor)',
    customerPhone: '+91-9431098765',
    cargoDetails: 'Premium Denim & Organic Cotton Textiles (1.5 Tonnes)',
    weightTonnes: 1.5,
    stopEarningInr: 2850.00,
    expectedOtp: '338102',
    isVerified: false,
    status: 'PENDING'
  },
  {
    id: 3,
    sequence: 3,
    demandId: 1,
    type: 'DROP',
    hubName: 'Ahmedabad Precision Spares Terminal Gate 4',
    city: 'Ahmedabad',
    coords: [23.0225, 72.5714],
    customerName: 'Rohan Jha (Consignee)',
    customerPhone: '+91-9771034567',
    cargoDetails: 'Precision Machine Components (Offloading 2.0 Tonnes)',
    weightTonnes: 2.0,
    stopEarningInr: 3200.00,
    expectedOtp: '784920',
    isVerified: false,
    status: 'PENDING'
  },
  {
    id: 4,
    sequence: 4,
    demandId: 2,
    type: 'DROP',
    hubName: 'Bhiwandi Mega Distribution Terminal (Mumbai)',
    city: 'Mumbai',
    coords: [19.0760, 72.8777],
    customerName: 'Vikas Roy (Consignee)',
    customerPhone: '+91-9822019944',
    cargoDetails: 'Premium Denim & Textiles (Offloading 1.5 Tonnes)',
    weightTonnes: 1.5,
    stopEarningInr: 2900.00,
    expectedOtp: '992144',
    isVerified: false,
    status: 'PENDING'
  }
];

export const DriverConsole: React.FC = () => {
  const { selectedTrip, consolidatedTrip, pendingDemands, showToast } = useSaathiStore();
  const { currentLanguage } = useLanguageStore();

  // Itinerary Stops State
  const [itinerary, setItinerary] = useState<ItineraryStop[]>(SAMPLE_ITINERARY);
  const [activeOtpModalStop, setActiveOtpModalStop] = useState<ItineraryStop | null>(null);
  const [otpModalInput, setOtpModalInput] = useState('');
  const [isVerifyingStopOtp, setIsVerifyingStopOtp] = useState(false);

  // e-POD Signature State
  const [selectedDemandId, setSelectedDemandId] = useState<number>(1);
  const [epod, setEpod] = useState<DeliveryEPOD | null>(null);
  const [ewayBill, setEwayBill] = useState<EWayBill | null>(null);
  const [receiverName, setReceiverName] = useState('Rohan Jha (Ahmedabad Terminal)');
  const [signatureData, setSignatureData] = useState('');
  const [vehicleNoInput, setVehicleNoInput] = useState(selectedTrip?.vehicle_number || 'DL-01-GB-4592');
  const [isAssigningVehicle, setIsAssigningVehicle] = useState(false);

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverDl, setNewDriverDl] = useState('');
  const [newDriverGovtId, setNewDriverGovtId] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleCap, setNewVehicleCap] = useState('10.0');

  const econ = consolidatedTrip?.dynamic_pricing_breakdown;
  const selectedDemand = pendingDemands.find(d => d.id === selectedDemandId) || pendingDemands[0];

  useEffect(() => {
    if (selectedDemand) {
      loadData(selectedDemand.id);
    }
  }, [selectedDemandId, pendingDemands]);

  const loadData = async (demandId: number) => {
    try {
      const [ep, ewb] = await Promise.all([
        api.fetchEPOD(demandId),
        api.fetchEWayBill(demandId)
      ]);
      setEpod(ep);
      setEwayBill(ewb);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Interactive Stop OTP Verification
  const handleVerifyStopOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOtpModalStop) return;

    setIsVerifyingStopOtp(true);
    try {
      if (activeOtpModalStop.type === 'PICKUP') {
        await api.verifyPickupOTP({
          demand_id: activeOtpModalStop.demandId,
          pickup_otp: otpModalInput,
        });
        showToast(`Pickup OTP Verified! Cargo for Stop #${activeOtpModalStop.sequence} loaded.`, 'success');
      } else {
        await api.verifyDeliveryOTP({
          demand_id: activeOtpModalStop.demandId,
          delivery_otp: otpModalInput,
          receiver_name: activeOtpModalStop.customerName,
          signature_svg: signatureData || '<svg>Signature</svg>'
        });
        showToast(`Delivery OTP Verified! ₹${activeOtpModalStop.stopEarningInr} payout released for Stop #${activeOtpModalStop.sequence}.`, 'success');
      }

      // Mark stop as verified in local state
      setItinerary(prev => prev.map(s => s.id === activeOtpModalStop.id ? { ...s, isVerified: true, status: 'VERIFIED' } : s));
      setActiveOtpModalStop(null);
      setOtpModalInput('');
    } catch (err: any) {
      showToast(err.message || 'Invalid OTP. Please check with customer.', 'error');
    } finally {
      setIsVerifyingStopOtp(false);
    }
  };

  const handleAssignVehicle = async () => {
    if (!selectedDemand) return;
    setIsAssigningVehicle(true);
    try {
      const updated = await api.generateEWayBillPartB({
        demand_id: selectedDemand.id,
        vehicle_number: vehicleNoInput,
      });
      setEwayBill(updated);
      showToast(`GST e-Way Bill Part-B updated for vehicle ${vehicleNoInput}!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsAssigningVehicle(false);
    }
  };

  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName || !newDriverPhone || !newDriverDl) {
      showToast('Please fill all mandatory KYC fields.', 'error');
      return;
    }
    showToast(`Driver ${newDriverName} & Truck ${newVehiclePlate || 'DL-01-GB-4592'} successfully registered and KYC verified!`, 'success');
    setShowRegModal(false);
  };

  // Map coordinates (Delhi NCR -> Jaipur -> Ahmedabad -> Surat -> Mumbai)
  const mapCoords: [number, number][] = useMemo(() => {
    const coords: [number, number][] = [[26.9124, 75.7873]]; // Driver live GPS near Jaipur
    itinerary.forEach(s => coords.push(s.coords));
    return coords;
  }, [itinerary]);

  const polylineCoords: [number, number][] = useMemo(() => {
    return [
      [28.7041, 77.1025], // Delhi NCR
      [26.9124, 75.7873], // Live GPS near Jaipur
      [23.0225, 72.5714], // Ahmedabad
      [21.1702, 72.8311], // Surat
      [19.0760, 72.8777], // Mumbai
    ];
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with KYC Registration Button */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            DRIVER DASHBOARD
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Turn-by-Turn Navigation, Stop Payouts & Dual-OTP Verification
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time highway navigation, pickup/drop OTP handshakes, and transparent earnings breakdown per stop.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRegModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Driver / Truck</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REQUIREMENT 5: CLEAR SEPARATION OF DRIVER IDENTITY VS VEHICLE ASSET */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Driver Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-start space-x-4">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              alt="Ramesh Kumar"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[9px] text-slate-900 font-bold" title="KYC Verified">
              ✓
            </span>
          </div>

          <div className="flex-1 min-w-0 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driver Identity Profile</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> KYC VERIFIED
              </span>
            </div>
            <div className="font-bold text-white text-sm mt-0.5 flex items-center justify-between">
              <span>Ramesh Kumar</span>
              <span className="text-emerald-400 font-bold">★ 4.9 Safety Rating</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Contact: <b className="text-white">+91-9123456780</b> • Total Completed Trips: <b className="text-white">184 Trips</b>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Driving License: <span className="text-emerald-400 font-semibold">BR-012018009412</span>
            </div>
          </div>
        </div>

        {/* Card 2: Vehicle Asset Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-md shrink-0">
            🚚
          </div>

          <div className="flex-1 min-w-0 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Asset Details</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  🟢 STANDARD POOLED (3/5 Loads • 80% Full)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  RC: ACTIVE
                </span>
              </div>
            </div>
            <div className="font-bold text-white text-sm mt-0.5 flex items-center justify-between">
              <span className="font-mono">{selectedTrip?.vehicle_number || 'BR-01-GB-4592'}</span>
              <span className="text-slate-300">{selectedTrip?.vehicle_model || 'Tata Prima 10-Tonne MCV'}</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 flex justify-between">
              <span>Class: <b className="text-white">{selectedTrip?.vehicle_segment || 'MCV (2.5T - 7.5T)'}</b></span>
              <span>Speed: <b className="text-cyan-400 font-mono">65 km/h</b></span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
              <span>Payload: <b className="text-white">8.0T</b> / 10.0T (80% Utilized)</span>
              <span className="text-emerald-400 font-bold">2.0T Available Space</span>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Financial Analytics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Gross Freight (Monthly)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">₹68,450</div>
          <div className="text-[10px] text-emerald-400 font-semibold">+18.4% from last month</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Backhaul Pooling Bonus</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">₹14,920</div>
          <div className="text-[10px] text-slate-400">Guaranteed &ge; 120% floor applied</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Diesel Fuel Cost Cut</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-teal-400 mt-1">₹8,120</div>
          <div className="text-[10px] text-slate-400">via 153 km empty run elimination</div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-md space-y-1 bg-gradient-to-br from-slate-900 to-emerald-950/40">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
            <span>Net Monthly Payout</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">₹59,810</div>
          <div className="text-[10px] text-emerald-300 font-semibold">100% On-Time Digital Settlement</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REQUIREMENT 4: INTERACTIVE MAP & TURN-BY-TURN ITINERARY WITH STOP PAYOUTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Columns: Interactive Leaflet Route Map */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[520px]">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Live Driver Route Navigation</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Distance Remaining: 840.5 km | ETA: 14 hrs 30 min
              </span>
            </div>

            <div className="flex-1 relative z-0">
              <MapContainer
                center={[26.9124, 75.7873]}
                zoom={6}
                className="w-full h-full"
                style={{ background: '#090d16' }}
              >
                <ChangeView coords={mapCoords} />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />

                {/* Route Polyline */}
                <Polyline
                  positions={polylineCoords}
                  color="#10b981"
                  weight={5}
                  opacity={0.9}
                />

                {/* Driver Live GPS Marker */}
                <Marker
                  position={[26.9124, 75.7873]}
                  icon={createDriverMarkerIcon('driver_truck')}
                >
                  <Popup>
                    <div className="text-slate-900 font-sans p-1">
                      <strong className="text-xs font-bold text-emerald-700">Your Live GPS Location</strong>
                      <p className="text-[11px]">NH-48 Golden Quadrilateral near Jaipur Bypass</p>
                      <p className="text-[10px] text-slate-500 font-mono">Speed: 62 km/h • Heading: 210°</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Waypoint Markers */}
                {itinerary.map((stop) => (
                  <Marker
                    key={`stop-marker-${stop.id}`}
                    position={stop.coords}
                    icon={createDriverMarkerIcon(stop.type === 'PICKUP' ? 'pickup' : 'drop', stop.sequence)}
                  >
                    <Popup>
                      <div className="text-slate-900 font-sans p-1">
                        <strong className={`text-xs font-bold ${stop.type === 'PICKUP' ? 'text-blue-700' : 'text-orange-700'}`}>
                          #{stop.sequence} {stop.type}: {stop.hubName}
                        </strong>
                        <p className="text-[11px] mt-1">{stop.cargoDetails}</p>
                        <p className="text-[11px] font-bold text-emerald-700">Stop Payout: ₹{stop.stopEarningInr.toFixed(2)}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Floating Driver HUD */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl p-3 shadow-2xl flex items-center justify-between z-[400] text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    🛰️
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white flex items-center space-x-1.5">
                      <span>NH-48 Golden Quadrilateral near Jaipur Bypass</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      GPS Coords: 26.9124° N, 75.7873° E
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Cruising Speed</div>
                    <div className="font-bold text-emerald-400 font-mono">62 km/h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Turn-by-Turn Itinerary & Stop Payout Action Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Turn-by-Turn Itinerary & Stop Payouts</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Total Route Payout: ₹{itinerary.reduce((acc, s) => acc + s.stopEarningInr, 0).toFixed(2)}
              </span>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {itinerary.map((stop) => {
                const isPickup = stop.type === 'PICKUP';
                const isVerified = stop.isVerified;

                return (
                  <div
                    key={`itinerary-stop-${stop.id}`}
                    className={`p-3.5 rounded-2xl border transition space-y-2.5 ${
                      isVerified
                        ? 'bg-slate-950/60 border-slate-800/80'
                        : isPickup
                        ? 'bg-slate-950 border-blue-500/30'
                        : 'bg-slate-950 border-orange-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isVerified ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'
                        }`}>
                          {isVerified ? '✓' : stop.sequence}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isPickup ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {stop.type} • {stop.weightTonnes} Tonnes
                        </span>
                      </div>

                      {/* Stop Earning Tag */}
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-xs flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        +₹{stop.stopEarningInr.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-sm text-white flex items-center justify-between">
                        <span>{stop.hubName}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{stop.city} Hub • Contact: <b className="text-slate-200">{stop.customerName}</b></span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="truncate max-w-[220px]">{stop.cargoDetails}</span>
                      <a
                        href={`tel:${stop.customerPhone}`}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 shrink-0 ml-2"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>

                    {/* Action Button: Enter OTP */}
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {isPickup ? 'Requires OTP 1 from Sender' : 'Requires OTP 2 from Receiver'} (Demo: {stop.expectedOtp})
                      </span>

                      {isVerified ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Stop Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveOtpModalStop(stop);
                            setOtpModalInput(stop.expectedOtp);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1 shadow-sm ${
                            isPickup
                              ? 'bg-blue-600 hover:bg-blue-500 text-white'
                              : 'bg-orange-600 hover:bg-orange-500 text-white'
                          }`}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Verify {isPickup ? 'Pickup OTP' : 'Delivery OTP'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE STOP OTP VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {activeOtpModalStop && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeOtpModalStop.type === 'PICKUP' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activeOtpModalStop.type === 'PICKUP' ? 'Verify Pickup Handshake (OTP 1)' : 'Verify Delivery Handshake (OTP 2)'}
                  </h3>
                  <p className="text-xs text-slate-400">Stop #{activeOtpModalStop.sequence} • {activeOtpModalStop.hubName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveOtpModalStop(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyStopOtp} className="space-y-4">
              <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-bold text-white">{activeOtpModalStop.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stop Payout Amount:</span>
                  <span className="font-mono text-emerald-400 font-bold">₹{activeOtpModalStop.stopEarningInr.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enter 6-Digit Verification OTP from {activeOtpModalStop.type === 'PICKUP' ? 'Sender' : 'Receiver'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpModalInput}
                  onChange={(e) => setOtpModalInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center font-mono text-lg font-bold text-emerald-400 tracking-widest focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 419820"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Demo Code for this stop: <b className="text-slate-400 font-mono">{activeOtpModalStop.expectedOtp}</b>
                </p>
              </div>

              {/* Delivery Signature for Drop Stops */}
              {activeOtpModalStop.type === 'DROP' && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Consignee Signature (Sign-on-Glass)
                  </label>
                  <SignatureCanvas onSave={(svg) => setSignatureData(svg)} receiverName={activeOtpModalStop.customerName} />
                </div>
              )}

              <div className="pt-2 flex space-x-2">
                <button
                  type="submit"
                  disabled={isVerifyingStopOtp}
                  className={`flex-1 py-2.5 text-white font-bold rounded-xl text-xs shadow-lg transition ${
                    activeOtpModalStop.type === 'PICKUP'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {isVerifyingStopOtp ? 'Verifying...' : `Confirm & Release Stop Payout (₹${activeOtpModalStop.stopEarningInr.toFixed(2)})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOtpModalStop(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REGISTER NEW DRIVER / VEHICLE KYC MODAL */}
      {/* ========================================================================= */}
      {showRegModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Transporter & Driver KYC Registration</h3>
              </div>
              <button
                onClick={() => setShowRegModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDriver} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Driving License (DL) No *</label>
                  <input
                    type="text"
                    required
                    value={newDriverDl}
                    onChange={(e) => setNewDriverDl(e.target.value)}
                    placeholder="BR-012019842109"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Aadhaar / Govt ID No</label>
                  <input
                    type="text"
                    value={newDriverGovtId}
                    onChange={(e) => setNewDriverGovtId(e.target.value)}
                    placeholder="XXXX-XXXX-4819"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Truck Registration Plate *</label>
                  <input
                    type="text"
                    required
                    value={newVehiclePlate}
                    onChange={(e) => setNewVehiclePlate(e.target.value)}
                    placeholder="BR-01-GB-4592"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Max Gross Capacity (Tonnes)</label>
                <select
                  value={newVehicleCap}
                  onChange={(e) => setNewVehicleCap(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="0.5">0.5 Tonnes (3-Wheeler Auto)</option>
                  <option value="1.2">1.2 Tonnes (Tata Ace LCV)</option>
                  <option value="2.5">2.5 Tonnes (Bolero Maxi Truck)</option>
                  <option value="7.5">7.5 Tonnes (Eicher 6-Wheeler MCV)</option>
                  <option value="16.0">16.0 Tonnes (Tata Prima 10-Wheeler HCV)</option>
                  <option value="25.0">25.0 Tonnes (14-Wheeler Heavy Hauler)</option>
                  <option value="40.0">40.0 Tonnes (Multi-Axle Trailer MAV)</option>
                </select>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
                >
                  Complete KYC & Activate Driver
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
