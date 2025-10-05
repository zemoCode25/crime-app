import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCrimeCaseTransaction } from '@/lib/queries/crime';
import useSupabaseBrowser from '@/lib/supabase/client';
import { CrimeCaseData, LocationData, PersonData } from '@/types/crime-case';
import toast from 'react-hot-toast';

interface CrimeCaseMutationData {
  crimeCase: CrimeCaseData;
  location: LocationData;
  persons: PersonData[];
}

export function useCrimeCaseMutation() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ crimeCase, location, persons }: CrimeCaseMutationData) => {
      if (!supabase) {
        throw new Error('Database connection error. Please try again.');
      }

      const result = await createCrimeCaseTransaction(
        supabase,
        crimeCase,
        location,
        persons
      );

      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to create crime case');
      }

      return result;
    },
    onMutate: () => {
      // Show loading toast when mutation starts
      toast.loading('Creating crime case...', { id: 'crime-case-mutation' });
    },
    onSuccess: (data) => {
      // Dismiss loading toast and show success
      toast.dismiss('crime-case-mutation');
      toast.success('Crime case created successfully!');
      
      // Invalidate and refetch crime cases list
      queryClient.invalidateQueries({ queryKey: ['crime-cases'] });
      
      console.log('Crime case created successfully:', data);
    },
    onError: (error) => {
      // Dismiss loading toast and show error
      toast.dismiss('crime-case-mutation');
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
          toast.error('A similar crime case already exists');
        } else if (errorMessage.includes('constraint') || errorMessage.includes('violation')) {
          toast.error('Invalid data provided. Please check your inputs.');
        } else if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
          toast.error("You don't have permission to create crime cases");
        } else if (errorMessage.includes('connection') || errorMessage.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error(`Failed to create crime case: ${errorMessage}`);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      console.error('Crime case mutation error:', error);
    },
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors only
      if (error instanceof Error && error.message.includes('network')) {
        return failureCount < 2;
      }
      return false;
    },
  });
}