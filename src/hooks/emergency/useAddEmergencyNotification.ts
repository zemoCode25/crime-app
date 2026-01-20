"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  addEmergencyNotification,
  type AddEmergencyNotificationParams,
  type AddEmergencyNotificationResult,
} from "@/server/queries/emergency";
import type { TypedSupabaseClient } from "@/types/supabase-client";

/**
 * Hook to add a new emergency notification.
 * Handles loading states, success/error toasts, and cache invalidation.
 */
export function useAddEmergencyNotification() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  const sanitizeFileName = (name: string) =>
    name.replace(/[^a-zA-Z0-9._-]/g, "_");

  const buildImagePath = (file: File) => {
    const safeName = sanitizeFileName(file.name);
    const uniqueId =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `emergency-notifications/${uniqueId}-${safeName}`;
  };

  const uploadEmergencyImage = async (
    client: TypedSupabaseClient,
    file?: File | null,
  ) => {
    if (!file) {
      return null;
    }

    const bucket = client.storage.from("emergency-notification-images");
    const path = buildImagePath(file);
    const { error } = await bucket.upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

    if (error) {
      throw new Error(error.message || "Failed to upload emergency image");
    }

    return path;
  };

  type AddEmergencyNotificationInput = AddEmergencyNotificationParams & {
    imageFile?: File | null;
  };

  return useMutation<
    AddEmergencyNotificationResult,
    Error,
    AddEmergencyNotificationInput
  >({
    mutationFn: async (params) => {
      if (!supabase) {
        throw new Error("Database connection error. Please try again.");
      }

      const { imageFile, ...payload } = params;
      const imageKey = await uploadEmergencyImage(supabase, imageFile);

      try {
        return await addEmergencyNotification(supabase, {
          ...payload,
          image_key: imageKey,
        });
      } catch (error) {
        if (imageKey) {
          await supabase.storage
            .from("emergency-notification-images")
            .remove([imageKey]);
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the emergency records query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["emergency-records"] });
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("network")) {
        return failureCount < 2;
      }
      return false;
    },
  });
}
