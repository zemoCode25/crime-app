import { useQuery } from '@tanstack/react-query';
import type { RiskAssessmentData, RiskLevel } from '@/app/(main)/crime/map/Components/MapSetting';

export interface RiskAssessmentResponse {
  success: boolean;
  riskLevel: RiskLevel;
  crimeCount: number;
  perimeter: {
    radius: number;
    crimeTypes: {
      type: string;
      count: number;
      percentage: number;
    }[];
    totalCrimes: number;
    safetyTips: string[];
  };
  metadata: {
    coordinates: { lat: number; lng: number };
    gridCell: { lat: number; lng: number };
  };
}

interface UseRiskAssessmentOptions {
  lat: number | null;
  lng: number | null;
  hour?: number;
  day?: string;
  month?: number;
  enabled?: boolean;
}

async function fetchRiskAssessment(
  lat: number,
  lng: number,
  hour: number,
  day: string,
  month: number
): Promise<RiskAssessmentData> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    hour: hour.toString(),
    day,
    month: month.toString(),
  });

  const response = await fetch(`/api/bigquery/risk-assessment?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch risk assessment: ${response.statusText}`);
  }

  const data: RiskAssessmentResponse = await response.json();

  if (!data.success) {
    throw new Error('Risk assessment failed');
  }

  return {
    riskLevel: data.riskLevel,
    crimeCount: data.crimeCount,
    perimeter: data.perimeter,
  };
}

export function useRiskAssessment(options: UseRiskAssessmentOptions) {
  const {
    lat,
    lng,
    hour = new Date().getHours(),
    day = new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    month = new Date().getMonth() + 1,
    enabled = true,
  } = options;

  const isValidCoordinates = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  return useQuery({
    queryKey: ['risk-assessment', lat, lng, hour, day, month],
    queryFn: () => fetchRiskAssessment(lat!, lng!, hour, day, month),
    enabled: enabled && isValidCoordinates,
    staleTime: 30 * 1000, // 30 seconds - fresher data for location changes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on failure
  });
}
