"use client";

import * as React from "react";
import { Pie, PieChart } from "recharts";

import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { useDateRange } from "@/context/DateRangeProvider";
import { useBarangayCrimeCounts } from "@/hooks/analytics/useCrimeAnalyticsData";
import { BARANGAY_COLORS } from "@/constants/barangay";
import { useBarangayDistributionAI } from "@/hooks/analytics/useBarangayDistributionAI";

export const description = "A pie chart with a legend";

function PieChartSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-4">
        <Skeleton className="mx-auto h-48 w-48 rounded-full" />
        <div className="flex flex-wrap justify-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-18" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

function AIInsightsSkeleton() {
  return (
    <div className="mt-4 rounded-sm border border-purple-200 bg-purple-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 animate-pulse text-purple-500" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <div className="ml-4 space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-[90%] rounded" />
        <Skeleton className="h-4 w-[85%] rounded" />
      </div>
    </div>
  );
}

interface BarangayDistributionPieProps {
  userBarangayId?: number;
}

export default function BarangayDistributionPie({ userBarangayId }: BarangayDistributionPieProps) {
  const { dateRange } = useDateRange();
  const { data: barangayData, isLoading } = useBarangayCrimeCounts({
    dateRange,
    barangayId: userBarangayId,
  });

  // Build chart config from barangay colors
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Crimes",
      },
    };

    BARANGAY_COLORS.forEach((barangay) => {
      config[barangay.key] = {
        label: barangay.name,
        color: barangay.light,
      };
    });

    return config;
  }, []);

  // Format date range for display
  const dateRangeLabel = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "All time";
    const from = dateRange.from.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const to = dateRange.to.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${from} - ${to}`;
  }, [dateRange]);

  // Transform data for the pie chart - use light colors for the pie slices
  const chartData = React.useMemo(() => {
    if (!barangayData) return [];
    return barangayData.map((item) => {
      const barangayColor = BARANGAY_COLORS.find((b) => b.key === item.barangayKey);
      return {
        barangay: item.barangayKey,
        count: item.count,
        fill: barangayColor?.light ?? item.fill,
      };
    });
  }, [barangayData]);

  // Prepare distribution data with percentages for AI analysis
  const distributionData = React.useMemo(() => {
    if (!barangayData || barangayData.length === 0) return [];

    const total = barangayData.reduce((sum, item) => sum + item.count, 0);

    return barangayData.map((item) => ({
      barangay: item.barangayName,
      count: item.count,
      percentage: (item.count / total) * 100,
    }));
  }, [barangayData]);

  // Fetch AI insights
  const {
    data: aiInsights,
    isLoading: isLoadingAI,
    error: aiError,
  } = useBarangayDistributionAI({
    distribution: distributionData,
    totalCases: distributionData.reduce((sum, d) => sum + d.count, 0),
    dateRange: {
      from: dateRange?.from?.toISOString() || "",
      to: dateRange?.to?.toISOString() || "",
    },
    enabled: !isLoading && distributionData.length > 0,
  });

  return (
    <div className="flex w-full flex-col rounded-md border border-neutral-300 p-4">
      <div className="items-center pb-0">
        <CardTitle>Barangay crime distribution</CardTitle>
        <CardDescription>{dateRangeLabel}</CardDescription>
      </div>
      <div className="flex-1 pb-0">
        {isLoading ? (
          <PieChartSkeleton />
        ) : chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[350px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={chartData} dataKey="count" nameKey="barangay" />
              <ChartLegend
                content={<ChartLegendContent nameKey="barangay" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground flex h-[350px] items-center justify-center">
            No crime data available
          </div>
        )}
      </div>
      {isLoading || isLoadingAI ? (
        <AIInsightsSkeleton />
      ) : aiError ? (
        <div className="mt-4 rounded-sm border border-orange-200 bg-orange-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">
              AI Insights Unavailable
            </span>
          </div>
          <p className="text-sm text-orange-700">
            {aiError.message || "Unable to generate insights for this dataset"}
          </p>
        </div>
      ) : aiInsights ? (
        <div className="mt-4 rounded-sm border border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">
              AI Insights
            </span>
          </div>
          <ul className="ml-4 list-disc space-y-1 text-sm text-purple-900">
            {aiInsights.insights.map((item, idx) => (
              <li key={idx}>{item.insight}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
