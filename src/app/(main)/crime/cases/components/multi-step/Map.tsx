"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const INITIAL_CENTER: [number, number] = [121.0218, 14.3731];
const INITIAL_ZOOM = 20;

export default function MapBox() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Add error and loading states
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    // ✅ Better error checking
    if (!apiKey) {
      setError("Mapbox access token is missing");
      return;
    }

    if (mapRef.current || !mapContainerRef.current) return;

    console.log("Initializing map...");

    try {
      mapboxgl.accessToken = apiKey;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: center,
        zoom: zoom,
      });

      // ✅ Handle load success
      mapRef.current.on("load", () => {
        if (!mapRef.current) return;
        mapRef.current.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        // Add the DEM source as a terrain layer
        mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        setIsLoaded(true);
        setError(null);
      });

      // ✅ Handle errors
      mapRef.current.on("error", (e) => {
        setError(e.error?.message || "Map failed to load");
        setIsLoaded(false);
      });

      const marker = new mapboxgl.Marker({ color: "red", draggable: true })
        .setLngLat(INITIAL_CENTER)
        .addTo(mapRef.current);

      marker.on("move", () => {
        const coordinates = marker.getLngLat();
        console.log(`Marker moved to: ${coordinates.lng}, ${coordinates.lat}`);
      });

      // ✅ Optimize move event with throttling
      let moveTimeout: NodeJS.Timeout;
      mapRef.current.on("dragend", () => {
        // Use moveend instead of move
        if (!mapRef.current) return;

        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
          const mapCenter = mapRef.current!.getCenter();
          const mapZoom = mapRef.current!.getZoom();
          setCenter([mapCenter.lng, mapCenter.lat]);
          setZoom(mapZoom);
        }, 200);
      });
    } catch (err) {
      setError("Failed to initialize map");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ✅ Better error UI
  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center border border-red-200 bg-red-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-[20rem] w-[25rem] overflow-hidden rounded-lg border border-gray-300 p-4">
      {/* ✅ Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-4 z-50 flex items-center justify-center rounded bg-gray-100">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="z-0 h-full w-full rounded" />
    </div>
  );
}
