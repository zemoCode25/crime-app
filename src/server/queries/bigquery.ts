import { bigquery } from "@/lib/bigquery";

export async function getCrimeHotspots(days: number = 30) {
  const query = `
    SELECT 
      latitude,
      longitude,
      crime_location,
      landmark,
      COUNT(*) as incident_count,
      ARRAY_AGG(DISTINCT crime_type_name) as crime_types,
      MAX(incident_datetime) as last_incident
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.crime_analytics.crime_cases\`
    WHERE 
      incident_datetime >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
      AND visibility = 'public'
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
    GROUP BY latitude, longitude, crime_location, landmark
    HAVING COUNT(*) >= 3
    ORDER BY incident_count DESC
    LIMIT 20
  `;

  const [rows] = await bigquery.query({
    query,
    params: { days },
  });

  return rows;
}

export async function getCrimeTrends(months: number = 6) {
  const query = `
    SELECT 
      incident_month,
      incident_year,
      crime_type_name,
      COUNT(*) as count
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.crime_analytics.crime_cases\`
    WHERE 
      incident_datetime >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @months MONTH)
      AND visibility = 'public'
    GROUP BY incident_month, incident_year, crime_type_name
    ORDER BY incident_year DESC, incident_month DESC, count DESC
  `;

  const [rows] = await bigquery.query({
    query,
    params: { months },
  });

  return rows;
}

export async function getTimePatterns() {
  const query = `
    SELECT 
      incident_hour,
      incident_day_of_week,
      COUNT(*) as incident_count,
      ARRAY_AGG(DISTINCT crime_type_name LIMIT 5) as common_crimes
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.crime_analytics.crime_cases\`
    WHERE 
      incident_datetime >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
      AND visibility = 'public'
    GROUP BY incident_hour, incident_day_of_week
    ORDER BY incident_count DESC
  `;

  const [rows] = await bigquery.query({ query });
  return rows;
}

export async function predictHighRiskAreas() {
  const query = `
    WITH recent_crimes AS (
      SELECT 
        latitude,
        longitude,
        crime_location,
        COUNT(*) as recent_count,
        COUNT(*) / NULLIF(COUNT(DISTINCT DATE(incident_datetime)), 0) as daily_avg
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.crime_analytics.crime_cases\`
      WHERE 
        incident_datetime >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        AND visibility = 'public'
      GROUP BY latitude, longitude, crime_location
    )
    SELECT 
      latitude,
      longitude,
      crime_location,
      recent_count,
      daily_avg,
      CASE 
        WHEN daily_avg >= 1.0 THEN 'CRITICAL'
        WHEN daily_avg >= 0.5 THEN 'HIGH'
        WHEN daily_avg >= 0.2 THEN 'MEDIUM'
        ELSE 'LOW'
      END as risk_level
    FROM recent_crimes
    WHERE recent_count >= 3
    ORDER BY daily_avg DESC
    LIMIT 50
  `;

  const [rows] = await bigquery.query({ query });
  return rows;
}