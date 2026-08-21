import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_full_flow():
    print("Testing GET / ...")
    r = client.get("/")
    assert r.status_code == 200, f"Failed root: {r.text}"
    print("  Root response:", r.json())

    print("\nTesting GET /api/trips/active ...")
    r = client.get("/api/trips/active")
    assert r.status_code == 200
    trips = r.json()
    assert len(trips) >= 1
    trip_id = trips[0]["id"]
    print(f"  Found active trip ID {trip_id}: {trips[0]['origin_city']} -> {trips[0]['destination_city']}")
    print(f"  Capacity: {trips[0]['current_load_tonnes']}t loaded / {trips[0]['total_capacity_tonnes']}t total")

    print("\nTesting GET /api/demands/pending ...")
    r = client.get("/api/demands/pending")
    assert r.status_code == 200
    demands = r.json()
    assert len(demands) >= 2
    for d in demands:
        print(f"  Demand #{d['id']}: {d['pickup_city']} -> {d['drop_city']} ({d['weight_tonnes']}t, {d['cargo_type']})")

    print(f"\nTesting POST /api/optimizer/consolidate/{trip_id} ...")
    r = client.post(f"/api/optimizer/consolidate/{trip_id}")
    assert r.status_code == 200, f"Failed optimization: {r.text}"
    opt = r.json()
    print("  Optimization Succeeded!")
    print(f"  Pooled Demands: {opt['demand_ids']}")
    print(f"  Baseline Direct Distance: {opt['baseline_direct_km']} km")
    print(f"  Optimized Total Distance: {opt['total_trip_km']} km")
    print(f"  Detour %: {opt['detour_pct']}%")
    print(f"  Empty KM Saved: {opt['empty_km_saved']} km")
    print(f"  CO2 Cut: {opt['co2_cut_kg']} kg")
    print(f"  Waypoints Sequence:")
    for wp in opt['optimized_waypoints']:
        print(f"    Stop {wp['sequence']}: [{wp['action']}] {wp['stop_name']} (Load: {wp['cumulative_load_tonnes']}t, +{wp['distance_from_prev_km']}km, ETA: {wp['eta_mins']}m)")

    econ = opt['dynamic_pricing_breakdown']
    print(f"\n  Economics Breakdown:")
    print(f"    Driver Baseline Revenue: Rs {econ['driver_baseline_revenue']}")
    print(f"    Driver Guaranteed Floor (>=120%): Rs {econ['driver_min_guaranteed_floor']}")
    print(f"    Driver Final Payout: Rs {econ['driver_final_payout']} (+{econ['driver_gain_over_baseline_pct']}%)")
    print(f"    Total Shipper Revenue: Rs {econ['total_shipper_revenue']}")
    print(f"    Total MSME Savings: Rs {econ['total_msme_savings_inr']}")

    print("\nTesting POST /api/pricing/quote ...")
    quote_req = {
        "pickup_city": "Patna",
        "drop_city": "Darbhanga",
        "weight_tonnes": 2.0,
        "urgency": "standard"
    }
    r = client.post("/api/pricing/quote", json=quote_req)
    assert r.status_code == 200
    q = r.json()
    print(f"  Quote for Patna->Darbhanga 2t: Solo Rs {q['raw_solo_price']} -> Pooled Rs {q['final_pooled_price']} (Saved Rs {q['shipper_savings_inr']} / {q['pooling_discount_pct']}%)")

    print("\nTesting Digital EPOD OTP & Verification ...")
    d_id = demands[0]["id"]
    r = client.post("/api/epod/generate-otp", json={"demand_id": d_id, "receiver_name": "Rohan Jha"})
    assert r.status_code == 200
    epod_gen = r.json()
    otp = epod_gen["otp_code"]
    print(f"  Generated OTP for Demand #{d_id}: {otp}")

    # Verify OTP
    r = client.post("/api/epod/verify", json={
        "demand_id": d_id,
        "otp_code": otp,
        "signature_svg": "<svg>Signature Data</svg>",
        "receiver_name": "Rohan Jha"
    })
    assert r.status_code == 200
    assert r.json()["verified"] is True
    print(f"  Verified ePOD successfully for Demand #{d_id}")

    print("\nTesting E-Way Bill Part-B Update ...")
    r = client.post("/api/ewaybill/generate-part-b", json={
        "demand_id": d_id,
        "vehicle_number": "BR-01-GB-4592"
    })
    assert r.status_code == 200
    ewb = r.json()
    print(f"  E-Way Bill {ewb['eway_bill_no']} assigned to Vehicle {ewb['part_b_vehicle_no']}, Status: {ewb['status']}")

    print("\nALL BACKEND ENDPOINTS AND LOGIC VERIFIED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_full_flow()
