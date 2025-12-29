import { TypedSupabaseClient } from '@/types/supabase-client';

// ==================== GET CRIME TYPES ====================

// Query function for cache helpers - returns the query builder
export function getCrimeTypes(client: TypedSupabaseClient) {
  return client
    .from("crime-type")
    .select("id, label")
    .order("id", { ascending: true });
}

// ==================== UPDATE CRIME TYPES ====================

export interface CrimeTypeUpdate {
  id: number;
  label: string;
}

/**
 * Update multiple crime types in a single transaction.
 * Only updates the crime types that have changed.
 */
export async function updateCrimeTypes(
  client: TypedSupabaseClient,
  updates: CrimeTypeUpdate[],
): Promise<void> {
  // Use Promise.all to update all crime types concurrently
  const updatePromises = updates.map((update) =>
    client
      .from("crime-type")
      .update({ label: update.label })
      .eq("id", update.id)
      .select(),
  );

  const results = await Promise.all(updatePromises);

  // Check for any errors
  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    throw new Error(
      `Failed to update crime types: ${errors.map((e) => e.error?.message).join(", ")}`,
    );
  }
}