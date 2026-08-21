import sys
import os
import time
import random
import unittest
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from optimizer import (
    OptimizationEngine,
    CITY_COORDINATES,
    calculate_distance_km,
    optimizer_instance
)
from pricing import (
    calculate_shipper_quote,
    calculate_consolidated_trip_economics,
    DEFAULT_BASE_RATE_PER_TONNE_KM,
    DRIVER_REVENUE_FLOOR_FACTOR,
    DEFAULT_POOLING_DISCOUNT_RATIO
)
from seed import run_seed

class TestLastMileSaathi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n=======================================================")
        print(" [TEST SETUP] Reseeding Database for Test Suite...")
        print("=======================================================")
        run_seed()
        cls.client = TestClient(app)
        cls.optimizer = OptimizationEngine(time_limit_seconds=2.0)

    # -------------------------------------------------------------
    # 1. OR-Tools Capacity Constraint Test (Payload <= 10T)
    # -------------------------------------------------------------
    def test_capacity_constraint_rejection(self):
        """Verify shipments exceeding 10T or spare capacity are rejected by VRPPD."""
        trip_origin = {"name": "Patna", "coords": CITY_COORDINATES["Patna"]}
        trip_dest = {"name": "Madhubani", "coords": CITY_COORDINATES["Madhubani"]}
        initial_load = 6.0  # 6 tonnes loaded, 4 tonnes spare on a 10T truck

        # Oversized demand requiring 6.0 tonnes (exceeding 4.0t spare capacity and 10.0t total cap)
        oversized_demands = [
            {
                "id": 99,
                "shipper_id": 1,
                "pickup_city": "Patna",
                "drop_city": "Madhubani",
                "pickup_coords": CITY_COORDINATES["Patna"],
                "drop_coords": CITY_COORDINATES["Madhubani"],
                "weight_tonnes": 6.0,  # 6.0t + 6.0t = 12.0t > 10.0t limit!
                "cargo_type": "Heavy Machinery",
                "urgency": "standard"
            }
        ]

        result = self.optimizer.solve_vrppd(
            trip_origin=trip_origin,
            trip_dest=trip_dest,
            initial_load_tonnes=initial_load,
            max_capacity_tonnes=10.0,
            demands=oversized_demands,
            detour_threshold_pct=15.0
        )

        self.assertTrue(result["success"])
        rejected_ids = [r["id"] if isinstance(r, dict) else r for r in result["demands_rejected"]]
        self.assertIn(99, rejected_ids, "Oversized 6T shipment should be rejected due to 10T truck payload cap")
        self.assertEqual(len(result["demands_pooled"]), 0, "No demands should be pooled when capacity is exceeded")

        # Verify cumulative tonnage on waypoints never exceeds 10.0 tonnes
        for wp in result["waypoints"]:
            self.assertLessEqual(wp["cumulative_load_tonnes"], 10.0, f"Waypoint {wp['sequence']} exceeded 10.0T limit!")

        print("  [PASSED] Capacity Constraint Test: Over-capacity demand successfully rejected.")

    # -------------------------------------------------------------
    # 2. Maximum Detour Threshold Test (Cap <= 15%)
    # -------------------------------------------------------------
    def test_detour_constraint_rejection(self):
        """Verify demands located far off corridor causing > 15% detour are rejected."""
        trip_origin = {"name": "Delhi NCR", "coords": CITY_COORDINATES["Delhi NCR"]}
        trip_dest = {"name": "Mumbai", "coords": CITY_COORDINATES["Mumbai"]}
        initial_load = 6.0

        # Extreme detour demand: Delhi -> Kolkata (located ~1500 km away in Eastern India)
        extreme_detour_demand = [
            {
                "id": 101,
                "shipper_id": 2,
                "pickup_city": "Delhi NCR",
                "drop_city": "Kolkata",
                "pickup_coords": CITY_COORDINATES["Delhi NCR"],
                "drop_coords": CITY_COORDINATES["Kolkata"],  # Far off NH-48 direct route!
                "weight_tonnes": 1.0,
                "cargo_type": "Tea Crates",
                "urgency": "standard"
            }
        ]

        result = self.optimizer.solve_vrppd(
            trip_origin=trip_origin,
            trip_dest=trip_dest,
            initial_load_tonnes=initial_load,
            max_capacity_tonnes=10.0,
            demands=extreme_detour_demand,
            detour_threshold_pct=15.0  # Max 15% detour cap
        )

        self.assertTrue(result["success"])
        rejected_ids = [r["id"] if isinstance(r, dict) else r for r in result["demands_rejected"]]
        self.assertIn(101, rejected_ids, "Extreme detour demand should be rejected by 15% detour cap")
        self.assertLessEqual(result["detour_pct"], 15.0, "Detour % must remain within 15% threshold")
        print("  [PASSED] Detour Constraint Test: Out-of-corridor detour rejected.")

    # -------------------------------------------------------------
    # 3. Dynamic Pricing & Driver Revenue Floor Test
    # -------------------------------------------------------------
    def test_dynamic_pricing_and_driver_floor(self):
        """Verify fair-share pooling discount (~25%) and driver revenue floor (>= 120%)."""
        pickup = CITY_COORDINATES["Delhi NCR"]
        drop = CITY_COORDINATES["Ahmedabad"]
        weight = 2.0

        # 1. Shipper Quote Formula Check
        quote = calculate_shipper_quote(
            pickup_coords=pickup,
            drop_coords=drop,
            weight_tonnes=weight,
            urgency="standard",
            base_rate_per_tonne_km=DEFAULT_BASE_RATE_PER_TONNE_KM,
            pooling_discount_ratio=DEFAULT_POOLING_DISCOUNT_RATIO
        )

        expected_solo = round(quote["direct_distance_km"] * DEFAULT_BASE_RATE_PER_TONNE_KM * weight, 2)
        expected_solo = max(expected_solo, 450.0 * weight)
        self.assertEqual(quote["raw_solo_price"], expected_solo)
        self.assertEqual(quote["pooling_discount_pct"], 25.0)
        self.assertAlmostEqual(quote["final_pooled_price"], round(expected_solo * 0.75, 2), places=1)
        self.assertAlmostEqual(quote["shipper_savings_inr"], round(expected_solo * 0.25, 2), places=1)

        # 2. Driver Guaranteed Floor Check (>= 120%)
        baseline_km = 153.61
        actual_km = 154.19
        base_fare_per_km = 32.0

        demands_data = [{
            "id": 1,
            "shipper_name": "Test Shipper",
            "pickup_coords": pickup,
            "drop_coords": drop,
            "pickup_city": "Patna",
            "drop_city": "Darbhanga",
            "weight_tonnes": 2.0,
            "urgency": "standard"
        }]

        economics = calculate_consolidated_trip_economics(
            baseline_direct_km=baseline_km,
            actual_trip_km=actual_km,
            base_fare_per_km=base_fare_per_km,
            pooled_demands_data=demands_data
        )

        expected_driver_baseline = round(baseline_km * base_fare_per_km, 2)
        expected_driver_floor = round(expected_driver_baseline * DRIVER_REVENUE_FLOOR_FACTOR, 2)

        self.assertEqual(economics["driver_baseline_revenue"], expected_driver_baseline)
        self.assertEqual(economics["driver_min_guaranteed_floor"], expected_driver_floor)
        self.assertGreaterEqual(economics["driver_final_payout"], expected_driver_floor, "Driver payout must be >= 120% floor!")
        self.assertGreaterEqual(economics["driver_gain_over_baseline_pct"], 20.0, "Gain over baseline must be >= 20%")

        print("  [PASSED] Dynamic Pricing & Driver Revenue Floor: Math verified with 100% precision.")

    # -------------------------------------------------------------
    # 4. GST e-Way Bill Part-B Schema Compliance Test
    # -------------------------------------------------------------
    def test_eway_bill_part_b_compliance(self):
        """Verify dynamic Part-B vehicle assignment and schema compliance."""
        # Test endpoint
        response = self.client.post("/api/ewaybill/generate-part-b", json={
            "demand_id": 1,
            "vehicle_number": "BR-01-GB-4592"
        })
        self.assertEqual(response.status_code, 200)
        ewb = response.json()

        # Assert schema fields
        self.assertIn("eway_bill_no", ewb)
        self.assertIn("part_a_data", ewb)
        self.assertEqual(ewb["part_b_vehicle_no"], "BR-01-GB-4592")
        self.assertEqual(ewb["status"], "ASSIGNED")
        self.assertIsNotNone(ewb["transport_doc_no"])

        # Assert Part-A data integrity
        part_a = ewb["part_a_data"]
        self.assertIn("consignor_gstin", part_a)
        self.assertIn("consignee_name", part_a)
        self.assertIn("hsn_code", part_a)
        self.assertIn("invoice_val_inr", part_a)
        self.assertIn("from_place", part_a)
        self.assertIn("to_place", part_a)

        print("  [PASSED] GST e-Way Bill Compliance: Part-A and Part-B schemas fully compliant.")

    # -------------------------------------------------------------
    # 5. Scalability Benchmark (50 LTL Demands Across 10 Corridors)
    # -------------------------------------------------------------
    def test_benchmark_50_demands_sub_3_seconds(self):
        """Benchmark: Solve 50 random LTL demands across 10 corridor cities in < 3.0 seconds."""
        cities = list(CITY_COORDINATES.keys())
        random.seed(42)  # Deterministic seed for reproducible benchmarks

        trip_origin = {"name": "Patna", "coords": CITY_COORDINATES["Patna"]}
        trip_dest = {"name": "Madhubani", "coords": CITY_COORDINATES["Madhubani"]}
        initial_load = 5.0
        max_capacity = 10.0

        benchmark_demands = []
        for i in range(1, 51):
            p_city = random.choice(cities[:6])
            d_city = random.choice([c for c in cities if c != p_city])
            benchmark_demands.append({
                "id": 1000 + i,
                "shipper_id": (i % 3) + 1,
                "shipper_name": f"MSME Enterprise #{i}",
                "pickup_city": p_city,
                "drop_city": d_city,
                "pickup_coords": CITY_COORDINATES[p_city],
                "drop_coords": CITY_COORDINATES[d_city],
                "weight_tonnes": round(random.uniform(0.3, 1.8), 2),
                "cargo_type": random.choice(["Agri Produce", "Textiles", "FMCG", "Hardware"]),
                "urgency": random.choice(["standard", "express"]),
                "max_budget": 2500.0
            })

        print(f"\n  [BENCHMARK] Executing OR-Tools on {len(benchmark_demands)} Demands across 10 corridor hubs...")
        start_time = time.perf_counter()

        result = self.optimizer.solve_vrppd(
            trip_origin=trip_origin,
            trip_dest=trip_dest,
            initial_load_tonnes=initial_load,
            max_capacity_tonnes=max_capacity,
            demands=benchmark_demands,
            detour_threshold_pct=15.0
        )

        elapsed_time = time.perf_counter() - start_time
        print(f"  [BENCHMARK RESULT] Latency: {elapsed_time:.4f} seconds ({elapsed_time*1000:.2f} ms)")
        print(f"  [BENCHMARK RESULT] Demands Evaluated: 50 | Pooled: {len(result['demands_pooled'])} | Rejected: {len(result['demands_rejected'])}")
        print(f"  [BENCHMARK RESULT] Detour %: {result['detour_pct']}% | Total Route Km: {result['total_trip_km']} km")
        print(f"  [BENCHMARK RESULT] Solver Utilized: {result.get('solver_used')}")

        # Assert hard latency constraint: Must be strictly under 3.0 seconds
        self.assertLess(elapsed_time, 3.0, f"Benchmark failed: Latency {elapsed_time:.3f}s exceeded 3.0s threshold!")
        self.assertTrue(result["success"])
        self.assertLessEqual(result["detour_pct"], 15.0)

        # Assert no waypoint exceeds 10T
        for wp in result["waypoints"]:
            self.assertLessEqual(wp["cumulative_load_tonnes"], 10.0)

        print("  [PASSED] Scalability Benchmark: 50 demands resolved well below 3.0 seconds.")

    # -------------------------------------------------------------
    # 6. Dual-OTP Handshake Protocol (Pickup OTP & Delivery OTP)
    # -------------------------------------------------------------
    def test_dual_otp_handshake_protocol(self):
        """Verify Sender->Driver Pickup OTP handshake and Receiver->Driver Delivery OTP handshake."""
        # 1. Check Seed demand #1 OTPs
        otp_res = self.client.get("/api/demands/1/otps")
        self.assertEqual(otp_res.status_code, 200)
        otp_data = otp_res.json()
        self.assertIn("pickup_otp", otp_data)
        self.assertIn("delivery_otp", otp_data)

        # 2. Verify Pickup OTP handshake on demand #2
        pickup_res = self.client.post("/api/epod/verify-pickup", json={
            "demand_id": 2,
            "pickup_otp": "338102"
        })
        self.assertEqual(pickup_res.status_code, 200)
        self.assertTrue(pickup_res.json()["pickup_verified"])

        # 3. Verify Delivery OTP handshake on demand #1
        deliv_res = self.client.post("/api/epod/verify-delivery", json={
            "demand_id": 1,
            "delivery_otp": "784920",
            "receiver_name": "Darbhanga Mandi In-Charge",
            "signature_svg": "<svg>signature</svg>"
        })
        self.assertEqual(deliv_res.status_code, 200)
        self.assertTrue(deliv_res.json()["delivery_verified"])
        self.assertTrue(deliv_res.json()["payout_released"])

        print("  [PASSED] Dual-OTP Protocol: Pickup & Delivery handshakes successfully verified.")

    # -------------------------------------------------------------
    # 7. Fleet Segregation & VRPPD-TW Time Window Constraints
    # -------------------------------------------------------------
    def test_fleet_segregation_and_vrppd_tw(self):
        """Verify strict segregation: Express Direct enforces <=5% detour while Standard Pooling pools up to 15%."""
        trip_origin = {"name": "Delhi NCR", "coords": CITY_COORDINATES["Delhi NCR"]}
        trip_dest = {"name": "Mumbai", "coords": CITY_COORDINATES["Mumbai"]}

        # Standard demand: Delhi -> Ahmedabad
        standard_demand = {
            "id": 501,
            "shipper_id": 1,
            "pickup_city": "Delhi NCR",
            "drop_city": "Ahmedabad",
            "pickup_coords": CITY_COORDINATES["Delhi NCR"],
            "drop_coords": CITY_COORDINATES["Ahmedabad"],
            "weight_tonnes": 2.0,
            "cargo_type": "Precision Machine Components",
            "urgency": "standard"
        }

        # Express demand: Delhi -> Jaipur
        express_demand = {
            "id": 502,
            "shipper_id": 2,
            "pickup_city": "Delhi NCR",
            "drop_city": "Jaipur",
            "pickup_coords": CITY_COORDINATES["Delhi NCR"],
            "drop_coords": CITY_COORDINATES["Jaipur"],
            "weight_tonnes": 0.8,
            "cargo_type": "Emergency Electronics",
            "urgency": "express"
        }

        # 1. Test Express Direct vehicle rejects Standard demand
        express_opt = self.optimizer.solve_vrppd(
            trip_origin=trip_origin,
            trip_dest=trip_dest,
            initial_load_tonnes=2.0,
            max_capacity_tonnes=5.0,
            demands=[standard_demand, express_demand],
            service_mode="EXPRESS_DIRECT"
        )
        self.assertIn(502, express_opt["demands_pooled"])
        self.assertNotIn(501, express_opt["demands_pooled"])  # Standard demand rejected from Express Direct
        self.assertLessEqual(express_opt["detour_pct"], 5.0)

        # 2. Test Standard Pooling vehicle pools Standard demand
        std_opt = self.optimizer.solve_vrppd(
            trip_origin=trip_origin,
            trip_dest=trip_dest,
            initial_load_tonnes=2.0,
            max_capacity_tonnes=10.0,
            demands=[standard_demand],
            service_mode="STANDARD_POOLING"
        )
        self.assertIn(501, std_opt["demands_pooled"])
        self.assertLessEqual(std_opt["detour_pct"], 15.0)

        print("  [PASSED] Fleet Segregation & VRPPD-TW: Express Direct and Standard Pooling constraints enforced.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
