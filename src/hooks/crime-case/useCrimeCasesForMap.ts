"use client";

import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/server/supabase/client";
import { getCrimeCasesForMap } from "@/server/queries/crime";
import type { CrimeCaseMapRecord } from "@/types/crime-case";

export function useCrimeCasesForMap() {
  const supabase = useSupabaseBrowser();

  return useQuery<CrimeCaseMapRecord[]>({
    queryKey: ["crime-cases", "map"],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      const { data, error } = await getCrimeCasesForMap(supabase);

      if (error) {
        throw new Error(`Failed to fetch crime cases for map: ${error.message}`);
      }

      return (data ?? []) as CrimeCaseMapRecord[];
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 2,
  });
}

