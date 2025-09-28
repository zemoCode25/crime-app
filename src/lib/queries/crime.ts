"use server";
import { TypedSupabaseClient } from "@/types/supabase-client";

export async function getTableCrimeCases(client: TypedSupabaseClient) {
  return client
    .from("crime_case")
    .select(
      `
      id,
      crime_type,
      case_status,
      case_person (
        case_role,
        person_profile ( 
          first_name, 
          last_name 
        )
      )
      `
    )
    .order("id", { ascending: true });
}