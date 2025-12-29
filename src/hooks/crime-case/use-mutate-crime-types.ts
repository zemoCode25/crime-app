"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  updateCrimeTypes,
  type CrimeTypeUpdate,
} from "@/server/queries/crime-type";

/**
 * Hook to update multiple crime types.
 * Handles loading states, success/error toasts, and cache invalidation.
 */
export function useUpdateCrimeTypes() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CrimeTypeUpdate[]>({
    mutationFn: async (updates) => {
      if (!supabase) {
        throw new Error("Database connection error. Please try again.");
      }

      return updateCrimeTypes(supabase, updates);
    },
    onMutate: () => {
      toast.loading("Updating crime types...", { id: "update-crime-types" });
    },
    onSuccess: () => {
      toast.dismiss("update-crime-types");
      toast.success("Crime types updated successfully!");

      // Invalidate the crime-types query to refetch
      queryClient.invalidateQueries({ queryKey: ["crime-types"] });
    },
    onError: (error) => {
      toast.dismiss("update-crime-types");

      if (error instanceof Error) {
        toast.error(error.message || "Failed to update crime types");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("Update crime types error:", error);
    },
  });
}
