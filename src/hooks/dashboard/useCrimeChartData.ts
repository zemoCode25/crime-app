"use client";

import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  getTopCrimeTypes,
  getCrimeTrendData,
  getCrimeStatusDistribution,
  getRecentCrimeCases,
  type TopCrimeType,
  type CrimeTrendPoint,
  type CrimeStatusDistribution,
  type RecentCrimeCase,
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

/**
 * Hook to fetch crime status distribution
 */
export function useCrimeStatusDistribution({ dateRange }: UseCrimeChartDataArgs) {
  const supabase = useSupabaseBrowser();

  return useQuery<CrimeStatusDistribution[]>({
    queryKey: [
      "crime-status-distribution",
      {
        from: dateRange?.from?.toISOString() ?? null,
        to: dateRange?.to?.toISOString() ?? null,
      },
    ],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      return getCrimeStatusDistribution(supabase, {
        startDate: dateRange?.from,
        endDate: dateRange?.to,
      });
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch recent crime cases
 * @param limit - Number of recent cases to fetch (default: 5)
 */
export function useRecentCrimeCases(limit: number = 5) {
  const supabase = useSupabaseBrowser();

  return useQuery<RecentCrimeCase[]>({
    queryKey: ["recent-crime-cases", limit],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      return getRecentCrimeCases(supabase, limit);
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 2, // 2 minutes - fresher data for recent cases
    refetchOnWindowFocus: true, // Refetch on focus for recent cases
  });
}
