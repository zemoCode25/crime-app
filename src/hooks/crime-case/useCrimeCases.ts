"use client";
import { useQuery } from '@tanstack/react-query';
import { getTableCrimeCases } from '@/server/queries/crime';
import useSupabaseBrowser from '@/server/supabase/client';
import type { CrimeCaseListItem, CrimeCaseListRecord } from '@/types/crime-case';

// Helper function to format a person's full name
function formatPersonName(firstName: string | null, lastName: string | null): string {
  const first = firstName ?? "";
  const last = lastName ?? "";
  return `${first} ${last}`.trim();
}

function transformCrimeCaseData(
  data: CrimeCaseListRecord[] = [],
): CrimeCaseListItem[] {
  return data.map((item) => {
    // Find suspect and complainant from case_person array
    const suspect = item.case_person?.find(
      (cp) => cp.case_role === "suspect",
    );
    const complainant = item.case_person?.find(
      (cp) => cp.case_role === "complainant",
    );

    // Format names using helper function
    const suspectName = suspect?.person_profile 
      ? formatPersonName(suspect.person_profile.first_name, suspect.person_profile.last_name)
      : "";
    
    const complainantName = complainant?.person_profile 
      ? formatPersonName(complainant.person_profile.first_name, complainant.person_profile.last_name)
      : "";

    return {
      id: item.id,
      case_number: item.case_number,
      crime_type: item.crime_type,
      case_status: item.case_status,
      suspect: suspectName || "Unknown",
      complainant: complainantName || "Unknown",
      incident_datetime: item.incident_datetime,
      report_datetime: item.report_datetime,
    };
  });
}

export interface UseCrimeCasesOptions {
  barangayId?: number; // Filter by barangay (for barangay_admin users)
}

export function useCrimeCases(options?: UseCrimeCasesOptions) {
  const supabase = useSupabaseBrowser();
  const { barangayId } = options || {};

  console.log(options);
  console.log("Fetching crime cases with barangayId(useCrimeCases):", barangayId);

  return useQuery({
    queryKey: ["crime-cases", barangayId],
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      const { data: result, error } = await getTableCrimeCases(
        supabase,
        barangayId
      );

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
