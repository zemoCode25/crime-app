"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { Coordinates } from "@/types/map";

const INITIAL_ZOOM = 20;

async function reverseGeocodeMapbox(lat: number, lng: number, apiKey: string) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("Mapbox API Response:", data);

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    } else {
      console.error("No address found for coordinates:", { lat, lng });
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // ✅ Fallback to coordinates
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // ✅ Fallback to coordinates
  }
}

export default function Map() {
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: 14.3731,
    long: 121.0218,
  });
  const [address, setAddress] = useState<string | null>(null); // ✅ Add address state
  const [loading, setLoading] = useState(false); // ✅ Add loading state

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null); // ✅ Keep marker reference

  const initialCenter: [number, number] = [coordinates.long, coordinates.lat];

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // ✅ Create marker and store reference
      const marker = new mapboxgl.Marker({ color: "red", draggable: true })
        .setLngLat(initialCenter)
        .addTo(mapRef.current);

      markerRef.current = marker;

      // ✅ Handle marker drag with proper async/await
      marker.on("dragend", async () => {
        const lngLat = marker.getLngLat();

        setCoordinates({ lat: lngLat.lat, long: lngLat.lng });
        setLoading(true);

        // ✅ Use Mapbox token, not Google token
        const addressResult = await reverseGeocodeMapbox(
          lngLat.lat,
          lngLat.lng,
          MAPBOX_ACCESS_TOKEN, // ✅ Use Mapbox token
        );

        setAddress(addressResult);
        setLoading(false);
      });

      // ✅ Get initial address
      reverseGeocodeMapbox(
        coordinates.lat,
        coordinates.long,
        MAPBOX_ACCESS_TOKEN,
      ).then(setAddress);

      const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_ACCESS_TOKEN,
        marker: false,
        placeholder: "Search for places",
        proximity: {
          longitude: initialCenter[0],
          latitude: initialCenter[1],
        },
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

      // ✅ Handle geocoder results
      geocoder.on("result", (e) => {
        const [lng, lat] = e.result.center;

        setCoordinates({ lat, long: lng });
        setAddress(e.result.place_name);

        marker.setLngLat([lng, lat]);

        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 16,
        });
      });

      mapRef.current.addControl(geocoder, "top-left");
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
  }, []); // ✅ Empty dependency array - only run once

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center border border-red-200 bg-red-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-10rem)] w-dvw overflow-hidden rounded-lg border border-gray-300">
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="h-full w-full" />

      {/* ✅ Enhanced sidebar with better formatting */}
      <div className="fixed top-12 right-0 bottom-0 w-[30dvw] overflow-y-auto bg-white p-4 shadow-lg">
        <h3 className="mb-4 text-lg font-bold">Location Details</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Coordinates:</p>
            <div className="mt-1 rounded bg-gray-50 p-2">
              <p className="font-mono text-xs">
                Lat: {coordinates.lat.toFixed(6)}
              </p>
              <p className="font-mono text-xs">
                Lng: {coordinates.long.toFixed(6)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Address:</p>
            <div className="mt-1 rounded bg-gray-50 p-2">
              {loading ? (
                <p className="text-xs text-gray-500">Loading address...</p>
              ) : address ? (
                <p className="text-xs">{address}</p>
              ) : (
                <p className="text-xs text-gray-400">No address available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
