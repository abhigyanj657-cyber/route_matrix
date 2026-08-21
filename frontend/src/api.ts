import type { VehicleTrip, LTLDemand, ConsolidatedTrip, PricingQuote, DeliveryEPOD, EWayBill, User, DriverRosterItem } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Fallback Mock Data in case backend is disconnected
const MOCK_USERS: User[] = [
  { id: 1, name: 'Maa Janaki Agro Mills (Patna)', phone: '+91-9835012345', role: 'shipper', gst_number: '10AAACM4928P1Z3', rating: 4.9 },
  { id: 2, name: 'Mithila Handloom & Crafts Co.', phone: '+91-9431098765', role: 'shipper', gst_number: '10BAECM8832L1Z9', rating: 4.7 },
  { id: 3, name: 'Champaran FMCG Distributors', phone: '+91-9771034567', role: 'shipper', gst_number: '10CAACP5521M1Z1', rating: 4.8 },
  { id: 4, name: 'Pune Auto Ancillaries Pvt Ltd', phone: '+91-9822019944', role: 'shipper', gst_number: '27AAACP8812K1Z5', rating: 4.9 },
  { id: 5, name: 'Ramesh Kumar', phone: '+91-9123456780', role: 'driver', gst_number: '10DAACT9920Q1Z4', driving_license_no: 'BR-012018009412', rating: 4.9, verified_identity: true },
  { id: 6, name: 'Santosh Yadav', phone: '+91-9876543210', role: 'driver', gst_number: '10EAACF7731K1Z8', driving_license_no: 'BR-062019004819', rating: 4.8, verified_identity: true },
  { id: 7, name: 'Vikramjit Singh', phone: '+91-9814018899', role: 'driver', gst_number: '03AAACV9912L1Z2', driving_license_no: 'PB-102016001289', rating: 4.95, verified_identity: true },
  { id: 8, name: 'Suresh Patil', phone: '+91-9823091122', role: 'driver', gst_number: '27AAACT6614M1Z9', driving_license_no: 'MH-122017007731', rating: 4.85, verified_identity: true }
];

const MOCK_DRIVER_ROSTERS: DriverRosterItem[] = [
  {
    id: 5,
    name: "Ramesh Kumar",
    phone: "+91-9123456780",
    rating: 4.9,
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    driving_license_no: "BR-012018009412",
    verified_identity: true,
    vehicle_number: "BR-01-GB-4592",
    vehicle_model: "Tata Prima 10-Tonne MCV",
    vehicle_segment: "MCV (2.5T - 7.5T)",
    assigned_route: "Patna ➔ Darbhanga ➔ Madhubani",
    live_gps: { lat: 25.5941, lng: 85.1376, heading: 45 },
    status: "On-Trip (Live)",
    eway_bill_status: "COMPLIANT / ATTACHED"
  },
  {
    id: 6,
    name: "Santosh Yadav",
    phone: "+91-9876543210",
    rating: 4.8,
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    driving_license_no: "BR-062019004819",
    verified_identity: true,
    vehicle_number: "BR-06-PA-8812",
    vehicle_model: "Eicher Pro 6-Wheeler (17ft)",
    vehicle_segment: "LCV (0.5T - 2.5T)",
    assigned_route: "Muzaffarpur ➔ Samastipur",
    live_gps: { lat: 26.1209, lng: 85.3647, heading: 110 },
    status: "Available at Hub",
    eway_bill_status: "VERIFIED"
  },
  {
    id: 7,
    name: "Vikramjit Singh",
    phone: "+91-9814018899",
    rating: 4.95,
    avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    driving_license_no: "PB-102016001289",
    verified_identity: true,
    vehicle_number: "PB-10-CZ-9901",
    vehicle_model: "BharatBenz 2823R (16-Tonne)",
    vehicle_segment: "HCV (7.5T - 16T)",
    assigned_route: "Delhi NCR ➔ Jaipur ➔ Ahmedabad",
    live_gps: { lat: 28.6139, lng: 77.2090, heading: 210 },
    status: "Loading at Depot",
    eway_bill_status: "COMPLIANT"
  },
  {
    id: 8,
    name: "Suresh Patil",
    phone: "+91-9823091122",
    rating: 4.85,
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    driving_license_no: "MH-122017007731",
    verified_identity: true,
    vehicle_number: "MH-12-RN-8821",
    vehicle_model: "Ashok Leyland 16T Taurus",
    vehicle_segment: "HCV (7.5T - 16T)",
    assigned_route: "Mumbai ➔ Pune ➔ Nagpur",
    live_gps: { lat: 19.0760, lng: 72.8777, heading: 120 },
    status: "On-Trip (Live)",
    eway_bill_status: "COMPLIANT / ATTACHED"
  }
];

const MOCK_TRIPS: VehicleTrip[] = [
  {
    id: 1,
    driver_id: 5,
    vehicle_number: 'BR-01-GB-4592',
    vehicle_model: 'Tata Prima 10-Tonne MCV',
    vehicle_segment: 'MCV (2.5T - 7.5T)',
    origin_city: 'Patna',
    destination_city: 'Madhubani',
    origin_coords: [25.5941, 85.1376],
    dest_coords: [26.3549, 86.0717],
    total_capacity_tonnes: 10.0,
    current_load_tonnes: 6.0,
    available_capacity_tonnes: 4.0,
    detour_threshold_pct: 15.0,
    base_fare_per_km: 32.0,
    departure_time: new Date(Date.now() + 3600000).toISOString(),
    live_gps: { lat: 25.5941, lng: 85.1376, heading: 45 },
    status: 'active',
    driver: MOCK_USERS[4],
  }
];

const MOCK_DEMANDS: LTLDemand[] = [
  {
    id: 1,
    shipper_id: 1,
    pickup_city: 'Patna',
    drop_city: 'Darbhanga',
    pickup_coords: [25.5941, 85.1376],
    drop_coords: [26.1542, 85.8918],
    weight_tonnes: 2.0,
    cargo_segment: 'LCV (0.5T - 2.5T)',
    cargo_type: 'Agro Produce / Packaged Makhana',
    cubic_volume_cuft: 210,
    urgency: 'standard',
    max_budget: 2800,
    quoted_price: 984.31,
    status: 'matched',
    shipper: MOCK_USERS[0],
  },
  {
    id: 2,
    shipper_id: 2,
    pickup_city: 'Darbhanga',
    drop_city: 'Madhubani',
    pickup_coords: [26.1542, 85.8918],
    drop_coords: [26.3549, 86.0717],
    weight_tonnes: 1.0,
    cargo_segment: 'LCV (0.5T - 2.5T)',
    cargo_type: 'Mithila Handloom & Handicrafts',
    cubic_volume_cuft: 110,
    urgency: 'express',
    max_budget: 1600,
    quoted_price: 337.5,
    status: 'matched',
    shipper: MOCK_USERS[1],
  },
  {
    id: 3,
    shipper_id: 3,
    pickup_city: 'Muzaffarpur',
    drop_city: 'Samastipur',
    pickup_coords: [26.1209, 85.3647],
    drop_coords: [25.8630, 85.7810],
    weight_tonnes: 0.8,
    cargo_segment: 'Mini LTL (50kg - 500kg)',
    cargo_type: 'FMCG Packaged Goods',
    cubic_volume_cuft: 80,
    urgency: 'standard',
    max_budget: 1200,
    quoted_price: 850.0,
    status: 'pending',
    shipper: MOCK_USERS[2],
  },
  {
    id: 4,
    shipper_id: 4,
    pickup_city: 'Pune',
    drop_city: 'Mumbai',
    pickup_coords: [18.5204, 73.8567],
    drop_coords: [19.0760, 72.8777],
    weight_tonnes: 1.5,
    cargo_segment: 'LCV (0.5T - 2.5T)',
    cargo_type: 'Auto Ancillary Spare Parts',
    cubic_volume_cuft: 160,
    urgency: 'express',
    max_budget: 3500,
    quoted_price: 2450.0,
    status: 'pending',
    shipper: MOCK_USERS[3],
  }
];

const MOCK_CONSOLIDATED: ConsolidatedTrip = {
  id: 1,
  trip_id: 1,
  demand_ids: [1, 2],
  optimized_waypoints: [
    { sequence: 1, stop_name: 'Patna Central Depot (Start)', location_coords: [25.5941, 85.1376], action: 'START', demand_id: null, tonnes_delta: 0, cumulative_load_tonnes: 6.0, distance_from_prev_km: 0, eta_mins: 0 },
    { sequence: 2, stop_name: 'Pickup: Patna Agro Mills (D#1)', location_coords: [25.5941, 85.1376], action: 'PICKUP', demand_id: 1, tonnes_delta: 2.0, cumulative_load_tonnes: 8.0, distance_from_prev_km: 0, eta_mins: 0 },
    { sequence: 3, stop_name: 'Pickup: Darbhanga Handloom Hub (D#2)', location_coords: [26.1542, 85.8918], action: 'PICKUP', demand_id: 2, tonnes_delta: 1.0, cumulative_load_tonnes: 9.0, distance_from_prev_km: 119.31, eta_mins: 159 },
    { sequence: 4, stop_name: 'Drop: Darbhanga Mandi (D#1)', location_coords: [26.1542, 85.8918], action: 'DROP', demand_id: 1, tonnes_delta: -2.0, cumulative_load_tonnes: 7.0, distance_from_prev_km: 0, eta_mins: 159 },
    { sequence: 5, stop_name: 'Drop: Madhubani Trade Center (D#2)', location_coords: [26.3549, 86.0717], action: 'DROP', demand_id: 2, tonnes_delta: -1.0, cumulative_load_tonnes: 6.0, distance_from_prev_km: 34.88, eta_mins: 205 },
    { sequence: 6, stop_name: 'Madhubani Terminal Depot (End)', location_coords: [26.3549, 86.0717], action: 'END', demand_id: null, tonnes_delta: 0, cumulative_load_tonnes: 6.0, distance_from_prev_km: 0, eta_mins: 205 },
  ],
  dynamic_pricing_breakdown: {
    driver_baseline_revenue: 4915.52,
    driver_min_guaranteed_floor: 5898.62,
    driver_final_payout: 5906.88,
    driver_gain_over_baseline_pct: 20.2,
    driver_extra_earnings_inr: 991.36,
    total_shipper_revenue: 1321.81,
    total_msme_savings_inr: 440.6,
    platform_fee_inr: 330.45,
    empty_km_saved: 153.61,
    co2_cut_kg: 104.45,
    detour_km: 0.58,
    shipper_breakdowns: [
      { demand_id: 1, shipper_name: 'Maa Janaki Agro Mills', pickup_city: 'Patna', drop_city: 'Darbhanga', weight_tonnes: 2.0, raw_solo_price: 1312.41, final_pooled_price: 984.31, savings_inr: 328.1, savings_pct: 25.0 },
      { demand_id: 2, shipper_name: 'Mithila Handloom & Crafts', pickup_city: 'Darbhanga', drop_city: 'Madhubani', weight_tonnes: 1.0, raw_solo_price: 450.0, final_pooled_price: 337.5, savings_inr: 112.5, savings_pct: 25.0 }
    ]
  },
  empty_km_saved: 153.61,
  co2_cut_kg: 104.45,
  total_trip_km: 154.19,
  baseline_direct_km: 153.61,
  detour_pct: 0.38,
  status: 'optimized'
};

export async function fetchActiveTrips(): Promise<VehicleTrip[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trips/active`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return MOCK_TRIPS;
  }
}

export async function fetchDriverRosters(): Promise<DriverRosterItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/drivers/roster`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return MOCK_DRIVER_ROSTERS;
  }
}

export async function fetchPendingDemands(): Promise<LTLDemand[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/demands/pending`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return MOCK_DEMANDS;
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return MOCK_USERS;
  }
}

export async function fetchConsolidatedTrip(tripId: number): Promise<ConsolidatedTrip | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/consolidated/${tripId}`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return MOCK_CONSOLIDATED;
  }
}

export async function runTripOptimization(tripId: number): Promise<ConsolidatedTrip> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/optimizer/consolidate/${tripId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return MOCK_CONSOLIDATED;
  }
}

export async function publishVehicleTrip(payload: {
  driver_id: number;
  vehicle_number: string;
  vehicle_model?: string;
  vehicle_segment?: string;
  origin_city: string;
  destination_city: string;
  origin_coords: [number, number];
  dest_coords: [number, number];
  total_capacity_tonnes: number;
  current_load_tonnes: number;
  detour_threshold_pct: number;
  base_fare_per_km: number;
}): Promise<VehicleTrip> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trips/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    const newTrip: VehicleTrip = {
      id: Date.now(),
      ...payload,
      available_capacity_tonnes: Math.max(0, payload.total_capacity_tonnes - payload.current_load_tonnes),
      departure_time: new Date().toISOString(),
      status: 'active',
    };
    MOCK_TRIPS.push(newTrip);
    return newTrip;
  }
}

export async function createLTLDemand(payload: {
  shipper_id: number;
  pickup_city: string;
  drop_city: string;
  pickup_coords: [number, number];
  drop_coords: [number, number];
  weight_tonnes: number;
  cargo_segment?: string;
  cargo_type: string;
  cubic_volume_cuft?: number;
  urgency: 'standard' | 'express';
  max_budget?: number;
}): Promise<LTLDemand> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/demands/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    const newDem: LTLDemand = {
      id: Date.now(),
      ...payload,
      quoted_price: round(payload.weight_tonnes * 450 * 1.5, 2),
      status: 'pending',
    };
    MOCK_DEMANDS.unshift(newDem);
    return newDem;
  }
}

export async function getPricingQuote(payload: {
  pickup_city: string;
  drop_city: string;
  weight_tonnes: number;
  cargo_segment?: string;
  urgency: 'standard' | 'express';
  trip_id?: number;
}): Promise<PricingQuote> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pricing/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    const dist = 145.0;
    const base = 5.5;
    const mult = payload.urgency === 'express' ? 1.25 : 1.0;
    const solo = Math.round(dist * base * payload.weight_tonnes * mult);
    const pooled = Math.round(solo * 0.75);
    return {
      direct_distance_km: dist,
      base_rate_per_km: base,
      weight_tonnes: payload.weight_tonnes,
      urgency_multiplier: mult,
      pooling_discount_pct: 25.0,
      raw_solo_price: solo,
      final_pooled_price: pooled,
      shipper_savings_inr: solo - pooled,
      estimated_co2_kg: Math.round(dist * 0.68 * 0.75),
    };
  }
}

export async function generateEPOD_OTP(demandId: number, receiverName?: string): Promise<DeliveryEPOD> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/epod/generate-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demand_id: demandId, receiver_name: receiverName }),
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return {
      id: demandId,
      demand_id: demandId,
      otp_code: '784920',
      receiver_name: receiverName || 'Consignee Warehouse Manager',
      photo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
      verified: false,
    };
  }
}

export async function verifyEPOD(payload: {
  demand_id: number;
  otp_code: string;
  signature_svg?: string;
  photo_url?: string;
  receiver_name?: string;
}): Promise<DeliveryEPOD> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/epod/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'OTP Verification failed');
    }
    return await res.json();
  } catch {
    if (payload.otp_code.trim() !== '784920' && payload.otp_code.trim().length !== 6) {
      throw new Error('Invalid OTP code. Please check SMS.');
    }
    return {
      id: payload.demand_id,
      demand_id: payload.demand_id,
      otp_code: payload.otp_code,
      signature_svg: payload.signature_svg || '<svg>Mock Signature</svg>',
      verified: true,
      verified_at: new Date().toISOString(),
      receiver_name: payload.receiver_name || 'Consignee Manager',
    };
  }
}

export async function verifyPickupOTP(payload: {
  demand_id: number;
  pickup_otp: string;
}): Promise<{ success: boolean; message: string; demand_id: number; pickup_verified: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/epod/verify-pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Pickup OTP Verification failed');
    }
    return await res.json();
  } catch (err: any) {
    if (payload.pickup_otp.trim().length === 6) {
      return {
        success: true,
        message: `Pickup Handshake Verified for Consignment #${payload.demand_id}!`,
        demand_id: payload.demand_id,
        pickup_verified: true
      };
    }
    throw new Error(err.message || 'Invalid Pickup OTP code. Please check with Sender.');
  }
}

export async function verifyDeliveryOTP(payload: {
  demand_id: number;
  delivery_otp: string;
  signature_svg?: string;
  photo_url?: string;
  receiver_name?: string;
}): Promise<{ success: boolean; message: string; demand_id: number; delivery_verified: boolean; payout_released: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/epod/verify-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Delivery OTP Verification failed');
    }
    return await res.json();
  } catch (err: any) {
    if (payload.delivery_otp.trim().length === 6) {
      return {
        success: true,
        message: `Delivery e-POD Verified for Consignment #${payload.demand_id}! Driver payout released.`,
        demand_id: payload.demand_id,
        delivery_verified: true,
        payout_released: true
      };
    }
    throw new Error(err.message || 'Invalid Delivery OTP code. Please check with Receiver.');
  }
}

export async function fetchEPOD(demandId: number): Promise<DeliveryEPOD | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/epod/${demandId}`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return {
      id: demandId,
      demand_id: demandId,
      otp_code: '784920',
      receiver_name: 'Consignee Warehouse Manager',
      verified: false,
    };
  }
}

export async function generateEWayBillPartB(payload: {
  demand_id: number;
  vehicle_number: string;
}): Promise<EWayBill> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ewaybill/generate-part-b`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return {
      id: payload.demand_id,
      demand_id: payload.demand_id,
      eway_bill_no: 'EWB-248910294812',
      part_a_data: {
        consignor_gstin: '10AAACM4928P1Z3',
        consignor_name: 'Maa Janaki Agro Mills (Patna)',
        consignee_name: 'Darbhanga Central Hub',
        item_desc: 'Agro Produce / Packaged Makhana',
        hsn_code: '0709',
        weight_tonnes: 2.0,
        invoice_val_inr: 130000,
        from_place: 'Patna',
        to_place: 'Darbhanga',
      },
      part_b_vehicle_no: payload.vehicle_number,
      transport_doc_no: 'LR-88219',
      valid_until: new Date(Date.now() + 3 * 86400000).toISOString(),
      status: 'ASSIGNED',
    };
  }
}

export async function fetchEWayBill(demandId: number): Promise<EWayBill | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ewaybill/${demandId}`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return {
      id: demandId,
      demand_id: demandId,
      eway_bill_no: 'EWB-248910294812',
      part_a_data: {
        consignor_gstin: '10AAACM4928P1Z3',
        consignor_name: 'Maa Janaki Agro Mills (Patna)',
        consignee_name: 'Darbhanga Central Hub',
        item_desc: 'Agro Produce / Packaged Makhana',
        hsn_code: '0709',
        weight_tonnes: 2.0,
        invoice_val_inr: 130000,
        from_place: 'Patna',
        to_place: 'Darbhanga',
      },
      part_b_vehicle_no: 'BR-01-GB-4592',
      transport_doc_no: 'LR-88219',
      valid_until: new Date(Date.now() + 3 * 86400000).toISOString(),
      status: 'ASSIGNED',
    };
  }
}

export async function resetSeedData(): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/seed/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch {
    return { message: 'Database reset to Pan-India demo state' };
  }
}

function round(val: number, decimals: number): number {
  return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
}
