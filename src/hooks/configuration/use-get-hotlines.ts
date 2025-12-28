"use client";

import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/server/supabase/client";
import { getHotlines, type Hotline } from "@/server/queries/hotline";

/**
 * Hook to fetch all hotlines.
 */
export function useGetHotlines() {
  const supabase = useSupabaseBrowser();

  return useQuery<Hotline[]>({
    queryKey: ["hotlines"],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      return getHotlines(supabase);
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
