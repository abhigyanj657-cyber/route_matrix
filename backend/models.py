import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False, unique=True)
    role = Column(String(20), nullable=False)  # 'shipper', 'driver', 'dispatcher'
    gst_number = Column(String(20), nullable=True)
    driving_license_no = Column(String(30), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    rating = Column(Float, default=4.8)
    verified_identity = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    trips = relationship("VehicleTrip", back_populates="driver")
    demands = relationship("LTLDemand", back_populates="shipper")

class VehicleTrip(Base):
    __tablename__ = "vehicle_trips"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_number = Column(String(20), default="BR-01-GB-4592")
    vehicle_model = Column(String(50), default="Tata Prima 10-Tonne MCV")
    vehicle_segment = Column(String(30), default="MCV (2.5T - 7.5T)")
    service_mode = Column(String(30), default="STANDARD_POOLING")  # 'EXPRESS_DIRECT' vs 'STANDARD_POOLING'
    rc_status = Column(String(30), default="ACTIVE & VERIFIED")
    origin_city = Column(String(100), nullable=False)
    destination_city = Column(String(100), nullable=False)
    origin_coords = Column(JSON, nullable=False)  # [lat, lng]
    dest_coords = Column(JSON, nullable=False)    # [lat, lng]
    total_capacity_tonnes = Column(Float, default=10.0)
    current_load_tonnes = Column(Float, default=6.0)
    available_capacity_tonnes = Column(Float, default=4.0)
    detour_threshold_pct = Column(Float, default=15.0)
    base_fare_per_km = Column(Float, default=32.0)
    departure_time = Column(DateTime, default=datetime.datetime.utcnow)
    sla_hours = Column(Float, default=24.0)  # Guaranteed delivery SLA in hours
    live_gps = Column(JSON, nullable=True)  # {"lat": float, "lng": float, "heading": int}
    status = Column(String(20), default="active")  # 'scheduled', 'active', 'completed'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    driver = relationship("User", back_populates="trips")
    consolidated_trips = relationship("ConsolidatedTrip", back_populates="trip")

class LTLDemand(Base):
    __tablename__ = "ltl_demands"

    id = Column(Integer, primary_key=True, index=True)
    shipper_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pickup_city = Column(String(100), nullable=False)
    drop_city = Column(String(100), nullable=False)
    pickup_coords = Column(JSON, nullable=False)  # [lat, lng]
    drop_coords = Column(JSON, nullable=False)    # [lat, lng]
    weight_tonnes = Column(Float, nullable=False)
    cargo_segment = Column(String(50), default="LCV (0.5T - 2.5T)")
    cargo_type = Column(String(100), default="Agri Produce / FMCG")
    cubic_volume_cuft = Column(Float, default=200.0)
    urgency = Column(String(20), default="standard")  # 'standard' (STANDARD_POOLING) or 'express' (EXPRESS_DIRECT)
    service_mode_required = Column(String(30), default="STANDARD_POOLING")
    max_budget = Column(Float, nullable=True)
    quoted_price = Column(Float, nullable=True)
    anti_contraband_declared = Column(Boolean, default=True)
    time_window_deadline = Column(DateTime, nullable=True)
    status = Column(String(20), default="pending")  # 'pending', 'matched', 'in_transit', 'delivered'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    shipper = relationship("User", back_populates="demands")
    epod = relationship("DeliveryEPOD", back_populates="demand", uselist=False)
    eway_bill = relationship("EWayBillMock", back_populates="demand", uselist=False)

class ConsolidatedTrip(Base):
    __tablename__ = "consolidated_trips"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("vehicle_trips.id"), nullable=False)
    service_mode = Column(String(30), default="STANDARD_POOLING")
    demand_ids = Column(JSON, nullable=False)  # list of int IDs
    optimized_waypoints = Column(JSON, nullable=False)  # detailed list of route stops with arrival windows
    dynamic_pricing_breakdown = Column(JSON, nullable=False)  # fare breakdown
    empty_km_saved = Column(Float, default=0.0)
    co2_cut_kg = Column(Float, default=0.0)
    total_trip_km = Column(Float, default=0.0)
    baseline_direct_km = Column(Float, default=0.0)
    detour_pct = Column(Float, default=0.0)
    status = Column(String(20), default="optimized")  # 'optimized', 'in_progress', 'completed'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    trip = relationship("VehicleTrip", back_populates="consolidated_trips")

class DeliveryEPOD(Base):
    __tablename__ = "delivery_epods"

    id = Column(Integer, primary_key=True, index=True)
    demand_id = Column(Integer, ForeignKey("ltl_demands.id"), nullable=False, unique=True)
    pickup_otp = Column(String(6), default="419820")
    pickup_verified = Column(Boolean, default=False)
    pickup_verified_at = Column(DateTime, nullable=True)
    
    delivery_otp = Column(String(6), default="784920")
    delivery_verified = Column(Boolean, default=False)
    delivery_verified_at = Column(DateTime, nullable=True)

    signature_svg = Column(Text, nullable=True)
    photo_url = Column(String(255), nullable=True)
    receiver_name = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def otp_code(self):
        return self.delivery_otp

    @property
    def verified(self):
        return self.delivery_verified

    # Relationships
    demand = relationship("LTLDemand", back_populates="epod")

class EWayBillMock(Base):
    __tablename__ = "eway_bill_mocks"

    id = Column(Integer, primary_key=True, index=True)
    demand_id = Column(Integer, ForeignKey("ltl_demands.id"), nullable=False, unique=True)
    eway_bill_no = Column(String(50), nullable=False, unique=True)
    part_a_data = Column(JSON, nullable=False)
    part_b_vehicle_no = Column(String(20), nullable=True)
    transport_doc_no = Column(String(50), nullable=True)
    valid_until = Column(DateTime, nullable=False)
    status = Column(String(20), default="GENERATED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    demand = relationship("LTLDemand", back_populates="eway_bill")
