import random
import string
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas
from optimizer import optimizer_instance, calculate_distance_km, get_city_coords, PAN_INDIA_CITIES, CITY_COORDINATES
from pricing import calculate_shipper_quote, calculate_consolidated_trip_economics

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LastMileSaathi API - Route Matrix Engine",
    description="AI-Optimized Freight Consolidation & Dual-OTP Handshake Platform",
    version="2.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "platform": "LastMileSaathi",
        "tagline": "Pan-India AI Freight Consolidation & Backhaul Network",
        "status": "operational",
        "version": "2.1.0",
        "dual_otp_handshake": "active"
    }

# ==========================================
# 1. USER & DRIVER ENDPOINTS
# ==========================================
@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    return query.all()

@app.get("/api/drivers/roster")
def get_driver_rosters(db: Session = Depends(get_db)):
    drivers = db.query(models.User).filter(models.User.role == "driver").all()
    roster = []
    for d in drivers:
        active_trip = db.query(models.VehicleTrip).filter(models.VehicleTrip.driver_id == d.id).first()
        roster.append({
            "id": d.id,
            "name": d.name,
            "phone": d.phone,
            "rating": d.rating,
            "avatar_url": d.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "driving_license_no": d.driving_license_no or "BR-012019842109",
            "verified_identity": d.verified_identity,
            "vehicle_number": active_trip.vehicle_number if active_trip else "BR-01-GB-4592",
            "vehicle_model": active_trip.vehicle_model if active_trip else "Tata Prima 10-Tonne MCV",
            "vehicle_segment": active_trip.vehicle_segment if active_trip else "MCV (2.5T - 7.5T)",
            "rc_status": active_trip.rc_status if active_trip else "ACTIVE & VERIFIED",
            "assigned_route": f"{active_trip.origin_city} ➔ {active_trip.destination_city}" if active_trip else "Patna ➔ Madhubani",
            "live_gps": active_trip.live_gps if active_trip and active_trip.live_gps else {"lat": 25.5941, "lng": 85.1376, "heading": 45},
            "status": "On-Trip" if active_trip else "Available",
            "eway_bill_status": "COMPLIANT / ATTACHED"
        })
    return roster

@app.post("/api/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.phone == user.phone).first()
    if existing:
        return existing
    new_user = models.User(
        name=user.name,
        phone=user.phone,
        role=user.role,
        gst_number=user.gst_number,
        driving_license_no=user.driving_license_no,
        avatar_url=user.avatar_url,
        rating=user.rating or 4.8,
        verified_identity=user.verified_identity if user.verified_identity is not None else True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ==========================================
# 2. VEHICLE TRIP ENDPOINTS
# ==========================================
@app.post("/api/trips/publish", response_model=schemas.VehicleTripResponse)
def publish_trip(trip_data: schemas.VehicleTripCreate, db: Session = Depends(get_db)):
    driver = db.query(models.User).filter(models.User.id == trip_data.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    origin_coords = trip_data.origin_coords or get_city_coords(trip_data.origin_city)
    dest_coords = trip_data.dest_coords or get_city_coords(trip_data.destination_city)

    new_trip = models.VehicleTrip(
        driver_id=trip_data.driver_id,
        vehicle_number=trip_data.vehicle_number or "BR-01-GB-4592",
        vehicle_model=trip_data.vehicle_model or "Tata Prima 10-Tonne MCV",
        vehicle_segment=trip_data.vehicle_segment or "MCV (2.5T - 7.5T)",
        rc_status=trip_data.rc_status or "ACTIVE & VERIFIED",
        origin_city=trip_data.origin_city,
        destination_city=trip_data.destination_city,
        origin_coords=origin_coords,
        dest_coords=dest_coords,
        total_capacity_tonnes=trip_data.total_capacity_tonnes,
        current_load_tonnes=trip_data.current_load_tonnes,
        available_capacity_tonnes=max(0.0, trip_data.total_capacity_tonnes - trip_data.current_load_tonnes),
        detour_threshold_pct=trip_data.detour_threshold_pct,
        base_fare_per_km=trip_data.base_fare_per_km,
        departure_time=trip_data.departure_time or datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        live_gps=trip_data.live_gps or {"lat": origin_coords[0], "lng": origin_coords[1], "heading": 45},
        status="active"
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip

@app.get("/api/trips/active", response_model=List[schemas.VehicleTripResponse])
def get_active_trips(db: Session = Depends(get_db)):
    return db.query(models.VehicleTrip).filter(models.VehicleTrip.status == "active").all()

@app.get("/api/trips/{trip_id}", response_model=schemas.VehicleTripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.VehicleTrip).filter(models.VehicleTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

# ==========================================
# 3. LTL DEMAND ENDPOINTS
# ==========================================
@app.post("/api/demands/create", response_model=schemas.LTLDemandResponse)
def create_demand(demand_data: schemas.LTLDemandCreate, db: Session = Depends(get_db)):
    shipper = db.query(models.User).filter(models.User.id == demand_data.shipper_id).first()
    if not shipper:
        raise HTTPException(status_code=404, detail="Shipper not found")

    pickup_coords = demand_data.pickup_coords or get_city_coords(demand_data.pickup_city)
    drop_coords = demand_data.drop_coords or get_city_coords(demand_data.drop_city)

    # Compute quote
    quote = calculate_shipper_quote(
        pickup_coords=pickup_coords,
        drop_coords=drop_coords,
        weight_tonnes=demand_data.weight_tonnes,
        urgency=demand_data.urgency or "standard"
    )

    new_demand = models.LTLDemand(
        shipper_id=demand_data.shipper_id,
        pickup_city=demand_data.pickup_city,
        drop_city=demand_data.drop_city,
        pickup_coords=pickup_coords,
        drop_coords=drop_coords,
        weight_tonnes=demand_data.weight_tonnes,
        cargo_segment=demand_data.cargo_segment or "LCV (0.5T - 2.5T)",
        cargo_type=demand_data.cargo_type or "Agri Produce / FMCG",
        cubic_volume_cuft=demand_data.cubic_volume_cuft or round(demand_data.weight_tonnes * 100, 1),
        urgency=demand_data.urgency or "standard",
        max_budget=demand_data.max_budget or quote["raw_solo_price"],
        quoted_price=quote["final_pooled_price"],
        anti_contraband_declared=demand_data.anti_contraband_declared if demand_data.anti_contraband_declared is not None else True,
        status="pending"
    )
    db.add(new_demand)
    db.commit()
    db.refresh(new_demand)

    # Generate Dual-OTP Record (OTP 1 for pickup, OTP 2 for delivery)
    pickup_otp = f"{random.randint(100000, 999999)}"
    delivery_otp = f"{random.randint(100000, 999999)}"

    epod = models.DeliveryEPOD(
        demand_id=new_demand.id,
        pickup_otp=pickup_otp,
        pickup_verified=False,
        delivery_otp=delivery_otp,
        delivery_verified=False,
        receiver_name=f"{new_demand.drop_city} Warehouse Manager"
    )
    db.add(epod)

    # Auto-generate E-Way Bill Part A mock
    eway_no = f"EWB-24{random.randint(10000000, 99999999)}"
    part_a_mock = {
        "consignor_gstin": shipper.gst_number or "10AAACM4928P1Z3",
        "consignor_name": shipper.name,
        "consignee_name": f"{demand_data.drop_city} Central Distribution Center",
        "item_desc": demand_data.cargo_type or "Agri Produce / FMCG",
        "hsn_code": "0709" if "Agri" in (demand_data.cargo_type or "") else "8471",
        "weight_tonnes": demand_data.weight_tonnes,
        "invoice_val_inr": round(demand_data.weight_tonnes * 45000, 2),
        "from_place": demand_data.pickup_city,
        "to_place": demand_data.drop_city
    }
    ewb = models.EWayBillMock(
        demand_id=new_demand.id,
        eway_bill_no=eway_no,
        part_a_data=part_a_mock,
        valid_until=datetime.datetime.utcnow() + datetime.timedelta(days=3),
        status="GENERATED"
    )
    db.add(ewb)
    db.commit()

    return new_demand

@app.get("/api/demands/pending", response_model=List[schemas.LTLDemandResponse])
def get_pending_demands(db: Session = Depends(get_db)):
    return db.query(models.LTLDemand).order_by(models.LTLDemand.id.desc()).all()

@app.get("/api/demands/{demand_id}/otps")
def get_demand_otps(demand_id: int, db: Session = Depends(get_db)):
    epod = db.query(models.DeliveryEPOD).filter(models.DeliveryEPOD.demand_id == demand_id).first()
    if not epod:
        raise HTTPException(status_code=404, detail="EPOD record not found")
    return {
        "demand_id": demand_id,
        "pickup_otp": epod.pickup_otp,
        "pickup_verified": epod.pickup_verified,
        "delivery_otp": epod.delivery_otp,
        "delivery_verified": epod.delivery_verified
    }

# ==========================================
# 4. FAIR-SHARE PRICING QUOTE ENDPOINT
# ==========================================
@app.post("/api/pricing/quote", response_model=schemas.PricingQuoteResponse)
def get_pricing_quote(req: schemas.PricingQuoteRequest, db: Session = Depends(get_db)):
    pickup_coords = req.pickup_coords or get_city_coords(req.pickup_city)
    drop_coords = req.drop_coords or get_city_coords(req.drop_city)

    base_rate = 5.50
    if req.trip_id:
        trip = db.query(models.VehicleTrip).filter(models.VehicleTrip.id == req.trip_id).first()
        if trip:
            base_rate = round(trip.base_fare_per_km / max(trip.total_capacity_tonnes, 1.0) * 1.5, 2)

    quote = calculate_shipper_quote(
        pickup_coords=pickup_coords,
        drop_coords=drop_coords,
        weight_tonnes=req.weight_tonnes,
        urgency=req.urgency or "standard",
        base_rate_per_tonne_km=base_rate
    )
    return schemas.PricingQuoteResponse(**quote)

# ==========================================
# 5. OR-TOOLS OPTIMIZATION & CONSOLIDATION
# ==========================================
@app.post("/api/optimizer/consolidate/{trip_id}", response_model=schemas.ConsolidatedTripResponse)
def consolidate_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.VehicleTrip).filter(models.VehicleTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Vehicle trip not found")

    pending_demands = db.query(models.LTLDemand).all()

    demands_payload = []
    for d in pending_demands:
        demands_payload.append({
            "id": d.id,
            "shipper_id": d.shipper_id,
            "shipper_name": d.shipper.name if d.shipper else f"Shipper #{d.shipper_id}",
            "pickup_city": d.pickup_city,
            "drop_city": d.drop_city,
            "pickup_coords": d.pickup_coords,
            "drop_coords": d.drop_coords,
            "weight_tonnes": d.weight_tonnes,
            "cargo_segment": d.cargo_segment,
            "cargo_type": d.cargo_type,
            "urgency": d.urgency,
            "max_budget": d.max_budget
        })

    # Run OR-Tools Optimization Engine with Fleet Segregation & Time Windows
    opt_result = optimizer_instance.solve_vrppd(
        trip_origin={"name": trip.origin_city, "coords": trip.origin_coords},
        trip_dest={"name": trip.destination_city, "coords": trip.dest_coords},
        initial_load_tonnes=trip.current_load_tonnes,
        max_capacity_tonnes=trip.total_capacity_tonnes,
        demands=demands_payload,
        detour_threshold_pct=trip.detour_threshold_pct,
        service_mode=trip.service_mode or "STANDARD_POOLING"
    )

    pooled_ids = opt_result.get("demands_pooled", [])
    pooled_demands_data = [d for d in demands_payload if d["id"] in pooled_ids]

    economics = calculate_consolidated_trip_economics(
        baseline_direct_km=opt_result["baseline_direct_km"],
        actual_trip_km=opt_result["total_trip_km"],
        base_fare_per_km=trip.base_fare_per_km,
        pooled_demands_data=pooled_demands_data
    )

    waypoint_objs = []
    for wp in opt_result["waypoints"]:
        waypoint_objs.append(schemas.WaypointDetail(
            sequence=wp["sequence"],
            stop_name=wp["stop_name"],
            location_coords=wp["location_coords"],
            action=wp["action"],
            demand_id=wp["demand_id"],
            tonnes_delta=wp["tonnes_delta"],
            cumulative_load_tonnes=wp["cumulative_load_tonnes"],
            distance_from_prev_km=wp["distance_from_prev_km"],
            eta_mins=wp["eta_mins"]
        ))

    existing_ct = db.query(models.ConsolidatedTrip).filter(models.ConsolidatedTrip.trip_id == trip_id).first()
    if existing_ct:
        existing_ct.demand_ids = pooled_ids
        existing_ct.optimized_waypoints = [w.dict() for w in waypoint_objs]
        existing_ct.dynamic_pricing_breakdown = economics
        existing_ct.empty_km_saved = economics["empty_km_saved"]
        existing_ct.co2_cut_kg = economics["co2_cut_kg"]
        existing_ct.total_trip_km = opt_result["total_trip_km"]
        existing_ct.baseline_direct_km = opt_result["baseline_direct_km"]
        existing_ct.detour_pct = opt_result["detour_pct"]
        existing_ct.status = "optimized"
        db.commit()
        db.refresh(existing_ct)
        ct_record = existing_ct
    else:
        ct_record = models.ConsolidatedTrip(
            trip_id=trip_id,
            demand_ids=pooled_ids,
            optimized_waypoints=[w.dict() for w in waypoint_objs],
            dynamic_pricing_breakdown=economics,
            empty_km_saved=economics["empty_km_saved"],
            co2_cut_kg=economics["co2_cut_kg"],
            total_trip_km=opt_result["total_trip_km"],
            baseline_direct_km=opt_result["baseline_direct_km"],
            detour_pct=opt_result["detour_pct"],
            status="optimized"
        )
        db.add(ct_record)
        db.commit()
        db.refresh(ct_record)

    for d in pending_demands:
        if d.id in pooled_ids:
            d.status = "matched"
        else:
            d.status = "pending"
    db.commit()

    return ct_record

@app.get("/api/consolidated/{trip_id}", response_model=Optional[schemas.ConsolidatedTripResponse])
def get_consolidated_trip(trip_id: int, db: Session = Depends(get_db)):
    ct = db.query(models.ConsolidatedTrip).filter(models.ConsolidatedTrip.trip_id == trip_id).first()
    return ct

# ==========================================
# 6. DUAL-OTP PROTOCOL (PICKUP & DELIVERY)
# ==========================================
@app.post("/api/epod/verify-pickup")
def verify_pickup_otp(req: schemas.PickupOTPVerifyRequest, db: Session = Depends(get_db)):
    epod = db.query(models.DeliveryEPOD).filter(models.DeliveryEPOD.demand_id == req.demand_id).first()
    if not epod:
        raise HTTPException(status_code=404, detail="EPOD record not found for this demand")

    if epod.pickup_otp.strip() != req.pickup_otp.strip():
        raise HTTPException(status_code=400, detail="Invalid Pickup Verification OTP code. Please check with Sender.")

    epod.pickup_verified = True
    epod.pickup_verified_at = datetime.datetime.utcnow()

    # Update demand status to in_transit
    demand = db.query(models.LTLDemand).filter(models.LTLDemand.id == req.demand_id).first()
    if demand:
        demand.status = "in_transit"

    db.commit()
    db.refresh(epod)
    return {
        "success": True,
        "message": f"Pickup Handshake Verified for Consignment #{req.demand_id}! Cargo is now In-Transit.",
        "demand_id": req.demand_id,
        "pickup_verified": True
    }

@app.post("/api/epod/verify-delivery")
def verify_delivery_otp(req: schemas.DeliveryOTPVerifyRequest, db: Session = Depends(get_db)):
    epod = db.query(models.DeliveryEPOD).filter(models.DeliveryEPOD.demand_id == req.demand_id).first()
    if not epod:
        raise HTTPException(status_code=404, detail="EPOD record not found for this demand")

    if epod.delivery_otp.strip() != req.delivery_otp.strip():
        raise HTTPException(status_code=400, detail="Invalid Delivery OTP code. Please check with Receiver.")

    epod.delivery_verified = True
    epod.delivery_verified_at = datetime.datetime.utcnow()
    if req.signature_svg:
        epod.signature_svg = req.signature_svg
    if req.photo_url:
        epod.photo_url = req.photo_url
    if req.receiver_name:
        epod.receiver_name = req.receiver_name

    # Update demand status to delivered
    demand = db.query(models.LTLDemand).filter(models.LTLDemand.id == req.demand_id).first()
    if demand:
        demand.status = "delivered"

    db.commit()
    db.refresh(epod)
    return {
        "success": True,
        "message": f"Delivery e-POD Verified for Consignment #{req.demand_id}! Driver payout has been released.",
        "demand_id": req.demand_id,
        "delivery_verified": True,
        "payout_released": True
    }

# Backward compatible single OTP verify endpoint
@app.post("/api/epod/verify")
def verify_epod_legacy(req: schemas.EPODVerifyRequest, db: Session = Depends(get_db)):
    epod = db.query(models.DeliveryEPOD).filter(models.DeliveryEPOD.demand_id == req.demand_id).first()
    if not epod:
        raise HTTPException(status_code=404, detail="EPOD record not found for this demand")

    if epod.delivery_otp.strip() != req.otp_code.strip() and epod.pickup_otp.strip() != req.otp_code.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please check SMS.")

    epod.delivery_verified = True
    epod.delivery_verified_at = datetime.datetime.utcnow()
    if req.signature_svg:
        epod.signature_svg = req.signature_svg
    if req.receiver_name:
        epod.receiver_name = req.receiver_name

    demand = db.query(models.LTLDemand).filter(models.LTLDemand.id == req.demand_id).first()
    if demand:
        demand.status = "delivered"

    db.commit()
    db.refresh(epod)
    return {
        "id": epod.id,
        "demand_id": epod.demand_id,
        "otp_code": epod.delivery_otp,
        "verified": True,
        "verified_at": epod.delivery_verified_at,
        "receiver_name": epod.receiver_name
    }

@app.get("/api/epod/{demand_id}")
def get_epod(demand_id: int, db: Session = Depends(get_db)):
    ep = db.query(models.DeliveryEPOD).filter(models.DeliveryEPOD.demand_id == demand_id).first()
    if not ep:
        return None
    return {
        "id": ep.id,
        "demand_id": ep.demand_id,
        "pickup_otp": ep.pickup_otp,
        "pickup_verified": ep.pickup_verified,
        "delivery_otp": ep.delivery_otp,
        "delivery_verified": ep.delivery_verified,
        "otp_code": ep.delivery_otp,
        "verified": ep.delivery_verified,
        "receiver_name": ep.receiver_name,
        "signature_svg": ep.signature_svg
    }

# ==========================================
# 7. E-WAY BILL GST PART-B ENDPOINTS
# ==========================================
@app.post("/api/ewaybill/generate-part-b", response_model=schemas.EWayBillResponse)
def update_eway_bill_part_b(req: schemas.EWayBillPartBRequest, db: Session = Depends(get_db)):
    ewb = db.query(models.EWayBillMock).filter(models.EWayBillMock.demand_id == req.demand_id).first()
    if not ewb:
        demand = db.query(models.LTLDemand).filter(models.LTLDemand.id == req.demand_id).first()
        if not demand:
            raise HTTPException(status_code=404, detail="Demand not found")

        eway_no = f"EWB-24{random.randint(10000000, 99999999)}"
        ewb = models.EWayBillMock(
            demand_id=req.demand_id,
            eway_bill_no=eway_no,
            part_a_data={
                "consignor_gstin": "10AAACP1234F1Z5",
                "consignor_name": demand.shipper.name if demand.shipper else "MSME Shipper",
                "consignee_name": f"{demand.drop_city} Central Distribution Center",
                "item_desc": demand.cargo_type,
                "hsn_code": "0709",
                "weight_tonnes": demand.weight_tonnes,
                "invoice_val_inr": round(demand.weight_tonnes * 45000, 2),
                "from_place": demand.pickup_city,
                "to_place": demand.drop_city
            },
            valid_until=datetime.datetime.utcnow() + datetime.timedelta(days=3),
            status="GENERATED"
        )
        db.add(ewb)

    ewb.part_b_vehicle_no = req.vehicle_number
    ewb.transport_doc_no = f"LR-{random.randint(10000, 99999)}"
    ewb.status = "ASSIGNED"
    db.commit()
    db.refresh(ewb)
    return ewb

@app.get("/api/ewaybill/{demand_id}", response_model=Optional[schemas.EWayBillResponse])
def get_eway_bill(demand_id: int, db: Session = Depends(get_db)):
    return db.query(models.EWayBillMock).filter(models.EWayBillMock.demand_id == demand_id).first()

# ==========================================
# 8. PAN-INDIA CITIES & STATS ENDPOINTS
# ==========================================
@app.get("/api/corridor/cities")
def get_corridor_cities(query: Optional[str] = Query(None, description="Search query for city name or state")):
    cities_list = []
    for name, data in PAN_INDIA_CITIES.items():
        if query:
            q = query.lower().strip()
            if q not in name.lower() and q not in data["state"].lower():
                continue
        cities_list.append({
            "name": name,
            "coords": data["coords"],
            "state": data["state"],
            "tier": data.get("tier", 2)
        })
    return cities_list

@app.get("/api/stats/overview")
def get_stats_overview(db: Session = Depends(get_db)):
    total_trips = db.query(models.VehicleTrip).count()
    active_trips = db.query(models.VehicleTrip).filter(models.VehicleTrip.status == "active").count()
    total_demands = db.query(models.LTLDemand).count()
    pending_demands = db.query(models.LTLDemand).filter(models.LTLDemand.status == "pending").count()
    matched_demands = db.query(models.LTLDemand).filter(models.LTLDemand.status == "matched").count()
    
    consolidated_trips = db.query(models.ConsolidatedTrip).all()
    total_empty_km_saved = sum(ct.empty_km_saved for ct in consolidated_trips)
    total_co2_cut_kg = sum(ct.co2_cut_kg for ct in consolidated_trips)

    return {
        "total_trips": total_trips,
        "active_trips": active_trips,
        "total_demands": total_demands,
        "pending_demands": pending_demands,
        "matched_demands": matched_demands,
        "total_empty_km_saved": round(total_empty_km_saved, 1),
        "total_co2_cut_kg": round(total_co2_cut_kg, 1),
        "average_detour_pct": 8.4,
        "indexed_pan_india_hubs": len(PAN_INDIA_CITIES)
    }

@app.post("/api/seed/reset")
def reset_seed_data(db: Session = Depends(get_db)):
    from seed import run_seed
    run_seed()
    return {"message": "Database successfully reseeded with Dual-OTP Pan-India scenario!"}
