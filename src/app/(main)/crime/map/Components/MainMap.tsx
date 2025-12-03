"use client";

import { createRoot } from "react-dom/client";

import { useEffect, useRef, useState } from "react";
import type {
  Map as MapboxMap,
  Marker as MapboxMarker,
  GeoJSONSource,
  MapLayerMouseEvent,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates, SelectedLocation } from "@/types/map";
import { reverseGeocodeMapbox } from "@/hooks/map/useMapboxSearch";
import { crimeCasesToGeoJSON } from "@/lib/map/crimeCasesToGeoJSON";
import type { CrimeCaseMapRecord } from "@/types/crime-case";
import { CrimePopup } from "./CrimePopup";
import { useCrimeType } from "@/context/CrimeTypeProvider";

type CrimeCaseFeatureProperties = {
  id?: number;
  case_number?: string;
  case_status?: string;
  crime_type?: string;
  crime_location?: string | null;
  landmark?: string | null;
  incident_datetime?: string | null;
};

const INITIAL_ZOOM = 15;
const INITIAL_COORDINATES: Coordinates = { lat: 14.389263, long: 121.04491 };

interface MapProps {
  selectedLocation?: SelectedLocation | null;
  onLocationChange?: (location: SelectedLocation) => void;
  crimeCases: CrimeCaseMapRecord[];
  onCaseSelect?: (crimeCase: CrimeCaseMapRecord | null) => void;
}

export default function Map({
  selectedLocation,
  onLocationChange,
  crimeCases,
  onCaseSelect,
}: MapProps) {
  const { crimeTypeConverter } = useCrimeType();
  const mapRef = useRef<MapboxMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);
  const onLocationChangeRef = useRef<MapProps["onLocationChange"] | null>(null);
  const crimeCasesRef = useRef<CrimeCaseMapRecord[]>([]);
  const onCaseSelectRef = useRef<MapProps["onCaseSelect"] | null>(null);
  const crimeTypeConverterRef = useRef(crimeTypeConverter);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialCenterRef = useRef<[number, number] | null>(null);

  if (!initialCenterRef.current) {
    initialCenterRef.current = [
      selectedLocation?.lng ?? INITIAL_COORDINATES.long,
      selectedLocation?.lat ?? INITIAL_COORDINATES.lat,
    ];
  }

  // Keep latest onLocationChange in a ref so init effect can stay stable
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange ?? null;
  }, [onLocationChange]);

  // Keep latest crimeCases in a ref for event handlers registered once
  useEffect(() => {
    crimeCasesRef.current = crimeCases;
  }, [crimeCases]);

  // Keep latest onCaseSelect in a ref so init effect can stay stable
  useEffect(() => {
    onCaseSelectRef.current = onCaseSelect ?? null;
  }, [onCaseSelect]);

  // Keep latest crimeTypeConverter in a ref
  useEffect(() => {
    crimeTypeConverterRef.current = crimeTypeConverter;
  }, [crimeTypeConverter]);

  // When selectedLocation prop changes, move marker and fly without changing zoom
  useEffect(() => {
    if (!selectedLocation || !mapRef.current || !markerRef.current) return;

    markerRef.current.setLngLat([selectedLocation.lng, selectedLocation.lat]);

    mapRef.current.flyTo({
      center: [selectedLocation.lng, selectedLocation.lat],
      duration: 2000,
    });
  }, [selectedLocation]);

  // Initialize Mapbox map once (SSR-safe via dynamic import)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!MAPBOX_ACCESS_TOKEN) {
      setError("Mapbox access token is missing");
      return;
    }

    if (mapRef.current || !mapContainerRef.current) return;

    const initialCenter = initialCenterRef.current ?? [
      INITIAL_COORDINATES.long,
      INITIAL_COORDINATES.lat,
    ];

    let cancelled = false;

    (async () => {
      try {
        const mapboxglModule = (await import("mapbox-gl")).default;

        if (cancelled) return;

        mapboxglModule.accessToken = MAPBOX_ACCESS_TOKEN;

        const map = new mapboxglModule.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/standard",
          center: initialCenter,
          zoom: INITIAL_ZOOM,
        });

        mapRef.current = map;

        map.on("load", () => {
          if (!mapRef.current || cancelled) return;

          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
          });

          map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

          map.addSource("crime-cases", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });

          map.addLayer({
            id: "crime-cases-points",
            type: "circle",
            source: "crime-cases",
            paint: {
              "circle-radius": 10,
              "circle-color": "#ef4444",
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            },
          });

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
          new mapboxglModule.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
            showUserHeading: true,
          }),
        );

        map.addControl(new mapboxglModule.NavigationControl());

        map.on("click", "crime-cases-points", (event: MapLayerMouseEvent) => {
          if (!mapRef.current || !event.features || !event.features.length)
            return;

          const feature = event.features[0];

          if (feature.geometry.type !== "Point") return;

          const [lng, lat] = feature.geometry.coordinates;
          const properties = feature.properties as CrimeCaseFeatureProperties;

          const title = properties.case_number || `Case #${properties.id}`;
          const location =
            properties.crime_location ||
            properties.landmark ||
            "Unknown location";

          // Notify parent about selected case
          if (onCaseSelectRef.current) {
            const id = properties.id;
            const match =
              typeof id === "number"
                ? crimeCasesRef.current.find((c) => c.id === id)
                : undefined;

            if (match) {
              onCaseSelectRef.current(match);

              if (
                match.location &&
                match.location.lat != null &&
                match.location.long != null &&
                onLocationChangeRef.current
              ) {
                onLocationChangeRef.current({
                  lat: Number(match.location.lat),
                  lng: Number(match.location.long),
                  address:
                    match.location.crime_location ||
                    match.location.landmark ||
                    title,
                });
              }
            }
          }

          const popupNode = document.createElement("div");
          const root = createRoot(popupNode);

          // Convert crime type number to label
          const crimeTypeLabel =
            typeof properties.crime_type === "number"
              ? crimeTypeConverterRef.current(properties.crime_type)
              : properties.crime_type;

          root.render(
            <CrimePopup
              id={properties.id}
              title={title}
              location={location}
              status={properties.case_status}
              type={crimeTypeLabel}
              date={properties.incident_datetime}
            />,
          );

          const popup = new mapboxglModule.Popup({
            closeButton: false,
            maxWidth: "none",
            className: "crime-popup",
          })
            .setLngLat([lng, lat])
            .setDOMContent(popupNode)
            .addTo(mapRef.current!);

          popup.on("close", () => {
            root.unmount();
          });
        });
      } catch (err) {
        if (cancelled) return;
        console.error("Map initialization error:", err);
        setError("Failed to initialize map");
      }
    })();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync crime cases data into the GeoJSON source
  useEffect(() => {
    if (!mapRef.current || !crimeCases || !isLoaded) return;

    const source = mapRef.current.getSource("crime-cases") as
      | GeoJSONSource
      | undefined;

    if (!source) return;

    source.setData(crimeCasesToGeoJSON(crimeCases));
  }, [crimeCases, isLoaded]);

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
