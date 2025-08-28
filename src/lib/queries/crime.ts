"use server";
import { createClient } from "@/lib/supabase/server";

export async function getTableCrimeCases() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crime_case")
    .select(
      `
    id,
    crime_type,
    case_status,
    case_person (
      case_role,
      person_profile ( first_name, last_name )
    )
  `,
    )
    .order("id", { ascending: true });

  if (error) throw error;

  data?.forEach((crime) => {
    crime.case_person.forEach((cp) => {
      const profile = cp.person_profile?.[0]; // take first (since only one exists)
      if (profile) {
        console.log(
          `${cp.case_role}: ${profile.first_name} ${profile.last_name}`,
        );
      }
    });
  });

  if (error) console.error(error);

  return data;
}
