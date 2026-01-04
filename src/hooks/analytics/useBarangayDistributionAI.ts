import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  BarangayDistributionInput,
  DistributionAnalyticsAI,
} from "@/lib/gemini/distribution-schema";

interface DistributionAIResponse {
  success: boolean;
  analytics?: DistributionAnalyticsAI;
  error?: string;
  cached?: boolean;
}

async function fetchBarangayDistributionAI(
  input: BarangayDistributionInput
): Promise<DistributionAnalyticsAI> {
  const response = await fetch("/api/gemini/barangay-distribution", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Barangay distribution AI failed: ${response.statusText}`);
  }

  const data: DistributionAIResponse = await response.json();

  if (!data.success || !data.analytics) {
    throw new Error(data.error || "Barangay distribution AI failed");
  }

  return data.analytics;
}

interface UseBarangayDistributionAIOptions {
  distribution: {
    barangay: string;
    count: number;
    percentage: number;
  }[];
  totalCases: number;
  dateRange: {
    from: string;
    to: string;
  };
  enabled?: boolean;
}

export function useBarangayDistributionAI(
  options: UseBarangayDistributionAIOptions
): UseQueryResult<DistributionAnalyticsAI, Error> {
  const { distribution, totalCases, dateRange, enabled = true } = options;

  const isValid =
    distribution.length > 0 && !!dateRange.from && !!dateRange.to;

  // Create stable query key
  const dataKey = distribution
    .slice(0, 5)
    .map((d) => `${d.barangay}:${d.count}`)
    .join("|");

  return useQuery<DistributionAnalyticsAI, Error>({
    queryKey: [
      "barangay-distribution-ai",
      dateRange.from,
      dateRange.to,
      dataKey,
    ],
    queryFn: () =>
      fetchBarangayDistributionAI({
        distribution,
        totalCases,
        dateRange,
      }),
    enabled: enabled && isValid,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 1,
    retryDelay: 2000,
  });
}
