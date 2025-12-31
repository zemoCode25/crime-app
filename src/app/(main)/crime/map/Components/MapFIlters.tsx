import { useState, type KeyboardEvent } from "react";
import { SelectedLocation } from "@/types/map";
import {
  MapPinIcon,
  Search,
  X,
  CircleArrowOutUpRight,
  ChevronsUpDownIcon,
  FunnelX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchSuggestion,
  useMapboxSearch,
  reverseGeocodeMapbox,
} from "@/hooks/map/useMapboxSearch";
import { useCrimeTypes } from "@/hooks/crime-case/useCrimeTypes";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BARANGAY_OPTIONS, STATUSES } from "@/constants/crime-case";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DateRangeSelector from "@/components/DateRangeSelector";
import type { MapFiltersState } from "./mapFiltersState";
import RouteInputBar from "./RouteInputBar";
import type { RoutePoint, TransportMode } from "@/types/route-assessment";

import type { CrimeCaseMapRecord } from "@/types/crime-case";

interface MapFiltersProps {
  selectedLocation: SelectedLocation | null;
  onLocationChange: (location: SelectedLocation | null) => void;
  filters: MapFiltersState;
  onFiltersChange: (filters: MapFiltersState) => void;
  selectedCase: CrimeCaseMapRecord | null;
  // Route mode props
  isRouteMode?: boolean;
  onToggleRouteMode?: () => void;
  routePointA?: RoutePoint | null;
  routePointB?: RoutePoint | null;
  transportMode?: TransportMode;
  onTransportModeChange?: (mode: TransportMode) => void;
  onPointAChange?: (point: RoutePoint | null) => void;
  onPointBChange?: (point: RoutePoint | null) => void;
  onCalculateRoute?: () => void;
  onCancelRouteMode?: () => void;
  isCalculatingRoute?: boolean;
  activePointSelection?: "A" | "B" | null;
  onSetActivePointSelection?: (point: "A" | "B" | null) => void;
}

export default function MapFilters({
  onLocationChange,
  filters,
  onFiltersChange,
  // Route mode props
  isRouteMode = false,
  onToggleRouteMode,
  routePointA,
  routePointB,
  transportMode = "walking",
  onTransportModeChange,
  onPointAChange,
  onPointBChange,
  onCalculateRoute,
  onCancelRouteMode,
  isCalculatingRoute = false,
  activePointSelection,
  onSetActivePointSelection,
}: MapFiltersProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [barangayOpen, setBarangayOpen] = useState(false);
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isLocating, setIsLocating] = useState(false);

  const { suggestions, loading, searchLocation, retrieveLocation } =
    useMapboxSearch();
  const { data: crimeTypes } = useCrimeTypes();

  const {
    statusFilters,
    typeFilters,
    barangayFilters,
    dateRange,
    selectedTimeFrame,
  } = filters;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 2) {
      searchLocation(value);
      setSearchOpen(true);
      setHighlightedIndex(0); // 0 = current location row
    } else {
      setSearchOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined") return;
    if (!navigator.geolocation) return;

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        const label = await reverseGeocodeMapbox(lat, lng);
        const address = label || "Current location";

        onLocationChange({
          lat,
          lng,
          address,
        });

        setSearchQuery(address);
        setSearchOpen(false);
        setHighlightedIndex(-1);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen) return;

    const totalItems = 1 + suggestions.length; // 0: current location, 1..n: suggestions

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const safePrev = prev < 0 ? 0 : prev;
        const next = safePrev + 1;
        return next >= totalItems ? 0 : next;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const safePrev = prev < 0 ? 0 : prev;
        const next = safePrev - 1;
        return next < 0 ? totalItems - 1 : next;
      });
    } else if (event.key === "Enter") {
      if (highlightedIndex < 0) return;
      event.preventDefault();

      if (highlightedIndex === 0) {
        handleUseCurrentLocation();
      } else {
        const suggestionIndex = highlightedIndex - 1;
        if (suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
          const suggestion = suggestions[suggestionIndex];
          handleSelectLocation(suggestion.mapbox_id, suggestion.name);
        }
      }
    }
  };

  const handleStatusFilterToggle = (value: string) => {
    const next = statusFilters.includes(value)
      ? statusFilters.filter((v) => v !== value)
      : [...statusFilters, value];
    onFiltersChange({ ...filters, statusFilters: next });
  };

  const handleCrimeTypeFilterToggle = (id: number) => {
    const next = typeFilters.includes(id)
      ? typeFilters.filter((v) => v !== id)
      : [...typeFilters, id];
    onFiltersChange({ ...filters, typeFilters: next });
  };

  const handleBarangayFilterToggle = (value: string) => {
    const next = barangayFilters.includes(value)
      ? barangayFilters.filter((v) => v !== value)
      : [...barangayFilters, value];
    onFiltersChange({ ...filters, barangayFilters: next });
  };

  const handleClearAllFilters = () => {
    onFiltersChange({
      statusFilters: [],
      typeFilters: [],
      barangayFilters: [],
      dateRange: undefined,
      selectedTimeFrame: "last_7d",
    });
  };

  const handleSelectLocation = async (mapboxId: string, name: string) => {
    const result = await retrieveLocation(mapboxId);

    if (result) {
      onLocationChange({
        lat: result.coordinates.lat,
        lng: result.coordinates.lng,
        address: result.full_address,
      });
      setSearchQuery(name);
      setSearchOpen(false);
    }
  };

  return (
    <div>
      {isRouteMode ? (
        // Route mode input bar
        <RouteInputBar
          pointA={routePointA ?? null}
          pointB={routePointB ?? null}
          transportMode={transportMode}
          onTransportModeChange={onTransportModeChange ?? (() => {})}
          onPointAChange={onPointAChange ?? (() => {})}
          onPointBChange={onPointBChange ?? (() => {})}
          onCalculateRoute={onCalculateRoute ?? (() => {})}
          onCancel={onCancelRouteMode ?? (() => {})}
          isCalculating={isCalculatingRoute}
          activePointSelection={activePointSelection ?? null}
          onSetActivePointSelection={onSetActivePointSelection ?? (() => {})}
        />
      ) : (
        // Normal search bar
        <div className="relative w-fit">
          <div className="flex items-center gap-2">
            <div>
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="location-search"
                type="text"
                placeholder="Search in Muntinlupa City..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white pr-10 pl-10"
              />
            </div>
            <Button
              onClick={onToggleRouteMode}
              className="cursor-pointer rounded-md bg-orange-600 px-3 py-2.5 text-white hover:bg-orange-700"
              title="Route Safety Assessment"
            >
              <CircleArrowOutUpRight className="h-4 w-4 text-white" />
            </Button>
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(false);
                setHighlightedIndex(-1);
              }}
            className="absolute top-1/2 right-15 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {/* Suggestions Dropdown */}
        {searchOpen && (
          <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      highlightedIndex === 0 ? "bg-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isLocating ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
                      ) : (
                        <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {isLocating
                            ? "Locating your current position..."
                            : "Use my current location"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {isLocating
                            ? "Waiting for browser permission"
                            : "Center map on where you are now"}
                        </span>
                      </div>
                    </div>
                  </button>
                  <div className="p-4 text-center text-sm text-gray-500">
                    Searching...
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      highlightedIndex === 0 ? "bg-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isLocating ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
                      ) : (
                        <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {isLocating
                            ? "Locating your current position..."
                            : "Use my current location"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {isLocating
                            ? "Waiting for browser permission"
                            : "Center map on where you are now"}
                        </span>
                      </div>
                    </div>
                  </button>
                  {suggestions.length > 0
                    ? suggestions.map(
                        (suggestion: SearchSuggestion, index: number) => (
                          <button
                            key={suggestion.mapbox_id}
                            onClick={() =>
                              handleSelectLocation(
                                suggestion.mapbox_id,
                                suggestion.name,
                              )
                            }
                            className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 ${
                              index + 1 === highlightedIndex
                                ? "bg-gray-100"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {suggestion.name}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                  {suggestion.place_formatted}
                                </p>
                              </div>
                            </div>
                          </button>
                        ),
                      )
                    : searchQuery.length > 2 && (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No locations found
                        </div>
                      )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Filters Section */}
      <div className="my-2 flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={statusOpen}
              className="w-fit justify-between"
              size="sm"
            >
              Status
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Select status" />
              <CommandList>
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  {STATUSES.map((status) => (
                    <CommandItem
                      key={status.value}
                      value={status.value}
                      onSelect={() => handleStatusFilterToggle(status.value)}
                    >
                      <Checkbox
                        id={status.value}
                        checked={statusFilters.includes(status.value)}
                      />
                      <Label
                        htmlFor={status.value}
                        className="ml-2 cursor-pointer"
                      >
                        {status.label}
                      </Label>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Crime Type Filter */}
        <Popover open={crimeTypeOpen} onOpenChange={setCrimeTypeOpen}>
          <PopoverTrigger asChild className="w-fit">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={crimeTypeOpen}
              className="w-fit justify-between"
              size="sm"
            >
              Type
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Select crime type" />
              <CommandList>
                <CommandEmpty>No crime type found.</CommandEmpty>
                <CommandGroup>
                  {(crimeTypes ?? []).map((crimeType) => (
                    <CommandItem
                      key={crimeType.id}
                      value={String(crimeType.id)}
                      onSelect={() => {
                        handleCrimeTypeFilterToggle(crimeType.id);
                      }}
                    >
                      <Checkbox
                        id={String(crimeType.id)}
                        checked={typeFilters.includes(crimeType.id)}
                      />
                      <Label
                        htmlFor={String(crimeType.id)}
                        className="ml-2 cursor-pointer"
                      >
                        {crimeType.label}
                      </Label>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Barangay Filter */}
        <Popover open={barangayOpen} onOpenChange={setBarangayOpen}>
          <PopoverTrigger asChild className="w-fit">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={barangayOpen}
              className="w-fit justify-between"
              size="sm"
            >
              Barangay
              <ChevronsUpDownIcon className="!m-0 ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Select barangay" />
              <CommandList>
                <CommandEmpty>No barangay found.</CommandEmpty>
                <CommandGroup className="max-h-36 overflow-auto">
                  {BARANGAY_OPTIONS.map((barangay) => (
                    <CommandItem
                      key={barangay.value}
                      value={barangay.value}
                      onSelect={() => {
                        handleBarangayFilterToggle(barangay.value);
                      }}
                    >
                      <Checkbox
                        id={barangay.value}
                        checked={barangayFilters.includes(barangay.value)}
                      />
                      <Label
                        htmlFor={barangay.value}
                        className="ml-2 cursor-pointer"
                      >
                        {barangay.value}
                      </Label>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <DateRangeSelector
          dateRange={dateRange}
          setDateRange={(next) =>
            onFiltersChange({ ...filters, dateRange: next })
          }
          selectedTimeFrame={selectedTimeFrame}
          setSelectedTimeFrame={(next) =>
            onFiltersChange({ ...filters, selectedTimeFrame: next })
          }
        />
      </div>

      {/* Active filter badges */}
      {(statusFilters.length > 0 ||
        typeFilters.length > 0 ||
        barangayFilters.length > 0 ||
        selectedTimeFrame !== "last_7d") && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {statusFilters.map((value) => {
            const status = STATUSES.find((s) => s.value === value);
            const label = status?.label ?? value;
            return ("" + value).length ? (
              <Badge
                key={`status-${value}`}
                variant="secondary"
                className="flex items-center gap-1 bg-black px-2 py-1 text-white"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleStatusFilterToggle(value)}
                  className="ml-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </Badge>
            ) : null;
          })}

          {typeFilters.map((id) => {
            const crimeType = (crimeTypes ?? []).find((ct) => ct.id === id);
            if (!crimeType) return null;
            return (
              <Badge
                key={`type-${id}`}
                variant="secondary"
                className="flex items-center gap-1 bg-black px-2 py-1 text-white"
              >
                {crimeType.label}
                <button
                  type="button"
                  onClick={() => handleCrimeTypeFilterToggle(id)}
                  className="ml-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            );
          })}

          {barangayFilters.map((value) => (
            <Badge
              key={`barangay-${value}`}
              variant="secondary"
              className="flex items-center gap-1 bg-black px-2 py-1 text-white"
            >
              {value}
              <button
                type="button"
                onClick={() => handleBarangayFilterToggle(value)}
                className="ml-1 text-xs text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </Badge>
          ))}

          {selectedTimeFrame !== "last_7d" && (
            <Badge
              key="timeframe"
              variant="outline"
              className="flex items-center gap-1 bg-black px-2 py-1 text-white"
            >
              Time:{" "}
              {selectedTimeFrame === "custom" ? "Custom" : selectedTimeFrame}
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    selectedTimeFrame: "last_7d",
                    dateRange: undefined,
                  })
                }
                className="ml-1 text-xs text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </Badge>
          )}

          <button
            type="button"
            onClick={handleClearAllFilters}
            className="ml-2 flex gap-2 rounded-sm border p-1 text-xs font-medium"
          >
            <FunnelX size={13} />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
