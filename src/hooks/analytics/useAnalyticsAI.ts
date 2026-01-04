import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  AnalyticsInput,
  CrimeAnalyticsAI,
} from "@/lib/gemini/analytics-schema";

interface AnalyticsAIResponse {
  success: boolean;
  analytics?: CrimeAnalyticsAI;
  error?: string;
  cached?: boolean;
}

async function fetchAnalyticsAI(
  input: AnalyticsInput
): Promise<CrimeAnalyticsAI> {
  const response = await fetch("/api/gemini/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Analytics AI failed: ${response.statusText}`);
  }

  const data: AnalyticsAIResponse = await response.json();

  if (!data.success || !data.analytics) {
    throw new Error(data.error || "Analytics AI failed");
  }

  return data.analytics;
}

interface UseAnalyticsAIOptions {
  dailyCounts: {
    date: string;
    count: number;
    label: string;
  }[];
  crimeType: string;
  barangay: string;
  status: string;
  dateRange: {
    from: string;
    to: string;
  };
  enabled?: boolean;
}

export function useAnalyticsAI(
  options: UseAnalyticsAIOptions
): UseQueryResult<CrimeAnalyticsAI, Error> {
  const {
    dailyCounts,
    crimeType,
    barangay,
    status,
    dateRange,
    enabled = true,
  } = options;

  const isValid = dailyCounts.length > 0 && !!dateRange.from && !!dateRange.to;

  // Create stable query key
  const dataKey = dailyCounts
    .slice(0, 5)
    .map((d) => `${d.date}:${d.count}`)
    .join("|");

  return useQuery<CrimeAnalyticsAI, Error>({
    queryKey: [
      "analytics-ai",
      crimeType,
      barangay,
      status,
      dateRange.from,
      dateRange.to,
      dataKey,
    ],
    queryFn: () =>
      fetchAnalyticsAI({
        dailyCounts,
        crimeType,
        barangay,
        status,
        dateRange,
      }),
    enabled: enabled && isValid,
    staleTime: 15 * 60 * 1000, // 15 minutes - analytics data changes less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 1, // Only retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
  });
}
