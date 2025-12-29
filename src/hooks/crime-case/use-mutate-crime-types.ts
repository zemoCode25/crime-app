"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  updateCrimeTypes,
  addCrimeType,
  deleteCrimeType,
  type CrimeTypeUpdate,
  type AddCrimeTypeParams,
  type CrimeType,
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

/**
 * Hook to add a new crime type.
 * Handles loading states, success/error toasts, and cache invalidation.
 */
export function useAddCrimeType() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation<CrimeType, Error, AddCrimeTypeParams>({
    mutationFn: async (params) => {
      if (!supabase) {
        throw new Error("Database connection error. Please try again.");
      }

      return addCrimeType(supabase, params);
    },
    onMutate: () => {
      toast.loading("Adding crime type...", { id: "add-crime-type" });
    },
    onSuccess: () => {
      toast.dismiss("add-crime-type");
      toast.success("Crime type added successfully!");

      // Invalidate the crime-types query to refetch
      queryClient.invalidateQueries({ queryKey: ["crime-types"] });
    },
    onError: (error) => {
      toast.dismiss("add-crime-type");

      if (error instanceof Error) {
        toast.error(error.message || "Failed to add crime type");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("Add crime type error:", error);
    },
  });
}

/**
 * Hook to delete a crime type.
 * Handles loading states, success/error toasts, and cache invalidation.
 */
export function useDeleteCrimeType() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      if (!supabase) {
        throw new Error("Database connection error. Please try again.");
      }

      return deleteCrimeType(supabase, id);
    },
    onMutate: () => {
      toast.loading("Deleting crime type...", { id: "delete-crime-type" });
    },
    onSuccess: () => {
      toast.dismiss("delete-crime-type");
      toast.success("Crime type deleted successfully!");

      // Invalidate the crime-types query to refetch
      queryClient.invalidateQueries({ queryKey: ["crime-types"] });
    },
    onError: (error) => {
      toast.dismiss("delete-crime-type");

      if (error instanceof Error) {
        toast.error(error.message || "Failed to delete crime type");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("Delete crime type error:", error);
    },
  });
}
