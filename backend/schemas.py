from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    phone: str
    role: str
    gst_number: Optional[str] = None
    driving_license_no: Optional[str] = None
    avatar_url: Optional[str] = None
    rating: Optional[float] = 4.8
    verified_identity: Optional[bool] = True

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# Vehicle Trip Schemas
class VehicleTripCreate(BaseModel):
    driver_id: int
    vehicle_number: Optional[str] = "BR-01-GB-4592"
    vehicle_model: Optional[str] = "Tata Prima 10-Tonne MCV"
    vehicle_segment: Optional[str] = "MCV (2.5T - 7.5T)"
    service_mode: Optional[str] = "STANDARD_POOLING"  # 'EXPRESS_DIRECT' vs 'STANDARD_POOLING'
    rc_status: Optional[str] = "ACTIVE & VERIFIED"
    origin_city: str
    destination_city: str
    origin_coords: List[float] = Field(..., description="[lat, lng]")
    dest_coords: List[float] = Field(..., description="[lat, lng]")
    total_capacity_tonnes: float = 10.0
    current_load_tonnes: float = 6.0
    available_capacity_tonnes: float = 4.0
    detour_threshold_pct: float = 15.0
    base_fare_per_km: float = 32.0
    departure_time: Optional[datetime.datetime] = None
    sla_hours: Optional[float] = 24.0
    live_gps: Optional[Dict[str, Any]] = None

class VehicleTripResponse(BaseModel):
    id: int
    driver_id: int
    vehicle_number: str
    vehicle_model: Optional[str] = "Tata Prima 10-Tonne MCV"
    vehicle_segment: Optional[str] = "MCV (2.5T - 7.5T)"
    service_mode: Optional[str] = "STANDARD_POOLING"
    rc_status: Optional[str] = "ACTIVE & VERIFIED"
    origin_city: str
    destination_city: str
    origin_coords: List[float]
    dest_coords: List[float]
    total_capacity_tonnes: float
    current_load_tonnes: float
    available_capacity_tonnes: float
    detour_threshold_pct: float
    base_fare_per_km: float
    departure_time: datetime.datetime
    sla_hours: Optional[float] = 24.0
    live_gps: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime.datetime
    driver: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# LTL Demand Schemas
class LTLDemandCreate(BaseModel):
    shipper_id: int
    pickup_city: str
    drop_city: str
    pickup_coords: List[float] = Field(..., description="[lat, lng]")
    drop_coords: List[float] = Field(..., description="[lat, lng]")
    weight_tonnes: float
    cargo_segment: Optional[str] = "LCV (0.5T - 2.5T)"
    cargo_type: Optional[str] = "Agri Produce / FMCG"
    cubic_volume_cuft: Optional[float] = 200.0
    urgency: Optional[str] = "standard"  # 'standard' or 'express'
    service_mode_required: Optional[str] = "STANDARD_POOLING"
    max_budget: Optional[float] = None
    anti_contraband_declared: Optional[bool] = True

class LTLDemandResponse(BaseModel):
    id: int
    shipper_id: int
    pickup_city: str
    drop_city: str
    pickup_coords: List[float]
    drop_coords: List[float]
    weight_tonnes: float
    cargo_segment: Optional[str] = "LCV (0.5T - 2.5T)"
    cargo_type: str
    cubic_volume_cuft: Optional[float] = 200.0
    urgency: str
    service_mode_required: Optional[str] = "STANDARD_POOLING"
    max_budget: Optional[float]
    quoted_price: Optional[float]
    anti_contraband_declared: Optional[bool] = True
    time_window_deadline: Optional[datetime.datetime] = None
    status: str
    created_at: datetime.datetime
    shipper: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Pricing Quote Schemas
class PricingQuoteRequest(BaseModel):
    pickup_city: str
    drop_city: str
    pickup_coords: Optional[List[float]] = None
    drop_coords: Optional[List[float]] = None
    weight_tonnes: float
    cargo_segment: Optional[str] = "LCV (0.5T - 2.5T)"
    urgency: Optional[str] = "standard"
    trip_id: Optional[int] = None

class PricingQuoteResponse(BaseModel):
    direct_distance_km: float
    base_rate_per_km: float
    weight_tonnes: float
    urgency_multiplier: float
    pooling_discount_pct: float
    raw_solo_price: float
    final_pooled_price: float
    shipper_savings_inr: float
    estimated_co2_kg: float
    service_mode: str = "STANDARD_POOLING"
    guaranteed_delivery_eta: str = "24-36 Hours"

# Dual-OTP Protocol Schemas
class PickupOTPVerifyRequest(BaseModel):
    demand_id: int
    pickup_otp: str

class DeliveryOTPVerifyRequest(BaseModel):
    demand_id: int
    delivery_otp: str
    signature_svg: Optional[str] = None
    photo_url: Optional[str] = None
    receiver_name: Optional[str] = None

class EPODVerifyRequest(BaseModel):
    demand_id: int
    otp_code: str
    signature_svg: Optional[str] = None
    photo_url: Optional[str] = None
    receiver_name: Optional[str] = None

class EPODGenerateRequest(BaseModel):
    demand_id: int
    receiver_name: Optional[str] = "Consignee Warehouse In-Charge"

class DualEPODResponse(BaseModel):
    id: int
    demand_id: int
    pickup_otp: str
    pickup_verified: bool
    pickup_verified_at: Optional[datetime.datetime]
    delivery_otp: str
    delivery_verified: bool
    delivery_verified_at: Optional[datetime.datetime]
    signature_svg: Optional[str]
    photo_url: Optional[str]
    receiver_name: Optional[str]

    otp_code: Optional[str] = None
    verified: Optional[bool] = None

    class Config:
        from_attributes = True

# E-Way Bill Schemas
class EWayBillPartBRequest(BaseModel):
    demand_id: int
    vehicle_number: str
    transporter_id: Optional[str] = "TRANS-BR-9941"
    driver_phone: Optional[str] = None

class EWayBillResponse(BaseModel):
    id: int
    demand_id: int
    eway_bill_no: str
    part_a_data: Dict[str, Any]
    part_b_vehicle_no: Optional[str]
    transport_doc_no: Optional[str]
    valid_until: datetime.datetime
    status: str

    class Config:
        from_attributes = True

# Optimization Schemas
class WaypointDetail(BaseModel):
    sequence: int
    stop_name: str
    location_coords: List[float]
    action: str  # 'START', 'PICKUP', 'DROP', 'END'
    demand_id: Optional[int] = None
    tonnes_delta: float
    cumulative_load_tonnes: float
    distance_from_prev_km: float
    eta_mins: int
    time_window_start_mins: Optional[int] = 0
    time_window_end_mins: Optional[int] = 1440

class ConsolidatedTripResponse(BaseModel):
    id: int
    trip_id: int
    service_mode: Optional[str] = "STANDARD_POOLING"
    demand_ids: List[int]
    optimized_waypoints: List[WaypointDetail]
    dynamic_pricing_breakdown: Dict[str, Any]
    empty_km_saved: float
    co2_cut_kg: float
    total_trip_km: float
    baseline_direct_km: float
    detour_pct: float
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True
