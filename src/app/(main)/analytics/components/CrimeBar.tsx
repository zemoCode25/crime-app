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
    <div className="mt-4 rounded-sm border border-orange-300 bg-orange-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="ml-4 grid grid-cols-2 gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  );
}

export function CrimeBar() {
  const { dateRange } = useDateRange();
  const { data: crimeTypeData, isLoading } = useCrimeTypeCounts({
    dateRange,
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

  // Calculate total crimes
  const totalCrimes = React.useMemo(() => {
    if (!crimeTypeData) return 0;
    return crimeTypeData.reduce((acc, curr) => acc + curr.count, 0);
  }, [crimeTypeData]);

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
          <ul className="ml-4 grid list-disc grid-cols-2 space-y-1 text-sm text-orange-900">
            <li>
              Peak theft activity in February with 305 cases, 64% higher than
              average.
            </li>
            <li>
              April shows lowest incidents (73 cases) - consider analyzing
              contributing factors.
            </li>
            <li>
              Upward trend detected from April to June, suggesting increased
              vigilance needed.
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
