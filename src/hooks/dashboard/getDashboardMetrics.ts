"use client";

import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  getDashboardMetrics,
  type DashboardMetricMap,
} from "@/server/queries/dashboard";

interface UseDashboardMetricsArgs {
  dateRange?: DateRange;
}

export function useDashboardMetrics({ dateRange }: UseDashboardMetricsArgs) {
  const supabase = useSupabaseBrowser();

  return useQuery<DashboardMetricMap>({
    queryKey: [
      "dashboard-metrics",
      {
        from: dateRange?.from?.toISOString() ?? null,
        to: dateRange?.to?.toISOString() ?? null,
      },
    ],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      return getDashboardMetrics(supabase, {
        startDate: dateRange?.from,
        endDate: dateRange?.to,
      });
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

