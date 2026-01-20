import { NextRequest, NextResponse } from 'next/server';
import { getRouteAssessment, RiskLevel, RoutePointAssessment } from '@/server/queries/bigquery';
import type { RouteSegment, RouteOverallAssessment } from '@/types/route-assessment';
import { BARANGAY_OPTIONS } from '@/constants/crime-case';

// Safety recommendations based on route characteristics
function generateRouteRecommendations(
  segments: RouteSegment[],
  overallRisk: RiskLevel
): string[] {
  const recommendations: string[] = [];

  const highRiskCount = segments.filter(s => s.riskLevel === 'HIGH').length;
  const mediumHighCount = segments.filter(s => s.riskLevel === 'MEDIUM_HIGH').length;

  if (overallRisk === 'HIGH' || overallRisk === 'MEDIUM_HIGH') {
    recommendations.push('Consider traveling during daylight hours for increased safety');
  }

  if (highRiskCount > 0) {
    recommendations.push(`Route passes through ${highRiskCount} high-risk area${highRiskCount > 1 ? 's' : ''} - stay alert`);
  }

  if (mediumHighCount > 0) {
    recommendations.push('Keep valuables secure and be aware of your surroundings');
  }

  if (overallRisk === 'LOW' || overallRisk === 'LOW_MEDIUM') {
    recommendations.push('Route appears relatively safe based on recent crime data');
  }

  if (segments.length > 0) {
    recommendations.push('Stay on well-lit main roads when possible');
  }

  return recommendations.slice(0, 4); // Limit to 4 recommendations
}

// Group consecutive points with same risk level into segments
function groupIntoSegments(
  assessments: RoutePointAssessment[],
  routeCoordinates: [number, number][]
): RouteSegment[] {
  if (assessments.length === 0) return [];

  const segments: RouteSegment[] = [];
  let currentSegment: RouteSegment = {
    startIndex: 0,
    endIndex: 0,
    coordinates: [routeCoordinates[0]],
    riskLevel: assessments[0].riskLevel,
    crimeCount: assessments[0].crimeCount,
  };

  for (let i = 1; i < assessments.length; i++) {
    if (assessments[i].riskLevel === currentSegment.riskLevel) {
      // Continue current segment
      currentSegment.endIndex = i;
      currentSegment.coordinates.push(routeCoordinates[i]);
      currentSegment.crimeCount += assessments[i].crimeCount;
    } else {
      // Start new segment
      segments.push(currentSegment);
      currentSegment = {
        startIndex: i,
        endIndex: i,
        coordinates: [routeCoordinates[i]],
        riskLevel: assessments[i].riskLevel,
        crimeCount: assessments[i].crimeCount,
      };
    }
  }

  segments.push(currentSegment);
  return segments;
}

// Calculate safety score (0-100)
function calculateSafetyScore(assessments: RoutePointAssessment[]): number {
  if (assessments.length === 0) return 100;

  const weights: Record<RiskLevel, number> = {
    LOW: 100,
    LOW_MEDIUM: 80,
    MEDIUM: 60,
    MEDIUM_HIGH: 40,
    HIGH: 20,
  };

  const totalScore = assessments.reduce(
    (sum, a) => sum + weights[a.riskLevel],
    0
  );

  return Math.round(totalScore / assessments.length);
}

// Determine overall risk level from safety score
function getOverallRiskLevel(safetyScore: number): RiskLevel {
  if (safetyScore >= 80) return 'LOW';
  if (safetyScore >= 65) return 'LOW_MEDIUM';
  if (safetyScore >= 50) return 'MEDIUM';
  if (safetyScore >= 35) return 'MEDIUM_HIGH';
  return 'HIGH';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { coordinates, filters } = body as {
      coordinates: [number, number][];
      filters?: {
        crimeTypeIds?: number[];
        statusFilters?: string[];
        barangayFilters?: string[];
        dateFrom?: string;
        dateTo?: string;
      };
    };

    if (filters?.barangayFilters?.length) {
      const mappedIds = filters.barangayFilters
        .map((value) => {
          const trimmed = value.trim();
          const numeric = Number(trimmed);
          if (!Number.isNaN(numeric)) {
            return numeric;
          }
          const found = BARANGAY_OPTIONS.find(
            (option) => option.value.toLowerCase() === trimmed.toLowerCase()
          );
          return found?.id;
        })
        .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id));

      if (mappedIds.length > 0) {
        filters.barangayFilters = mappedIds.map(String);
      } else {
        delete filters.barangayFilters;
      }
    }

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 coordinates are required' },
        { status: 400 }
      );
    }

    console.log(`🛤️ Route assessment for ${coordinates.length} points`);

    // Get risk assessment for all points
    const { assessments, routeCrimeCount } = await getRouteAssessment({
      coordinates,
      filters,
    });

    // Group into segments
    const segments = groupIntoSegments(assessments, coordinates);

    // Calculate overall metrics
    const safetyScore = calculateSafetyScore(assessments);
    const overallRiskLevel = getOverallRiskLevel(safetyScore);
    const totalCrimeCount = assessments.reduce((sum, a) => sum + a.crimeCount, 0);

    const highRiskSegments = segments.filter(s =>
      s.riskLevel === 'HIGH' || s.riskLevel === 'MEDIUM_HIGH'
    ).length;
    const mediumRiskSegments = segments.filter(s =>
      s.riskLevel === 'MEDIUM'
    ).length;
    const lowRiskSegments = segments.filter(s =>
      s.riskLevel === 'LOW' || s.riskLevel === 'LOW_MEDIUM'
    ).length;

    const recommendations = generateRouteRecommendations(segments, overallRiskLevel);

    const overallAssessment: RouteOverallAssessment = {
      riskLevel: overallRiskLevel,
      totalCrimeCount,
      routeCrimeCount,
      highRiskSegments,
      mediumRiskSegments,
      lowRiskSegments,
      safetyScore,
      recommendations,
      distance: 0, // Will be set by frontend from Mapbox response
      duration: 0, // Will be set by frontend from Mapbox response
    };

    console.log(`✅ Route assessment: ${overallRiskLevel} (score: ${safetyScore}, ${segments.length} segments)`);

    return NextResponse.json({
      success: true,
      segments,
      overallAssessment,
    });

  } catch (error) {
    console.error('❌ Error in route assessment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assess route',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
