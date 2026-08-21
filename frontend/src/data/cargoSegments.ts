export interface VehicleClass {
  id: string;
  name: string;
  nameHindi: string;
  tag: string;
  minTonnage: number;
  maxTonnage: number;
  defaultTonnage: number;
  vehicleExample: string;
  maxSpeedKmph: number;
  approxVolumeCuFt: number;
  densityFactor: number;
  occupiedTonnes: number;
  totalCapacityTonnes: number;
  icon: string;
  colorClass: string;
}

export const EXPANDED_VEHICLE_FLEET: VehicleClass[] = [
  {
    id: "auto_3w",
    name: "3-Wheeler Electric / Cargo Auto",
    nameHindi: "3-व्हीलर इलेक्ट्रिक / कार्गो ऑटो",
    tag: "Up to 500 kg (Micro-freight)",
    minTonnage: 0.05,
    maxTonnage: 0.50,
    defaultTonnage: 0.30,
    vehicleExample: "Piaggio Ape / Mahindra Treo Zor / E-Loader",
    maxSpeedKmph: 35,
    approxVolumeCuFt: 60,
    densityFactor: 200,
    occupiedTonnes: 0.15,
    totalCapacityTonnes: 0.50,
    icon: "🛵",
    colorClass: "from-blue-500 to-cyan-500"
  },
  {
    id: "tata_ace",
    name: "Tata Ace Gold / Mini Pickup (LCV)",
    nameHindi: "टाटा ऐस गोल्ड / छोटा हाथी (एलसीवी)",
    tag: "Up to 1.2 Tonnes (Mini Truck)",
    minTonnage: 0.30,
    maxTonnage: 1.20,
    defaultTonnage: 0.80,
    vehicleExample: "Tata Ace Gold / Mahindra Jeeto / Maruti Super Carry",
    maxSpeedKmph: 50,
    approxVolumeCuFt: 150,
    densityFactor: 160,
    occupiedTonnes: 0.50,
    totalCapacityTonnes: 1.20,
    icon: "🛻",
    colorClass: "from-emerald-500 to-teal-500"
  },
  {
    id: "bolero_pickup",
    name: "Bolero Maxi Truck / Ashok Leyland Dost",
    nameHindi: "बोलेरो मैक्सी ट्रक / अशोक लीलैंड दोस्त",
    tag: "Up to 2.5 Tonnes (Maxi Pickup)",
    minTonnage: 0.80,
    maxTonnage: 2.50,
    defaultTonnage: 1.50,
    vehicleExample: "Mahindra Bolero Maxi Truck Plus / Dost Strong",
    maxSpeedKmph: 55,
    approxVolumeCuFt: 280,
    densityFactor: 140,
    occupiedTonnes: 1.20,
    totalCapacityTonnes: 2.50,
    icon: "🛻",
    colorClass: "from-teal-500 to-emerald-600"
  },
  {
    id: "eicher_6w",
    name: "Eicher Pro 6-Wheeler (MCV)",
    nameHindi: "आयशर प्रो 6-टायर (एमसीवी)",
    tag: "Up to 7.5 Tonnes (14ft - 19ft)",
    minTonnage: 2.00,
    maxTonnage: 7.50,
    defaultTonnage: 4.50,
    vehicleExample: "Eicher Pro 2059 / Pro 3015 / Tata 1109",
    maxSpeedKmph: 60,
    approxVolumeCuFt: 700,
    densityFactor: 130,
    occupiedTonnes: 3.50,
    totalCapacityTonnes: 7.50,
    icon: "🚛",
    colorClass: "from-amber-500 to-orange-600"
  },
  {
    id: "tata_prima_10w",
    name: "Tata Prima 10-Wheeler (HCV)",
    nameHindi: "टाटा प्राइमा 10-टायर (एचसीवी)",
    tag: "Up to 16 Tonnes (Taurus)",
    minTonnage: 6.00,
    maxTonnage: 16.00,
    defaultTonnage: 10.00,
    vehicleExample: "Tata Prima 2830.K / BharatBenz 2823R / Eicher 10W",
    maxSpeedKmph: 65,
    approxVolumeCuFt: 1400,
    densityFactor: 135,
    occupiedTonnes: 9.60,
    totalCapacityTonnes: 16.00,
    icon: "🚚",
    colorClass: "from-purple-500 to-indigo-600"
  },
  {
    id: "heavy_hauler_14w",
    name: "12/14-Wheeler Heavy Hauler",
    nameHindi: "12/14-टायर भारी मालवाहक",
    tag: "Up to 25 Tonnes (Heavy Linehaul)",
    minTonnage: 12.00,
    maxTonnage: 25.00,
    defaultTonnage: 18.00,
    vehicleExample: "Tata Signa 3525.K / Ashok Leyland 3520 8x2",
    maxSpeedKmph: 60,
    approxVolumeCuFt: 2100,
    densityFactor: 125,
    occupiedTonnes: 15.00,
    totalCapacityTonnes: 25.00,
    icon: "🚛",
    colorClass: "from-rose-500 to-pink-600"
  },
  {
    id: "trailer_mav",
    name: "Multi-Axle Container Trailer (MAV)",
    nameHindi: "मल्टी-एक्सल कंटेनर ट्रेलर (एमएवी)",
    tag: "Up to 40 Tonnes (22ft - 40ft Container)",
    minTonnage: 18.00,
    maxTonnage: 40.00,
    defaultTonnage: 28.00,
    vehicleExample: "Volvo FH16 / Tata Prima 5530.S / 40ft High-Cube",
    maxSpeedKmph: 55,
    approxVolumeCuFt: 2800,
    densityFactor: 115,
    occupiedTonnes: 22.00,
    totalCapacityTonnes: 40.00,
    icon: "🚜",
    colorClass: "from-blue-600 to-indigo-700"
  }
];

export const CARGO_SEGMENTS = EXPANDED_VEHICLE_FLEET;

export const QUICK_TONNAGE_PRESETS = [
  { label: "250 kg", tonnes: 0.25, segmentId: "auto_3w" },
  { label: "500 kg", tonnes: 0.50, segmentId: "auto_3w" },
  { label: "1.0 Ton", tonnes: 1.00, segmentId: "tata_ace" },
  { label: "2.0 Tons", tonnes: 2.00, segmentId: "bolero_pickup" },
  { label: "5.0 Tons", tonnes: 5.00, segmentId: "eicher_6w" },
  { label: "10.0 Tons", tonnes: 10.00, segmentId: "tata_prima_10w" },
  { label: "20.0 Tons", tonnes: 20.00, segmentId: "heavy_hauler_14w" },
  { label: "30.0 Tons", tonnes: 30.00, segmentId: "trailer_mav" }
];

export function calculateVolumetricWeight(lengthInches: number, widthInches: number, heightInches: number): {
  cubicFeet: number;
  volumetricTonnes: number;
} {
  const cubicInches = lengthInches * widthInches * heightInches;
  const cubicFeet = cubicInches / 1728;
  const volumetricTonnes = cubicFeet / 100;
  return {
    cubicFeet: Math.round(cubicFeet * 100) / 100,
    volumetricTonnes: Math.round(volumetricTonnes * 100) / 100
  };
}

export function calculateEstimatedTransitHours(distanceKm: number, vehicleSpeedKmph: number, isExpress: boolean): number {
  const avgSpeed = isExpress ? vehicleSpeedKmph * 0.9 : vehicleSpeedKmph * 0.75;
  const transitHours = distanceKm / Math.max(avgSpeed, 20);
  // Add 1.5 hours buffer for loading / unloading
  return Math.round((transitHours + 1.5) * 10) / 10;
}
