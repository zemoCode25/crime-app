"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  addEmergencyNotification,
  type AddEmergencyNotificationParams,
  type AddEmergencyNotificationResult,
} from "@/server/queries/emergency";

/**
 * Hook to add a new emergency notification.
 * Handles loading states, success/error toasts, and cache invalidation.
 */
export function useAddEmergencyNotification() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation<
    AddEmergencyNotificationResult,
    Error,
    AddEmergencyNotificationParams
  >({
    mutationFn: async (params) => {
      if (!supabase) {
        throw new Error("Database connection error. Please try again.");
      }

      return addEmergencyNotification(supabase, params);
    },
    onMutate: () => {
      toast.loading("Sending notification...", { id: "add-emergency" });
    },
    onSuccess: (data) => {
      toast.dismiss("add-emergency");

      const isScheduled = data.schedule !== null;
      if (isScheduled) {
        toast.success("Notification scheduled successfully!");
      } else {
        toast.success("Notification sent successfully!");
      }

      // Invalidate the emergency records query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["emergency-records"] });
    },
    onError: (error) => {
      toast.dismiss("add-emergency");

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();

        if (msg.includes("not authenticated") || msg.includes("auth")) {
          toast.error("You must be logged in to send notifications.");
        } else if (msg.includes("permission")) {
          toast.error("You don't have permission to send notifications.");
        } else if (msg.includes("network")) {
          toast.error(
            "Network error. Please check your connection and try again.",
          );
        } else {
          toast.error(error.message || "Failed to send notification");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("Emergency notification error:", error);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("network")) {
        return failureCount < 2;
      }
      return false;
    },
  });
}
