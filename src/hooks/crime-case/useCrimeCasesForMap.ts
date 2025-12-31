"use client";

import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/server/supabase/client";
import { getCrimeCasesForMap } from "@/server/queries/crime";
import type { CrimeCaseMapRecord } from "@/types/crime-case";
import type { DateRangeValue } from "@/components/DateRangeSelector";
import { BARANGAY_OPTIONS } from "@/constants/crime-case";

export interface CrimeCasesMapFilters {
  statusFilters?: string[];
  crimeTypeIds?: number[];
  barangayFilters?: string[];
  dateRange?: DateRangeValue;
}

export function useCrimeCasesForMap(filters?: CrimeCasesMapFilters) {
  const supabase = useSupabaseBrowser();

  return useQuery<CrimeCaseMapRecord[]>({
    queryKey: ["crime-cases", "map", filters ?? {}],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      const { data, error } = await getCrimeCasesForMap(supabase);

      if (error) {
        throw new Error(
          `Failed to fetch crime cases for map: ${error.message}`,
        );
      }

      let records = (data ?? []) as CrimeCaseMapRecord[];

      if (filters?.crimeTypeIds && filters.crimeTypeIds.length > 0) {
        const set = new Set(filters.crimeTypeIds);
        records = records.filter((record) =>
          record.crime_type != null ? set.has(record.crime_type) : false,
        );
      }

      if (filters?.statusFilters && filters.statusFilters.length > 0) {
        const set = new Set(filters.statusFilters);
        records = records.filter((record) =>
          record.case_status != null ? set.has(record.case_status) : false,
        );
      }

      if (filters?.barangayFilters && filters.barangayFilters.length > 0) {
        const barangayIds = filters.barangayFilters
          .map((name) => BARANGAY_OPTIONS.find((b) => b.value === name)?.id)
          .filter((id): id is number => id !== undefined);

        if (barangayIds.length > 0) {
          const set = new Set(barangayIds);
          records = records.filter((record) =>
            record.location?.barangay != null
              ? set.has(record.location.barangay)
              : false,
          );
        }
      }

      if (filters?.dateRange) {
        const { from, to } = filters.dateRange;
        records = records.filter((record) => {
          if (!record.incident_datetime) return false;
          const incidentDate = new Date(record.incident_datetime);
          return incidentDate >= from && incidentDate <= to;
        });
      }

      return records;
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 2,
  });
}
