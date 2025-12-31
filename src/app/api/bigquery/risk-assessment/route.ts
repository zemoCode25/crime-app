import { NextRequest, NextResponse } from 'next/server';
import { getRiskAssessment, RiskLevel } from '@/server/queries/bigquery';

// Safety tips based on crime types
const SAFETY_TIPS: Record<string, string> = {
  'Theft': 'Keep valuables secure and be aware of your surroundings',
  'Physical Injury': 'Avoid confrontations and stay in well-lit areas',
  'Domestic Violence': 'Community support resources are available - contact local authorities',
  'Drug-related': 'Report suspicious activity to authorities',
  'Vandalism': 'Report property damage promptly to local authorities',
  'Trespassing': 'Secure property boundaries and report unauthorized access',
  'Others': 'Stay vigilant and report any suspicious activity',
};

// General tips based on risk level
const RISK_LEVEL_TIPS: Record<RiskLevel, string> = {
  HIGH: 'Exercise extreme caution in this area',
  MEDIUM_HIGH: 'Be extra vigilant when traveling through this area',
  MEDIUM: 'Take standard safety precautions',
  LOW_MEDIUM: 'Generally safe, but remain aware of surroundings',
  LOW: 'Low crime activity reported in this area',
};

function generateSafetyTips(
  riskLevel: RiskLevel,
  crimeTypes: { type: string; percentage: number }[]
): string[] {
  const tips: string[] = [];

  // Add risk level general tip
  tips.push(RISK_LEVEL_TIPS[riskLevel]);

  // Add tips for top crime types (those with >15% of crimes)
  for (const crime of crimeTypes) {
    if (crime.percentage >= 15 && SAFETY_TIPS[crime.type]) {
      tips.push(SAFETY_TIPS[crime.type]);
    }
    // Limit to 3 crime-specific tips
    if (tips.length >= 4) break;
  }

  return tips;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get required coordinates
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: lat and lng' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates: lat and lng must be numbers' },
        { status: 400 }
      );
    }

    // Get optional time parameters (default to current time)
    const now = new Date();
    const hour = parseInt(searchParams.get('hour') || now.getHours().toString());
    const dayOfWeek = searchParams.get('day') || now.toLocaleDateString('en-US', { weekday: 'long' });
    const month = parseInt(searchParams.get('month') || (now.getMonth() + 1).toString());

    console.log(`📍 Risk assessment for: (${lat}, ${lng}) at ${dayOfWeek} ${hour}:00, Month ${month}`);

    // Get risk assessment from BigQuery
    const assessment = await getRiskAssessment(lat, lng, hour, dayOfWeek, month);

    // Generate safety tips
    const safetyTips = generateSafetyTips(
      assessment.riskLevel,
      assessment.perimeter.crimeTypes
    );

    console.log(`✅ Risk level: ${assessment.riskLevel} (${assessment.crimeCount} crimes in perimeter)`);

    return NextResponse.json({
      success: true,
      riskLevel: assessment.riskLevel,
      crimeCount: assessment.crimeCount,
      perimeter: {
        ...assessment.perimeter,
        safetyTips,
      },
      metadata: {
        coordinates: { lat, lng },
        gridCell: {
          lat: Math.round(lat * 1000) / 1000,
          lng: Math.round(lng * 1000) / 1000,
        },
      },
    });

  } catch (error) {
    console.error('❌ Error in risk assessment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assess risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
