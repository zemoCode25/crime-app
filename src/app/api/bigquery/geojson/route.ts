import { NextRequest, NextResponse } from 'next/server';
import { bigquery } from '@/lib/bigquery';
import { predictionsToGeoJSON, filterByRiskLevel, HeatmapPrediction } from '@/lib/geojson';

// Muntinlupa City bounds
const MUNTINLUPA_BOUNDS = {
  latMin: 14.370,
  latMax: 14.430,
  lngMin: 121.030,
  lngMax: 121.065,
  gridSize: 0.001, // ~110m grid cells (3 decimal precision)
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get time parameters (default to current time)
    const hour = parseInt(searchParams.get('hour') || new Date().getHours().toString());
    const dayOfWeek = searchParams.get('day') || new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // Filter parameters
    const minRiskProbability = parseFloat(searchParams.get('minRisk') || '0.5');

    console.log(`🗺️  Fetching GeoJSON heatmap for: ${dayOfWeek} ${hour}:00, Month ${month}`);
    console.log(`   Filter: Min risk probability >= ${minRiskProbability}`);

    // Generate complete grid covering Muntinlupa City and get predictions
    const query = `
      WITH grid AS (
        -- Generate all lat/lng grid cells for Muntinlupa City
        SELECT
          ROUND(lat, 3) as latitude,
          ROUND(lng, 3) as longitude,
          @hour as incident_hour,
          @day as incident_day_of_week,
          @month as incident_month
        FROM
          UNNEST(GENERATE_ARRAY(@latMin, @latMax, @gridSize)) as lat
        CROSS JOIN
          UNNEST(GENERATE_ARRAY(@lngMin, @lngMax, @gridSize)) as lng
      ),
      predictions AS (
        -- Get ML predictions for entire grid
        SELECT
          latitude,
          longitude,
          predicted_is_high_risk,
          predicted_is_high_risk_probs[OFFSET(0)].prob as risk_probability
        FROM ML.PREDICT(
          MODEL \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.crime_analytics.crime_prediction_model\`,
          TABLE grid
        )
      )
      -- Return predictions with crime counts
      SELECT
        p.latitude,
        p.longitude,
        p.predicted_is_high_risk,
        p.risk_probability,
        COALESCE(c.crime_count, 0) as historical_crime_count
      FROM predictions p
      LEFT JOIN (
        SELECT
          ROUND(latitude, 3) as lat_grid,
          ROUND(longitude, 3) as lng_grid,
          COUNT(*) as crime_count
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.crime_analytics.crime_cases\`
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        GROUP BY lat_grid, lng_grid
      ) c ON p.latitude = c.lat_grid AND p.longitude = c.lng_grid
      WHERE p.predicted_is_high_risk = true OR c.crime_count > 0
      ORDER BY p.risk_probability DESC;
    `;

    const [rows] = await bigquery.query({
      query,
      params: {
        hour,
        day: dayOfWeek,
        month,
        latMin: MUNTINLUPA_BOUNDS.latMin,
        latMax: MUNTINLUPA_BOUNDS.latMax,
        lngMin: MUNTINLUPA_BOUNDS.lngMin,
        lngMax: MUNTINLUPA_BOUNDS.lngMax,
        gridSize: MUNTINLUPA_BOUNDS.gridSize,
      },
    });

    // Filter by minimum risk probability
    const filteredPredictions = filterByRiskLevel(
      rows as HeatmapPrediction[],
      minRiskProbability
    );

    // Convert to GeoJSON
    const geojson = predictionsToGeoJSON(filteredPredictions);

    console.log(`✅ Generated GeoJSON with ${geojson.features.length} features`);

    return NextResponse.json({
      ...geojson,
      metadata: {
        generatedAt: new Date().toISOString(),
        parameters: {
          hour,
          dayOfWeek,
          month,
          minRiskProbability,
        },
        statistics: {
          totalFeatures: geojson.features.length,
          highRisk: geojson.features.filter((f) => f.properties.riskLevel === 'high').length,
          mediumRisk: geojson.features.filter((f) => f.properties.riskLevel === 'medium').length,
          lowRisk: geojson.features.filter((f) => f.properties.riskLevel === 'low').length,
        },
        gridCoverage: {
          latRange: [MUNTINLUPA_BOUNDS.latMin, MUNTINLUPA_BOUNDS.latMax],
          lngRange: [MUNTINLUPA_BOUNDS.lngMin, MUNTINLUPA_BOUNDS.lngMax],
          gridSize: MUNTINLUPA_BOUNDS.gridSize,
          cellSizeMeters: '~110m',
        },
      },
    });

  } catch (error) {
    console.error('❌ Error generating GeoJSON heatmap:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate GeoJSON heatmap',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
