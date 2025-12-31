"use client";
import { useState } from "react";
import Map from "./MainMap";
import MapSetting from "./MapSetting";
import { SelectedLocation } from "@/types/map";
import MapFilters from "./MapFilters";
import type { MapFiltersState } from "./mapFiltersState";
import { useCrimeCasesForMap } from "@/hooks/crime-case/useCrimeCasesForMap";
import type { CrimeCaseMapRecord } from "@/types/crime-case";
import { useRiskAssessment } from "@/hooks/map/useRiskAssessment";

const initialFilters: MapFiltersState = {
  statusFilters: [],
  typeFilters: [],
  barangayFilters: [],
  dateRange: undefined,
  selectedTimeFrame: "last_7d",
};

export default function MapContainer() {
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [filters, setFilters] = useState<MapFiltersState>(initialFilters);
  const [selectedCase, setSelectedCase] = useState<CrimeCaseMapRecord | null>(
    null,
  );

  const handleLocationChange = (location: SelectedLocation | null) => {
    setSelectedLocation(location);
  };

  const { data: riskAssessment, isLoading: isLoadingRisk, error: riskError } = useRiskAssessment({
    lat: selectedLocation?.lat ?? null,
    lng: selectedLocation?.lng ?? null,
    enabled: selectedLocation !== null,
  });

  const crimeCasesQuery = useCrimeCasesForMap({
    statusFilters: filters.statusFilters,
    crimeTypeIds: filters.typeFilters,
    barangayFilters: filters.barangayFilters,
    dateRange: filters.dateRange,
  });
  const crimeCases = crimeCasesQuery.data ?? [];

  return (
    <div className="relative mt-10 flex gap-4">
      <div className="flex w-full flex-col gap-2">
        <MapFilters
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
          filters={filters}
          onFiltersChange={setFilters}
          selectedCase={selectedCase}
        />
        <Map
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
          crimeCases={crimeCases}
          onCaseSelect={setSelectedCase}
        />
      </div>
      <MapSetting
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        selectedCase={selectedCase}
        riskAssessment={riskAssessment}
        isLoadingRisk={isLoadingRisk}
        riskError={riskError}
      />
    </div>
  );
}
