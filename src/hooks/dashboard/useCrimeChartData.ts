"use client";

import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  getTopCrimeTypes,
  getCrimeTrendData,
  type TopCrimeType,
  type CrimeTrendPoint,
} from "@/server/queries/dashboard";

interface UseCrimeChartDataArgs {
  dateRange?: DateRange;
}

/**
 * Hook to fetch top 5 most prevalent crime types
 */
export function useTopCrimeTypes({ dateRange }: UseCrimeChartDataArgs) {
  const supabase = useSupabaseBrowser();

  return useQuery<TopCrimeType[]>({
    queryKey: [
      "top-crime-types",
      {
        from: dateRange?.from?.toISOString() ?? null,
        to: dateRange?.to?.toISOString() ?? null,
      },
    ],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      return getTopCrimeTypes(supabase, {
        startDate: dateRange?.from,
        endDate: dateRange?.to,
      });
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

interface UseCrimeTrendDataArgs {
  crimeType: number | null;
  dateRange?: DateRange;
}

/**
 * Hook to fetch crime trend data over 7 time points
 */
export function useCrimeTrendData({
  crimeType,
  dateRange,
}: UseCrimeTrendDataArgs) {
  const supabase = useSupabaseBrowser();

  return useQuery<CrimeTrendPoint[]>({
    queryKey: [
      "crime-trend-data",
      {
        crimeType,
        from: dateRange?.from?.toISOString() ?? null,
        to: dateRange?.to?.toISOString() ?? null,
      },
    ],
    queryFn: async () => {
      if (!supabase || crimeType === null) {
        return [];
      }

      return getCrimeTrendData(supabase, crimeType, {
        startDate: dateRange?.from,
        endDate: dateRange?.to,
      });
    },
    enabled: !!supabase && crimeType !== null && !!dateRange?.from && !!dateRange?.to,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
