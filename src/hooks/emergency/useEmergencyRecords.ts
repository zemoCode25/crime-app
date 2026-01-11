"use client";

import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  getEmergencyRecords,
  type PaginatedEmergencyRecords,
} from "@/server/queries/emergency";

interface UseEmergencyRecordsArgs {
  searchQuery?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/**
 * Hook to fetch paginated emergency notification records.
 * Supports filtering by subject, sorting by created_at, and pagination.
 */
export function useEmergencyRecords({
  searchQuery,
  sortOrder = "desc",
  page = 1,
  pageSize = 10,
}: UseEmergencyRecordsArgs = {}) {
  const supabase = useSupabaseBrowser();

  return useQuery<PaginatedEmergencyRecords>({
    queryKey: [
      "emergency-records",
      {
        searchQuery: searchQuery ?? null,
        sortOrder,
        page,
        pageSize,
      },
    ],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      return getEmergencyRecords(supabase, {
        searchQuery,
        sortOrder,
        page,
        pageSize,
      });
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
}
