"use client";

import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/server/supabase/client";
import type { Database } from "@/server/supabase/database.types";

type Role = Database["public"]["Enums"]["roles"];

export interface UserProfile {
  id: string;
  role: Role | null;
  barangay: number | null;
  first_name: string | null;
  last_name: string | null;
}

export function useCurrentUserProfile() {
  const supabase = useSupabaseBrowser();

  return useQuery<UserProfile | null, Error>({
    queryKey: ["current-user-profile"],
    queryFn: async () => {
      // Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Not authenticated");
      }

      // Fetch the user's profile from the users table
      const { data, error } = await supabase
        .from("users")
        .select("id, role, barangay, first_name, last_name")
        .eq("id", user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      return data as UserProfile;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - user profile rarely changes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    retry: 1,
  });
}

// Helper to check if user is a barangay admin
export function isBarangayAdmin(role: Role | null): boolean {
  return role === "barangay_admin";
}

// Helper to check if user has full access (main_admin or system_admin)
export function hasFullAccess(role: Role | null): boolean {
  return role === "main_admin" || role === "system_admin";
}
