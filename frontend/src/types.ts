export interface User {
  id: number;
  name: string;
  phone: string;
  role: 'shipper' | 'driver' | 'dispatcher';
  gst_number?: string;
  driving_license_no?: string;
  avatar_url?: string;
  rating: number;
  verified_identity?: boolean;
}

export interface DriverRosterItem {
  id: number;
  name: string;
  phone: string;
  rating: number;
  avatar_url: string;
  driving_license_no: string;
  verified_identity: boolean;
  vehicle_number: string;
  vehicle_model: string;
  vehicle_segment: string;
  rc_status?: string;
  assigned_route: string;
  live_gps: {
    lat: number;
    lng: number;
    heading: number;
  };
  status: string;
  eway_bill_status: string;
}

export interface VehicleTrip {
  id: number;
  driver_id: number;
  vehicle_number: string;
  vehicle_model?: string;
  vehicle_segment?: string;
  rc_status?: string;
  origin_city: string;
  destination_city: string;
  origin_coords: [number, number];
  dest_coords: [number, number];
  total_capacity_tonnes: number;
  current_load_tonnes: number;
  available_capacity_tonnes: number;
  detour_threshold_pct: number;
  base_fare_per_km: number;
  departure_time: string;
  live_gps?: {
    lat: number;
    lng: number;
    heading: number;
  };
  status: string;
  driver?: User;
}

export interface LTLDemand {
  id: number;
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
  quoted_price?: number;
  anti_contraband_declared?: boolean;
  status: 'pending' | 'matched' | 'in_transit' | 'delivered';
  shipper?: User;
}

export interface WaypointDetail {
  sequence: number;
  stop_name: string;
  location_coords: [number, number];
  action: 'START' | 'PICKUP' | 'DROP' | 'END';
  demand_id?: number | null;
  tonnes_delta: number;
  cumulative_load_tonnes: number;
  distance_from_prev_km: number;
  eta_mins: number;
}

export interface ShipperBreakdown {
  demand_id: number;
  shipper_name: string;
  pickup_city: string;
  drop_city: string;
  weight_tonnes: number;
  raw_solo_price: number;
  final_pooled_price: number;
  savings_inr: number;
  savings_pct: number;
}

export interface DynamicPricingBreakdown {
  driver_baseline_revenue: number;
  driver_min_guaranteed_floor: number;
  driver_final_payout: number;
  driver_gain_over_baseline_pct: number;
  driver_extra_earnings_inr: number;
  total_shipper_revenue: number;
  total_msme_savings_inr: number;
  platform_fee_inr: number;
  empty_km_saved: number;
  co2_cut_kg: number;
  detour_km: number;
  shipper_breakdowns: ShipperBreakdown[];
}

export interface ConsolidatedTrip {
  id: number;
  trip_id: number;
  demand_ids: number[];
  optimized_waypoints: WaypointDetail[];
  dynamic_pricing_breakdown: DynamicPricingBreakdown;
  empty_km_saved: number;
  co2_cut_kg: number;
  total_trip_km: number;
  baseline_direct_km: number;
  detour_pct: number;
  status: string;
}

export interface PricingQuote {
  direct_distance_km: number;
  base_rate_per_km: number;
  weight_tonnes: number;
  urgency_multiplier: number;
  pooling_discount_pct: number;
  raw_solo_price: number;
  final_pooled_price: number;
  shipper_savings_inr: number;
  estimated_co2_kg: number;
}

export interface DeliveryEPOD {
  id: number;
  demand_id: number;
  pickup_otp?: string;
  pickup_verified?: boolean;
  pickup_verified_at?: string;
  delivery_otp?: string;
  delivery_verified?: boolean;
  delivery_verified_at?: string;
  otp_code: string;
  signature_svg?: string;
  photo_url?: string;
  verified: boolean;
  verified_at?: string;
  receiver_name?: string;
}

export interface EWayBill {
  id: number;
  demand_id: number;
  eway_bill_no: string;
  part_a_data: {
    consignor_gstin: string;
    consignor_name: string;
    consignee_name: string;
    item_desc: string;
    hsn_code: string;
    weight_tonnes: number;
    invoice_val_inr: number;
    from_place: string;
    to_place: string;
  };
  part_b_vehicle_no?: string;
  transport_doc_no?: string;
  valid_until: string;
  status: string;
}
