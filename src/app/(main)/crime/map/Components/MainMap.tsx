"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates, SelectedLocation } from "@/types/map";
import { reverseGeocodeMapbox } from "@/hooks/map/useMapboxSearch";

const INITIAL_ZOOM = 20;
const INITIAL_COORDINATES: Coordinates = { lat: 14.3731, long: 121.0218 };

interface MapProps {
  selectedLocation?: SelectedLocation | null;
  onLocationChange?: (location: SelectedLocation) => void;
}

export default function Map({ selectedLocation, onLocationChange }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onLocationChangeRef = useRef<MapProps["onLocationChange"] | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep latest onLocationChange in a ref so init effect can stay stable
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange ?? null;
  }, [onLocationChange]);

  // When selectedLocation prop changes, move marker and fly without changing zoom
  useEffect(() => {
    if (!selectedLocation || !mapRef.current || !markerRef.current) return;

    markerRef.current.setLngLat([selectedLocation.lng, selectedLocation.lat]);

    mapRef.current.flyTo({
      center: [selectedLocation.lng, selectedLocation.lat],
      duration: 2000,
    });
  }, [selectedLocation]);

  // Initialize Mapbox map once
  useEffect(() => {
    const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!MAPBOX_ACCESS_TOKEN) {
      setError("Mapbox access token is missing");
      return;
    }

    if (mapRef.current || !mapContainerRef.current) return;

    const initialCenter: [number, number] = [
      selectedLocation?.lng ?? INITIAL_COORDINATES.long,
      selectedLocation?.lat ?? INITIAL_COORDINATES.lat,
    ];

    try {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/standard",
        center: initialCenter,
        zoom: INITIAL_ZOOM,
      });

      mapRef.current = map;

      map.on("load", () => {
        if (!mapRef.current) return;

        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });

        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        setIsLoaded(true);
        setError(null);
      });

      map.on("error", (e) => {
        setError(e.error?.message || "Map failed to load");
        setIsLoaded(false);
      });

      const marker = new mapboxgl.Marker({ color: "red", draggable: true })
        .setLngLat(initialCenter)
        .addTo(map);

      markerRef.current = marker;

      marker.on("dragend", async () => {
        const lngLat = marker.getLngLat();

        const newLocation: SelectedLocation = {
          lat: lngLat.lat,
          lng: lngLat.lng,
          address: "",
        };

        const addressResult = await reverseGeocodeMapbox(
          lngLat.lat,
          lngLat.lng,
        );

        newLocation.address = addressResult || "";

        if (onLocationChangeRef.current) {
          onLocationChangeRef.current(newLocation);
        }
      });

      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
      );

      map.addControl(new mapboxgl.NavigationControl());
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
  }, []);

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
