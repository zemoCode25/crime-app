import { useMutation } from '@tanstack/react-query';
import * as turf from '@turf/turf';
import type {
  RoutePoint,
  RouteAssessmentResult,
  RouteAssessmentResponse,
  RouteSegment,
  TransportMode,
} from '@/types/route-assessment';
import type { RiskAssessmentFilters } from './useRiskAssessment';

interface MapboxRoute {
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
}

interface UseRouteAssessmentOptions {
  filters?: RiskAssessmentFilters;
}

// Mapbox profile mapping
const MAPBOX_PROFILES: Record<TransportMode, string> = {
  walking: 'mapbox/walking',
  cycling: 'mapbox/cycling',
  driving: 'mapbox/driving',
};

// Fetch route from Mapbox Directions API
async function fetchMapboxRoute(
  pointA: RoutePoint,
  pointB: RoutePoint,
  transportMode: TransportMode = 'walking'
): Promise<MapboxRoute> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Mapbox access token not configured');
  }

  const profile = MAPBOX_PROFILES[transportMode];
  const url = `https://api.mapbox.com/directions/v5/${profile}/${pointA.lng},${pointA.lat};${pointB.lng},${pointB.lat}?geometries=geojson&overview=full&access_token=${accessToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error(data.message || 'No route found between these points');
  }

  return {
    geometry: data.routes[0].geometry,
    distance: data.routes[0].distance,
    duration: data.routes[0].duration,
  };
}

// Sample points along the route at regular intervals using turf.js
function sampleRoutePoints(
  geometry: GeoJSON.LineString,
  intervalMeters: number = 100
): [number, number][] {
  const coordinates = geometry.coordinates as [number, number][];

  if (coordinates.length <= 2) {
    return coordinates;
  }

  // Create a LineString feature for turf operations
  const line = turf.lineString(coordinates);

  // Get the total length of the route in kilometers
  const totalLength = turf.length(line, { units: 'meters' });

  // Calculate the number of sample points needed
  const numSamples = Math.ceil(totalLength / intervalMeters);

  // Limit to max 100 points for performance
  const maxSamples = Math.min(numSamples, 100);
  const actualInterval = totalLength / maxSamples;

  const sampledPoints: [number, number][] = [];

  // Sample points along the route at regular intervals
  for (let i = 0; i <= maxSamples; i++) {
    const distance = i * actualInterval;
    const point = turf.along(line, distance, { units: 'meters' });
    const coords = point.geometry.coordinates as [number, number];
    sampledPoints.push(coords);
  }

  // Ensure the last point is the actual end of the route
  const lastPoint = coordinates[coordinates.length - 1];
  const lastSampled = sampledPoints[sampledPoints.length - 1];

  if (
    Math.abs(lastSampled[0] - lastPoint[0]) > 0.00001 ||
    Math.abs(lastSampled[1] - lastPoint[1]) > 0.00001
  ) {
    sampledPoints[sampledPoints.length - 1] = lastPoint;
  }

  return sampledPoints;
}

// Assess route safety via backend API
async function assessRouteSafety(
  coordinates: [number, number][],
  filters?: RiskAssessmentFilters
): Promise<RouteAssessmentResponse> {
  const response = await fetch('/api/bigquery/route-assessment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates,
      filters: filters
        ? {
            crimeTypeIds: filters.crimeTypeIds,
            statusFilters: filters.statusFilters,
            barangayFilters: filters.barangayFilters,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
          }
        : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to assess route: ${response.statusText}`);
  }

  const data: RouteAssessmentResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Route assessment failed');
  }

  return data;
}

// Expand segments to include all route coordinates (not just sampled points)
function expandSegmentsToFullRoute(
  segments: RouteSegment[],
  fullRouteCoordinates: [number, number][],
  sampledCoordinates: [number, number][]
): RouteSegment[] {
  if (segments.length === 0 || fullRouteCoordinates.length === 0) {
    return segments;
  }

  // Create a line from full route for finding nearest points
  const line = turf.lineString(fullRouteCoordinates);

  // For each segment, find the corresponding range in the full route
  // and include all intermediate coordinates
  return segments.map((segment) => {
    const startSampleCoord = sampledCoordinates[segment.startIndex];
    const endSampleCoord = sampledCoordinates[segment.endIndex];

    // Use turf.nearestPointOnLine to find the closest points on the full route
    const startPoint = turf.point(startSampleCoord);
    const endPoint = turf.point(endSampleCoord);

    const nearestStart = turf.nearestPointOnLine(line, startPoint);
    const nearestEnd = turf.nearestPointOnLine(line, endPoint);

    // Get indices (nearestPointOnLine returns index in properties)
    let startFullIdx = nearestStart.properties.index ?? 0;
    let endFullIdx = nearestEnd.properties.index ?? fullRouteCoordinates.length - 1;

    // Ensure proper order
    if (startFullIdx > endFullIdx) {
      [startFullIdx, endFullIdx] = [endFullIdx, startFullIdx];
    }

    return {
      ...segment,
      startIndex: startFullIdx,
      endIndex: endFullIdx,
      coordinates: fullRouteCoordinates.slice(startFullIdx, endFullIdx + 1),
    };
  });
}

// Main function to calculate route and assess safety
async function calculateRouteAssessment(
  pointA: RoutePoint,
  pointB: RoutePoint,
  transportMode: TransportMode = 'walking',
  filters?: RiskAssessmentFilters
): Promise<RouteAssessmentResult> {
  // Step 1: Get route from Mapbox
  const mapboxRoute = await fetchMapboxRoute(pointA, pointB, transportMode);

  // Step 2: Sample points along the route
  const fullRouteCoordinates = mapboxRoute.geometry.coordinates as [number, number][];
  const sampledPoints = sampleRoutePoints(mapboxRoute.geometry);

  // Step 3: Assess safety for sampled points
  const assessment = await assessRouteSafety(sampledPoints, filters);

  // Step 4: Expand segments to include full route coordinates
  const expandedSegments = expandSegmentsToFullRoute(
    assessment.segments,
    fullRouteCoordinates,
    sampledPoints
  );

  // Step 5: Build final result
  return {
    success: true,
    transportMode,
    route: {
      geometry: mapboxRoute.geometry,
      distance: mapboxRoute.distance,
      duration: mapboxRoute.duration,
      segments: expandedSegments,
    },
    overallAssessment: {
      ...assessment.overallAssessment,
      distance: mapboxRoute.distance,
      duration: mapboxRoute.duration,
    },
  };
}

export function useRouteAssessment(options: UseRouteAssessmentOptions = {}) {
  const { filters } = options;

  return useMutation({
    mutationKey: ['route-assessment'],
    mutationFn: ({
      pointA,
      pointB,
      transportMode = 'walking',
    }: {
      pointA: RoutePoint;
      pointB: RoutePoint;
      transportMode?: TransportMode;
    }) => calculateRouteAssessment(pointA, pointB, transportMode, filters),
  });
}
