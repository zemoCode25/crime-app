import { TypedSupabaseClient } from '@/types/supabase-client';

// Query function for cache helpers - returns the query builder
export function getCrimeTypes(client: TypedSupabaseClient) {
  return client
    .from("crime-type")
    .select("id, label")
    .order("id", { ascending: true });
}