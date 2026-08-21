from typing import Dict, Any, List
from optimizer import calculate_distance_km

DEFAULT_BASE_RATE_PER_TONNE_KM = 5.50  # INR per tonne-km
EXPRESS_URGENCY_MULTIPLIER = 1.25
STANDARD_URGENCY_MULTIPLIER = 1.00
DEFAULT_POOLING_DISCOUNT_RATIO = 0.25  # 25% discount for shippers sharing backhaul/spare capacity
DRIVER_REVENUE_FLOOR_FACTOR = 1.20    # Driver guaranteed >= 120% of baseline solo run
CO2_KG_PER_DIESEL_KM = 0.68            # Standard Indian CV diesel emission factor (kg CO2 / km)

def calculate_shipper_quote(
    pickup_coords: List[float],
    drop_coords: List[float],
    weight_tonnes: float,
    urgency: str = "standard",
    base_rate_per_tonne_km: float = DEFAULT_BASE_RATE_PER_TONNE_KM,
    pooling_discount_ratio: float = DEFAULT_POOLING_DISCOUNT_RATIO
) -> Dict[str, Any]:
    """
    Calculate Fair-Share Dynamic Quote for an MSME Shipper:
    Shipper Price = (Direct Distance * Base Rate * Weight) * Urgency Multiplier * (1 - Pooling Discount)
    """
    direct_dist_km = calculate_distance_km(pickup_coords, drop_coords)
    urgency_mult = EXPRESS_URGENCY_MULTIPLIER if urgency.lower() == "express" else STANDARD_URGENCY_MULTIPLIER

    # Standard solo price (without pooling)
    raw_solo_price = round(direct_dist_km * base_rate_per_tonne_km * weight_tonnes * urgency_mult, 2)
    raw_solo_price = max(raw_solo_price, 450.0 * weight_tonnes)

    # Discounted pooled price
    discount_amount = round(raw_solo_price * pooling_discount_ratio, 2)
    final_pooled_price = round(raw_solo_price - discount_amount, 2)
    shipper_savings_inr = discount_amount

    # Estimated CO2 footprint avoided if pooled vs dedicated mini-truck
    estimated_co2_kg = round(direct_dist_km * CO2_KG_PER_DIESEL_KM * 0.75, 2)

    return {
        "direct_distance_km": direct_dist_km,
        "base_rate_per_km": base_rate_per_tonne_km,
        "weight_tonnes": weight_tonnes,
        "urgency_multiplier": urgency_mult,
        "pooling_discount_pct": round(pooling_discount_ratio * 100, 1),
        "raw_solo_price": raw_solo_price,
        "final_pooled_price": final_pooled_price,
        "shipper_savings_inr": shipper_savings_inr,
        "estimated_co2_kg": estimated_co2_kg
    }

def calculate_consolidated_trip_economics(
    baseline_direct_km: float,
    actual_trip_km: float,
    base_fare_per_km: float,
    pooled_demands_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Calculates consolidated trip fair-share economics:
    1. Driver guaranteed revenue floor >= 120% of baseline single run.
    2. Shipper breakdown with pooling discount.
    3. Platform commission and driver incentive bonus.
    4. Empty km saved and net CO2 cuts.
    """
    # 1. Driver Baseline Single Run
    driver_baseline_revenue = round(baseline_direct_km * base_fare_per_km, 2)
    driver_min_guaranteed_floor = round(driver_baseline_revenue * DRIVER_REVENUE_FLOOR_FACTOR, 2)

    # 2. Total Revenue from Pooled Shippers
    total_shipper_revenue = 0.0
    total_solo_alternative_cost = 0.0
    shipper_breakdowns = []
    total_demand_direct_km = 0.0

    for d in pooled_demands_data:
        quote = calculate_shipper_quote(
            pickup_coords=d["pickup_coords"],
            drop_coords=d["drop_coords"],
            weight_tonnes=d["weight_tonnes"],
            urgency=d.get("urgency", "standard")
        )
        total_shipper_revenue += quote["final_pooled_price"]
        total_solo_alternative_cost += quote["raw_solo_price"]
        total_demand_direct_km += quote["direct_distance_km"]

        shipper_name = d.get("shipper_name") or f"Shipper #{d.get('shipper_id', d.get('id', 1))}"

        shipper_breakdowns.append({
            "demand_id": d["id"],
            "shipper_name": shipper_name,
            "pickup_city": d["pickup_city"],
            "drop_city": d["drop_city"],
            "weight_tonnes": d["weight_tonnes"],
            "raw_solo_price": quote["raw_solo_price"],
            "final_pooled_price": quote["final_pooled_price"],
            "savings_inr": quote["shipper_savings_inr"],
            "savings_pct": quote["pooling_discount_pct"]
        })

    # 3. Driver Payout Calculation
    incremental_driver_share = round(total_shipper_revenue * 0.75, 2)
    driver_calculated_payout = round(driver_baseline_revenue + incremental_driver_share, 2)
    
    # Enforce minimum 120% floor
    driver_final_payout = max(driver_calculated_payout, driver_min_guaranteed_floor)
    driver_gain_over_baseline_pct = round(
        ((driver_final_payout - driver_baseline_revenue) / max(driver_baseline_revenue, 1.0)) * 100, 1
    )

    platform_margin = round(
        (driver_baseline_revenue + total_shipper_revenue) - driver_final_payout, 2
    )

    # 4. Environmental & Operational Savings
    detour_km = max(0.0, actual_trip_km - baseline_direct_km)
    empty_km_saved = round(max(0.0, total_demand_direct_km - detour_km), 2)
    co2_cut_kg = round(empty_km_saved * CO2_KG_PER_DIESEL_KM, 2)

    return {
        "driver_baseline_revenue": driver_baseline_revenue,
        "driver_min_guaranteed_floor": driver_min_guaranteed_floor,
        "driver_final_payout": driver_final_payout,
        "driver_gain_over_baseline_pct": driver_gain_over_baseline_pct,
        "driver_extra_earnings_inr": round(driver_final_payout - driver_baseline_revenue, 2),
        "total_shipper_revenue": round(total_shipper_revenue, 2),
        "total_msme_savings_inr": round(total_solo_alternative_cost - total_shipper_revenue, 2),
        "platform_fee_inr": max(0.0, platform_margin),
        "empty_km_saved": empty_km_saved,
        "co2_cut_kg": co2_cut_kg,
        "detour_km": round(detour_km, 2),
        "shipper_breakdowns": shipper_breakdowns
    }
