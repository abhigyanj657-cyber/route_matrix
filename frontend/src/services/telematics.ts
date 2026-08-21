// Telematics and GPS Route Animation Service

export interface GPSPoint {
  lat: number;
  lng: number;
  speedKmH: number;
  heading: number; // degrees
  waypointIndex: number;
  progressPct: number;
  currentMilestone: string;
  odometerKm: number;
}

// Calculate bearing/heading between two coords in degrees
export function calculateHeading(from: [number, number], to: [number, number]): number {
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0] * Math.PI) / 180;
  const dLng = ((to[1] - from[1]) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Linear interpolation between two coordinates
export function interpolateCoords(
  start: [number, number],
  end: [number, number],
  fraction: number
): [number, number] {
  return [
    start[0] + (end[0] - start[0]) * fraction,
    start[1] + (end[1] - start[1]) * fraction,
  ];
}

// Generate interpolated sub-points for smooth simulation
export function generateRoutePoints(
  waypoints: Array<{ location_coords: [number, number]; stop_name: string; action: string }>,
  stepsPerLeg: number = 20
): Array<{
  coord: [number, number];
  waypointIndex: number;
  legProgress: number;
  overallProgress: number;
  stopName: string;
  action: string;
  heading: number;
}> {
  if (!waypoints || waypoints.length < 2) return [];

  const points: Array<{
    coord: [number, number];
    waypointIndex: number;
    legProgress: number;
    overallProgress: number;
    stopName: string;
    action: string;
    heading: number;
  }> = [];

  const totalLegs = waypoints.length - 1;
  const totalSteps = totalLegs * stepsPerLeg;

  for (let i = 0; i < totalLegs; i++) {
    const startWp = waypoints[i];
    const endWp = waypoints[i + 1];
    const heading = calculateHeading(startWp.location_coords, endWp.location_coords);

    for (let step = 0; step < stepsPerLeg; step++) {
      const legFraction = step / stepsPerLeg;
      const coord = interpolateCoords(startWp.location_coords, endWp.location_coords, legFraction);
      const overallStep = i * stepsPerLeg + step;
      const overallProgress = Math.round((overallStep / totalSteps) * 100);

      points.push({
        coord,
        waypointIndex: i,
        legProgress: Math.round(legFraction * 100),
        overallProgress,
        stopName: endWp.stop_name,
        action: endWp.action,
        heading,
      });
    }
  }

  // Add final point
  const lastWp = waypoints[waypoints.length - 1];
  const prevWp = waypoints[waypoints.length - 2];
  points.push({
    coord: lastWp.location_coords,
    waypointIndex: totalLegs,
    legProgress: 100,
    overallProgress: 100,
    stopName: lastWp.stop_name,
    action: lastWp.action,
    heading: calculateHeading(prevWp.location_coords, lastWp.location_coords),
  });

  return points;
}
