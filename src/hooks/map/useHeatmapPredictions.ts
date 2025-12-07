import { useQuery } from '@tanstack/react-query';

export interface HeatmapPrediction {
  latitude: number;
  longitude: number;
  predicted_is_high_risk: boolean;
  risk_probability: number;
  historical_crime_count: number;
}

export interface HeatmapGeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    latitude: number;
    longitude: number;
    isHighRisk: boolean;
    riskProbability: number;
    historicalCrimeCount: number;
    riskLevel: 'high' | 'medium' | 'low';
    gridCell: string;
  };
}

export interface HeatmapGeoJSON {
  type: 'FeatureCollection';
  features: HeatmapGeoJSONFeature[];
  metadata?: {
    generatedAt: string;
    parameters: {
      hour: number;
      dayOfWeek: string;
      month: number;
      minRiskProbability: number;
    };
    statistics: {
      totalFeatures: number;
      highRisk: number;
      mediumRisk: number;
      lowRisk: number;
    };
  };
}

interface UseHeatmapPredictionsOptions {
  hour?: number;
  day?: string;
  month?: number;
  minRisk?: number;
  enabled?: boolean;
}

async function fetchHeatmapPredictions(
  hour: number,
  day: string,
  month: number,
  minRisk: number
): Promise<HeatmapGeoJSON> {
  const params = new URLSearchParams({
    hour: hour.toString(),
    day,
    month: month.toString(),
    minRisk: minRisk.toString(),
  });

  const response = await fetch(`/api/bigquery/geojson?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch heatmap: ${response.statusText}`);
  }

  return response.json();
}

export function useHeatmapPredictions(options: UseHeatmapPredictionsOptions = {}) {
  const {
    hour = new Date().getHours(),
    day = new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    month = new Date().getMonth() + 1,
    minRisk = 0.5,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ['heatmap-predictions', hour, day, month, minRisk],
    queryFn: () => fetchHeatmapPredictions(hour, day, month, minRisk),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
