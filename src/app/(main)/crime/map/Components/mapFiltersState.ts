import type { DateRangeValue } from "@/components/DateRangeSelector";

export interface MapFiltersState {
  statusFilters: string[];
  typeFilters: number[]; // crime_type ids
  barangayFilters: string[];
  dateRange?: DateRangeValue;
  selectedTimeFrame: string;
}

