"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates, SelectedLocation } from "@/types/map";

const INITIAL_ZOOM = 20;
const INITIAL_COORDINATES: Coordinates = { lat: 14.3731, long: 121.0218 };

async function reverseGeocodeMapbox(lat: number, lng: number, apiKey: string) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    } else {
      console.error("No address found for coordinates:", { lat, lng });
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// ✅ Add props interface
interface MapProps {
  selectedLocation?: SelectedLocation | null;
  onLocationChange?: (location: SelectedLocation) => void;
}

export default function Map({ selectedLocation, onLocationChange }: MapProps) {
  const [coordinates, setCoordinates] =
    useState<Coordinates>(INITIAL_COORDINATES);

  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // ...existing code...
  // const initialCenter: [number, number] = [coordinates.long, coordinates.lat];
  const initialCenter = useMemo<[number, number]>(
    () => [coordinates.long, coordinates.lat],
    [coordinates.long, coordinates.lat]
  );

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Effect to handle selectedLocation prop changes
  useEffect(() => {
    if (selectedLocation && mapRef.current && markerRef.current) {
      // Move marker to new location
      markerRef.current.setLngLat([selectedLocation.lng, selectedLocation.lat]);

      // Fly to new location
      mapRef.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: zoom,
        duration: 2000,
      });
    }
  }, [selectedLocation, zoom]);

  useEffect(() => {
    const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!MAPBOX_ACCESS_TOKEN) {
      setError("Mapbox access token is missing");
      return;
    }

    if (mapRef.current || !mapContainerRef.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/standard",
        center: initialCenter,
        zoom: INITIAL_ZOOM,
      });

      mapRef.current.on("load", () => {
        if (!mapRef.current) return;

        mapRef.current.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });

        mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        setIsLoaded(true);
        setError(null);
      });

      mapRef.current.on("error", (e) => {
        setError(e.error?.message || "Map failed to load");
        setIsLoaded(false);
      });

      const marker = new mapboxgl.Marker({ color: "red", draggable: true })
        .setLngLat(initialCenter)
        .addTo(mapRef.current);

      markerRef.current = marker;

      marker.on("dragend", async () => {
        const lngLat = marker.getLngLat();

        const newLocation = {
          lat: lngLat.lat,
          lng: lngLat.lng,
          address: "",
        };

        setCoordinates({ lat: lngLat.lat, long: lngLat.lng });

        const addressResult = await reverseGeocodeMapbox(
          lngLat.lat,
          lngLat.lng,
          MAPBOX_ACCESS_TOKEN,
        );

        newLocation.address = addressResult || "";

        // ✅ Notify parent component of location change
        if (onLocationChange) {
          onLocationChange(newLocation);
        }
      });

      mapRef.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
      );
      mapRef.current.addControl(new mapboxgl.NavigationControl());
      mapRef.current.on("zoomend", () => {
        setZoom(mapRef.current?.getZoom() || INITIAL_ZOOM);
      });
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("Failed to initialize map");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCenter, onLocationChange]);

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center border border-red-200 bg-red-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-11.5rem)] w-full overflow-hidden rounded-lg border border-gray-300">
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
