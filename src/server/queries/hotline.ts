import { TypedSupabaseClient } from "@/types/supabase-client";

export interface Hotline {
  id: number;
  label: string | null;
  number: string | null;
  created_at: string;
  user_id: string | null;
}

/**
 * Get all hotlines.
 */
export async function getHotlines(
  client: TypedSupabaseClient,
): Promise<Hotline[]> {
  const { data, error } = await client
    .from("hotline")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

// ==================== UPDATE HOTLINES ====================

export interface HotlineUpdate {
  id: number;
  number: string;
}

/**
 * Update multiple hotlines in batch.
 * Only updates the `number` field for each hotline.
 */
export async function updateHotlines(
  client: TypedSupabaseClient,
  updates: HotlineUpdate[],
): Promise<void> {
  if (updates.length === 0) return;

  // Update each hotline individually using Promise.all
  const results = await Promise.all(
    updates.map((update) =>
      client
        .from("hotline")
        .update({ number: update.number })
        .eq("id", update.id),
    ),
  );

  // Check for any errors
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    throw new Error(`Failed to update ${errors.length} hotline(s)`);
  }
}

// ==================== ADD HOTLINE ====================

export interface AddHotlineParams {
  label: string;
  number: string;
}

/**
 * Add a new hotline.
 * Automatically sets the user_id to the current authenticated user.
 */
export async function addHotline(
  client: TypedSupabaseClient,
  params: AddHotlineParams,
): Promise<Hotline> {
  const { label, number } = params;

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await client
    .from("hotline")
    .insert({
      label,
      number,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// ==================== DELETE HOTLINE ====================

/**
 * Delete a hotline by ID.
 */
export async function deleteHotline(
  client: TypedSupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await client.from("hotline").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
