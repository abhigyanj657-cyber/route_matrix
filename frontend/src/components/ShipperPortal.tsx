import React, { useState, useEffect } from 'react';
import { useSaathiStore } from '../store/useSaathiStore';
import { useLanguageStore } from '../store/languageStore';
import { getPricingQuote } from '../api';
import type { PricingQuote } from '../types';
import { CityAutocomplete } from './CityAutocomplete';
import { EXPANDED_VEHICLE_FLEET, QUICK_TONNAGE_PRESETS, calculateEstimatedTransitHours, VehicleClass } from '../data/cargoSegments';
import { 
  Box, Plus, IndianRupee, Sparkles, ShieldCheck, 
  Clock, CheckCircle2, ArrowRight, ArrowLeft, Truck, KeyRound, Check,
  Layers, Calculator, Info, FileText, TrendingDown, Star, Calendar,
  Zap, Fuel, ReceiptText, UserCheck, Phone, CheckCircle, AlertTriangle,
  Edit3, ShieldAlert, CheckSquare, Square, Building2, Timer, Flame
} from 'lucide-react';

const STANDARD_COMMODITIES = [
  { id: 'agri', name: 'Agriculture & Grains (Makhana, Wheat, Rice, Spices)', icon: '🌾' },
  { id: 'textiles', name: 'Textiles & Garments (Handloom, Cotton, Silk)', icon: '🧵' },
  { id: 'machinery', name: 'Machine Parts, Hardware & Industrial Tools', icon: '⚙️' },
  { id: 'fmcg', name: 'FMCG, Food & Packaged Consumer Goods', icon: '📦' },
  { id: 'electronics', name: 'Electronics, Batteries & Appliances', icon: '💻' },
  { id: 'chemicals', name: 'Chemicals, Paints & Fragile Materials', icon: '🧪' },
];

interface DummyCorridorTruck {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  driverDl: string;
  driverPhoto: string;
  rating: number;
  completedTrips: number;
  kycVerified: boolean;
  vehicleModel: string;
  segmentId: string;
  serviceMode: 'EXPRESS_DIRECT' | 'STANDARD_POOLING';
  departureTime: string;
  estimatedArrival: string;
  slaBadgeText: string;
  occupiedTonnes: number;
  spareCapacityTonnes: number;
  totalCapacityTonnes: number;
  speedKmph: number;
}

const DUMMY_CORRIDOR_TRUCKS: DummyCorridorTruck[] = [
  {
    id: 't-1',
    vehicleNumber: 'BR-01-GB-4592',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91-9123456780',
    driverDl: 'BR-012018009412',
    driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: 4.9,
    completedTrips: 184,
    kycVerified: true,
    vehicleModel: 'Tata Prima 10-Tonne MCV',
    segmentId: 'tata_prima_10w',
    serviceMode: 'STANDARD_POOLING',
    departureTime: 'Today, 04:30 PM',
    estimatedArrival: 'Tomorrow, 08:15 AM',
    slaBadgeText: '24-36h Multi-Load Pool',
    occupiedTonnes: 9.6,
    spareCapacityTonnes: 6.4,
    totalCapacityTonnes: 16.0,
    speedKmph: 65
  },
  {
    id: 't-2',
    vehicleNumber: 'BR-06-PA-8812',
    driverName: 'Santosh Yadav',
    driverPhone: '+91-9876543210',
    driverDl: 'BR-062019004819',
    driverPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    rating: 4.8,
    completedTrips: 126,
    kycVerified: true,
    vehicleModel: 'Bolero Maxi Truck Plus (Express Direct)',
    segmentId: 'bolero_pickup',
    serviceMode: 'EXPRESS_DIRECT',
    departureTime: 'Today, 02:00 PM',
    estimatedArrival: 'Today, 07:30 PM (Guaranteed Same-Day)',
    slaBadgeText: '⚡ Same-Day Delivery SLA (< 6 hrs)',
    occupiedTonnes: 0.5,
    spareCapacityTonnes: 2.0,
    totalCapacityTonnes: 2.5,
    speedKmph: 55
  },
  {
    id: 't-3',
    vehicleNumber: 'DL-1L-AA-3301',
    driverName: 'Vikramjit Singh',
    driverPhone: '+91-9814018899',
    driverDl: 'PB-102016001289',
    driverPhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    rating: 4.95,
    completedTrips: 310,
    kycVerified: true,
    vehicleModel: 'Eicher Pro 6-Wheeler (19ft)',
    segmentId: 'eicher_6w',
    serviceMode: 'STANDARD_POOLING',
    departureTime: 'Today, 08:00 PM',
    estimatedArrival: 'Tomorrow, 01:00 PM',
    slaBadgeText: '24-48h Backhaul Aggregator',
    occupiedTonnes: 4.2,
    spareCapacityTonnes: 3.3,
    totalCapacityTonnes: 7.5,
    speedKmph: 60
  },
  {
    id: 't-4',
    vehicleNumber: 'MH-12-RN-8821',
    driverName: 'Suresh Patil',
    driverPhone: '+91-9823091122',
    driverDl: 'MH-122017007731',
    driverPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    rating: 4.85,
    completedTrips: 245,
    kycVerified: true,
    vehicleModel: 'Ashok Leyland 40ft Trailer (Express Dedicated)',
    segmentId: 'trailer_mav',
    serviceMode: 'EXPRESS_DIRECT',
    departureTime: 'Today, 03:30 PM',
    estimatedArrival: 'Today, 10:00 PM (Same-Day Priority)',
    slaBadgeText: '⚡ Same-Day Priority Dedicated (< 8 hrs)',
    occupiedTonnes: 12.0,
    spareCapacityTonnes: 28.0,
    totalCapacityTonnes: 40.0,
    speedKmph: 55
  },
  {
    id: 't-5',
    vehicleNumber: 'BR-01-EA-9912',
    driverName: 'Manoj Tiwari',
    driverPhone: '+91-9934021188',
    driverDl: 'BR-012020005511',
    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.75,
    completedTrips: 92,
    kycVerified: true,
    vehicleModel: 'Piaggio Ape Cargo E-Auto (Fast-Track)',
    segmentId: 'auto_3w',
    serviceMode: 'EXPRESS_DIRECT',
    departureTime: 'Today, 01:00 PM',
    estimatedArrival: 'Today, 05:00 PM (Same-Day Hyperlocal)',
    slaBadgeText: '⚡ Hyperlocal Same-Day (< 4 hrs)',
    occupiedTonnes: 0.10,
    spareCapacityTonnes: 0.40,
    totalCapacityTonnes: 0.50,
    speedKmph: 35
  }
];

export const ShipperPortal: React.FC = () => {
  const { pendingDemands, addNewDemand, users, showToast } = useSaathiStore();
  const { currentLanguage } = useLanguageStore();

  // 5-Step Linear Wizard State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Origin & Destination
  const [pickupCity, setPickupCity] = useState('Delhi NCR');
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([28.7041, 77.1025]);
  const [dropCity, setDropCity] = useState('Mumbai');
  const [dropCoords, setDropCoords] = useState<[number, number]>([19.0760, 72.8777]);

  // Delivery Speed & Urgency (Default Standard)
  const [urgency, setUrgency] = useState<'standard' | 'express'>('standard');

  // Step 2: Vehicle Choice & Assigned Truck
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('bolero_pickup');
  const [selectedTruckId, setSelectedTruckId] = useState<string>('t-1');

  // Step 3: Weight & Product
  const [weightTonnes, setWeightTonnes] = useState<number>(2.0);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('machinery');
  const [customCommodityText, setCustomCommodityText] = useState<string>('');
  const [isCustomProduct, setIsCustomProduct] = useState<boolean>(false);

  // Anti-Contraband Declaration Checkbox
  const [antiContrabandDeclared, setAntiContrabandDeclared] = useState<boolean>(true);

  // Step 5: User & Pricing & Driver KYC
  const [selectedShipperId, setSelectedShipperId] = useState<number>(1);
  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);

  // Filter available trucks dynamically based on Fleet Segregation:
  // Express Direct trucks vs Standard Pooling trucks
  const filteredCorridorTrucks = DUMMY_CORRIDOR_TRUCKS.filter(truck => {
    if (urgency === 'express') {
      return truck.serviceMode === 'EXPRESS_DIRECT';
    } else {
      return truck.serviceMode === 'STANDARD_POOLING';
    }
  });

  const activeVehicleClass = EXPANDED_VEHICLE_FLEET.find(v => v.id === selectedSegmentId) || EXPANDED_VEHICLE_FLEET[2];
  const assignedTruck = filteredCorridorTrucks.find(t => t.id === selectedTruckId) || filteredCorridorTrucks[0] || DUMMY_CORRIDOR_TRUCKS[0];

  const currentShipper = users.find(u => u.id === selectedShipperId) || {
    id: 1,
    name: 'Bharat Heavy Engineering & Auto Components',
    phone: '+91-9835012345',
    gst_number: '07AAACB1942P1Z1',
    verified_identity: true
  };

  // Final effective cargo description
  const finalCargoName = isCustomProduct && customCommodityText.trim()
    ? customCommodityText.trim()
    : STANDARD_COMMODITIES.find(c => c.id === selectedCommodityId)?.name || 'General Freight';

  // Auto-fetch dynamic quote when parameters change
  useEffect(() => {
    let active = true;
    const fetchQuote = async () => {
      setIsQuoting(true);
      try {
        const q = await getPricingQuote({
          pickup_city: pickupCity,
          drop_city: dropCity,
          weight_tonnes: weightTonnes,
          cargo_segment: activeVehicleClass.name,
          urgency: urgency,
        });
        if (active) setQuote(q);
      } catch (err) {
        console.error('Error fetching quote:', err);
      } finally {
        if (active) setIsQuoting(false);
      }
    };
    fetchQuote();
    return () => { active = false; };
  }, [pickupCity, dropCity, weightTonnes, urgency, activeVehicleClass.name]);

  // Adjust selected truck when urgency changes
  useEffect(() => {
    if (filteredCorridorTrucks.length > 0) {
      setSelectedTruckId(filteredCorridorTrucks[0].id);
    }
  }, [urgency]);

  // Pricing & Tax Calculations
  const distanceKm = quote ? quote.direct_distance_km : 145;
  const rawSolo = quote ? quote.raw_solo_price : Math.round(distanceKm * 5.5 * weightTonnes);
  const backhaulDiscount = urgency === 'standard' ? Math.round(rawSolo * 0.25) : 0;
  const netTaxableFreight = rawSolo - backhaulDiscount;
  const gstAmount = Math.round(netTaxableFreight * 0.05); // 5% GST for GTA
  const tollGreenCess = 60.0;
  const totalPayable = netTaxableFreight + gstAmount + tollGreenCess;

  const estimatedHours = calculateEstimatedTransitHours(distanceKm, activeVehicleClass.maxSpeedKmph, urgency === 'express');

  const handlePostLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!antiContrabandDeclared) {
      showToast('You must check and agree to the mandatory Non-Contraband Cargo Declaration.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addNewDemand({
        shipper_id: selectedShipperId,
        pickup_city: pickupCity,
        drop_city: dropCity,
        pickup_coords: pickupCoords,
        drop_coords: dropCoords,
        weight_tonnes: Number(weightTonnes),
        cargo_segment: activeVehicleClass.name,
        cargo_type: finalCargoName,
        cubic_volume_cuft: Math.round(weightTonnes * activeVehicleClass.densityFactor),
        urgency: urgency,
        max_budget: rawSolo
      });

      // Dual-OTP Generation
      const pickupOtp = '419820';
      const deliveryOtp = '784920';

      setSubmittedOrder({
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        pickupCity,
        dropCity,
        weightTonnes,
        totalPayable,
        urgency,
        serviceMode: urgency === 'express' ? 'EXPRESS_DIRECT' : 'STANDARD_POOLING',
        slaText: urgency === 'express' ? 'Guaranteed Same-Day Delivery by 08:30 PM Today' : 'Standard 24-36h Delivery Window',
        pickupOtp,
        deliveryOtp,
        vehicleNumber: assignedTruck.vehicleNumber,
        driverName: assignedTruck.driverName,
        driverPhone: assignedTruck.driverPhone
      });
      showToast('Consignment booked! Dual-OTP handshake protocol initiated.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shippers = users.filter(u => u.role === 'shipper');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            CUSTOMER DASHBOARD
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Freight Booking & Fleet Segregation Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose between dedicated Same-Day Express or cost-saving Multi-Shipper Backhaul Pooling.
          </p>
        </div>

        {/* 5-Step Stepper Header */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {[
            { num: 1, label: 'Route' },
            { num: 2, label: 'Delivery SLA' },
            { num: 3, label: 'Vehicle Fleet' },
            { num: 4, label: 'Cargo & Declaration' },
            { num: 5, label: 'Review & Dual-OTP' },
          ].map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={`step-btn-${s.num}`}
                type="button"
                onClick={() => setCurrentStep(s.num as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400'
                    : isDone
                    ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                    : 'bg-slate-800/60 text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-white text-emerald-900' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                }`}>
                  {isDone ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Step-by-Step Forms */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[520px]">
          {submittedOrder ? (
            /* Order Placed Success Confirmation with Dual-OTP Handshake */
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Consignment Confirmed & Dispatched!</h3>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Order ID: {submittedOrder.orderId}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    submittedOrder.urgency === 'express' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {submittedOrder.serviceMode}
                  </span>
                </div>
              </div>

              {/* SLA Guarantee Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-w-md mx-auto text-xs text-center font-semibold text-emerald-400">
                🎯 Guaranteed SLA: <span className="text-white">{submittedOrder.slaText}</span>
              </div>

              {/* Dual-OTP Handshake Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
                {/* OTP 1: Pickup */}
                <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-3.5 space-y-1">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> OTP 1: Pickup Handshake
                  </div>
                  <div className="text-xs text-slate-400">Share with Driver at Pickup:</div>
                  <div className="text-xl font-mono font-bold text-blue-300 bg-blue-950/60 px-2 py-1 rounded border border-blue-500/40 text-center tracking-widest mt-1">
                    {submittedOrder.pickupOtp}
                  </div>
                </div>

                {/* OTP 2: Delivery */}
                <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-1">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> OTP 2: Delivery Handshake
                  </div>
                  <div className="text-xs text-slate-400">Receiver shares at Drop Hub:</div>
                  <div className="text-xl font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-1 rounded border border-amber-500/40 text-center tracking-widest mt-1">
                    {submittedOrder.deliveryOtp}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Corridor Route:</span>
                  <span className="text-white font-bold">{submittedOrder.pickupCity} ➔ {submittedOrder.dropCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Driver:</span>
                  <span className="text-white font-semibold">{submittedOrder.driverName} ({submittedOrder.driverPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Truck:</span>
                  <span className="font-mono text-emerald-400 font-bold">{submittedOrder.vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Amount (incl. 5% GST):</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">₹{submittedOrder.totalPayable.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedOrder(null);
                    setCurrentStep(1);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
                >
                  Book Another Consignment
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePostLoad} className="space-y-6">
              {/* ========================================================================= */}
              {/* STEP 1: ORIGIN & DESTINATION */}
              {/* ========================================================================= */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                      Select Origin & Destination Hubs
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose departure and arrival logistics hubs across Pan-India corridors.
                    </p>
                  </div>

                  {/* Customer Identity & Verified Business KYC Card */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        Verified Business Identity (KYC)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> KYC VERIFIED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <div>
                        Business: <b className="text-white">{currentShipper.name}</b>
                      </div>
                      <div>
                        GSTIN: <span className="font-mono text-emerald-400 font-bold">{currentShipper.gst_number || '10AAACM4928P1Z3'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipper Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Switch Registered Shipper Account
                    </label>
                    <select
                      value={selectedShipperId}
                      onChange={(e) => setSelectedShipperId(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {shippers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (GSTIN: {s.gst_number || '10AAACM4928P1Z3'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CityAutocomplete
                      label="Pickup Hub (Departure City)"
                      sublabel="Origin Node"
                      value={pickupCity}
                      onChange={(cityName, coords) => {
                        setPickupCity(cityName);
                        setPickupCoords(coords);
                      }}
                      excludeCity={dropCity}
                      placeholder="Search origin hub (e.g. Patna, Pune, Delhi NCR)..."
                    />

                    <CityAutocomplete
                      label="Drop Hub (Arrival City)"
                      sublabel="Destination Node"
                      value={dropCity}
                      onChange={(cityName, coords) => {
                        setDropCity(cityName);
                        setDropCoords(coords);
                      }}
                      excludeCity={pickupCity}
                      placeholder="Search destination hub (e.g. Darbhanga, Mumbai)..."
                    />
                  </div>

                  {/* Corridor Highway Distance */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Direct Road Corridor Distance:</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">{distanceKm} km</span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30"
                    >
                      <span>Continue to Delivery SLA</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 2: FLEET SEGREGATION BY DELIVERY MODE (SLA SELECTION) */}
              {/* ========================================================================= */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                      Choose Delivery SLA & Fleet Segregation Mode
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Select your priority SLA. The fleet roster automatically filters dedicated vehicles.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option A: Standard Backhaul Pool */}
                    <div
                      onClick={() => setUrgency('standard')}
                      className={`p-4 rounded-2xl border cursor-pointer transition space-y-3 ${
                        urgency === 'standard'
                          ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🟢</span>
                          <span className="font-bold text-white text-sm">Standard Backhaul Pool (24–48h)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          -25% SAVINGS
                        </span>
                      </div>
                      <div className="text-xs text-emerald-300 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Estimated Arrival: Within 24–36 Hours</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Shared capacity with verified MSMEs along the corridor. Maximizes vehicle load factor and diesel efficiency.
                      </p>
                    </div>

                    {/* Option B: Same-Day Express Direct */}
                    <div
                      onClick={() => setUrgency('express')}
                      className={`p-4 rounded-2xl border cursor-pointer transition space-y-3 ${
                        urgency === 'express'
                          ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-500/40 shadow-lg'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">⚡</span>
                          <span className="font-bold text-white text-sm">Same-Day Express Direct</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> GUARANTEED SLA
                        </span>
                      </div>
                      <div className="text-xs text-amber-300 font-medium flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5" />
                        <span>Guaranteed Delivery: By 08:30 PM Today</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Dedicated Point-to-Point fast-track transit with zero multi-stop intermediate detours (detour &le; 5%).
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30"
                    >
                      <span>Continue to Vehicle Fleet</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 3: VEHICLE FLEET SELECTION (DYNAMICALLY FILTERED BY SERVICE MODE) */}
              {/* ========================================================================= */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                      Select Segregated Vehicle Class & Available Truck
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Showing vehicles matching your selected SLA: <b className="text-emerald-400 font-mono">{urgency === 'express' ? 'EXPRESS_DIRECT (Same-Day)' : 'STANDARD_POOLING (Multi-Load)'}</b>
                    </p>
                  </div>

                  {/* 7 Expanded Vehicle Cards with Live Visual Capacity Meters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {EXPANDED_VEHICLE_FLEET.map((veh) => {
                      const isSelected = veh.id === selectedSegmentId;
                      const occupancyPct = Math.round((veh.occupiedTonnes / veh.totalCapacityTonnes) * 100);
                      const spareTonnes = Number((veh.totalCapacityTonnes - veh.occupiedTonnes).toFixed(2));
                      const sparePct = 100 - occupancyPct;

                      const meterColor = sparePct > 40 ? 'bg-emerald-500' : sparePct >= 15 ? 'bg-amber-500' : 'bg-rose-500';

                      return (
                        <div
                          key={`veh-fleet-${veh.id}`}
                          onClick={() => {
                            setSelectedSegmentId(veh.id);
                            setWeightTonnes(veh.defaultTonnage);
                          }}
                          className={`p-3 rounded-2xl border cursor-pointer text-left transition flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-emerald-950/50 border-emerald-500 text-white ring-1 ring-emerald-500/40 shadow-md'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{veh.icon}</span>
                              <div>
                                <div className="text-xs font-bold text-white leading-tight">{veh.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {veh.tag} • Speed: <b className="text-cyan-400">{veh.maxSpeedKmph} km/h</b>
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                                ✓
                              </div>
                            )}
                          </div>

                          {/* Visual Capacity Meter Bar */}
                          <div className="space-y-1 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-[10px]">
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Occupied: <b className="text-slate-200">{veh.occupiedTonnes}T</b> ({occupancyPct}%)</span>
                              <span>Spare: <b className="text-emerald-400 font-bold">{spareTonnes}T</b> ({sparePct}%)</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${occupancyPct}%` }}
                                className="bg-slate-600 h-full"
                              />
                              <div
                                style={{ width: `${sparePct}%` }}
                                className={`${meterColor} h-full transition-all duration-300`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Available Segregated Dummy Trucks Roster on Corridor */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                      <span>Available {urgency === 'express' ? '⚡ Express Dedicated' : '🟢 Standard Pooling'} Trucks</span>
                      <span className="text-[10px] text-emerald-400 font-normal">Fleet Segregated • Live SLA Verified</span>
                    </div>

                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {filteredCorridorTrucks.map((truck) => {
                        const isSelected = selectedTruckId === truck.id;
                        return (
                          <div
                            key={truck.id}
                            onClick={() => setSelectedTruckId(truck.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                              isSelected
                                ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <div className="w-4 h-4 rounded-full border border-emerald-500 flex items-center justify-center">
                                {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-bold text-white">{truck.vehicleNumber}</span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                    truck.serviceMode === 'EXPRESS_DIRECT' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                                  }`}>
                                    {truck.slaBadgeText}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Driver: <b className="text-slate-200">{truck.driverName}</b> (★ {truck.rating}) • {truck.vehicleModel}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[10px] text-slate-400">
                                ETA: <span className="text-white font-medium">{truck.estimatedArrival}</span>
                              </div>
                              <div className="text-[10px] text-emerald-400 font-semibold">
                                {truck.spareCapacityTonnes}T Spare Space
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30"
                    >
                      <span>Continue to Cargo Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 4: CARGO SELECTION & MANDATORY NON-CONTRABAND DECLARATION */}
              {/* ========================================================================= */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                      Consignment Weight & Legal Cargo Declaration
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose commodity type, enter exact payload, and sign the mandatory non-contraband declaration.
                    </p>
                  </div>

                  {/* Weight Presets & Slider */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        Consignment Weight: <b className="text-emerald-400 font-mono text-base">{weightTonnes} Tonnes</b>
                        <span className="text-[11px] text-slate-500 ml-1">({Math.round(weightTonnes * 1000)} kg)</span>
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      {QUICK_TONNAGE_PRESETS.map((preset) => (
                        <button
                          key={`w-preset-${preset.label}`}
                          type="button"
                          onClick={() => {
                            setWeightTonnes(preset.tonnes);
                            setSelectedSegmentId(preset.segmentId);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                            weightTonnes === preset.tonnes
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="range"
                      min={0.1}
                      max={activeVehicleClass.maxTonnage}
                      step={0.1}
                      value={weightTonnes}
                      onChange={(e) => setWeightTonnes(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Product Category Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-300">
                        Select Product Category or Type Custom
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomProduct(!isCustomProduct)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isCustomProduct ? 'Choose Standard Category' : 'Type Custom Product'}</span>
                      </button>
                    </div>

                    {isCustomProduct ? (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                        <label className="text-[11px] text-slate-400">Custom Product Description / Self-Type:</label>
                        <input
                          type="text"
                          value={customCommodityText}
                          onChange={(e) => setCustomCommodityText(e.target.value)}
                          placeholder="e.g. Handcrafted Brass Utensils, Cold-Pressed Mustard Oil, Solar Panels..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {STANDARD_COMMODITIES.map((prod) => {
                          const isSelected = selectedCommodityId === prod.id;
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => setSelectedCommodityId(prod.id)}
                              className={`p-3 rounded-xl border text-left text-xs transition flex items-center space-x-2.5 ${
                                isSelected
                                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold'
                                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span className="text-base">{prod.icon}</span>
                              <span className="truncate">{prod.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mandatory Non-Contraband Declaration Checkbox */}
                  <div
                    onClick={() => setAntiContrabandDeclared(!antiContrabandDeclared)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 text-xs ${
                      antiContrabandDeclared
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-slate-200'
                        : 'bg-rose-950/30 border-rose-500/50 text-slate-300'
                    }`}
                  >
                    <div className="text-emerald-400 shrink-0 mt-0.5">
                      {antiContrabandDeclared ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-white">
                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                        <span>Mandatory Non-Contraband & Legal Cargo Declaration</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        "I hereby declare that this consignment contains no prohibited, hazardous, contraband, or illegal goods under Indian Law (Motor Vehicles Act & GST Rules). Sender identity and cargo are legally verified."
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      disabled={!antiContrabandDeclared}
                      onClick={() => setCurrentStep(5)}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                    >
                      <span>Review Driver & Dual-OTP Handshake</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 5: DRIVER PROFILE, DUAL-OTP HANDSHAKE & TAX BREAKDOWN */}
              {/* ========================================================================= */}
              {currentStep === 5 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">5</span>
                      Assigned Driver KYC & Dual-OTP Verification Overview
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Verify transporter credentials, dual-OTP pickup/delivery protocol, and itemized 5% GST breakdown.
                    </p>
                  </div>

                  {/* Complete Assigned Driver Card with KYC Badges */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        Assigned Transporter & Driver Profile
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> KYC VERIFIED
                      </span>
                    </div>

                    <div className="flex items-start space-x-3.5">
                      <img
                        src={assignedTruck.driverPhoto}
                        alt={assignedTruck.driverName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/40 shadow"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-bold text-white text-sm flex items-center justify-between">
                          <span>{assignedTruck.driverName}</span>
                          <span className="text-emerald-400 font-bold">★ {assignedTruck.rating}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Phone: <b className="text-slate-200">{assignedTruck.driverPhone}</b> • Total Trips: <b className="text-white">{assignedTruck.completedTrips}</b>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Driving License (DL): <span className="text-slate-300 font-semibold">{assignedTruck.driverDl}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Truck Registration:</span>
                        <div className="font-mono font-bold text-white">{assignedTruck.vehicleNumber}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[11px]">Service SLA & Speed:</span>
                        <div className="text-emerald-400 font-medium">{assignedTruck.vehicleModel} ({assignedTruck.speedKmph} km/h)</div>
                      </div>
                    </div>
                  </div>

                  {/* Dual-OTP Handshake Protocol Notice */}
                  <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-xs">
                    <KeyRound className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-blue-300">Dual-OTP Security Handshake Protocol</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <b>OTP 1 (Pickup Code)</b> will be generated for you to share with the driver upon cargo pickup. <b>OTP 2 (Delivery Code)</b> will be sent to the receiver to complete the delivery and release driver payout.
                      </p>
                    </div>
                  </div>

                  {/* Transparent Itemized Tax Breakdown */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <ReceiptText className="w-4 h-4 text-emerald-400" />
                        Itemized Logistics Tax Invoice
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">SAC: 996511 (GTA)</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Base Freight ({distanceKm} km × {weightTonnes}T):</span>
                      <span className="font-mono text-white">₹{rawSolo.toFixed(2)}</span>
                    </div>

                    {backhaulDiscount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>Backhaul Pooling Discount (-25%):</span>
                        <span className="font-mono">- ₹{backhaulDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-900">
                      <span>Net Taxable Freight:</span>
                      <span className="font-mono text-white font-semibold">₹{netTaxableFreight.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>GST @ 5% (Logistics Service Tax):</span>
                      <span className="font-mono text-white">₹{gstAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>National Highway Toll & Green Cess:</span>
                      <span className="font-mono text-white">₹{tollGreenCess.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-200 font-bold pt-2 border-t border-slate-800 text-sm">
                      <span>Total Amount Payable:</span>
                      <span className="font-mono text-emerald-400 text-base">₹{totalPayable.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !antiContrabandDeclared}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmitting ? 'Booking & Initiating Handshake...' : 'Confirm Booking & Generate Dual-OTP'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Right 5 Columns: Dynamic Live Summary Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Rate & Service SLA</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                urgency === 'express' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {urgency === 'express' ? '⚡ EXPRESS DEDICATED' : '🟢 STANDARD POOLED'}
              </span>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Selected Corridor:</span>
                <span className="text-white font-semibold">{pickupCity} ➔ {dropCity}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Service Mode:</span>
                <span className={`font-semibold ${urgency === 'express' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {urgency === 'express' ? 'Same-Day Fast-Track' : 'Multi-Shipper Backhaul'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vehicle Class:</span>
                <span className="text-white font-semibold">{activeVehicleClass.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payload Weight:</span>
                <span className="text-white font-mono">{weightTonnes} Tonnes</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Product:</span>
                <span className="text-slate-200 truncate max-w-[170px]">{finalCargoName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transit Window:</span>
                <span className="text-cyan-400 font-semibold">
                  {urgency === 'express' ? 'Same-Day (< 8 Hours)' : `~${estimatedHours} Hours (24-36h window)`}
                </span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between shadow-inner">
              <div>
                <div className="text-[11px] text-emerald-300 font-medium">Final Amount Payable</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  ₹{totalPayable.toFixed(2)}
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-xs">
                  {urgency === 'standard' ? `Save ₹${backhaulDiscount}` : 'Dedicated SLA'}
                </span>
                <div className="text-[10px] text-slate-400 mt-1">
                  Incl. 5% GST & Tolls
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-start space-x-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Automated Form GST EWB-01 generation and real-time Dual-OTP security verification.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
