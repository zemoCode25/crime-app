import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  StatusDistributionInput,
  DistributionAnalyticsAI,
} from "@/lib/gemini/distribution-schema";

interface DistributionAIResponse {
  success: boolean;
  analytics?: DistributionAnalyticsAI;
  error?: string;
  cached?: boolean;
}

async function fetchStatusDistributionAI(
  input: StatusDistributionInput
): Promise<DistributionAnalyticsAI> {
  const response = await fetch("/api/gemini/status-distribution", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Status distribution AI failed: ${response.statusText}`);
  }

  const data: DistributionAIResponse = await response.json();

  if (!data.success || !data.analytics) {
    throw new Error(data.error || "Status distribution AI failed");
  }

  return data.analytics;
}

interface UseStatusDistributionAIOptions {
  distribution: {
    status: string;
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

export function useStatusDistributionAI(
  options: UseStatusDistributionAIOptions
): UseQueryResult<DistributionAnalyticsAI, Error> {
  const { distribution, totalCases, dateRange, enabled = true } = options;

  const isValid =
    distribution.length > 0 && !!dateRange.from && !!dateRange.to;

  // Create stable query key
  const dataKey = distribution
    .slice(0, 5)
    .map((d) => `${d.status}:${d.count}`)
    .join("|");

  return useQuery<DistributionAnalyticsAI, Error>({
    queryKey: ["status-distribution-ai", dateRange.from, dateRange.to, dataKey],
    queryFn: () =>
      fetchStatusDistributionAI({
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
