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

// ==================== ADD CRIME TYPE ====================

export interface AddCrimeTypeParams {
  label: string;
}

export interface CrimeType {
  id: number;
  label: string | null;
}

/**
 * Add a new crime type.
 */
export async function addCrimeType(
  client: TypedSupabaseClient,
  params: AddCrimeTypeParams,
): Promise<CrimeType> {
  const { data, error } = await client
    .from("crime-type")
    .insert({ label: params.label })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// ==================== DELETE CRIME TYPE ====================

/**
 * Delete a crime type by ID.
 */
export async function deleteCrimeType(
  client: TypedSupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await client.from("crime-type").delete().eq("id", id);

  if (error) {
    throw error;
  }
}