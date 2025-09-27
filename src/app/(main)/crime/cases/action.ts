"use server";
import { createClient } from '@/utils/supabase-server';
import { getTableCrimeCases } from '@/lib/queries/crime';

// Helper function to format a person's full name
function formatPersonName(firstName: string | null, lastName: string | null): string {
  const first = firstName ?? "";
  const last = lastName ?? "";
  return `${first} ${last}`.trim();
}

export async function getTableCases() {
  const supabase = await createClient();
  
  try {
    // Execute the query and get the result
    const { data: result, error } = await getTableCrimeCases(supabase);
    
    if (error) {
      throw new Error(`Failed to fetch crime cases: ${error.message}`);
    }
    
    if (!result) {
      return [];
    }

    // Transform the data to a cleaner format
    const transformedData = result.map((item) => {
      // Find suspect and complainant from case_person array
      const suspect = item.case_person?.find((cp) => cp.case_role === "suspect");
      const complainant = item.case_person?.find((cp) => cp.case_role === "complainant");

      // Format names using helper function
      const suspectName = suspect?.person_profile 
        ? formatPersonName(suspect.person_profile.first_name, suspect.person_profile.last_name)
        : "";
      
      const complainantName = complainant?.person_profile 
        ? formatPersonName(complainant.person_profile.first_name, complainant.person_profile.last_name)
        : "";

      return {
        id: item.id,
        crime_type: item.crime_type,
        case_status: item.case_status,
        suspect: suspectName || "Unknown",
        complainant: complainantName || "Unknown",
      };
    });

    return transformedData;
    
  } catch (error) {
    console.error('Error fetching crime cases:', error);
    throw error; // Re-throw to let the caller handle it
  }
}
