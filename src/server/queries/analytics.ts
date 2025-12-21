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