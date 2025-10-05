"use server";

import { createClient } from "@/server/supabase/server"; // ✅ Use server client, not browser client
import { getTableCrimeCases } from "@/server/queries/crime";

export async function getCrimeCases() {
  try {
    // ✅ Use server-side Supabase client
    const supabase = await createClient();
    
    // ✅ Execute the query
    const { data, error } = await getTableCrimeCases(supabase);
    
    // ✅ Handle Supabase errors
    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(`Failed to fetch crime cases: ${error.message}`);
    }
    
    // ✅ Transform data if needed (optional)
    const transformedData = data?.map((item) => {
      // Find suspect and complainant from case_person array
      const suspect = item.case_person?.find((cp) => cp.case_role === "suspect");
      const complainant = item.case_person?.find((cp) => cp.case_role === "complainant");

      // Format names
      const suspectName = suspect?.person_profile 
        ? `${suspect.person_profile.first_name} ${suspect.person_profile.last_name}`.trim()
        : "";
      
      const complainantName = complainant?.person_profile 
        ? `${complainant.person_profile.first_name} ${complainant.person_profile.last_name}`.trim()
        : "";

      return {
        id: item.id,
        crime_type: item.crime_type,
        case_status: item.case_status,
        suspect: suspectName || "Unknown",
        complainant: complainantName || "Unknown",
      };
    }) || [];

    return {
      data: transformedData,
      error: null,
    };
    
  } catch (error) {
    console.error("Error fetching crime cases:", error);
    
    // ✅ Return error object instead of throwing (better for UI handling)
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
