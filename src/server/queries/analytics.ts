import { TypedSupabaseClient } from "@/types/supabase-client";
import type { Database } from "@/server/supabase/database.types";

type CaseStatus = Database["public"]["Enums"]["status_enum"];

export interface AnalyticsParams {
  startDate?: Date;
  endDate?: Date;
  crimeType?: number; // undefined or 0 = all crime types
  barangayId?: number; // 0 = all, 1-9 = specific barangay
  status?: CaseStatus | "all"; // undefined or "all" = all statuses
}

export interface DailyCrimeCount {
  date: string;
  count: number;
  label: string;
}

/**
 * Get daily crime counts for a date range with optional crime type and barangay filters.
 * Returns one data point per day within the range.
 * Barangay is filtered via the location table (crime_case -> location -> barangay).
 */
export async function getDailyCrimeCounts(
  client: TypedSupabaseClient,
  params: AnalyticsParams,
): Promise<DailyCrimeCount[]> {
  const { startDate, endDate, crimeType, barangayId, status } = params;

  if (!startDate || !endDate) {
    return [];
  }

  // Generate all dates in the range
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const endDateNormalized = new Date(endDate);
  endDateNormalized.setHours(23, 59, 59, 999);

  while (currentDate <= endDateNormalized) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Build query filters
  const filters: {
    crime_type?: number;
    case_status?: CaseStatus;
  } = {};

  if (crimeType && crimeType !== 0) {
    filters.crime_type = crimeType;
  }

  if (status && status !== "all") {
    filters.case_status = status;
  }

  // Fetch all matching crimes in the date range with location data
  let query = client
    .from("crime_case")
    .select("report_datetime, location:location_id(barangay)")
    .gte("report_datetime", startDate.toISOString())
    .lte("report_datetime", endDate.toISOString());

  // Apply filters
  if (filters.crime_type !== undefined) {
    query = query.eq("crime_type", filters.crime_type);
  }

  if (filters.case_status !== undefined) {
    query = query.eq("case_status", filters.case_status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Count crimes per day, filtering by barangay if specified
  const countsByDate = new Map<string, number>();

  data?.forEach((record) => {
    if (record.report_datetime) {
      // Filter by barangay if specified (0 = all barangays)
      if (barangayId && barangayId !== 0) {
        const location = record.location as { barangay: number | null } | null;
        if (location?.barangay !== barangayId) {
          return;
        }
      }

      const date = new Date(record.report_datetime);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      countsByDate.set(dateKey, (countsByDate.get(dateKey) || 0) + 1);
    }
  });

  // Build result with all dates in range
  return dates.map((date) => {
    const dateKey = date.toISOString().split("T")[0];
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      date: dateKey,
      count: countsByDate.get(dateKey) || 0,
      label,
    };
  });
}

// ==================== BARANGAY CRIME DISTRIBUTION ====================

export interface BarangayCrimeCount {
  barangayId: number;
  barangayName: string;
  barangayKey: string;
  count: number;
  fill: string;
}

/**
 * Get crime counts by barangay for a date range.
 * Returns the count of crimes for each barangay.
 * If barangayId is provided, only returns data for that barangay (for barangay_admin users).
 */
export async function getBarangayCrimeCounts(
  client: TypedSupabaseClient,
  params: Pick<AnalyticsParams, "startDate" | "endDate" | "barangayId">,
): Promise<BarangayCrimeCount[]> {
  const { startDate, endDate, barangayId } = params;

  // Import barangay colors
  const { BARANGAY_COLORS } = await import("@/constants/barangay");

  // Build query with location data
  let query = client
    .from("crime_case")
    .select("location:location_id(barangay)");

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

  // Count crimes per barangay
  const countsByBarangay = new Map<number, number>();

  data?.forEach((record) => {
    const location = record.location as { barangay: number | null } | null;
    if (location?.barangay) {
      const recordBarangayId = location.barangay;
      // Filter by barangay if specified (for barangay_admin users)
      if (barangayId && barangayId !== 0 && recordBarangayId !== barangayId) {
        return;
      }
      countsByBarangay.set(recordBarangayId, (countsByBarangay.get(recordBarangayId) || 0) + 1);
    }
  });

  // Build result - filter to single barangay if specified
  const barangaysToInclude = barangayId && barangayId !== 0
    ? BARANGAY_COLORS.filter((b) => b.id === barangayId)
    : BARANGAY_COLORS;

  return barangaysToInclude.map((barangay) => ({
    barangayId: barangay.id,
    barangayName: barangay.name,
    barangayKey: barangay.key,
    count: countsByBarangay.get(barangay.id) || 0,
    fill: barangay.dark,
  }));
}

// ==================== STATUS CRIME DISTRIBUTION ====================

export interface StatusCrimeCount {
  status: string;
  statusKey: string;
  label: string;
  count: number;
  fill: string;
}

/**
 * Get crime counts by status for a date range.
 * Returns the count of crimes for each status using colors from STATUSES.
 * If barangayId is provided, only counts cases from that barangay (for barangay_admin users).
 */
export async function getStatusCrimeCounts(
  client: TypedSupabaseClient,
  params: Pick<AnalyticsParams, "startDate" | "endDate" | "barangayId">,
): Promise<StatusCrimeCount[]> {
  const { startDate, endDate, barangayId } = params;

  // Import status colors
  const { STATUSES } = await import("@/constants/crime-case");

  // Build query - include location data for barangay filtering
  let query = client.from("crime_case").select("case_status, location:location_id(barangay)");

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

  // Count crimes per status
  const countsByStatus = new Map<string, number>();

  data?.forEach((record) => {
    if (record.case_status !== null) {
      // Filter by barangay if specified (for barangay_admin users)
      if (barangayId && barangayId !== 0) {
        const location = record.location as { barangay: number | null } | null;
        if (location?.barangay !== barangayId) {
          return;
        }
      }
      const current = countsByStatus.get(record.case_status) || 0;
      countsByStatus.set(record.case_status, current + 1);
    }
  });

  // Build result with all statuses from STATUSES constant
  return STATUSES.map((status) => ({
    status: status.value,
    statusKey: status.value.replace(/\s+/g, "_"),
    label: status.label,
    count: countsByStatus.get(status.value) || 0,
    fill: status.dark,
  }));
}

// ==================== CRIME TYPE DISTRIBUTION ====================

export interface CrimeTypeCount {
  crimeTypeId: number;
  label: string;
  count: number;
  fill: string;
}

/**
 * Get crime counts by crime type for a date range.
 * Returns the count of crimes for each crime type, sorted by count descending.
 * If barangayId is provided, only counts cases from that barangay (for barangay_admin users).
 */
export async function getCrimeTypeCounts(
  client: TypedSupabaseClient,
  params: Pick<AnalyticsParams, "startDate" | "endDate" | "barangayId">,
): Promise<CrimeTypeCount[]> {
  const { startDate, endDate, barangayId } = params;

  // Import crime type colors
  const { getCrimeTypeColor } = await import("@/constants/crime-case");

  // Build query for crime cases - include location data for barangay filtering
  let query = client.from("crime_case").select("crime_type, location:location_id(barangay)");

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

  // Count crimes per crime type
  const countsByCrimeType = new Map<number, number>();

  data?.forEach((record) => {
    if (record.crime_type !== null) {
      // Filter by barangay if specified (for barangay_admin users)
      if (barangayId && barangayId !== 0) {
        const location = record.location as { barangay: number | null } | null;
        if (location?.barangay !== barangayId) {
          return;
        }
      }
      const current = countsByCrimeType.get(record.crime_type) || 0;
      countsByCrimeType.set(record.crime_type, current + 1);
    }
  });

  // Get all crime type IDs that have counts
  const crimeTypeIds = Array.from(countsByCrimeType.keys());

  if (crimeTypeIds.length === 0) {
    return [];
  }

  // Fetch crime type labels
  const { data: crimeTypeData, error: crimeTypeError } = await client
    .from("crime-type")
    .select("id, label")
    .in("id", crimeTypeIds);

  if (crimeTypeError) {
    throw crimeTypeError;
  }

  // Build label map
  const labelMap = new Map(
    crimeTypeData?.map((ct) => [ct.id, ct.label || `Crime Type ${ct.id}`]) || []
  );

  // Build result sorted by count descending
  const result: CrimeTypeCount[] = Array.from(countsByCrimeType.entries())
    .map(([crimeTypeId, count], index) => ({
      crimeTypeId,
      label: labelMap.get(crimeTypeId) || `Crime Type ${crimeTypeId}`,
      count,
      fill: getCrimeTypeColor(index),
    }))
    .sort((a, b) => b.count - a.count);

  // Re-assign colors after sorting so highest count gets first color
  return result.map((item, index) => ({
    ...item,
    fill: getCrimeTypeColor(index),
  }));
}