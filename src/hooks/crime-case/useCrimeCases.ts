"use client";
import { useQuery } from '@tanstack/react-query';
import { getTableCrimeCases } from '@/server/queries/crime';
import useSupabaseBrowser from '@/server/supabase/client';

// Helper function to format a person's full name
function formatPersonName(firstName: string | null, lastName: string | null): string {
  const first = firstName ?? "";
  const last = lastName ?? "";
  return `${first} ${last}`.trim();
}

function transformCrimeCaseData(data: any[]) {
  return data?.map((item) => {
    // Find suspect and complainant from case_person array
    const suspect = item.case_person?.find((cp: any) => cp.case_role === "suspect");
    const complainant = item.case_person?.find((cp: any) => cp.case_role === "complainant");

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
  }) || [];
}

export function useCrimeCases() {
  const supabase = useSupabaseBrowser();
  
  return useQuery({
    queryKey: ['crime-cases'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data: result, error } = await getTableCrimeCases(supabase);
      
      if (error) {
        throw new Error(`Failed to fetch crime cases: ${error.message}`);
      }
      
      // ✅ Transform data here
      return transformCrimeCaseData(result);
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes in background
  });
}