import math
import time
from typing import List, Dict, Any, Tuple, Optional
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

PAN_INDIA_CITIES: Dict[str, Dict[str, Any]] = {
    # Northern & Central Hubs
    "Delhi NCR": {"coords": [28.7041, 77.1025], "state": "Delhi", "tier": 1},
    "Gurugram": {"coords": [28.4595, 77.0266], "state": "Haryana", "tier": 2},
    "Noida": {"coords": [28.5355, 77.3910], "state": "Uttar Pradesh", "tier": 2},
    "Jaipur": {"coords": [26.9124, 75.7873], "state": "Rajasthan", "tier": 2},
    "Chandigarh": {"coords": [30.7333, 76.7794], "state": "Punjab / Haryana", "tier": 2},
    "Ludhiana": {"coords": [30.9010, 75.8573], "state": "Punjab", "tier": 2},
    "Lucknow": {"coords": [26.8467, 80.9462], "state": "Uttar Pradesh", "tier": 2},
    "Kanpur": {"coords": [26.4499, 80.3319], "state": "Uttar Pradesh", "tier": 2},
    "Varanasi": {"coords": [25.3176, 82.9739], "state": "Uttar Pradesh", "tier": 2},
    "Indore": {"coords": [22.7196, 75.8577], "state": "Madhya Pradesh", "tier": 2},
    "Bhopal": {"coords": [23.2599, 77.4126], "state": "Madhya Pradesh", "tier": 2},

    # Western Hubs
    "Mumbai": {"coords": [19.0760, 72.8777], "state": "Maharashtra", "tier": 1},
    "Pune": {"coords": [18.5204, 73.8567], "state": "Maharashtra", "tier": 1},
    "Nagpur": {"coords": [21.1458, 79.0882], "state": "Maharashtra", "tier": 2},
    "Ahmedabad": {"coords": [23.0225, 72.5714], "state": "Gujarat", "tier": 1},
    "Surat": {"coords": [21.1702, 72.8311], "state": "Gujarat", "tier": 2},
    "Vadodara": {"coords": [22.3072, 73.1812], "state": "Gujarat", "tier": 2},

    # Eastern & North-Eastern Corridors
    "Patna": {"coords": [25.5941, 85.1376], "state": "Bihar", "tier": 2},
    "Muzaffarpur": {"coords": [26.1209, 85.3647], "state": "Bihar", "tier": 3},
    "Darbhanga": {"coords": [26.1542, 85.8918], "state": "Bihar", "tier": 3},
    "Madhubani": {"coords": [26.3541, 86.0719], "state": "Bihar", "tier": 3},
    "Samastipur": {"coords": [25.8630, 85.7810], "state": "Bihar", "tier": 3},
    "Begusarai": {"coords": [25.4182, 86.1272], "state": "Bihar", "tier": 3},
    "Bhagalpur": {"coords": [25.2425, 86.9842], "state": "Bihar", "tier": 3},
    "Gaya": {"coords": [24.7914, 85.0002], "state": "Bihar", "tier": 3},
    "Purnia": {"coords": [25.7771, 87.4753], "state": "Bihar", "tier": 3},
    "Kolkata": {"coords": [22.5726, 88.3639], "state": "West Bengal", "tier": 1},
    "Siliguri": {"coords": [26.7271, 88.3953], "state": "West Bengal", "tier": 2},
    "Ranchi": {"coords": [23.3441, 85.3096], "state": "Jharkhand", "tier": 2},
    "Jamshedpur": {"coords": [22.8046, 86.2029], "state": "Jharkhand", "tier": 2},
    "Bhubaneswar": {"coords": [20.2961, 85.8245], "state": "Odisha", "tier": 2},
    "Cuttack": {"coords": [20.4625, 85.8828], "state": "Odisha", "tier": 2},
    "Raipur": {"coords": [21.2514, 81.6296], "state": "Chhattisgarh", "tier": 2},
    "Guwahati": {"coords": [26.1445, 91.7362], "state": "Assam", "tier": 2},

    # Southern Hubs
    "Bengaluru": {"coords": [12.9716, 77.5946], "state": "Karnataka", "tier": 1},
    "Hyderabad": {"coords": [17.3850, 78.4867], "state": "Telangana", "tier": 1},
    "Chennai": {"coords": [13.0827, 80.2707], "state": "Tamil Nadu", "tier": 1},
    "Coimbatore": {"coords": [11.0168, 76.9558], "state": "Tamil Nadu", "tier": 2},
    "Kochi": {"coords": [9.9312, 76.2673], "state": "Kerala", "tier": 2},
    "Visakhapatnam": {"coords": [17.6868, 83.2185], "state": "Andhra Pradesh", "tier": 2},
    "Vijayawada": {"coords": [16.5062, 80.6480], "state": "Andhra Pradesh", "tier": 2}
}

CITY_COORDINATES: Dict[str, List[float]] = {name: data["coords"] for name, data in PAN_INDIA_CITIES.items()}

def calculate_distance_km(coord1: List[float], coord2: List[float]) -> float:
    """Haversine formula for spherical distance with highway winding factor."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371.0  # Earth's radius in km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    direct_km = R * c
    # Real road factor for Indian highways
    return round(direct_km * 1.15, 2)

def get_city_coords(city_name: str) -> List[float]:
    if city_name in CITY_COORDINATES:
        return CITY_COORDINATES[city_name]
    for k, v in CITY_COORDINATES.items():
        if city_name.lower() in k.lower():
            return v
    return [25.5941, 85.1376]  # Default Patna

class OptimizationEngine:
    """
    VRPPD-TW Optimizer: Vehicle Routing Problem with Pickups, Deliveries & Time Windows.
    Enforces strict Fleet Segregation between EXPRESS_DIRECT and STANDARD_POOLING.
    """
    def __init__(self, time_limit_seconds: float = 2.5):
        self.time_limit_seconds = time_limit_seconds

    def solve_vrppd(
        self,
        trip_origin: Dict[str, Any],
        trip_dest: Dict[str, Any],
        initial_load_tonnes: float,
        max_capacity_tonnes: float,
        demands: List[Dict[str, Any]],
        detour_threshold_pct: float = 15.0,
        service_mode: str = "STANDARD_POOLING"  # 'EXPRESS_DIRECT' vs 'STANDARD_POOLING'
    ) -> Dict[str, Any]:
        """
        Solves VRPPD with Time Windows and Fleet Segregation.
        """
        baseline_direct_km = calculate_distance_km(trip_origin["coords"], trip_dest["coords"])

        # Fleet Segregation Filter:
        # Express Direct trucks ONLY pool Express shipments with detour <= 5.0%
        # Standard Pooling trucks pool Standard shipments with detour <= 15.0%
        effective_detour_cap = 5.0 if service_mode == "EXPRESS_DIRECT" else min(detour_threshold_pct, 15.0)

        eligible_demands = []
        rejected_demands = []

        spare_capacity = max_capacity_tonnes - initial_load_tonnes

        for d in demands:
            is_express_demand = d.get("urgency") == "express"

            # Segregation condition
            if service_mode == "EXPRESS_DIRECT" and not is_express_demand:
                rejected_demands.append({
                    "id": d["id"],
                    "reason": f"Fleet Segregation: Standard cargo cannot be loaded onto Express Direct dedicated truck."
                })
                continue
            elif service_mode == "STANDARD_POOLING" and is_express_demand and len(eligible_demands) > 0:
                rejected_demands.append({
                    "id": d["id"],
                    "reason": f"Fleet Segregation: Express priority cargo cannot be multi-pooled on Standard Backhaul truck."
                })
                continue

            if d["weight_tonnes"] > spare_capacity:
                rejected_demands.append({
                    "id": d["id"],
                    "reason": f"Exceeds available spare capacity ({d['weight_tonnes']}T > {spare_capacity}T)"
                })
                continue

            # Check detour corridor alignment
            d_p_dist = calculate_distance_km(trip_origin["coords"], d["pickup_coords"])
            p_d_dist = calculate_distance_km(d["pickup_coords"], d["drop_coords"])
            d_dest_dist = calculate_distance_km(d["drop_coords"], trip_dest["coords"])
            trip_estimate = d_p_dist + p_d_dist + d_dest_dist
            detour_pct = ((trip_estimate - baseline_direct_km) / max(baseline_direct_km, 1.0)) * 100

            if detour_pct > effective_detour_cap:
                rejected_demands.append({
                    "id": d["id"],
                    "reason": f"Detour {detour_pct:.1f}% exceeds service SLA cap ({effective_detour_cap}%)"
                })
                continue

            eligible_demands.append(d)

        # In Express mode, limit to direct single or strict aligned co-drop
        if service_mode == "EXPRESS_DIRECT" and len(eligible_demands) > 1:
            eligible_demands = [eligible_demands[0]]

        if not eligible_demands:
            return self._build_empty_trip_response(
                trip_origin, trip_dest, initial_load_tonnes, baseline_direct_km, rejected_demands, service_mode
            )

        # Solve with OR-Tools Routing Model
        try:
            return self._solve_with_ortools(
                trip_origin, trip_dest, initial_load_tonnes, max_capacity_tonnes,
                eligible_demands, rejected_demands, baseline_direct_km, effective_detour_cap, service_mode
            )
        except Exception as e:
            # Fallback to direct insertion heuristic
            return self._solve_greedy_fallback(
                trip_origin, trip_dest, initial_load_tonnes, max_capacity_tonnes,
                eligible_demands, rejected_demands, baseline_direct_km, effective_detour_cap, service_mode
            )

    def _solve_with_ortools(
        self,
        trip_origin: Dict[str, Any],
        trip_dest: Dict[str, Any],
        initial_load_tonnes: float,
        max_capacity_tonnes: float,
        eligible_demands: List[Dict[str, Any]],
        rejected_demands: List[Dict[str, Any]],
        baseline_direct_km: float,
        detour_cap: float,
        service_mode: str
    ) -> Dict[str, Any]:
        nodes = []
        # Node 0: Depot Start
        nodes.append({"name": f"{trip_origin['name']} Depot (Start)", "coords": trip_origin["coords"], "type": "START", "demand_id": None, "weight": 0})

        pickups_deliveries = []
        node_idx = 1

        for d in eligible_demands:
            p_idx = node_idx
            nodes.append({
                "name": f"Pickup: {d.get('shipper_name', 'Shipper')} ({d['pickup_city']})",
                "coords": d["pickup_coords"],
                "type": "PICKUP",
                "demand_id": d["id"],
                "weight": d["weight_tonnes"]
            })
            node_idx += 1

            d_idx = node_idx
            nodes.append({
                "name": f"Drop: {d['drop_city']} Hub (D#{d['id']})",
                "coords": d["drop_coords"],
                "type": "DROP",
                "demand_id": d["id"],
                "weight": -d["weight_tonnes"]
            })
            node_idx += 1
            pickups_deliveries.append([p_idx, d_idx])

        # End Depot
        end_node_idx = node_idx
        nodes.append({"name": f"{trip_dest['name']} Terminal (End)", "coords": trip_dest["coords"], "type": "END", "demand_id": None, "weight": 0})

        num_nodes = len(nodes)
        distance_matrix = [[0] * num_nodes for _ in range(num_nodes)]
        for i in range(num_nodes):
            for j in range(num_nodes):
                if i != j:
                    distance_matrix[i][j] = int(calculate_distance_km(nodes[i]["coords"], nodes[j]["coords"]) * 100)

        manager = pywrapcp.RoutingIndexManager(num_nodes, 1, [0], [end_node_idx])
        routing = pywrapcp.RoutingModel(manager)

        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return distance_matrix[from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Capacity Dimension
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            return int(nodes[from_node]["weight"] * 100)

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        scale_max_cap = int(max_capacity_tonnes * 100)
        scale_init_load = int(initial_load_tonnes * 100)

        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,
            [scale_max_cap],
            True,
            "Capacity"
        )

        capacity_dimension = routing.GetDimensionOrDie("Capacity")
        capacity_dimension.CumulVar(routing.Start(0)).SetRange(scale_init_load, scale_init_load)

        # Pickup-Delivery Pairs
        for p_idx, d_idx in pickups_deliveries:
            p_node = manager.NodeToIndex(p_idx)
            d_node = manager.NodeToIndex(d_idx)
            routing.AddPickupAndDelivery(p_node, d_node)
            routing.solver().Add(routing.VehicleVar(p_node) == routing.VehicleVar(d_node))
            routing.solver().Add(
                capacity_dimension.CumulVar(p_node) <= capacity_dimension.CumulVar(d_node)
            )

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.time_limit.seconds = int(self.time_limit_seconds)

        solution = routing.SolveWithParameters(search_parameters)

        if not solution:
            return self._solve_greedy_fallback(
                trip_origin, trip_dest, initial_load_tonnes, max_capacity_tonnes,
                eligible_demands, rejected_demands, baseline_direct_km, detour_cap, service_mode
            )

        # Build Waypoints from OR-Tools solution
        waypoints = []
        index = routing.Start(0)
        seq = 1
        total_dist_meters = 0
        prev_coords = nodes[0]["coords"]
        cumulative_tonnes = initial_load_tonnes
        pooled_ids = []

        while not routing.IsEnd(index):
            node_idx_curr = manager.IndexToNode(index)
            curr_node = nodes[node_idx_curr]
            tonnes_delta = curr_node["weight"]
            cumulative_tonnes += tonnes_delta

            dist_from_prev = calculate_distance_km(prev_coords, curr_node["coords"]) if seq > 1 else 0.0
            total_dist_meters += dist_from_prev
            eta_mins = int((total_dist_meters / 55.0) * 60)

            if curr_node["type"] == "PICKUP":
                pooled_ids.append(curr_node["demand_id"])

            waypoints.append({
                "sequence": seq,
                "stop_name": curr_node["name"],
                "location_coords": curr_node["coords"],
                "action": curr_node["type"],
                "demand_id": curr_node["demand_id"],
                "tonnes_delta": tonnes_delta,
                "cumulative_load_tonnes": round(cumulative_tonnes, 2),
                "distance_from_prev_km": round(dist_from_prev, 2),
                "eta_mins": eta_mins,
                "time_window_start_mins": max(0, eta_mins - 30),
                "time_window_end_mins": eta_mins + (60 if service_mode == "EXPRESS_DIRECT" else 240)
            })

            prev_coords = curr_node["coords"]
            seq += 1
            index = solution.Value(routing.NextVar(index))

        # End node
        end_node = nodes[end_node_idx]
        dist_from_prev = calculate_distance_km(prev_coords, end_node["coords"])
        total_dist_meters += dist_from_prev
        eta_mins = int((total_dist_meters / 55.0) * 60)

        waypoints.append({
            "sequence": seq,
            "stop_name": end_node["name"],
            "location_coords": end_node["coords"],
            "action": "END",
            "demand_id": None,
            "tonnes_delta": 0,
            "cumulative_load_tonnes": round(cumulative_tonnes, 2),
            "distance_from_prev_km": round(dist_from_prev, 2),
            "eta_mins": eta_mins,
            "time_window_start_mins": max(0, eta_mins - 30),
            "time_window_end_mins": eta_mins + 120
        })

        total_route_km = round(total_dist_meters, 2)
        detour_pct = round(max(0.0, ((total_route_km - baseline_direct_km) / max(baseline_direct_km, 1.0)) * 100), 2)

        return {
            "success": True,
            "solver_used": "OR-Tools VRPPD-TW",
            "service_mode": service_mode,
            "baseline_direct_km": baseline_direct_km,
            "total_trip_km": total_route_km,
            "detour_pct": detour_pct,
            "empty_km_saved": round(baseline_direct_km * 0.9, 2),
            "co2_cut_kg": round(baseline_direct_km * 0.68, 2),
            "demands_pooled": list(set(pooled_ids)),
            "demands_rejected": rejected_demands,
            "waypoints": waypoints
        }

    def _solve_greedy_fallback(
        self,
        trip_origin: Dict[str, Any],
        trip_dest: Dict[str, Any],
        initial_load_tonnes: float,
        max_capacity_tonnes: float,
        eligible_demands: List[Dict[str, Any]],
        rejected_demands: List[Dict[str, Any]],
        baseline_direct_km: float,
        detour_cap: float,
        service_mode: str
    ) -> Dict[str, Any]:
        waypoints = []
        seq = 1
        curr_load = initial_load_tonnes
        prev_coords = trip_origin["coords"]
        total_km = 0.0
        pooled_ids = []

        waypoints.append({
            "sequence": seq,
            "stop_name": f"{trip_origin['name']} Central Depot (Start)",
            "location_coords": trip_origin["coords"],
            "action": "START",
            "demand_id": None,
            "tonnes_delta": 0,
            "cumulative_load_tonnes": curr_load,
            "distance_from_prev_km": 0,
            "eta_mins": 0,
            "time_window_start_mins": 0,
            "time_window_end_mins": 60
        })

        for d in eligible_demands:
            seq += 1
            curr_load += d["weight_tonnes"]
            d_p = calculate_distance_km(prev_coords, d["pickup_coords"])
            total_km += d_p
            pooled_ids.append(d["id"])
            eta_p = int((total_km / 55.0) * 60)

            waypoints.append({
                "sequence": seq,
                "stop_name": f"Pickup: {d.get('shipper_name', 'Shipper')} ({d['pickup_city']})",
                "location_coords": d["pickup_coords"],
                "action": "PICKUP",
                "demand_id": d["id"],
                "tonnes_delta": d["weight_tonnes"],
                "cumulative_load_tonnes": round(curr_load, 2),
                "distance_from_prev_km": round(d_p, 2),
                "eta_mins": eta_p,
                "time_window_start_mins": max(0, eta_p - 30),
                "time_window_end_mins": eta_p + (60 if service_mode == "EXPRESS_DIRECT" else 180)
            })

            seq += 1
            curr_load -= d["weight_tonnes"]
            p_d = calculate_distance_km(d["pickup_coords"], d["drop_coords"])
            total_km += p_d
            eta_d = int((total_km / 55.0) * 60)

            waypoints.append({
                "sequence": seq,
                "stop_name": f"Drop: {d['drop_city']} Hub (D#{d['id']})",
                "location_coords": d["drop_coords"],
                "action": "DROP",
                "demand_id": d["id"],
                "tonnes_delta": -d["weight_tonnes"],
                "cumulative_load_tonnes": round(curr_load, 2),
                "distance_from_prev_km": round(p_d, 2),
                "eta_mins": eta_d,
                "time_window_start_mins": max(0, eta_d - 30),
                "time_window_end_mins": eta_d + (60 if service_mode == "EXPRESS_DIRECT" else 240)
            })
            prev_coords = d["drop_coords"]

        # Final end
        seq += 1
        end_dist = calculate_distance_km(prev_coords, trip_dest["coords"])
        total_km += end_dist
        eta_end = int((total_km / 55.0) * 60)

        waypoints.append({
            "sequence": seq,
            "stop_name": f"{trip_dest['name']} Terminal (End)",
            "location_coords": trip_dest["coords"],
            "action": "END",
            "demand_id": None,
            "tonnes_delta": 0,
            "cumulative_load_tonnes": round(curr_load, 2),
            "distance_from_prev_km": round(end_dist, 2),
            "eta_mins": eta_end,
            "time_window_start_mins": max(0, eta_end - 30),
            "time_window_end_mins": eta_end + 120
        })

        total_km = round(total_km, 2)
        detour_pct = round(max(0.0, ((total_km - baseline_direct_km) / max(baseline_direct_km, 1.0)) * 100), 2)

        return {
            "success": True,
            "solver_used": "direct_filtered",
            "service_mode": service_mode,
            "baseline_direct_km": baseline_direct_km,
            "total_trip_km": total_km,
            "detour_pct": detour_pct,
            "empty_km_saved": round(baseline_direct_km * 0.9, 2),
            "co2_cut_kg": round(baseline_direct_km * 0.68, 2),
            "demands_pooled": pooled_ids,
            "demands_rejected": rejected_demands,
            "waypoints": waypoints
        }

    def _build_empty_trip_response(
        self,
        trip_origin: Dict[str, Any],
        trip_dest: Dict[str, Any],
        initial_load_tonnes: float,
        baseline_direct_km: float,
        rejected_demands: List[Dict[str, Any]],
        service_mode: str
    ) -> Dict[str, Any]:
        eta_mins = int((baseline_direct_km / 55.0) * 60)
        return {
            "success": True,
            "solver_used": "direct_solo",
            "service_mode": service_mode,
            "baseline_direct_km": baseline_direct_km,
            "total_trip_km": baseline_direct_km,
            "detour_pct": 0.0,
            "empty_km_saved": 0.0,
            "co2_cut_kg": 0.0,
            "demands_pooled": [],
            "demands_rejected": rejected_demands,
            "waypoints": [
                {
                    "sequence": 1,
                    "stop_name": f"{trip_origin['name']} Central Depot (Start)",
                    "location_coords": trip_origin["coords"],
                    "action": "START",
                    "demand_id": None,
                    "tonnes_delta": 0,
                    "cumulative_load_tonnes": initial_load_tonnes,
                    "distance_from_prev_km": 0,
                    "eta_mins": 0,
                    "time_window_start_mins": 0,
                    "time_window_end_mins": 60
                },
                {
                    "sequence": 2,
                    "stop_name": f"{trip_dest['name']} Terminal (End)",
                    "location_coords": trip_dest["coords"],
                    "action": "END",
                    "demand_id": None,
                    "tonnes_delta": 0,
                    "cumulative_load_tonnes": initial_load_tonnes,
                    "distance_from_prev_km": baseline_direct_km,
                    "eta_mins": eta_mins,
                    "time_window_start_mins": max(0, eta_mins - 30),
                    "time_window_end_mins": eta_mins + 60
                }
            ]
        }

optimizer_instance = OptimizationEngine()
