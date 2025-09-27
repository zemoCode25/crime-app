import { createClient } from "@/lib/supabase/server";
import { createClient as createClientBrowser } from "@/lib/supabase/client";

// Server-side function (for Server Components and API routes)
export async function getCrimeTypes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crime-type")
    .select("id, label")
    .order("id", { ascending: true });

  if (error) throw error;

  return data;
}

// Client-side function (for Client Components and TanStack Query)
export async function getCrimeTypesClient() {
  const supabase = createClientBrowser();
  const { data, error } = await supabase
    .from("crime-type")
    .select("id, label")
    .order("id", { ascending: true });

  if (error) throw error;

  return data;
}
