"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCrimeCases() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.from("crime_case").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data; // total number of crime
}
