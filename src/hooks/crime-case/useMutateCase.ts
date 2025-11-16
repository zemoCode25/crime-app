import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCrimeCaseTransaction,
  updateCrimeCaseTransaction,
  deleteCrimeCaseTransaction,
} from '@/server/queries/crime';
import useSupabaseBrowser from '@/server/supabase/client';
import {
  CrimeCaseData,
  LocationData,
  PersonData,
  CrimeCaseTransactionResult,
} from '@/types/crime-case';
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
    mutationFn: async ({
      crimeCase,
      location,
      persons,
    }: CreateCrimeCaseInput): Promise<CrimeCaseTransactionResult> => {
      if (!supabase) {
        throw new Error('Database connection error. Please try again.');
      }

      const { data, error } = await createCrimeCaseTransaction(
        supabase,
        crimeCase,
        location,
        persons,
      );

      if (error) {
        throw new Error(error.message || 'Failed to create crime case');
      }

      const payload = data as CrimeCaseTransactionResult | null;

      if (!payload || payload.success === false) {
        throw new Error(
          payload?.error || payload?.message || 'Failed to create crime case',
        );
      }

      console.log('Create result:', payload);

      return payload;
    },
    onMutate: () => {
      toast.loading('Creating crime case...', { id: 'create-crime-case' });
    },
    onSuccess: (payload) => {
      toast.dismiss('create-crime-case');
      toast.success(payload.message || 'Crime case created successfully!');

      queryClient.invalidateQueries({ queryKey: ['crime-cases'] });

      console.log('Crime case create successful:', payload);
    },
    onError: (error) => {
      toast.dismiss('create-crime-case');

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();

        if (msg.includes('permission')) {
          toast.error("You don't have permission to create crime cases.");
        } else if (msg.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else if (msg.includes('validation') || msg.includes('invalid')) {
          toast.error('The case data is invalid. Please review the form and try again.');
        } else {
          toast.error(error.message || 'Failed to create crime case');
        }
      } else {
        toast.error('An unexpected error occurred while creating the crime case.');
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
    mutationFn: async ({
      id,
      crimeCase,
      location,
      persons,
    }: UpdateCrimeCaseInput): Promise<CrimeCaseTransactionResult> => {
      if (!supabase) {
        throw new Error('Database connection error. Please try again.');
      }

      const { data, error } = await updateCrimeCaseTransaction(
        supabase,
        id,
        crimeCase,
        location,
        persons,
      );

      if (error) {
        throw new Error(error.message || 'Failed to update crime case');
      }

      const payload = data as CrimeCaseTransactionResult | null;

      if (!payload || payload.success === false) {
        throw new Error(
          payload?.error || payload?.message || 'Failed to update crime case',
        );
      }

      console.log('Update result:', payload);

      return payload;
    },
    onMutate: () => {
      toast.loading('Updating crime case...', { id: 'update-crime-case' });
    },
    onSuccess: (payload) => {
      toast.dismiss('update-crime-case');
      toast.success(payload.message || 'Crime case updated successfully!');

      queryClient.invalidateQueries({ queryKey: ['crime-cases'] });
      queryClient.invalidateQueries({ queryKey: ['crime-case'] });

      console.log('Crime case update successful:', payload);
    },
    onError: (error) => {
      toast.dismiss('update-crime-case');

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();

        if (msg.includes('permission')) {
          toast.error("You don't have permission to update this crime case.");
        } else if (msg.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else if (msg.includes('not found')) {
          toast.error('This crime case no longer exists.');
        } else if (msg.includes('validation') || msg.includes('invalid')) {
          toast.error('The case data is invalid. Please review the form and try again.');
        } else {
          toast.error(error.message || 'Failed to update crime case');
        }
      } else {
        toast.error('An unexpected error occurred while updating the crime case.');
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
