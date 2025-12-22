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
    <div className="mt-4 rounded-sm border border-orange-300 bg-orange-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="ml-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[85%]" />
      </div>
    </div>
  );
}

export default function BarangayDistributionPie() {
  const { dateRange } = useDateRange();
  const { data: barangayData, isLoading } = useBarangayCrimeCounts({
    dateRange,
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
      {isLoading ? (
        <AIInsightsSkeleton />
      ) : (
        <div className="mt-4 rounded-sm border border-orange-300 bg-orange-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">
              AI Insights
            </span>
          </div>
          <ul className="ml-4 list-disc space-y-1 text-sm text-orange-900">
            <li>
              Peak theft activity in February with 305 cases, 64% higher than
              average.
            </li>
            <li>
              April shows lowest incidents (73 cases) - consider analyzing
              contributing.
            </li>
            <li>
              Upward trend detected from April to June, suggesting increased
              vigilance needed.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
