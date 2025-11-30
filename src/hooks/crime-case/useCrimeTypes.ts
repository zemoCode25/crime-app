"use client";

import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/server/supabase/client";
import { getCrimeTypes } from "@/server/queries/crime-type";

export interface CrimeTypeOption {
  id: number;
  label: string;
}

export function useCrimeTypes() {
  const supabase = useSupabaseBrowser();

  return useQuery<CrimeTypeOption[]>({
    queryKey: ["crime-types"],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      const { data, error } = await getCrimeTypes(supabase);

      if (error) {
        throw new Error(`Failed to fetch crime types: ${error.message}`);
      }

      return (data ?? []) as CrimeTypeOption[];
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

