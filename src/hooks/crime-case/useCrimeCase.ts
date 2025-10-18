import useSupabaseBrowser from "@/server/supabase/client";
import { getCrimeCaseById } from "@/server/queries/crime";
import { useQuery } from "@tanstack/react-query";
export function useCrimeCase(caseId: number) {
    
  const supabase = useSupabaseBrowser();

  return useQuery({
    queryKey: ['crime-case', caseId],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
        const { data: result, error } = await getCrimeCaseById(supabase, caseId);
        if (error) {
            throw new Error(`Failed to fetch crime case: ${error.message}`);
        }
        return result;
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes in background
});
}