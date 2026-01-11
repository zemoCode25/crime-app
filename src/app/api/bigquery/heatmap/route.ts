import { NextRequest, NextResponse } from 'next/server';
import { bigquery } from '@/lib/bigquery';

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

    console.log(`🗺️  Fetching heatmap predictions for: ${dayOfWeek} ${hour}:00, Month ${month}`);

    // Generate complete grid covering Muntinlupa City and get predictions
    const query = `
      WITH grid AS (
        -- Generate all lat/lng grid cells for Muntinlupa City
        -- Grid size: 0.001 degrees (~110m) covering entire city
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
      -- Return all predictions with crime counts from historical data
      SELECT
        p.latitude,
        p.longitude,
        p.predicted_is_high_risk,
        p.risk_probability,
        COALESCE(c.crime_count, 0) as historical_crime_count
      FROM predictions p
      LEFT JOIN (
        -- Get actual crime counts per grid cell for reference
        SELECT
          ROUND(latitude, 3) as lat_grid,
          ROUND(longitude, 3) as lng_grid,
          COUNT(*) as crime_count
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.crime_analytics.crime_cases\`
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
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

    console.log(`✅ Retrieved ${rows.length} high-risk predictions`);

    // Calculate statistics
    const highRiskCount = rows.filter((r: any) => r.predicted_is_high_risk).length;
    const avgRiskProbability = rows.reduce((sum: number, r: any) => sum + (r.risk_probability || 0), 0) / rows.length;

    return NextResponse.json({
      success: true,
      predictions: rows,
      metadata: {
        hour,
        dayOfWeek,
        month,
        totalGridCells: rows.length,
        highRiskCells: highRiskCount,
        averageRiskProbability: avgRiskProbability,
        gridCoverage: {
          latRange: [MUNTINLUPA_BOUNDS.latMin, MUNTINLUPA_BOUNDS.latMax],
          lngRange: [MUNTINLUPA_BOUNDS.lngMin, MUNTINLUPA_BOUNDS.lngMax],
          gridSize: MUNTINLUPA_BOUNDS.gridSize,
          cellSizeMeters: '~110m',
        },
      },
    });

  } catch (error) {
    console.error('❌ Error fetching heatmap predictions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch predictions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}