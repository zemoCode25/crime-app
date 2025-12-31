"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Navigation,
  Loader2,
  Footprints,
  Bike,
  Car,
  LocateFixed,
  MapPin,
  Search,
} from "lucide-react";
import type { RoutePoint, TransportMode } from "@/types/route-assessment";
import {
  useMapboxSearch,
  reverseGeocodeMapbox,
  type SearchSuggestion,
} from "@/hooks/map/useMapboxSearch";

interface RouteInputBarProps {
  pointA: RoutePoint | null;
  pointB: RoutePoint | null;
  transportMode: TransportMode;
  onTransportModeChange: (mode: TransportMode) => void;
  onPointAChange: (point: RoutePoint | null) => void;
  onPointBChange: (point: RoutePoint | null) => void;
  onCalculateRoute: () => void;
  onCancel: () => void;
  isCalculating: boolean;
  activePointSelection: "A" | "B" | null;
  onSetActivePointSelection: (point: "A" | "B" | null) => void;
}

const TRANSPORT_MODES: {
  mode: TransportMode;
  icon: typeof Footprints;
  label: string;
}[] = [
  { mode: "walking", icon: Footprints, label: "Walk" },
  { mode: "cycling", icon: Bike, label: "Bike" },
  { mode: "driving", icon: Car, label: "Drive" },
];

export default function RouteInputBar({
  pointA,
  pointB,
  transportMode,
  onTransportModeChange,
  onPointAChange,
  onPointBChange,
  onCalculateRoute,
  onCancel,
  isCalculating,
  activePointSelection,
  onSetActivePointSelection,
}: RouteInputBarProps) {
  const [isLocatingA, setIsLocatingA] = useState(false);
  const [isLocatingB, setIsLocatingB] = useState(false);
  const [searchQueryA, setSearchQueryA] = useState("");
  const [searchQueryB, setSearchQueryB] = useState("");
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);
  const [highlightedIndexA, setHighlightedIndexA] = useState(-1);
  const [highlightedIndexB, setHighlightedIndexB] = useState(-1);

  const inputRefA = useRef<HTMLInputElement>(null);
  const inputRefB = useRef<HTMLInputElement>(null);
  const dropdownRefA = useRef<HTMLDivElement>(null);
  const dropdownRefB = useRef<HTMLDivElement>(null);

  const searchA = useMapboxSearch();
  const searchB = useMapboxSearch();

  // Update search query when point changes externally (from map click)
  useEffect(() => {
    if (pointA?.address) {
      setSearchQueryA(pointA.address);
    } else if (!pointA) {
      setSearchQueryA("");
    }
  }, [pointA]);

  useEffect(() => {
    if (pointB?.address) {
      setSearchQueryB(pointB.address);
    } else if (!pointB) {
      setSearchQueryB("");
    }
  }, [pointB]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefA.current &&
        !dropdownRefA.current.contains(event.target as Node) &&
        inputRefA.current &&
        !inputRefA.current.contains(event.target as Node)
      ) {
        setShowDropdownA(false);
      }
      if (
        dropdownRefB.current &&
        !dropdownRefB.current.contains(event.target as Node) &&
        inputRefB.current &&
        !inputRefB.current.contains(event.target as Node)
      ) {
        setShowDropdownB(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUseCurrentLocation = async (point: "A" | "B") => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    const setLocating = point === "A" ? setIsLocatingA : setIsLocatingB;
    const setPoint = point === "A" ? onPointAChange : onPointBChange;

    setLocating(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const lat = Number(position.coords.latitude.toFixed(6));
      const lng = Number(position.coords.longitude.toFixed(6));

      const address = await reverseGeocodeMapbox(lat, lng);

      setPoint({
        lat,
        lng,
        address: address || "Current location",
      });

      onSetActivePointSelection(null);
      if (point === "A") {
        setShowDropdownA(false);
      } else {
        setShowDropdownB(false);
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location permission denied. Please enable location access in your browser settings."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out. Please try again.");
            break;
        }
      }
    } finally {
      setLocating(false);
    }
  };

  const handleSearchChange = (point: "A" | "B", value: string) => {
    if (point === "A") {
      setSearchQueryA(value);
      if (value.length > 2) {
        searchA.searchLocation(value);
        setShowDropdownA(true);
        setHighlightedIndexA(0);
      } else {
        setShowDropdownA(false);
      }
    } else {
      setSearchQueryB(value);
      if (value.length > 2) {
        searchB.searchLocation(value);
        setShowDropdownB(true);
        setHighlightedIndexB(0);
      } else {
        setShowDropdownB(false);
      }
    }
  };

  const handleSelectLocation = async (
    point: "A" | "B",
    mapboxId: string,
    name: string
  ) => {
    const search = point === "A" ? searchA : searchB;
    const setPoint = point === "A" ? onPointAChange : onPointBChange;

    const result = await search.retrieveLocation(mapboxId);

    if (result) {
      setPoint({
        lat: result.coordinates.lat,
        lng: result.coordinates.lng,
        address: result.full_address,
      });

      if (point === "A") {
        setSearchQueryA(name);
        setShowDropdownA(false);
      } else {
        setSearchQueryB(name);
        setShowDropdownB(false);
      }

      onSetActivePointSelection(null);
    }
  };

  const handleKeyDown = (point: "A" | "B", event: KeyboardEvent) => {
    const showDropdown = point === "A" ? showDropdownA : showDropdownB;
    const suggestions = point === "A" ? searchA.suggestions : searchB.suggestions;
    const highlightedIndex = point === "A" ? highlightedIndexA : highlightedIndexB;
    const setHighlightedIndex =
      point === "A" ? setHighlightedIndexA : setHighlightedIndexB;

    if (!showDropdown) return;

    const totalItems = 1 + suggestions.length;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev + 1 >= totalItems ? 0 : prev + 1
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex === 0) {
        handleUseCurrentLocation(point);
      } else {
        const suggestionIndex = highlightedIndex - 1;
        if (suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
          const suggestion = suggestions[suggestionIndex];
          handleSelectLocation(point, suggestion.mapbox_id, suggestion.name);
        }
      }
    } else if (event.key === "Escape") {
      if (point === "A") {
        setShowDropdownA(false);
      } else {
        setShowDropdownB(false);
      }
    }
  };

  const handleInputFocus = (point: "A" | "B") => {
    onSetActivePointSelection(point);
    const query = point === "A" ? searchQueryA : searchQueryB;
    if (query.length > 2) {
      if (point === "A") {
        setShowDropdownA(true);
      } else {
        setShowDropdownB(true);
      }
    }
  };

  const handleClearPoint = (point: "A" | "B") => {
    if (point === "A") {
      onPointAChange(null);
      setSearchQueryA("");
      setShowDropdownA(false);
    } else {
      onPointBChange(null);
      setSearchQueryB("");
      setShowDropdownB(false);
    }
  };

  const canCalculate = pointA !== null && pointB !== null && !isCalculating;

  const renderDropdown = (
    point: "A" | "B",
    suggestions: SearchSuggestion[],
    loading: boolean,
    highlightedIndex: number,
    isLocating: boolean
  ) => {
    return (
      <div
        ref={point === "A" ? dropdownRefA : dropdownRefB}
        className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto"
      >
        {/* Current Location Option */}
        <button
          type="button"
          onClick={() => handleUseCurrentLocation(point)}
          className={`w-full border-b border-gray-100 px-3 py-2 text-left transition-colors hover:bg-gray-50 ${
            highlightedIndex === 0 ? "bg-gray-100" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <LocateFixed className="h-4 w-4 text-blue-600" />
            )}
            <span className="text-sm font-medium">
              {isLocating ? "Locating..." : "Use my current location"}
            </span>
          </div>
        </button>

        {loading ? (
          <div className="p-3 text-center text-sm text-gray-500">
            Searching...
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <button
              key={suggestion.mapbox_id}
              onClick={() =>
                handleSelectLocation(point, suggestion.mapbox_id, suggestion.name)
              }
              className={`w-full border-b border-gray-100 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-gray-50 ${
                index + 1 === highlightedIndex ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
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
          ))
        ) : (
          <div className="p-3 text-center text-sm text-gray-500">
            No locations found
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Compact route inputs and controls */}
      <div className="flex items-start gap-2">
        {/* Stacked point inputs */}
        <div className="relative flex-1 flex flex-col">
          {/* Point A Input */}
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
              A
            </div>
            <Search className="absolute left-9 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              ref={inputRefA}
              type="text"
              placeholder={
                activePointSelection === "A"
                  ? "Click map or search..."
                  : "Start point"
              }
              value={searchQueryA}
              onChange={(e) => handleSearchChange("A", e.target.value)}
              onKeyDown={(e) => handleKeyDown("A", e)}
              onFocus={() => handleInputFocus("A")}
              className={`pl-14 pr-16 h-9 text-sm rounded-b-none border-b-0 ${
                activePointSelection === "A"
                  ? "ring-2 ring-green-200 border-green-500"
                  : ""
              }`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {isLocatingA ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation("A")}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  title="Use current location"
                >
                  <LocateFixed className="h-4 w-4" />
                </button>
              )}
              {pointA && (
                <button
                  type="button"
                  onClick={() => handleClearPoint("A")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {showDropdownA &&
              renderDropdown(
                "A",
                searchA.suggestions,
                searchA.loading,
                highlightedIndexA,
                isLocatingA
              )}
          </div>

          {/* Point B Input */}
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              B
            </div>
            <Search className="absolute left-9 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              ref={inputRefB}
              type="text"
              placeholder={
                activePointSelection === "B"
                  ? "Click map or search..."
                  : "Destination"
              }
              value={searchQueryB}
              onChange={(e) => handleSearchChange("B", e.target.value)}
              onKeyDown={(e) => handleKeyDown("B", e)}
              onFocus={() => handleInputFocus("B")}
              className={`pl-14 pr-16 h-9 text-sm rounded-t-none ${
                activePointSelection === "B"
                  ? "ring-2 ring-red-200 border-red-500"
                  : ""
              }`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {isLocatingB ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation("B")}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  title="Use current location"
                >
                  <LocateFixed className="h-4 w-4" />
                </button>
              )}
              {pointB && (
                <button
                  type="button"
                  onClick={() => handleClearPoint("B")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {showDropdownB &&
              renderDropdown(
                "B",
                searchB.suggestions,
                searchB.loading,
                highlightedIndexB,
                isLocatingB
              )}
          </div>

          {/* Connecting line indicator */}
          <div className="absolute left-[18px] top-9 h-[18px] w-[2px] bg-gradient-to-b from-green-500 to-red-500" />
        </div>

        {/* Transport mode, Calculate & Cancel buttons */}
        <div className="flex flex-col gap-1">
          {/* Transport mode selector */}
          <div className="flex items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 p-0.5">
            {TRANSPORT_MODES.map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onTransportModeChange(mode)}
                className={`rounded p-1.5 transition-colors ${
                  transportMode === mode
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-1">
            <Button
              onClick={onCalculateRoute}
              disabled={!canCalculate}
              className="bg-orange-600 hover:bg-orange-700 h-8 px-2"
              size="sm"
              title="Assess Route"
            >
              {isCalculating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-1 text-xs">
                {isCalculating ? "..." : "Go"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-8 px-2"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active point selection hint */}
      {activePointSelection && (
        <p className="text-xs text-gray-500 animate-pulse">
          Click on map or search to set Point {activePointSelection}
        </p>
      )}
    </div>
  );
}
