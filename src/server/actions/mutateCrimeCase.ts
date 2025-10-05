import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createCrimeCaseTransaction, 
  updateCrimeCaseTransaction,
  deleteCrimeCaseTransaction 
} from '@/server/queries/crime';
import useSupabaseBrowser from '@/server/supabase/client';
import { CrimeCaseData, LocationData, PersonData } from '@/types/crime-case';
import toast from 'react-hot-toast';

type CrimeCaseOperation = 'create' | 'update' | 'delete';

interface CrimeCaseMutationData {
  operation: CrimeCaseOperation;
  id?: number; // For update/delete
  crimeCase?: CrimeCaseData;
  location?: LocationData;
  persons?: PersonData[];
}

export function CrimeCaseMutation(operation: CrimeCaseOperation = 'create') {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  const operationConfig = {
    create: {
      mutationFn: async ({ crimeCase, location, persons }: CrimeCaseMutationData) => {
        return createCrimeCaseTransaction(supabase, crimeCase!, location!, persons!);
      },
      loadingMessage: 'Creating crime case...',
      successMessage: 'Crime case created successfully!',
      errorMessage: 'Failed to create crime case',
    },
    update: {
      mutationFn: async ({ id, crimeCase, location, persons }: CrimeCaseMutationData) => {
        return updateCrimeCaseTransaction(supabase, id!, crimeCase!, location!, persons!);
      },
      loadingMessage: 'Updating crime case...',
      successMessage: 'Crime case updated successfully!',
      errorMessage: 'Failed to update crime case',
    },
    delete: {
      mutationFn: async ({ id }: CrimeCaseMutationData) => {
        return deleteCrimeCaseTransaction(supabase, id!);
      },
      loadingMessage: 'Deleting crime case...',
      successMessage: 'Crime case deleted successfully!',
      errorMessage: 'Failed to delete crime case',
    },
  };

  const config = operationConfig[operation];

  return useMutation({
    mutationFn: async (data: Omit<CrimeCaseMutationData, 'operation'>) => {
      if (!supabase) {
        throw new Error('Database connection error. Please try again.');
      }

      const result = await config.mutationFn({ ...data, operation });

      if (!result || result.error) {
        throw new Error(result?.error?.message || config.errorMessage);
      }

      return result;
    },
    onMutate: () => {
      toast.loading(config.loadingMessage, { id: 'crime-case-mutation' });
    },
    onSuccess: (data) => {
      toast.dismiss('crime-case-mutation');
      toast.success(config.successMessage);
      
      // Invalidate queries based on operation
      queryClient.invalidateQueries({ queryKey: ['crime-cases'] });
      if (operation === 'update' || operation === 'delete') {
        queryClient.invalidateQueries({ queryKey: ['crime-case'] });
      }
      
      console.log(`Crime case ${operation} successful:`, data);
    },
    onError: (error) => {
      toast.dismiss('crime-case-mutation');
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('duplicate')) {
          toast.error('A similar crime case already exists');
        } else if (errorMessage.includes('constraint')) {
          toast.error('Invalid data provided. Please check your inputs.');
        } else if (errorMessage.includes('permission')) {
          toast.error("You don't have permission to perform this action");
        } else if (errorMessage.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error(`${config.errorMessage}: ${errorMessage}`);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      console.error(`Crime case ${operation} error:`, error);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('network')) {
        return failureCount < 2;
      }
      return false;
    },
  });
}