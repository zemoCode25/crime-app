import "server-only";
import { createClient } from "@/server/supabase/server";
import { BARANGAY_COLORS } from "@/constants/barangay";
import { getStatusByValue } from "@/constants/crime-case";
import { startOfDay, endOfDay, eachDayOfInterval, format, parseISO } from "date-fns";

export type ReportFilter = {
  from: Date;
  to: Date;
  barangay?: number | null; // If null/undefined, fetched for all (if authorized)
};

export type CrimeTypeStat = {
  name: string;
  count: number;
  color: string;
  percentage: number;
};

export type StatusStat = {
  status: string;
  count: number;
  fill: string; // Color for the chart
};

export type TrendPoint = {
  date: string; // Display format (e.g., "Jan 01")
  fullDate: string; // ISO or YYYY-MM-DD
  count: number;
};

export type BarangayStat = {
  name: string;
  count: number;
};

export type ReportData = {
  totalCrimes: number;
  solvedCount: number;
  unsolvedCount: number;
  crimeDistribution: CrimeTypeStat[];
  statusDistribution: StatusStat[];
  trendData: TrendPoint[];
  barangayDistribution: BarangayStat[]; // Empty if specific barangay is selected
  topCrimeType: string;
  mostAffectedBarangay: string;
};

export async function getCrimeReportsData(
  filter: ReportFilter
): Promise<{ data: ReportData | null; error: string | null }> {
  const supabase = await createClient();

  try {
    const fromISO = startOfDay(filter.from).toISOString();
    const toISO = endOfDay(filter.to).toISOString();

    let query = supabase
      .from("crime_case")
      .select(`
        id,
        case_status,
        incident_datetime,
        "crime-type" (
          id,
          name,
          color
        ),
        location!inner (
          id,
          barangay
        )
      `)
      .gte("incident_datetime", fromISO)
      .lte("incident_datetime", toISO);

    if (filter.barangay) {
      query = query.eq("location.barangay", filter.barangay);
    }

    const { data: cases, error } = await query;

    if (error) {
      console.error("Error fetching crime report data:", error);
      return { data: null, error: error.message };
    }

    if (!cases) {
      return { data: null, error: "No data found." };
    }

    // --- Aggregation Logic ---

    const totalCrimes = cases.length;

    // 1. Solved vs Unsolved
    // Assuming "case settled", "lupon", "direct filing", "turn-over" are considered 'solved' or 'closed' in some capacity,
    // and "open", "under investigation" are 'unsolved'.
    // Adjust logic as per specific business rules.
    const solvedStatuses = ["case settled", "lupon", "direct filing", "turn-over"];
    const solvedCount = cases.filter((c) => 
      c.case_status && solvedStatuses.includes(c.case_status)
    ).length;
    const unsolvedCount = totalCrimes - solvedCount;

    // 2. Crime Type Distribution
    // Map: Name -> { count, color }
    const typeMap = new Map<string, { count: number; color: string }>();
    cases.forEach((c) => {
      const crimeType = c["crime-type"];
      const typeName = crimeType?.name || "Unknown";
      const typeColor = crimeType?.color || "#94a3b8";
      const current = typeMap.get(typeName) || { count: 0, color: typeColor };
      typeMap.set(typeName, { count: current.count + 1, color: typeColor });
    });

    const crimeDistribution: CrimeTypeStat[] = Array.from(typeMap.entries())
      .map(([name, val]) => ({
        name,
        count: val.count,
        color: val.color,
        percentage: totalCrimes > 0 ? (val.count / totalCrimes) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const topCrimeType = crimeDistribution.length > 0 ? crimeDistribution[0].name : "N/A";

    // 3. Status Distribution
    const statusMap = new Map<string, number>();
    cases.forEach((c) => {
      const status = c.case_status || "Unknown";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    // Helper for status colors - use centralized constants
    const getStatusColor = (status: string) => {
      // Import from crime-case constants
      const statusDef = getStatusByValue(status);
      return statusDef?.dark || "#64748b"; // fallback slate-500
    };

    const statusDistribution: StatusStat[] = Array.from(statusMap.entries()).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      fill: getStatusColor(status),
    }));

    // 4. Trend Data (Daily)
    const trendMap = new Map<string, number>();
    // Initialize all days in range with 0
    const days = eachDayOfInterval({ start: filter.from, end: filter.to });
    days.forEach(day => {
        trendMap.set(format(day, "yyyy-MM-dd"), 0);
    });

    cases.forEach((c) => {
      if (c.incident_datetime) {
        const dateKey = format(parseISO(c.incident_datetime), "yyyy-MM-dd");
        if (trendMap.has(dateKey)) {
             trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
        }
      }
    });

    const trendData: TrendPoint[] = Array.from(trendMap.entries()).map(([dateStr, count]) => ({
        date: format(parseISO(dateStr), "MMM dd"),
        fullDate: dateStr,
        count
    }));

    // 5. Barangay Distribution (Only relevant if we are fetching all barangays)
    let barangayDistribution: BarangayStat[] = [];
    let mostAffectedBarangay = "N/A";

    if (!filter.barangay) {
      const bMap = new Map<number, number>();
      cases.forEach((c) => {
        const bId = c.location?.barangay;
        if (bId) {
          bMap.set(bId, (bMap.get(bId) || 0) + 1);
        }
      });

      barangayDistribution = Array.from(bMap.entries()).map(([id, count]) => {
        const bName = BARANGAY_COLORS.find(b => b.id === id)?.name || `Barangay ${id}`;
        return { name: bName, count };
      }).sort((a, b) => b.count - a.count);

      if (barangayDistribution.length > 0) {
        mostAffectedBarangay = barangayDistribution[0].name;
      }
    } else {
        // If a specific barangay is selected, that is the "Active Scope"
        const bName = BARANGAY_COLORS.find(b => b.id === filter.barangay)?.name;
        mostAffectedBarangay = bName || "N/A";
    }

    return {
      data: {
        totalCrimes,
        solvedCount,
        unsolvedCount,
        crimeDistribution,
        statusDistribution,
        trendData,
        barangayDistribution,
        topCrimeType,
        mostAffectedBarangay,
      },
      error: null,
    };

  } catch (err: unknown) {
    console.error("Unexpected error in getCrimeReportsData:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { data: null, error: message };
  }
}
