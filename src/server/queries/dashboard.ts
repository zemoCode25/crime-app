import { TypedSupabaseClient } from "@/types/supabase-client";
import type { Database } from "@/server/supabase/database.types";

export type DashboardMetricKey =
  | "totalReportedCrimes"
  | "crimeRate"
  | "underInvestigation"
  | "settledCase"
  | "emergencyReports"
  | "detectedHeatZones";

export interface DashboardTrend {
  value: number;
  percentage: number;
  isPositive: boolean;
  periodLabel: string;
  isSignificant: boolean;
}

export interface DashboardMetricValue {
  value: number;
  trend: DashboardTrend | null;
}

export type DashboardMetricMap = Record<DashboardMetricKey, DashboardMetricValue>;

export interface DashboardMetricsParams {
  startDate?: Date;
  endDate?: Date;
}

interface CountCasesParams {
  startDate?: Date;
  endDate?: Date;
  status?: Database["public"]["Tables"]["crime_case"]["Row"]["case_status"];
}

async function countCases(
  client: TypedSupabaseClient,
  params: CountCasesParams,
): Promise<number> {
  const { startDate, endDate, status } = params;

  let query = client
    .from("crime_case")
    .select("id", { count: "exact", head: true });

  if (status) {
    query = query.eq("case_status", status);
  }

  if (startDate) {
    query = query.gte("report_datetime", startDate.toISOString());
  }

  if (endDate) {
    query = query.lte("report_datetime", endDate.toISOString());
  }

  const { error, count } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

function calculateTrend(
  current: number,
  previous: number,
  positiveDirection: "up" | "down",
  daysInPeriod: number,
): DashboardTrend {
  const change = current - previous;

  let percentage: number;
  if (previous === 0) {
    percentage = current === 0 ? 0 : 100;
  } else {
    percentage = (change / previous) * 100;
  }

  const isPositive =
    positiveDirection === "up" ? change >= 0 : change <= 0;

  // Statistical significance: require at least 5 cases to show meaningful trend
  const isSignificant = current >= 5 || previous >= 5;

  // Generate period label
  const periodLabel = daysInPeriod === 1
    ? "vs. yesterday"
    : `vs. previous ${daysInPeriod} days`;

  return {
    value: change,
    percentage: Number(percentage.toFixed(1)),
    isPositive,
    periodLabel,
    isSignificant,
  };
}

export async function getDashboardMetrics(
  client: TypedSupabaseClient,
  params: DashboardMetricsParams = {},
): Promise<DashboardMetricMap> {
  const { startDate, endDate } = params;

  if (!startDate || !endDate) {
    const [total, underInvestigation, settled] = await Promise.all([
      countCases(client, {}),
      countCases(client, { status: "under investigation" }),
      countCases(client, { status: "case settled" }),
    ]);

    return {
      totalReportedCrimes: {
        value: total,
        trend: null,
      },
      crimeRate: {
        value: 0,
        trend: null,
      },
      underInvestigation: {
        value: underInvestigation,
        trend: null,
      },
      settledCase: {
        value: settled,
        trend: null,
      },
      emergencyReports: {
        value: 0,
        trend: null,
      },
      detectedHeatZones: {
        value: 0,
        trend: null,
      },
    };
  }

  const periodMs = endDate.getTime() - startDate.getTime();
  const safePeriodMs = periodMs > 0 ? periodMs : 24 * 60 * 60 * 1000;

  const previousEnd = new Date(startDate.getTime());
  const previousStart = new Date(startDate.getTime() - safePeriodMs);

  const [
    currentTotal,
    previousTotal,
    currentUnderInvestigation,
    previousUnderInvestigation,
    currentSettled,
    previousSettled,
  ] = await Promise.all([
    countCases(client, { startDate, endDate }),
    countCases(client, { startDate: previousStart, endDate: previousEnd }),
    countCases(client, {
      startDate,
      endDate,
      status: "under investigation",
    }),
    countCases(client, {
      startDate: previousStart,
      endDate: previousEnd,
      status: "under investigation",
    }),
    countCases(client, {
      startDate,
      endDate,
      status: "case settled",
    }),
    countCases(client, {
      startDate: previousStart,
      endDate: previousEnd,
      status: "case settled",
    }),
  ]);

  const daysInPeriod = Math.max(
    1,
    Math.round(safePeriodMs / (24 * 60 * 60 * 1000)),
  );

  const totalTrend = calculateTrend(currentTotal, previousTotal, "down", daysInPeriod);
  const underInvestigationTrend = calculateTrend(
    currentUnderInvestigation,
    previousUnderInvestigation,
    "down",
    daysInPeriod,
  );
  const settledTrend = calculateTrend(
    currentSettled,
    previousSettled,
    "up",
    daysInPeriod,
  );

  const currentCrimeRate = currentTotal / daysInPeriod;
  const previousCrimeRate = previousTotal / daysInPeriod;
  const crimeRateTrend = calculateTrend(
    currentCrimeRate,
    previousCrimeRate,
    "down",
    daysInPeriod,
  );

  return {
    totalReportedCrimes: {
      value: currentTotal,
      trend: totalTrend,
    },
    crimeRate: {
      value: Number(currentCrimeRate.toFixed(2)),
      trend: crimeRateTrend,
    },
    underInvestigation: {
      value: currentUnderInvestigation,
      trend: underInvestigationTrend,
    },
    settledCase: {
      value: currentSettled,
      trend: settledTrend,
    },
    emergencyReports: {
      value: 0,
      trend: null,
    },
    detectedHeatZones: {
      value: 0,
      trend: null,
    },
  };
}

// ==================== CHART DATA QUERIES ====================

export interface TopCrimeType {
  crimeType: number;
  count: number;
  label: string;
}

export interface CrimeTrendPoint {
  date: Date;
  count: number;
  label: string;
}

/**
 * Get the top 5 most prevalent crime types in the given timeframe
 */
export async function getTopCrimeTypes(
  client: TypedSupabaseClient,
  params: DashboardMetricsParams = {},
): Promise<TopCrimeType[]> {
  const { startDate, endDate } = params;

  let query = client
    .from("crime_case")
    .select("crime_type");

  if (startDate) {
    query = query.gte("report_datetime", startDate.toISOString());
  }

  if (endDate) {
    query = query.lte("report_datetime", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Count occurrences of each crime type
  const crimeCounts = new Map<number, number>();
  data?.forEach((record) => {
    if (record.crime_type !== null) {
      const current = crimeCounts.get(record.crime_type) || 0;
      crimeCounts.set(record.crime_type, current + 1);
    }
  });

  // Convert to array and sort by count
  const sortedCrimes = Array.from(crimeCounts.entries())
    .map(([crimeType, count]) => ({ crimeType, count, label: "" }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Fetch crime type labels
  const crimeTypeIds = sortedCrimes.map((c) => c.crimeType);

  if (crimeTypeIds.length === 0) {
    return [];
  }

  const { data: crimeTypeData, error: crimeTypeError } = await client
    .from("crime-type")
    .select("id, label")
    .in("id", crimeTypeIds);

  if (crimeTypeError) {
    throw crimeTypeError;
  }

  // Map labels to crime types
  const labelMap = new Map(crimeTypeData?.map((ct) => [ct.id, ct.label]) || []);

  return sortedCrimes.map((crime) => ({
    ...crime,
    label: labelMap.get(crime.crimeType) || `Crime Type ${crime.crimeType}`,
  }));
}

/**
 * Divide a time range into 7 equal segments and count crimes for each
 */
export async function getCrimeTrendData(
  client: TypedSupabaseClient,
  crimeType: number,
  params: DashboardMetricsParams = {},
): Promise<CrimeTrendPoint[]> {
  const { startDate, endDate } = params;

  if (!startDate || !endDate) {
    return [];
  }

  const totalMs = endDate.getTime() - startDate.getTime();
  const segmentMs = totalMs / 7;

  // Generate 7 time segments
  const segments: { start: Date; end: Date; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const segmentStart = new Date(startDate.getTime() + segmentMs * i);
    const segmentEnd = new Date(startDate.getTime() + segmentMs * (i + 1));

    // Format label based on timeframe duration
    const daysInSegment = Math.ceil(segmentMs / (24 * 60 * 60 * 1000));
    let label: string;

    // Use actual start/end dates for first and last segments
    const labelDate = i === 6 ? endDate : segmentStart;

    if (daysInSegment < 1) {
      // Hours
      label = labelDate.toLocaleTimeString("en-US", { hour: "2-digit" });
    } else if (daysInSegment === 1) {
      // Single day
      label = labelDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      // Multiple days
      label = labelDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    segments.push({ start: segmentStart, end: segmentEnd, label });
  }

  // Query crime counts for each segment
  const trendData: CrimeTrendPoint[] = [];

  for (const segment of segments) {
    const { count, error } = await client
      .from("crime_case")
      .select("id", { count: "exact", head: true })
      .eq("crime_type", crimeType)
      .gte("report_datetime", segment.start.toISOString())
      .lte("report_datetime", segment.end.toISOString());

    if (error) {
      throw error;
    }

    trendData.push({
      date: segment.start,
      count: count || 0,
      label: segment.label,
    });
  }

  return trendData;
}

// ==================== CRIME STATUS DISTRIBUTION ====================

export interface CrimeStatusDistribution {
  status: string;
  count: number;
  label: string;
  fill: string;
}

/**
 * Get the distribution of crimes by status
 */
export async function getCrimeStatusDistribution(
  client: TypedSupabaseClient,
  params: DashboardMetricsParams = {},
): Promise<CrimeStatusDistribution[]> {
  const { startDate, endDate } = params;

  let query = client.from("crime_case").select("case_status");

  if (startDate) {
    query = query.gte("report_datetime", startDate.toISOString());
  }
  if (endDate) {
    query = query.lte("report_datetime", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Count occurrences of each status
  const statusCounts = new Map<string, number>();
  data?.forEach((record) => {
    if (record.case_status !== null) {
      const current = statusCounts.get(record.case_status) || 0;
      statusCounts.set(record.case_status, current + 1);
    }
  });

  // Define status colors and labels
  const statusConfig: Record<string, { label: string; fill: string }> = {
    open: { label: "Open", fill: "#FF6467" },
    "under investigation": { label: "Under Investigation", fill: "#FF8904" },
    "case settled": { label: "Case Settled", fill: "#9AE600" },
    lupon: { label: "Lupon", fill: "#7BF1A8" },
    "direct filing": { label: "Direct Filing", fill: "#534AFD" },
    "for record": { label: "For Record", fill: "#F59E0B" },
    "turn-over": { label: "Turn-Over", fill: "#06B6D4" },
  };

  // Convert to array with proper formatting
  return Array.from(statusCounts.entries()).map(([status, count]) => ({
    status,
    count,
    label: statusConfig[status]?.label || status,
    fill: statusConfig[status]?.fill || "#999999",
  }));
}

// ==================== RECENT CRIME CASES ====================

export interface RecentCrimeCase {
  id: number;
  case_code: string;
  crime_type: number | null;
  crime_type_label: string;
  case_status: string | null;
  complainant_name: string;
  suspect_name: string;
  report_datetime: string;
}

/**
 * Get the most recent crime cases
 * @param limit - Number of cases to fetch (default: 5)
 */
export async function getRecentCrimeCases(
  client: TypedSupabaseClient,
  limit: number = 5,
): Promise<RecentCrimeCase[]> {
  // Fetch recent cases
  const { data: cases, error } = await client
    .from("crime_case")
    .select("id, case_number, crime_type, case_status, report_datetime")
    .order("report_datetime", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!cases || cases.length === 0) return [];

  // Fetch crime type labels
  const crimeTypeIds = Array.from(
    new Set(cases.map((c) => c.crime_type).filter((id) => id !== null)),
  );

  let crimeTypeMap = new Map<number, string>();
  if (crimeTypeIds.length > 0) {
    const { data: crimeTypes, error: crimeTypeError } = await client
      .from("crime-type")
      .select("id, label")
      .in("id", crimeTypeIds);

    if (crimeTypeError) throw crimeTypeError;
    crimeTypeMap = new Map(
      crimeTypes?.map((ct) => [ct.id, ct.label || "Unknown"]) || [],
    );
  }

  // For each case, get the complainant and suspect names
  const casesWithNames = await Promise.all(
    cases.map(async (crimeCase) => {
      // Get complainant
      const { data: complainantData } = await client
        .from("case_person")
        .select(`
          person_profile (
            first_name,
            middle_name,
            last_name
          )
        `)
        .eq("crime_case_id", crimeCase.id)
        .eq("role", "complainant")
        .limit(1)
        .single();

      // Get suspect
      const { data: suspectData } = await client
        .from("case_person")
        .select(`
          person_profile (
            first_name,
            middle_name,
            last_name
          )
        `)
        .eq("crime_case_id", crimeCase.id)
        .eq("role", "suspect")
        .limit(1)
        .single();

      const getFullName = (data: any) => {
        if (!data?.person_profile) return "Unknown";
        const { first_name, middle_name, last_name } = data.person_profile;
        return [first_name, middle_name, last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || "Unknown";
      };

      return {
        id: crimeCase.id,
        case_code: crimeCase.case_number || String(crimeCase.id).padStart(4, "0"),
        crime_type: crimeCase.crime_type,
        crime_type_label:
          crimeTypeMap.get(crimeCase.crime_type ?? 0) || "Unknown",
        case_status: crimeCase.case_status,
        complainant_name: getFullName(complainantData),
        suspect_name: getFullName(suspectData),
        report_datetime: crimeCase.report_datetime || "",
      };
    }),
  );

  return casesWithNames;
}

