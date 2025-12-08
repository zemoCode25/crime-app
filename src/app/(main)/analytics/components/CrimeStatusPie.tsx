"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { DateRange } from "react-day-picker";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrimeStatusDistribution } from "@/hooks/dashboard/useCrimeChartData";

interface CrimeStatusChartProps {
  dateRange?: DateRange;
}

export default function CrimeStatusChart({ dateRange }: CrimeStatusChartProps) {
  const { data: statusData, isLoading } = useCrimeStatusDistribution({
    dateRange,
  });

  // Calculate total crimes
  const totalCrimes = React.useMemo(() => {
    if (!statusData) return 0;
    return statusData.reduce((acc, curr) => acc + curr.count, 0);
  }, [statusData]);

  // Format chart config from data
  const chartConfig = React.useMemo(() => {
    if (!statusData) return {};

    const config: ChartConfig = {
      count: {
        label: "Crimes",
      },
    };

    statusData.forEach((status) => {
      config[status.status] = {
        label: status.label,
        color: status.fill,
      };
    });

    return config;
  }, [statusData]);

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
    <div className="flex h-full w-[40%] flex-col rounded-md border border-neutral-300 bg-white p-4 dark:border-orange-900/30 dark:bg-[var(--dark-bg)]">
      <div className="flex flex-col items-center justify-center pb-0">
        <CardTitle className="dark:text-orange-100">
          Crime Status Distribution
        </CardTitle>
        <CardDescription className="text-xs dark:text-orange-200/60">
          {dateRangeLabel}
        </CardDescription>
      </div>
      <div className="flex-1 pb-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="space-y-3">
              <Skeleton className="mx-auto h-48 w-48 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ) : statusData && statusData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold dark:fill-orange-100"
                          >
                            {totalCrimes.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground dark:fill-orange-200/60"
                          >
                            Crimes
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="-translate-y-2 flex-wrap gap-2"
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            No crime data available
          </div>
        )}
      </div>
    </div>
  );
}
