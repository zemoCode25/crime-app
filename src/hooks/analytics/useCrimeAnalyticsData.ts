"use client";

import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  getDailyCrimeCounts,
  type DailyCrimeCount,
} from "@/server/queries/analytics";

interface UseDailyCrimeCountsArgs {
  dateRange?: DateRange;
  crimeType?: number;
  barangayId?: number; // 0 = all, 1-9 = specific barangay
}

/**
 * Hook to fetch daily crime counts for the analytics chart.
 * Returns one data point per day within the selected date range.
 */
export function useDailyCrimeCounts({
  dateRange,
  crimeType,
  barangayId,
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
      });
    },
    enabled:
      !!supabase && !!dateRange?.from && !!dateRange?.to && !!crimeType,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}