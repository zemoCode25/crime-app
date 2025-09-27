import { createClient } from "@/lib/supabase/server";
import useSupabaseBrowser from "@/utils/supabase-browser";


// Server-side function (for Server Components and API routes)
export async function getCrimeTypes() {
  const supabase = useSupabaseBrowser();
  const { data, error } = await supabase
    .from("crime-type")
    .select("id, label")
    .order("id", { ascending: true });

  if (error) throw error;

  return data;
}