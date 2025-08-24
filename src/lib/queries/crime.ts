"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchProducts() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;

  return data;
}
