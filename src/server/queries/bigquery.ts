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

// Risk level thresholds based on crime count (matches training data thresholds)
const CRIME_COUNT_THRESHOLDS = {
  HIGH: 8,        // >= 8 crimes
  MEDIUM_HIGH: 5, // >= 5 crimes
  MEDIUM: 3,      // >= 3 crimes
  LOW_MEDIUM: 2,  // == 2 crimes
} as const;

export type RiskLevel = 'HIGH' | 'MEDIUM_HIGH' | 'MEDIUM' | 'LOW_MEDIUM' | 'LOW';

export interface CrimeTypeCount {
  type: string;
  count: number;
  percentage: number;
}

export interface RiskAssessmentResult {
  riskLevel: RiskLevel;
  crimeCount: number;
  perimeter: {
    radius: number;
    crimeTypes: CrimeTypeCount[];
    totalCrimes: number;
  };
}

function getRiskLevelFromCrimeCount(crimeCount: number): RiskLevel {
  if (crimeCount >= CRIME_COUNT_THRESHOLDS.HIGH) return 'HIGH';
  if (crimeCount >= CRIME_COUNT_THRESHOLDS.MEDIUM_HIGH) return 'MEDIUM_HIGH';
  if (crimeCount >= CRIME_COUNT_THRESHOLDS.MEDIUM) return 'MEDIUM';
  if (crimeCount >= CRIME_COUNT_THRESHOLDS.LOW_MEDIUM) return 'LOW_MEDIUM';
  return 'LOW';
}

export interface RiskAssessmentFilters {
  crimeTypeIds?: number[];
  statusFilters?: string[];
  barangayFilters?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export async function getRiskAssessment(
  lat: number,
  lng: number,
  filters?: RiskAssessmentFilters
): Promise<RiskAssessmentResult> {
  // Build dynamic WHERE conditions based on filters
  const conditions: string[] = [
    'ABS(latitude - @lat) <= 0.0027', // 300m radius (~0.0027 degrees)
    'ABS(longitude - @lng) <= 0.0027',
    "visibility = 'public'",
    'latitude IS NOT NULL',
    'longitude IS NOT NULL',
  ];

  const params: Record<string, unknown> = { lat, lng };

  // Add filter conditions
  if (filters?.crimeTypeIds && filters.crimeTypeIds.length > 0) {
    conditions.push('crime_type_id IN UNNEST(@crimeTypeIds)');
    params.crimeTypeIds = filters.crimeTypeIds;
  }

  if (filters?.statusFilters && filters.statusFilters.length > 0) {
    conditions.push('case_status IN UNNEST(@statusFilters)');
    params.statusFilters = filters.statusFilters;
  }

  if (filters?.barangayFilters && filters.barangayFilters.length > 0) {
    conditions.push('barangay_id IN UNNEST(@barangayFilters)');
    // Convert string IDs to numbers for BigQuery
    params.barangayFilters = filters.barangayFilters.map(Number).filter(n => !isNaN(n));
  }

  if (filters?.dateFrom) {
    conditions.push('incident_datetime >= @dateFrom');
    params.dateFrom = filters.dateFrom;
  }

  if (filters?.dateTo) {
    conditions.push('incident_datetime <= @dateTo');
    params.dateTo = filters.dateTo;
  }

  // Get crime types within 300m radius
  const perimeterQuery = `
    SELECT
      crime_type_name as type,
      COUNT(*) as count
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.crime_analytics.crime_cases\`
    WHERE ${conditions.join('\n      AND ')}
    GROUP BY crime_type_name
    ORDER BY count DESC
  `;

  const [perimeterRows] = await bigquery.query({
    query: perimeterQuery,
    params,
  });

  // Calculate total crimes in perimeter
  const totalCrimes = perimeterRows.reduce(
    (sum: number, row: { count: number }) => sum + row.count,
    0
  );

  // Determine risk level from crime count (matches training thresholds)
  const riskLevel = getRiskLevelFromCrimeCount(totalCrimes);

  // Process crime type breakdown
  const crimeTypes: CrimeTypeCount[] = perimeterRows.map(
    (row: { type: string; count: number }) => ({
      type: row.type,
      count: row.count,
      percentage: totalCrimes > 0 ? Math.round((row.count / totalCrimes) * 100) : 0,
    })
  );

  return {
    riskLevel,
    crimeCount: totalCrimes,
    perimeter: {
      radius: 300,
      crimeTypes,
      totalCrimes,
    },
  };
}