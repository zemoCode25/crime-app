// hooks/useMapboxSearch.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export interface SearchSuggestion {
  mapbox_id: string;
  name: string;
  place_formatted: string;
  feature_type: string;
}

export interface SearchResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  name: string;
  full_address: string;
}

export function useMapboxSearch() {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken] = useState(() => uuidv4());

  const searchLocation = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          access_token: accessToken || "",
          session_token: sessionToken,
          language: "en",
          limit: "10",
          country: "PH", // Philippines only
          proximity: "121.0218,14.3731", // Muntinlupa City coordinates
          types: "place,locality,neighborhood,address,poi,street",
        });

        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`,
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.suggestions) {
          setSuggestions(data.suggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Search failed");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [sessionToken],
  );

  const retrieveLocation = useCallback(
    async (mapboxId: string): Promise<SearchResult | null> => {
      setLoading(true);
      setError(null);

      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      try {
        const params = new URLSearchParams({
          access_token: accessToken || "",
          session_token: sessionToken,
        });

        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?${params}`,
        );

        if (!response.ok) {
          throw new Error(`Retrieve failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.features && data.features[0]) {
          const feature = data.features[0];
          const [lng, lat] = feature.geometry.coordinates;

          return {
            coordinates: { lat, lng },
            name: feature.properties.name || "",
            full_address:
              feature.properties.full_address ||
              feature.properties.place_formatted ||
              "",
          };
        }

        return null;
      } catch (err) {
        console.error("Retrieve error:", err);
        setError(err instanceof Error ? err.message : "Retrieve failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [sessionToken],
  );

  return {
    suggestions,
    loading,
    error,
    searchLocation,
    retrieveLocation,
  };
}
