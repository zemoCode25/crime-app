import type { RiskLevel } from '@/server/queries/bigquery';

export type TransportMode = 'walking' | 'cycling' | 'driving';

export interface RoutePoint {
  lat: number;
  lng: number;
  address?: string;
}

// Transport mode configuration
export const TRANSPORT_MODE_CONFIG: Record<
  TransportMode,
  { label: string; icon: string; speedLabel: string }
> = {
  walking: { label: 'Walking', icon: 'walking', speedLabel: 'walk' },
  cycling: { label: 'Cycling', icon: 'bike', speedLabel: 'bike' },
  driving: { label: 'Driving', icon: 'car', speedLabel: 'drive' },
};

export interface RouteSegment {
  startIndex: number;
  endIndex: number;
  coordinates: [number, number][]; // [lng, lat] pairs
  riskLevel: RiskLevel;
  crimeCount: number;
}

export interface RouteOverallAssessment {
  riskLevel: RiskLevel;
  totalCrimeCount: number;
  highRiskSegments: number;
  mediumRiskSegments: number;
  lowRiskSegments: number;
  safetyScore: number; // 0-100
  recommendations: string[];
  distance: number; // meters
  duration: number; // seconds
}

export interface RouteAssessmentResult {
  success: boolean;
  transportMode: TransportMode;
  route: {
    geometry: GeoJSON.LineString;
    distance: number;
    duration: number;
    segments: RouteSegment[];
  };
  overallAssessment: RouteOverallAssessment;
}

// API request/response types
export interface RouteAssessmentRequest {
  coordinates: [number, number][]; // [lng, lat] pairs
  filters?: {
    crimeTypeIds?: number[];
    statusFilters?: string[];
    barangayFilters?: string[];
    dateFrom?: string;
    dateTo?: string;
  };
}

export interface RoutePointAssessment {
  index: number;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  crimeCount: number;
}

export interface RouteAssessmentResponse {
  success: boolean;
  segments: RouteSegment[];
  overallAssessment: RouteOverallAssessment;
  error?: string;
}

// Risk level color mapping for route visualization
export const ROUTE_RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#22c55e',        // green-500
  LOW_MEDIUM: '#84cc16', // lime-500
  MEDIUM: '#eab308',     // yellow-500
  MEDIUM_HIGH: '#f97316', // orange-500
  HIGH: '#ef4444',       // red-500
};
