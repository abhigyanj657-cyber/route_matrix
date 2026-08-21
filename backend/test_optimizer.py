import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from optimizer import optimizer_instance, CITY_COORDINATES
from pricing import calculate_consolidated_trip_economics

print("Running Optimizer directly...")
trip_origin = {"name": "Patna", "coords": CITY_COORDINATES["Patna"]}
trip_dest = {"name": "Madhubani", "coords": CITY_COORDINATES["Madhubani"]}
initial_load = 6.0
max_capacity = 10.0

demands = [
    {
        "id": 1,
        "shipper_id": 1,
        "shipper_name": "Maa Janaki Agro Mills",
        "pickup_city": "Patna",
        "drop_city": "Darbhanga",
        "pickup_coords": CITY_COORDINATES["Patna"],
        "drop_coords": CITY_COORDINATES["Darbhanga"],
        "weight_tonnes": 2.0,
        "cargo_type": "Agro Produce",
        "urgency": "standard",
        "max_budget": 2800.0
    },
    {
        "id": 2,
        "shipper_id": 2,
        "shipper_name": "Mithila Handloom",
        "pickup_city": "Darbhanga",
        "drop_city": "Madhubani",
        "pickup_coords": CITY_COORDINATES["Darbhanga"],
        "drop_coords": CITY_COORDINATES["Madhubani"],
        "weight_tonnes": 1.0,
        "cargo_type": "Handloom Textiles",
        "urgency": "express",
        "max_budget": 1600.0
    }
]

res = optimizer_instance.solve_vrppd(
    trip_origin=trip_origin,
    trip_dest=trip_dest,
    initial_load_tonnes=initial_load,
    max_capacity_tonnes=max_capacity,
    demands=demands,
    detour_threshold_pct=15.0
)

print("Optimizer result:", res)

econ = calculate_consolidated_trip_economics(
    baseline_direct_km=res["baseline_direct_km"],
    actual_trip_km=res["total_trip_km"],
    base_fare_per_km=32.0,
    pooled_demands_data=demands
)
print("Economics:", econ)
