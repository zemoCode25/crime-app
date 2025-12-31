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
import type { RouteAssessmentResult, RoutePoint } from "@/types/route-assessment";
import { ROUTE_RISK_COLORS } from "@/types/route-assessment";

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
  routeAssessment?: RouteAssessmentResult | null;
  onClearRoute?: () => void;
  // Route mode props
  isRouteMode?: boolean;
  activePointSelection?: "A" | "B" | null;
  routePointA?: RoutePoint | null;
  routePointB?: RoutePoint | null;
  onRoutePointSelected?: (point: "A" | "B", location: RoutePoint) => void;
}

export default function Map({
  selectedLocation,
  onLocationChange,
  crimeCases,
  onCaseSelect,
  routeAssessment,
  onClearRoute,
  isRouteMode = false,
  activePointSelection,
  routePointA,
  routePointB,
  onRoutePointSelected,
}: MapProps) {
  const { crimeTypeConverter } = useCrimeType();
  const mapRef = useRef<MapboxMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);
  const routeStartMarkerRef = useRef<MapboxMarker | null>(null);
  const routeEndMarkerRef = useRef<MapboxMarker | null>(null);
  const routePointAMarkerRef = useRef<MapboxMarker | null>(null);
  const routePointBMarkerRef = useRef<MapboxMarker | null>(null);
  const onLocationChangeRef = useRef<MapProps["onLocationChange"] | null>(null);
  const crimeCasesRef = useRef<CrimeCaseMapRecord[]>([]);
  const onCaseSelectRef = useRef<MapProps["onCaseSelect"] | null>(null);
  const crimeTypeConverterRef = useRef(crimeTypeConverter);
  const onClearRouteRef = useRef<MapProps["onClearRoute"] | null>(null);
  const onRoutePointSelectedRef = useRef<MapProps["onRoutePointSelected"] | null>(null);
  const activePointSelectionRef = useRef<"A" | "B" | null>(null);

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

  // Keep latest onClearRoute in a ref
  useEffect(() => {
    onClearRouteRef.current = onClearRoute ?? null;
  }, [onClearRoute]);

  // Keep latest route point selection refs
  useEffect(() => {
    onRoutePointSelectedRef.current = onRoutePointSelected ?? null;
  }, [onRoutePointSelected]);

  useEffect(() => {
    activePointSelectionRef.current = activePointSelection ?? null;
  }, [activePointSelection]);

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

          // Add crime cases source
          map.addSource("crime-cases", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });

          // Add native Mapbox heatmap layer for crime density visualization
          map.addLayer({
            id: "crime-heatmap",
            type: "heatmap",
            source: "crime-cases",
            paint: {
              // Increase weight as zoom level increases for better visibility
              "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                0.5,
                15,
                1,
              ],
              // Increase intensity as zoom level increases
              "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                1,
                15,
                1.5,
              ],
              // Color gradient from yellow (low density) to dark red (high density)
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(0, 0, 0, 0)",
                0.2,
                "rgba(255, 255, 0, 0.6)",
                0.4,
                "rgba(255, 165, 0, 0.7)",
                0.6,
                "rgba(255, 69, 0, 0.8)",
                0.8,
                "rgba(255, 0, 0, 0.9)",
                1,
                "rgba(139, 0, 0, 0.95)",
              ],
              // Adjust radius by zoom level
              "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                10,
                15,
                30,
                18,
                50,
              ],
              // Fade out heatmap at higher zoom levels when points become visible
              "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                0.8,
                16,
                0.5,
              ],
            },
          });

          // Crime case points layer (rendered on top of heatmap)
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

        // Trigger initial location on map load for risk assessment
        if (onLocationChangeRef.current) {
          const [initLng, initLat] = initialCenter;
          reverseGeocodeMapbox(initLat, initLng).then((address) => {
            if (onLocationChangeRef.current) {
              onLocationChangeRef.current({
                lat: initLat,
                lng: initLng,
                address: address || "",
              });
            }
          });
        }

        marker.on("dragend", async () => {
          const lngLat = marker.getLngLat();

          // Clear selected case when marker is dragged to a new location
          if (onCaseSelectRef.current) {
            onCaseSelectRef.current(null);
          }

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

  // Handle map clicks for route point selection
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;

    const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
      // Only handle if in route mode and a point is being selected
      if (!activePointSelectionRef.current || !onRoutePointSelectedRef.current) {
        return;
      }

      const { lng, lat } = e.lngLat;

      // Reverse geocode to get address
      const address = await reverseGeocodeMapbox(lat, lng);

      onRoutePointSelectedRef.current(activePointSelectionRef.current, {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [isLoaded]);

  // Manage route point markers (A and B) during route mode
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;

    // Import mapbox-gl for marker creation
    import("mapbox-gl").then((mapboxgl) => {
      // Update Point A marker
      if (routePointA && !routeAssessment) {
        if (routePointAMarkerRef.current) {
          routePointAMarkerRef.current.setLngLat([routePointA.lng, routePointA.lat]);
        } else {
          const el = document.createElement("div");
          el.innerHTML = `
            <div style="
              width: 28px;
              height: 28px;
              background: #22c55e;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
              cursor: move;
            ">A</div>
          `;
          routePointAMarkerRef.current = new mapboxgl.default.Marker({
            element: el,
            draggable: true,
          })
            .setLngLat([routePointA.lng, routePointA.lat])
            .addTo(map);

          // Handle drag end
          routePointAMarkerRef.current.on("dragend", async () => {
            const lngLat = routePointAMarkerRef.current?.getLngLat();
            if (lngLat && onRoutePointSelectedRef.current) {
              const address = await reverseGeocodeMapbox(lngLat.lat, lngLat.lng);
              onRoutePointSelectedRef.current("A", {
                lat: Number(lngLat.lat.toFixed(6)),
                lng: Number(lngLat.lng.toFixed(6)),
                address: address || `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`,
              });
            }
          });
        }
      } else if (!routePointA && routePointAMarkerRef.current) {
        routePointAMarkerRef.current.remove();
        routePointAMarkerRef.current = null;
      }

      // Update Point B marker
      if (routePointB && !routeAssessment) {
        if (routePointBMarkerRef.current) {
          routePointBMarkerRef.current.setLngLat([routePointB.lng, routePointB.lat]);
        } else {
          const el = document.createElement("div");
          el.innerHTML = `
            <div style="
              width: 28px;
              height: 28px;
              background: #ef4444;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
              cursor: move;
            ">B</div>
          `;
          routePointBMarkerRef.current = new mapboxgl.default.Marker({
            element: el,
            draggable: true,
          })
            .setLngLat([routePointB.lng, routePointB.lat])
            .addTo(map);

          // Handle drag end
          routePointBMarkerRef.current.on("dragend", async () => {
            const lngLat = routePointBMarkerRef.current?.getLngLat();
            if (lngLat && onRoutePointSelectedRef.current) {
              const address = await reverseGeocodeMapbox(lngLat.lat, lngLat.lng);
              onRoutePointSelectedRef.current("B", {
                lat: Number(lngLat.lat.toFixed(6)),
                lng: Number(lngLat.lng.toFixed(6)),
                address: address || `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`,
              });
            }
          });
        }
      } else if (!routePointB && routePointBMarkerRef.current) {
        routePointBMarkerRef.current.remove();
        routePointBMarkerRef.current = null;
      }
    });

    // Cleanup when route assessment is shown (route layers handle markers)
    if (routeAssessment) {
      if (routePointAMarkerRef.current) {
        routePointAMarkerRef.current.remove();
        routePointAMarkerRef.current = null;
      }
      if (routePointBMarkerRef.current) {
        routePointBMarkerRef.current.remove();
        routePointBMarkerRef.current = null;
      }
    }
  }, [routePointA, routePointB, routeAssessment, isLoaded]);

  // Hide main marker when in route mode
  useEffect(() => {
    if (!markerRef.current) return;

    if (isRouteMode) {
      markerRef.current.getElement().style.display = "none";
    } else {
      markerRef.current.getElement().style.display = "";
    }
  }, [isRouteMode]);

  // Render route assessment on the map
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;

    // Helper to remove existing route layers/sources
    const removeRouteElements = () => {
      // Remove layers first (before sources)
      if (map.getLayer("route-segments")) {
        map.removeLayer("route-segments");
      }
      if (map.getSource("route-segments")) {
        map.removeSource("route-segments");
      }

      // Remove route markers
      if (routeStartMarkerRef.current) {
        routeStartMarkerRef.current.remove();
        routeStartMarkerRef.current = null;
      }
      if (routeEndMarkerRef.current) {
        routeEndMarkerRef.current.remove();
        routeEndMarkerRef.current = null;
      }
    };

    // If no route assessment, clear everything
    if (!routeAssessment) {
      removeRouteElements();
      return;
    }

    // Remove existing route elements before adding new ones
    removeRouteElements();

    // Create GeoJSON FeatureCollection for route segments
    const segmentFeatures = routeAssessment.route.segments.map((segment, idx) => ({
      type: "Feature" as const,
      properties: {
        riskLevel: segment.riskLevel,
        crimeCount: segment.crimeCount,
        segmentIndex: idx,
        color: ROUTE_RISK_COLORS[segment.riskLevel],
      },
      geometry: {
        type: "LineString" as const,
        coordinates: segment.coordinates,
      },
    }));

    // Add route segments source
    map.addSource("route-segments", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: segmentFeatures,
      },
    });

    // Add route segments layer with color based on risk level
    map.addLayer({
      id: "route-segments",
      type: "line",
      source: "route-segments",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": ["get", "color"],
        "line-width": 6,
        "line-opacity": 0.85,
      },
    });

    // Add start and end markers
    const routeCoords = routeAssessment.route.geometry.coordinates;
    if (routeCoords.length >= 2) {
      const startCoord = routeCoords[0] as [number, number];
      const endCoord = routeCoords[routeCoords.length - 1] as [number, number];

      // Dynamically import mapbox-gl for markers
      import("mapbox-gl").then((mapboxgl) => {
        // Start marker (green)
        const startEl = document.createElement("div");
        startEl.className = "route-marker route-start";
        startEl.innerHTML = `
          <div style="
            width: 24px;
            height: 24px;
            background: #22c55e;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">A</div>
        `;

        routeStartMarkerRef.current = new mapboxgl.default.Marker({ element: startEl })
          .setLngLat(startCoord)
          .addTo(map);

        // End marker (red)
        const endEl = document.createElement("div");
        endEl.className = "route-marker route-end";
        endEl.innerHTML = `
          <div style="
            width: 24px;
            height: 24px;
            background: #ef4444;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">B</div>
        `;

        routeEndMarkerRef.current = new mapboxgl.default.Marker({ element: endEl })
          .setLngLat(endCoord)
          .addTo(map);

        // Fit map bounds to show the entire route
        const bounds = new mapboxgl.default.LngLatBounds();
        routeCoords.forEach((coord) => {
          bounds.extend(coord as [number, number]);
        });

        map.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 1000,
        });
      });
    }
  }, [routeAssessment, isLoaded]);

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
