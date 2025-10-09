"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

    if (!apiKey) {
      setError("Mapbox API key is missing");
      setIsLoading(false);
      return;
    }

    if (!mapContainerRef.current) {
      setError("Map container not found");
      setIsLoading(false);
      return;
    }

    if (mapRef.current) return;

    try {
      mapboxgl.accessToken = apiKey;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [121.0437, 14.676], // Manila coordinates
        zoom: 12,
      });

      mapRef.current.on("load", () => {
        setIsLoading(false);
        setError(null);
      });

      mapRef.current.on("error", (e) => {
        setError(e.error?.message || "Failed to load map");
        setIsLoading(false);
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (error) {
      setError("Failed to initialize map");
      setIsLoading(false);
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
      <div className="flex h-[90vh] w-full items-center justify-center rounded-lg border border-red-300 bg-red-50">
        <div className="text-center">
          <p className="text-red-600">Failed to load map</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-lg border border-gray-300"
      />
    </div>
  );
}
