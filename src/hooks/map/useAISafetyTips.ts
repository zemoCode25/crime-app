import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type {
  AISafetyAnalysis,
  SafetyAnalysisInput,
} from "@/lib/gemini/gemini-schema";

export type RiskLevel =
  | "HIGH"
  | "MEDIUM_HIGH"
  | "MEDIUM"
  | "LOW_MEDIUM"
  | "LOW";

export interface CrimeTypeCount {
  type: string;
  count: number;
  percentage: number;
}

interface UseAISafetyTipsOptions {
  riskLevel: RiskLevel | null;
  crimeCount: number;
  crimeTypes: CrimeTypeCount[];
  coordinates: { lat: number; lng: number } | null;
  enabled?: boolean;
}

// Debounce delay in milliseconds - wait for user to stop moving before fetching
const DEBOUNCE_DELAY = 2000;

interface AISafetyTipsResponse {
  success: boolean;
  analysis?: AISafetyAnalysis;
  error?: string;
  cached?: boolean;
}

async function fetchAISafetyTips(
  input: SafetyAnalysisInput
): Promise<AISafetyAnalysis> {
  const response = await fetch("/api/gemini/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`AI analysis failed: ${response.statusText}`);
  }

  const data: AISafetyTipsResponse = await response.json();

  if (!data.success || !data.analysis) {
    throw new Error(data.error || "AI analysis failed");
  }

  return data.analysis;
}

export function useAISafetyTips(options: UseAISafetyTipsOptions) {
  const {
    riskLevel,
    crimeCount,
    crimeTypes,
    coordinates,
    enabled = true,
  } = options;

  // Debounce the input to prevent excessive API calls while dragging
  const [debouncedInput, setDebouncedInput] = useState<{
    riskLevel: RiskLevel | null;
    crimeCount: number;
    crimeTypes: CrimeTypeCount[];
    coordinates: { lat: number; lng: number } | null;
  } | null>(null);

  useEffect(() => {
    // Don't debounce if disabled
    if (!enabled) {
      setDebouncedInput(null);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedInput({
        riskLevel,
        crimeCount,
        crimeTypes,
        coordinates,
      });
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [riskLevel, crimeCount, crimeTypes, coordinates, enabled]);

  const isValid =
    debouncedInput?.riskLevel !== null &&
    debouncedInput?.coordinates !== null &&
    (debouncedInput?.crimeTypes.length ?? 0) > 0;

  // Create stable query key from debounced values
  const coordKey = debouncedInput?.coordinates
    ? `${Math.round(debouncedInput.coordinates.lat * 1000)},${Math.round(debouncedInput.coordinates.lng * 1000)}`
    : "none";
  const crimeKey = (debouncedInput?.crimeTypes ?? [])
    .slice(0, 3)
    .map((c) => c.type)
    .join("|");

  return useQuery({
    queryKey: ["ai-safety-tips", debouncedInput?.riskLevel, debouncedInput?.crimeCount, coordKey, crimeKey],
    queryFn: () =>
      fetchAISafetyTips({
        riskLevel: debouncedInput!.riskLevel!,
        crimeCount: debouncedInput!.crimeCount,
        crimeTypes: debouncedInput!.crimeTypes,
        coordinates: debouncedInput!.coordinates!,
      }),
    enabled: enabled && isValid && debouncedInput !== null,
    staleTime: 10 * 60 * 1000, // 10 minutes - AI responses are expensive
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 1, // Only retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
  });
}
