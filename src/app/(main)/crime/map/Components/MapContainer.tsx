"use client";
import { useState } from "react";
import Map from "./MainMap";
import MapSetting from "./MapSetting";
import { SelectedLocation } from "@/types/map";
import MapFilters from "./MapFilters";
import RouteInputBar from "./RouteInputBar";
import type { MapFiltersState } from "./mapFiltersState";
import { useCrimeCasesForMap } from "@/hooks/crime-case/useCrimeCasesForMap";
import type { CrimeCaseMapRecord } from "@/types/crime-case";
import {
  useCurrentUserProfile,
  isBarangayAdmin,
} from "@/hooks/user/useCurrentUserProfile";
import {
  useRiskAssessment,
  type RiskAssessmentFilters,
} from "@/hooks/map/useRiskAssessment";
import { useRouteAssessment } from "@/hooks/map/useRouteAssessment";
import { useFacilities } from "@/hooks/map/useFacilities";
import type {
  RouteAssessmentResult,
  RoutePoint,
  TransportMode,
} from "@/types/route-assessment";

const initialFilters: MapFiltersState = {
  statusFilters: [],
  typeFilters: [],
  barangayFilters: [],
  dateRange: undefined,
  selectedTimeFrame: "last_7d",
  showFacilities: true,
};

export default function MapContainer() {
  const { data: userProfile } = useCurrentUserProfile();

  // Determine barangay filter based on user role
  const userBarangayId = isBarangayAdmin(userProfile?.role ?? null)
    ? (userProfile?.barangay ?? undefined)
    : undefined;

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [filters, setFilters] = useState<MapFiltersState>(initialFilters);
  const [selectedCase, setSelectedCase] = useState<CrimeCaseMapRecord | null>(
    null,
  );

  // Route mode state
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [routePointA, setRoutePointA] = useState<RoutePoint | null>(null);
  const [routePointB, setRoutePointB] = useState<RoutePoint | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>("walking");
  const [activePointSelection, setActivePointSelection] = useState<
    "A" | "B" | null
  >(null);
  const [routeAssessment, setRouteAssessment] =
    useState<RouteAssessmentResult | null>(null);

  const handleLocationChange = (location: SelectedLocation | null) => {
    setSelectedLocation(location);
  };

  // Convert map filters to risk assessment filters
  const riskFilters: RiskAssessmentFilters = {
    crimeTypeIds:
      filters.typeFilters.length > 0 ? filters.typeFilters : undefined,
    statusFilters:
      filters.statusFilters.length > 0 ? filters.statusFilters : undefined,
    barangayFilters:
      filters.barangayFilters.length > 0 ? filters.barangayFilters : undefined,
    dateFrom: filters.dateRange?.from?.toISOString(),
    dateTo: filters.dateRange?.to?.toISOString(),
  };

  const {
    data: riskAssessment,
    isLoading: isLoadingRisk,
    error: riskError,
  } = useRiskAssessment({
    lat: selectedLocation?.lat ?? null,
    lng: selectedLocation?.lng ?? null,
    filters: riskFilters,
    enabled: selectedLocation !== null && !isRouteMode,
  });

  const routeAssessmentMutation = useRouteAssessment({ filters: riskFilters });

  const crimeCasesQuery = useCrimeCasesForMap({
    filters: {
      statusFilters: filters.statusFilters,
      crimeTypeIds: filters.typeFilters,
      barangayFilters: filters.barangayFilters,
      dateRange: filters.dateRange,
    },
    userBarangayId,
  });
  const crimeCases = crimeCasesQuery.data ?? [];

  // Fetch facilities when toggle is enabled
  const { data: facilities } = useFacilities(filters.showFacilities);

  // Toggle route mode
  const handleToggleRouteMode = () => {
    if (isRouteMode) {
      // Exit route mode - clear everything
      setIsRouteMode(false);
      setRoutePointA(null);
      setRoutePointB(null);
      setActivePointSelection(null);
      setRouteAssessment(null);
    } else {
      // Enter route mode - start with Point A selection
      setIsRouteMode(true);
      setActivePointSelection("A");
      setRouteAssessment(null);
    }
  };

  // Handle route point selection from map
  const handleRoutePointSelected = (point: "A" | "B", location: RoutePoint) => {
    if (point === "A") {
      setRoutePointA(location);
      // Automatically switch to Point B selection if not set
      if (!routePointB) {
        setActivePointSelection("B");
      } else {
        setActivePointSelection(null);
      }
    } else {
      setRoutePointB(location);
      setActivePointSelection(null);
    }
  };

  // Calculate route
  const handleCalculateRoute = async () => {
    if (!routePointA || !routePointB) return;

    try {
      const result = await routeAssessmentMutation.mutateAsync({
        pointA: routePointA,
        pointB: routePointB,
        transportMode,
      });
      setRouteAssessment(result);
    } catch (error) {
      console.error("Route assessment failed:", error);
    }
  };

  // Clear route and exit route mode
  const handleClearRoute = () => {
    setRouteAssessment(null);
    setRoutePointA(null);
    setRoutePointB(null);
    setActivePointSelection(null);
    setIsRouteMode(false);
  };

  // Cancel route mode
  const handleCancelRouteMode = () => {
    setIsRouteMode(false);
    setRoutePointA(null);
    setRoutePointB(null);
    setActivePointSelection(null);
    setRouteAssessment(null);
  };

  // Handle facility click - activate route mode from current pin to facility
  const handleFacilityRouteSelect = (facility: RoutePoint) => {
    // Set Point A as current selected location (or use default marker position)
    const pointA: RoutePoint = selectedLocation
      ? {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: selectedLocation.address,
        }
      : {
          lat: 14.389263,
          lng: 121.04491,
          address: "Current location",
        };

    // Enter route mode with Point A (current location) and Point B (facility)
    setIsRouteMode(true);
    setRoutePointA(pointA);
    setRoutePointB(facility);
    setActivePointSelection(null);
    setRouteAssessment(null);
  };

  return (
    <div className="relative mt-10 flex gap-4">
      <div className="flex w-full flex-col gap-2">
        {isRouteMode ? (
          <RouteInputBar
            pointA={routePointA}
            pointB={routePointB}
            transportMode={transportMode}
            onTransportModeChange={setTransportMode}
            onPointAChange={setRoutePointA}
            onPointBChange={setRoutePointB}
            onCalculateRoute={handleCalculateRoute}
            onCancel={handleCancelRouteMode}
            isCalculating={routeAssessmentMutation.isPending}
            activePointSelection={activePointSelection}
            onSetActivePointSelection={setActivePointSelection}
          />
        ) : (
          <MapFilters
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
            filters={filters}
            onFiltersChange={setFilters}
            selectedCase={selectedCase}
            onToggleRouteMode={handleToggleRouteMode}
          />
        )}
        <Map
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
          crimeCases={crimeCases}
          onCaseSelect={setSelectedCase}
          routeAssessment={routeAssessment}
          onClearRoute={handleClearRoute}
          // Route mode props
          isRouteMode={isRouteMode}
          activePointSelection={activePointSelection}
          routePointA={routePointA}
          routePointB={routePointB}
          onRoutePointSelected={handleRoutePointSelected}
          // Facilities props
          facilities={facilities}
          showFacilities={filters.showFacilities}
          onFacilityRouteSelect={handleFacilityRouteSelect}
        />
      </div>
      <MapSetting
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        selectedCase={selectedCase}
        riskAssessment={riskAssessment}
        isLoadingRisk={isLoadingRisk}
        riskError={riskError}
        routeAssessment={routeAssessment}
        onClearRoute={handleClearRoute}
        isRouteMode={isRouteMode}
      />
    </div>
  );
}
