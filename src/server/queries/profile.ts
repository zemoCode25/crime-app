import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/server/supabase/database.types";

export type UserProfileRow = Database["public"]["Tables"]["users"]["Row"];
export type UserProfileUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function getUserProfile(
  client: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await client
    .from("users")
    .select("id, first_name, last_name, role, contact_number, barangay")
    .eq("id", userId)
    .maybeSingle();

  return { data, error } as const;
}

export async function updateUserProfile(
  client: SupabaseClient<Database>,
  userId: string,
  updates: Pick<UserProfileUpdate, "first_name" | "last_name" | "contact_number">,
) {
  const { data, error } = await client
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, first_name, last_name, role, contact_number, barangay")
    .maybeSingle();

  return { data, error } as const;
}

