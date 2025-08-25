"use server";
import { createClient } from "@/lib/supabase/server";

export async function getCrimeCases() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("crime_case").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data; // total number of crime
}
