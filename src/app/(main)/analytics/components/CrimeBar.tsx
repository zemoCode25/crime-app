"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Sparkles } from "lucide-react";

import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useDateRange } from "@/context/DateRangeProvider";
import { useCrimeTypeCounts } from "@/hooks/analytics/useCrimeAnalyticsData";
import { useCrimeTypeDistributionAI } from "@/hooks/analytics/useCrimeTypeDistributionAI";

export const description = "A horizontal bar chart showing crime types";

function BarChartSkeleton() {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton
            className="h-6"
            style={{ width: `${Math.random() * 50 + 30}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function AIInsightsSkeleton() {
  return (
    <div className="mt-4 rounded-sm border border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded bg-purple-200" />
        <Skeleton className="h-4 w-20 bg-purple-200" />
      </div>
      <div className="ml-4 space-y-2">
        <Skeleton className="h-4 w-full bg-purple-200" />
        <Skeleton className="h-4 w-[90%] bg-purple-200" />
        <Skeleton className="h-4 w-[85%] bg-purple-200" />
      </div>
    </div>
  );
}

export function CrimeBar() {
  const { dateRange } = useDateRange();
  const { data: crimeTypeData, isLoading } = useCrimeTypeCounts({
    dateRange,
  });

  // Calculate total crimes
  const totalCrimes = React.useMemo(() => {
    if (!crimeTypeData) return 0;
    return crimeTypeData.reduce((acc, curr) => acc + curr.count, 0);
  }, [crimeTypeData]);

  // Prepare distribution data for AI
  const distributionData = React.useMemo(() => {
    if (!crimeTypeData || totalCrimes === 0) return [];
    return crimeTypeData.map((item) => ({
      crimeType: item.label,
      count: item.count,
      percentage: (item.count / totalCrimes) * 100,
    }));
  }, [crimeTypeData, totalCrimes]);

  // AI insights hook
  const {
    data: aiInsights,
    isLoading: isLoadingAI,
    error: aiError,
  } = useCrimeTypeDistributionAI({
    distribution: distributionData,
    totalCases: totalCrimes,
    dateRange: {
      from: dateRange?.from?.toISOString() || "",
      to: dateRange?.to?.toISOString() || "",
    },
    enabled: !isLoading && distributionData.length > 0,
  });

  // Build chart config from data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Cases",
      },
    };

    crimeTypeData?.forEach((item) => {
      config[item.label] = {
        label: item.label,
        color: item.fill,
      };
    });

    return config;
  }, [crimeTypeData]);

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

  return (
    <div className="mt-4 rounded-md border border-gray-300 bg-white p-4">
      <div>
        <CardTitle>Crime type distribution</CardTitle>
        <CardDescription>
          {dateRangeLabel} | Total: {totalCrimes.toLocaleString()} cases
        </CardDescription>
      </div>
      <div>
        {isLoading ? (
          <BarChartSkeleton />
        ) : crimeTypeData && crimeTypeData.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={crimeTypeData}
              layout="vertical"
              margin={{ left: 10, right: 30 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={120}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{value}</span>
                        <span className="text-muted-foreground">cases</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {crimeTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground flex h-[200px] items-center justify-center">
            No crime data available
          </div>
        )}
      </div>
      {isLoading || isLoadingAI ? (
        <AIInsightsSkeleton />
      ) : aiError ? (
        <div className="mt-4 rounded-sm border border-red-300 bg-red-50 p-4">
          <span className="text-sm text-red-700">
            Failed to load AI insights. Please try again.
          </span>
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
