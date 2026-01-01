'use client';

import { useQuery } from '@tanstack/react-query';
import type { Facility, FacilitiesResponse } from '@/types/facilities';

async function fetchFacilities(): Promise<Facility[]> {
  const response = await fetch('/api/facilities');

  if (!response.ok) {
    throw new Error(`Failed to fetch facilities: ${response.statusText}`);
  }

  const data: FacilitiesResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to load facility data');
  }

  return data.data;
}

export function useFacilities(enabled: boolean = true) {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: fetchFacilities,
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
