"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useSupabaseBrowser from "@/server/supabase/client";
import { updateHotlines, type HotlineUpdate } from "@/server/queries/hotline";

/**
 * Hook to update multiple hotlines.
 * Handles loading states, success/error toasts, and cache invalidation.
 */
export function useUpdateHotlines() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation<void, Error, HotlineUpdate[]>({
    mutationFn: async (updates) => {
      if (!supabase) {
        throw new Error("Database connection error. Please try again.");
      }

      return updateHotlines(supabase, updates);
    },
    onMutate: () => {
      toast.loading("Updating hotlines...", { id: "update-hotlines" });
    },
    onSuccess: () => {
      toast.dismiss("update-hotlines");
      toast.success("Hotlines updated successfully!");

      // Invalidate the hotlines query to refetch
      queryClient.invalidateQueries({ queryKey: ["hotlines"] });
    },
    onError: (error) => {
      toast.dismiss("update-hotlines");

      if (error instanceof Error) {
        toast.error(error.message || "Failed to update hotlines");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("Hotlines update error:", error);
    },
  });
}
