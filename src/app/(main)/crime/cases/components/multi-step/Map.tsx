"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import type MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { Coordinates } from "@/types/map";

const INITIAL_ZOOM = 14;

interface MapBoxProps {
  coordinates: Coordinates;
  setCoordinates: (newCoordinates: Coordinates) => void;
}

export default function MapBox({ coordinates, setCoordinates }: MapBoxProps) {
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const initialCenter = useMemo<[number, number]>(
    () => [coordinates.long ?? 0, coordinates.lat ?? 0],
    [],
  );

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const MapboxGeocoderModule = (
          await import("@mapbox/mapbox-gl-geocoder")
        ).default;

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

        marker.on("dragend", () => {
          const pos = marker.getLngLat();
          setCoordinates({ lat: pos.lat, long: pos.lng });
        });

        const geocoder = new MapboxGeocoderModule({
          accessToken: apiKey,
          marker: false,
          placeholder: "Search for places",
          proximity: {
            longitude: initialCenter[0],
            latitude: initialCenter[1],
          },
        });

        geocoderRef.current = geocoder;

        geocoder.on("result", (e) => {
          const [lng, lat] = e.result.center;
          setCoordinates({ lat, long: lng });
          marker.setLngLat([lng, lat]);
          map.flyTo({ center: [lng, lat], zoom: 16 });
        });

        map.addControl(geocoder, "top-left");
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
      geocoderRef.current = null;
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

  if (error) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-red-200 bg-red-50">
        <p className="px-4 text-center text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
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
  );
}
