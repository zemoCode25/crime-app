import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createCrimeCaseTransaction, 
  updateCrimeCaseTransaction,
  deleteCrimeCaseTransaction 
} from '@/server/queries/crime';
import useSupabaseBrowser from '@/server/supabase/client';
import { CrimeCaseData, LocationData, PersonData } from '@/types/crime-case';
import toast from 'react-hot-toast';

// ✅ Separate input types for each operation
type CreateCrimeCaseInput = {
  crimeCase: CrimeCaseData;
  location: LocationData;
  persons: PersonData[];
};

type UpdateCrimeCaseInput = {
  id: number;
  crimeCase: CrimeCaseData;
  location: LocationData;
  persons: PersonData[];
};
// ✅ CREATE HOOK
export function useCreateCrimeCase() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ crimeCase, location, persons }: CreateCrimeCaseInput) => {
      if (!supabase) {
        throw new Error('Database connection error. Please try again.');
      }

      const result = await createCrimeCaseTransaction(supabase, crimeCase, location, persons);

      if (!result || result.error) {
        throw new Error(result?.error?.message || 'Failed to create crime case');
      }

      return result;
    },
    onMutate: () => {
      toast.loading('Creating crime case...', { id: 'create-crime-case' });
    },
    onSuccess: (data) => {
      toast.dismiss('create-crime-case');
      toast.success('Crime case created successfully!');
      
      queryClient.invalidateQueries({ queryKey: ['crime-cases'] });
      
      console.log('Crime case create successful:', data);
    },
    onError: (error) => {
      toast.dismiss('create-crime-case');
      
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
          toast.error(`Failed to create crime case: ${errorMessage}`);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      console.error('Crime case create error:', error);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('network')) {
        return failureCount < 2;
      }
      return false;
    },
  });
}

// ✅ UPDATE HOOK
export function useUpdateCrimeCase() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, crimeCase, location, persons }: UpdateCrimeCaseInput) => {
      if (!supabase) {
        throw new Error('Database connection error. Please try again.');
      }

      const result = await updateCrimeCaseTransaction(supabase, id, crimeCase, location, persons);

      console.log('Update result:', result);
      if (!result || result.error) {
        throw new Error(result?.error?.message || 'Failed to update crime case');
      }

      return result;
    },
    onMutate: () => {
      toast.loading('Updating crime case...', { id: 'update-crime-case' });
    },
    onSuccess: (data) => {
      if(data.error) {
        throw new Error(data.error);
      }
      toast.dismiss('update-crime-case');
      toast.success('Crime case updated successfully!');
      
      queryClient.invalidateQueries({ queryKey: ['crime-cases'] });
      queryClient.invalidateQueries({ queryKey: ['crime-case'] });
      
      console.log('Crime case update successful:', data);
    },
    onError: (error) => {
      toast.dismiss('update-crime-case');
      
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
          toast.error(`Failed to update crime case: ${errorMessage}`);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      console.error('Crime case update error:', error);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('network')) {
        return failureCount < 2;
      }
      return false;
    },
  });
}

// ✅ DELETE HOOK
export function useDeleteCrimeCase() {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      if (!supabase) {
        throw new Error('Database connection error. Please try again.');
      }

      const result = await deleteCrimeCaseTransaction(supabase, id);

      if (!result || result.error) {
        throw new Error(result?.error?.message || 'Failed to delete crime case');
      }

      return result;
    },
    onMutate: () => {
      toast.loading('Deleting crime case...', { id: 'delete-crime-case' });
    },
    onSuccess: (data) => {
      toast.dismiss('delete-crime-case');
      toast.success('Crime case deleted successfully!');
      
      queryClient.invalidateQueries({ queryKey: ['crime-cases'] });
      queryClient.invalidateQueries({ queryKey: ['crime-case'] });
      
      console.log('Crime case delete successful:', data);
    },
    onError: (error) => {
      toast.dismiss('delete-crime-case');
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('permission')) {
          toast.error("You don't have permission to perform this action");
        } else if (errorMessage.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else if (errorMessage.includes('foreign key')) {
          toast.error('Cannot delete: This case has related records');
        } else {
          toast.error(`Failed to delete crime case: ${errorMessage}`);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      console.error('Crime case delete error:', error);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('network')) {
        return failureCount < 2;
      }
      return false;
    },
  });
}