"use client";
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fingerprint } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import { CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DateRange } from "react-day-picker";
import CrimeStatusChart from "../../analytics/components/CrimeStatusPie";
import {
  useTopCrimeTypes,
  useCrimeTrendData,
} from "@/hooks/dashboard/useCrimeChartData";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChartSection({
  dateRange,
}: {
  dateRange: DateRange | undefined;
}) {
  // Fetch top 5 crime types
  const { data: topCrimeTypes, isLoading: isLoadingTypes } = useTopCrimeTypes({
    dateRange,
  });

  // State for selected crime type
  const [selectedCrimeType, setSelectedCrimeType] = useState<number | null>(
    null,
  );

  // Set default selected crime type when data loads
  useMemo(() => {
    if (
      topCrimeTypes &&
      topCrimeTypes.length > 0 &&
      selectedCrimeType === null
    ) {
      setSelectedCrimeType(topCrimeTypes[0].crimeType);
    }
  }, [topCrimeTypes, selectedCrimeType]);

  // Fetch trend data for selected crime type
  const { data: trendData, isLoading: isLoadingTrend } = useCrimeTrendData({
    crimeType: selectedCrimeType,
    dateRange,
  });

  // Configure chart
  const chartConfig = {
    count: {
      label: "Crime Reports",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  // Format chart data for recharts
  const chartData = useMemo(() => {
    if (!trendData) return [];
    return trendData.map((point) => ({
      date: point.label,
      count: point.count,
    }));
  }, [trendData]);
  // Format date range for display
  const dateRangeLabel = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "";
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

  // Get selected crime type label
  const selectedCrimeTypeLabel = useMemo(() => {
    if (!topCrimeTypes || !selectedCrimeType) return "";
    const crimeType = topCrimeTypes.find(
      (ct) => ct.crimeType === selectedCrimeType,
    );
    return crimeType?.label || "";
  }, [topCrimeTypes, selectedCrimeType]);

  return (
    <div className="flex justify-between gap-4 rounded-sm p-1">
      <div className="flex w-full flex-col justify-center gap-2 rounded-sm border border-neutral-300 bg-white p-4 dark:border-orange-900/30 dark:bg-[var(--dark-bg)]">
        {isLoadingTypes ? (
          <div className="space-y-4 p-2">
            {/* Skeleton for tabs */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 w-20 rounded-md" />
              ))}
            </div>
            {/* Skeleton for chart */}
            <div className="space-y-3 pt-4">
              <Skeleton className="h-[10rem] w-full rounded-md" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          </div>
        ) : topCrimeTypes && topCrimeTypes.length > 0 ? (
          <>
            <Tabs
              value={selectedCrimeType?.toString() || ""}
              onValueChange={(value) => setSelectedCrimeType(Number(value))}
              className="max-w-[30rem]"
            >
              <TabsList className="w-full gap-5 bg-neutral-200/50 dark:bg-neutral-900">
                {topCrimeTypes.map((crimeType) => (
                  <TabsTrigger
                    key={crimeType.crimeType}
                    value={crimeType.crimeType.toString()}
                    className="cursor-pointer active:bg-neutral-100"
                  >
                    {crimeType.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <p className="text-center text-sm text-neutral-700 italic dark:text-neutral-300">
              <Fingerprint className="mr-1 mb-1 inline-block h-4 w-4" />
              {selectedCrimeTypeLabel && dateRangeLabel
                ? `${selectedCrimeTypeLabel} case from ${dateRangeLabel}`
                : "Select a date range"}
            </p>
            {isLoadingTrend ? (
              <div className="space-y-3 pt-4">
                <Skeleton className="h-[10rem] w-full rounded-md" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ) : chartData.length > 0 ? (
              <CardContent className="flex h-full w-full flex-col justify-center bg-white p-0 dark:bg-[var(--dark-bg)]">
                <ChartContainer
                  config={chartConfig}
                  className="h-[10rem] w-full"
                >
                  <ResponsiveContainer>
                    <AreaChart
                      accessibilityLayer
                      data={chartData}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                      className="h-[1rem] w-full"
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) =>
                          value.length > 6 ? value.slice(0, 6) : value
                        }
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <defs>
                        <linearGradient
                          id="fillCount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-count)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-count)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="count"
                        type="linear"
                        fill="url(#fillCount)"
                        fillOpacity={0.4}
                        stroke="var(--color-count)"
                        stackId="a"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            ) : (
              <div className="text-muted-foreground p-4 text-center">
                No trend data available
              </div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground p-4 text-center">
            No crime data available for the selected period
          </div>
        )}
      </div>
      <CrimeStatusChart dateRange={dateRange} />
    </div>
  );
}
