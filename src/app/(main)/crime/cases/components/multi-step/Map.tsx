"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { Coordinates } from "@/types/map";

const INITIAL_ZOOM = 20;

interface MapBoxProps {
  coordinates: Coordinates;
  setCoordinates: (newCoordinates: Coordinates) => void;
}

export default function MapBox({ coordinates, setCoordinates }: MapBoxProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const initialCenter: [number, number] = [coordinates.long, coordinates.lat];

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!apiKey) {
      setError("Mapbox access token is missing");
      return;
    }

    if (mapRef.current || !mapContainerRef.current) return;

    try {
      mapboxgl.accessToken = apiKey;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
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

      marker.on("dragend", () => {
        const coordinates = marker.getLngLat();
        setCoordinates({ lat: coordinates.lat, long: coordinates.lng });
      });

      // ✅ Fix: Create geocoder without mapboxgl property first
      const geocoder = new MapboxGeocoder({
        accessToken: apiKey,
        marker: false, // ✅ Disable geocoder's built-in marker since we have our own
        placeholder: "Search for places",
        proximity: {
          longitude: initialCenter[0],
          latitude: initialCenter[1],
        },
      });

      // ✅ Add event listener for geocoder results
      geocoder.on("result", (e) => {
        const [lng, lat] = e.result.center;
        setCoordinates({ lat, long: lng });

        // Update our custom marker position
        marker.setLngLat([lng, lat]);

        // Fly to the location
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 16,
        });
      });

      mapRef.current.addControl(geocoder, "top-left");
    } catch (err) {
      setError(`Failed to load map: ${(err as Error).message}`);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCenter, setCoordinates]);

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center border border-red-200 bg-red-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-[20rem] w-[25rem] overflow-hidden rounded-lg border border-gray-300">
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
