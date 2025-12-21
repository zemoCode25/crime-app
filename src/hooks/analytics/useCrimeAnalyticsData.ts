"use client";

import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  getDailyCrimeCounts,
  type DailyCrimeCount,
  type AnalyticsParams,
} from "@/server/queries/analytics";

interface UseDailyCrimeCountsArgs {
  dateRange?: DateRange;
  crimeType?: number; // 0 = all crime types
  barangayId?: number; // 0 = all barangays
  status?: AnalyticsParams["status"]; // "all" = all statuses
}

/**
 * Hook to fetch daily crime counts for the analytics chart.
 * Returns one data point per day within the selected date range.
 */
export function useDailyCrimeCounts({
  dateRange,
  crimeType,
  barangayId,
  status,
}: UseDailyCrimeCountsArgs) {
  const supabase = useSupabaseBrowser();

  return useQuery<DailyCrimeCount[]>({
    queryKey: [
      "daily-crime-counts",
      {
        from: dateRange?.from?.toISOString() ?? null,
        to: dateRange?.to?.toISOString() ?? null,
        crimeType: crimeType ?? null,
        barangayId: barangayId ?? null,
        status: status ?? null,
      },
    ],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      return getDailyCrimeCounts(supabase, {
        startDate: dateRange?.from,
        endDate: dateRange?.to,
        crimeType,
        barangayId,
        status,
      });
    },
    enabled: !!supabase && !!dateRange?.from && !!dateRange?.to,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}