import { useQuery } from '@tanstack/react-query';
import type { RiskAssessmentData, RiskLevel } from '@/app/(main)/crime/map/Components/MapSetting';

export interface RiskAssessmentFilters {
  crimeTypeIds?: number[];
  statusFilters?: string[];
  barangayFilters?: string[];
  dateFrom?: string;
  dateTo?: string;
}

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
  filters?: RiskAssessmentFilters;
  enabled?: boolean;
}

async function fetchRiskAssessment(
  lat: number,
  lng: number,
  filters?: RiskAssessmentFilters
): Promise<RiskAssessmentData> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
  });

  // Add filter params if present
  if (filters?.crimeTypeIds?.length) {
    params.set('crimeTypeIds', filters.crimeTypeIds.join(','));
  }
  if (filters?.statusFilters?.length) {
    params.set('statusFilters', filters.statusFilters.join(','));
  }
  if (filters?.barangayFilters?.length) {
    params.set('barangayFilters', filters.barangayFilters.join(','));
  }
  if (filters?.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }
  if (filters?.dateTo) {
    params.set('dateTo', filters.dateTo);
  }

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
    filters,
    enabled = true,
  } = options;

  const isValidCoordinates = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  // Create a stable key for filters
  const filtersKey = filters ? JSON.stringify(filters) : 'no-filters';

  return useQuery({
    queryKey: ['risk-assessment', lat, lng, filtersKey],
    queryFn: () => fetchRiskAssessment(lat!, lng!, filters),
    enabled: enabled && isValidCoordinates,
    staleTime: 30 * 1000, // 30 seconds - fresher data for location changes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on failure
  });
}
