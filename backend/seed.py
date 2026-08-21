import datetime
from database import SessionLocal, engine, Base
import models

def run_seed():
    db = SessionLocal()
    try:
        print("[Seed] Initializing LastMileSaathi Pan-India Database Tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        print("[Seed] Creating Pan-India Users (MSME Shippers & Fleet Operators)...")
        # 1. Shippers (MSMEs across India)
        shippers = [
            models.User(
                name="Bharat Heavy Engineering & Auto Components",
                phone="+91-9835012345",
                role="shipper",
                gst_number="07AAACB1942P1Z1",
                rating=4.9,
                verified_identity=True
            ),
            models.User(
                name="Sabarmati Cotton & Denim Textiles Co.",
                phone="+91-9431098765",
                role="shipper",
                gst_number="24AABCS8819Q1Z3",
                rating=4.8,
                verified_identity=True
            ),
            models.User(
                name="Silicon Plateau Electronics & Cloud Servers",
                phone="+91-9812345678",
                role="shipper",
                gst_number="29AAACD4421M1Z8",
                rating=4.95,
                verified_identity=True
            ),
            models.User(
                name="Howrah Industrial Spares & FMCG Hub",
                phone="+91-9822019944",
                role="shipper",
                gst_number="19AAACH5512L1Z5",
                rating=4.75,
                verified_identity=True
            ),
            models.User(
                name="Deccan Auto Assemblies & Precision Works",
                phone="+91-9844012299",
                role="shipper",
                gst_number="27AAACD8892P1Z2",
                rating=4.88,
                verified_identity=True
            )
        ]

        # 2. Transporters & Drivers
        drivers = [
            models.User(
                name="Ramesh Kumar",
                phone="+91-9123456780",
                role="driver",
                driving_license_no="DL-042018009412",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                rating=4.9,
                verified_identity=True
            ),
            models.User(
                name="Santosh Yadav",
                phone="+91-9876543210",
                role="driver",
                driving_license_no="MH-122019004819",
                avatar_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
                rating=4.8,
                verified_identity=True
            ),
            models.User(
                name="Vikramjit Singh",
                phone="+91-9814018899",
                role="driver",
                driving_license_no="WB-022016001289",
                avatar_url="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
                rating=4.95,
                verified_identity=True
            ),
            models.User(
                name="Suresh Patil",
                phone="+91-9823091122",
                role="driver",
                driving_license_no="KA-012017007731",
                avatar_url="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
                rating=4.85,
                verified_identity=True
            ),
            models.User(
                name="Amitabh Verma (National Dispatch Controller)",
                phone="+91-9988776655",
                role="dispatcher",
                rating=5.0,
                verified_identity=True
            )
        ]

        db.add_all(shippers)
        db.add_all(drivers)
        db.commit()

        print("[Seed] Creating Major National Industrial & Metropolitan Corridors...")
        # 3. Scheduled / Active Vehicle Trips on Golden Quadrilateral & National Expressways
        trips = [
            # Primary Default Demo Trip: Delhi NCR ➔ Mumbai (via Jaipur & Ahmedabad on NH-48)
            models.VehicleTrip(
                driver_id=drivers[0].id,
                vehicle_number="DL-01-GB-4592",
                vehicle_model="Tata Prima 10-Tonne MCV",
                vehicle_segment="MCV (2.5T - 7.5T)",
                service_mode="STANDARD_POOLING",
                rc_status="ACTIVE & VERIFIED",
                origin_city="Delhi NCR",
                destination_city="Mumbai",
                origin_coords=[28.7041, 77.1025],
                dest_coords=[19.0760, 72.8777],
                total_capacity_tonnes=10.0,
                current_load_tonnes=6.0,
                available_capacity_tonnes=4.0,
                detour_threshold_pct=15.0,
                base_fare_per_km=35.0,
                departure_time=datetime.datetime.utcnow() + datetime.timedelta(hours=1),
                sla_hours=36.0,
                live_gps={"lat": 26.9124, "lng": 75.7873, "heading": 210},  # Near Jaipur on NH-48
                status="active"
            ),
            # Trip 2: Mumbai ➔ Bengaluru (via Pune on NH-48)
            models.VehicleTrip(
                driver_id=drivers[1].id,
                vehicle_number="MH-12-PA-8812",
                vehicle_model="Bolero Maxi Truck Plus (Express Direct)",
                vehicle_segment="LCV (0.5T - 2.5T)",
                service_mode="EXPRESS_DIRECT",
                rc_status="ACTIVE & VERIFIED",
                origin_city="Mumbai",
                destination_city="Bengaluru",
                origin_coords=[19.0760, 72.8777],
                dest_coords=[12.9716, 77.5946],
                total_capacity_tonnes=2.5,
                current_load_tonnes=1.2,
                available_capacity_tonnes=1.3,
                detour_threshold_pct=5.0,
                base_fare_per_km=24.0,
                departure_time=datetime.datetime.utcnow() + datetime.timedelta(hours=2),
                sla_hours=18.0,
                live_gps={"lat": 18.5204, "lng": 73.8567, "heading": 150},  # Near Pune
                status="active"
            ),
            # Trip 3: Kolkata ➔ Delhi NCR (via Varanasi, Kanpur, Lucknow on NH-19)
            models.VehicleTrip(
                driver_id=drivers[2].id,
                vehicle_number="WB-02-AA-3301",
                vehicle_model="Eicher Pro 6-Wheeler (19ft)",
                vehicle_segment="HCV (7.5T - 16T)",
                service_mode="STANDARD_POOLING",
                rc_status="ACTIVE & VERIFIED",
                origin_city="Kolkata",
                destination_city="Delhi NCR",
                origin_coords=[22.5726, 88.3639],
                dest_coords=[28.7041, 77.1025],
                total_capacity_tonnes=16.0,
                current_load_tonnes=9.6,
                available_capacity_tonnes=6.4,
                detour_threshold_pct=10.0,
                base_fare_per_km=48.0,
                departure_time=datetime.datetime.utcnow() + datetime.timedelta(hours=4),
                sla_hours=48.0,
                live_gps={"lat": 25.3176, "lng": 82.9739, "heading": 300},  # Near Varanasi
                status="active"
            ),
            # Trip 4: Bengaluru ➔ Chennai (via Hosur on National Highway)
            models.VehicleTrip(
                driver_id=drivers[3].id,
                vehicle_number="KA-01-RN-8821",
                vehicle_model="Ashok Leyland 40ft Trailer (Express Direct)",
                vehicle_segment="Multi-Axle Trailer (16T+)",
                service_mode="EXPRESS_DIRECT",
                rc_status="ACTIVE & VERIFIED",
                origin_city="Bengaluru",
                destination_city="Chennai",
                origin_coords=[12.9716, 77.5946],
                dest_coords=[13.0827, 80.2707],
                total_capacity_tonnes=40.0,
                current_load_tonnes=26.0,
                available_capacity_tonnes=14.0,
                detour_threshold_pct=5.0,
                base_fare_per_km=65.0,
                departure_time=datetime.datetime.utcnow() + datetime.timedelta(hours=3),
                sla_hours=7.0,
                live_gps={"lat": 12.7300, "lng": 77.8300, "heading": 85},  # Near Hosur
                status="active"
            )
        ]
        db.add_all(trips)
        db.commit()

        print("[Seed] Creating High-Volume Pan-India LTL Demands...")
        # 4. Pending / Matched LTL Demands on National Corridors
        demands = [
            # Demand X: Delhi NCR ➔ Ahmedabad (2.0 Tonnes - Machine Components)
            models.LTLDemand(
                shipper_id=shippers[0].id,
                pickup_city="Delhi NCR",
                drop_city="Ahmedabad",
                pickup_coords=[28.7041, 77.1025],
                drop_coords=[23.0225, 72.5714],
                weight_tonnes=2.0,
                cargo_segment="MCV (2.5T - 7.5T)",
                cargo_type="Precision Machine Components & Auto Spares",
                cubic_volume_cuft=220.0,
                urgency="standard",
                max_budget=14500.0,
                quoted_price=10800.0,
                anti_contraband_declared=True,
                status="matched"
            ),
            # Demand Y: Ahmedabad ➔ Mumbai (1.5 Tonnes - Textiles)
            models.LTLDemand(
                shipper_id=shippers[1].id,
                pickup_city="Ahmedabad",
                drop_city="Mumbai",
                pickup_coords=[23.0225, 72.5714],
                drop_coords=[19.0760, 72.8777],
                weight_tonnes=1.5,
                cargo_segment="LCV (0.5T - 2.5T)",
                cargo_type="Premium Denim & Organic Cotton Textiles",
                cubic_volume_cuft=180.0,
                urgency="standard",
                max_budget=8500.0,
                quoted_price=6200.0,
                anti_contraband_declared=True,
                status="matched"
            ),
            # Demand 3: Bengaluru ➔ Hyderabad (3.0 Tonnes - Electronic Components)
            models.LTLDemand(
                shipper_id=shippers[2].id,
                pickup_city="Bengaluru",
                drop_city="Hyderabad",
                pickup_coords=[12.9716, 77.5946],
                drop_coords=[17.3850, 78.4867],
                weight_tonnes=3.0,
                cargo_segment="MCV (2.5T - 7.5T)",
                cargo_type="Electronic Components & High-Density Servers",
                cubic_volume_cuft=280.0,
                urgency="standard",
                max_budget=16000.0,
                quoted_price=11900.0,
                anti_contraband_declared=True,
                status="pending"
            ),
            # Demand 4: Kolkata ➔ Varanasi (2.5 Tonnes - Industrial Jute & FMCG)
            models.LTLDemand(
                shipper_id=shippers[3].id,
                pickup_city="Kolkata",
                drop_city="Varanasi",
                pickup_coords=[22.5726, 88.3639],
                drop_coords=[25.3176, 82.9739],
                weight_tonnes=2.5,
                cargo_segment="MCV (2.5T - 7.5T)",
                cargo_type="Industrial Jute Goods & FMCG Packets",
                cubic_volume_cuft=250.0,
                urgency="standard",
                max_budget=12500.0,
                quoted_price=9100.0,
                anti_contraband_declared=True,
                status="pending"
            ),
            # Demand 5: Mumbai ➔ Pune (1.2 Tonnes - Automotive Assemblies, Express)
            models.LTLDemand(
                shipper_id=shippers[4].id,
                pickup_city="Mumbai",
                drop_city="Pune",
                pickup_coords=[19.0760, 72.8777],
                drop_coords=[18.5204, 73.8567],
                weight_tonnes=1.2,
                cargo_segment="LCV (0.5T - 2.5T)",
                cargo_type="Automotive Transmission Assemblies",
                cubic_volume_cuft=110.0,
                urgency="express",
                max_budget=5500.0,
                quoted_price=4200.0,
                anti_contraband_declared=True,
                status="pending"
            ),
            # Demand 6: Bengaluru ➔ Chennai (2.0 Tonnes - Aerospace Parts, Express)
            models.LTLDemand(
                shipper_id=shippers[2].id,
                pickup_city="Bengaluru",
                drop_city="Chennai",
                pickup_coords=[12.9716, 77.5946],
                drop_coords=[13.0827, 80.2707],
                weight_tonnes=2.0,
                cargo_segment="LCV (0.5T - 2.5T)",
                cargo_type="Precision Aerospace & Defense Tooling",
                cubic_volume_cuft=150.0,
                urgency="express",
                max_budget=8000.0,
                quoted_price=6400.0,
                anti_contraband_declared=True,
                status="pending"
            )
        ]
        db.add_all(demands)
        db.commit()

        print("[Seed] Generating Dual-OTP Records & GST E-Way Bills...")
        # 5. Dual-OTP Records
        epods = [
            models.DeliveryEPOD(
                demand_id=demands[0].id,
                pickup_otp="419820",
                pickup_verified=True,
                pickup_verified_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=45),
                delivery_otp="784920",
                delivery_verified=False,
                receiver_name="Ahmedabad Auto Logistics Park In-Charge"
            ),
            models.DeliveryEPOD(
                demand_id=demands[1].id,
                pickup_otp="338102",
                pickup_verified=False,
                delivery_otp="992144",
                delivery_verified=False,
                receiver_name="Bhiwandi Textile Depot Manager (Mumbai)"
            ),
            models.DeliveryEPOD(
                demand_id=demands[2].id,
                pickup_otp="552910",
                pickup_verified=False,
                delivery_otp="114829",
                delivery_verified=False,
                receiver_name="Hyderabad Hardware Terminal"
            ),
            models.DeliveryEPOD(
                demand_id=demands[3].id,
                pickup_otp="641829",
                pickup_verified=False,
                delivery_otp="284019",
                delivery_verified=False,
                receiver_name="Varanasi Regional Trade Depot"
            ),
            models.DeliveryEPOD(
                demand_id=demands[4].id,
                pickup_otp="771029",
                pickup_verified=False,
                delivery_otp="391048",
                delivery_verified=False,
                receiver_name="Pune Auto Cluster Manager"
            ),
            models.DeliveryEPOD(
                demand_id=demands[5].id,
                pickup_otp="810293",
                pickup_verified=False,
                delivery_otp="492018",
                delivery_verified=False,
                receiver_name="Chennai Aerospace Logistics Hub"
            )
        ]
        db.add_all(epods)

        # 6. E-Way Bills
        ewbs = [
            models.EWayBillMock(
                demand_id=demands[0].id,
                eway_bill_no="EWB-248910294812",
                part_a_data={
                    "consignor_gstin": shippers[0].gst_number,
                    "consignor_name": shippers[0].name,
                    "consignee_name": "Ahmedabad Precision Spares Ltd",
                    "item_desc": demands[0].cargo_type,
                    "hsn_code": "8483",
                    "weight_tonnes": demands[0].weight_tonnes,
                    "invoice_val_inr": 450000.0,
                    "from_place": demands[0].pickup_city,
                    "to_place": demands[0].drop_city
                },
                part_b_vehicle_no="DL-01-GB-4592",
                transport_doc_no="LR-DEL-99214",
                valid_until=datetime.datetime.utcnow() + datetime.timedelta(days=4),
                status="ASSIGNED"
            ),
            models.EWayBillMock(
                demand_id=demands[1].id,
                eway_bill_no="EWB-247712398411",
                part_a_data={
                    "consignor_gstin": shippers[1].gst_number,
                    "consignor_name": shippers[1].name,
                    "consignee_name": "Mumbai Textile Emporium",
                    "item_desc": demands[1].cargo_type,
                    "hsn_code": "5208",
                    "weight_tonnes": demands[1].weight_tonnes,
                    "invoice_val_inr": 280000.0,
                    "from_place": demands[1].pickup_city,
                    "to_place": demands[1].drop_city
                },
                part_b_vehicle_no="DL-01-GB-4592",
                transport_doc_no="LR-AHM-99215",
                valid_until=datetime.datetime.utcnow() + datetime.timedelta(days=4),
                status="ASSIGNED"
            )
        ]
        db.add_all(ewbs)
        db.commit()

        print("[Seed] Successfully seeded Pan-India LastMileSaathi Database with National Corridors!")

    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
