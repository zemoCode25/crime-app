"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates } from "@/types/map";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MapPinIcon, Search, X } from "lucide-react";
import { SearchSuggestion, useMapboxSearch } from "@/hooks/map/useMapboxSearch";

const INITIAL_ZOOM = 14;

async function reverseGeocodeMapbox(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<string | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name as string;
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
}

interface MapBoxProps {
  coordinates: Coordinates;
  setCoordinates: (newCoordinates: Coordinates) => void;
}

export default function MapBox({ coordinates, setCoordinates }: MapBoxProps) {
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const initialCenter = useMemo<[number, number]>(
    () => [coordinates.long ?? 0, coordinates.lat ?? 0],
    [],
  );

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { suggestions, loading, searchLocation, retrieveLocation } =
    useMapboxSearch();

  // Initialize Mapbox map once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const apiKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!apiKey) {
      setError("Mapbox access token is missing");
      return;
    }

    if (mapRef.current || !mapContainerRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const mapboxglModule = (await import("mapbox-gl")).default;

        if (cancelled) return;

        mapboxglModule.accessToken = apiKey;

        const map = new mapboxglModule.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/streets-v11",
          center: initialCenter,
          zoom: INITIAL_ZOOM,
        });

        mapRef.current = map;

        map.on("load", () => {
          if (cancelled) return;
          setIsLoaded(true);
          setError(null);
        });

        map.on("error", (e) => {
          if (cancelled) return;
          setError(e.error?.message || "Map failed to load");
          setIsLoaded(false);
        });

        const marker = new mapboxglModule.Marker({
          color: "red",
          draggable: true,
        })
          .setLngLat(initialCenter)
          .addTo(map);

        markerRef.current = marker;

        marker.on("dragend", async () => {
          const pos = marker.getLngLat();
          const lat = Number(pos.lat.toFixed(6));
          const lng = Number(pos.lng.toFixed(6));

          setCoordinates({ lat, long: lng });
          setSelectedCoords({ lat, lng });

          const label = await reverseGeocodeMapbox(lat, lng, apiKey);
          setSelectedLabel(label || "Dropped pin");
        });
      } catch (err) {
        if (cancelled) return;
        setError(`Failed to load map: ${(err as Error).message}`);
      }
    })();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markerRef.current = null;
      setIsLoaded(false);
    };
  }, []);

  // Keep marker and center in sync when coordinates change
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const lng = Number(coordinates.long);
    const lat = Number(coordinates.lat);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

    markerRef.current.setLngLat([lng, lat]);
    mapRef.current.setCenter([lng, lat]);
  }, [coordinates.long, coordinates.lat]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 2) {
      searchLocation(value);
      setSearchOpen(true);
      setHighlightedIndex(0);
    } else {
      setSearchOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectLocation = async (mapboxId: string, name: string) => {
    const result = await retrieveLocation(mapboxId);

    if (result) {
      const lat = Number(result.coordinates.lat.toFixed(6));
      const lng = Number(result.coordinates.lng.toFixed(6));

      setCoordinates({
        lat,
        long: lng,
      });
      setSelectedLabel(result.full_address || name);
      setSelectedCoords({ lat, lng });
      setSearchOpen(false);
    }
  };

  const handleKeyDown = (event: any) => {
    if (!searchOpen || !suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? 0 : next;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? suggestions.length - 1 : next;
      });
    } else if (event.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        event.preventDefault();
        const suggestion = suggestions[highlightedIndex];
        handleSelectLocation(
          suggestion.mapbox_id,
          suggestion.place_formatted || suggestion.name,
        );
      }
    }
  };

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-center text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          id="case-location-search"
          type="text"
          placeholder="Search for incident location..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-white pr-8 pl-10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(false);
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {searchOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
            <Command>
              <CommandList className="max-h-60 overflow-auto">
                <CommandGroup>
                  {loading ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : (
                    suggestions.map(
                      (suggestion: SearchSuggestion, index: number) => (
                        <CommandItem
                          key={suggestion.mapbox_id}
                          value={suggestion.mapbox_id}
                          className={
                            index === highlightedIndex
                              ? "bg-gray-100"
                              : undefined
                          }
                          onSelect={() =>
                            handleSelectLocation(
                              suggestion.mapbox_id,
                              suggestion.place_formatted || suggestion.name,
                            )
                          }
                        >
                          <div className="flex gap-2">
                            <MapPinIcon className="mt-0.5 h-10 w-10 flex-shrink-0 text-orange-600" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {suggestion.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {suggestion.place_formatted}
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      ),
                    )
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>

      {selectedLabel && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          <div className="font-medium">Selected map location</div>
          <div className="text-sm text-gray-800">{selectedLabel}</div>
        </div>
      )}

      <div className="relative h-64 w-full overflow-hidden rounded-lg border border-gray-300">
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
