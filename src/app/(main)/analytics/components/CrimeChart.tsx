"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BARANGAY_OPTIONS_WITH_ALL, STATUSES } from "@/constants/crime-case";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import type { AnalyticsParams } from "@/server/queries/analytics";
import { getCrimeTypes } from "@/server/queries/crime-type";
import useSupabaseBrowser from "@/server/supabase/client";
import { useDailyCrimeCounts } from "@/hooks/analytics/useCrimeAnalyticsData";
import { useDateRange } from "@/context/DateRangeProvider";

const chartConfig = {
  count: {
    label: "Crime Reports",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export default function CrimeChart() {
  const { dateRange } = useDateRange();
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [crimeTypeValue, setCrimeTypeValue] = useState(0); // 0 = All crime types
  const [barangayOpen, setBarangayOpen] = useState(false);
  const [barangayValue, setBarangayValue] = useState(0); // 0 = All barangays
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] =
    useState<AnalyticsParams["status"]>("all");

  const supabase = useSupabaseBrowser();
  const { data: crimeTypes } = useQuery(getCrimeTypes(supabase));

  // Get selected barangay label for display
  const selectedBarangayLabel = useMemo(() => {
    const barangay = BARANGAY_OPTIONS_WITH_ALL.find(
      (b) => b.id === barangayValue,
    );
    return barangay?.value || "All barangays";
  }, [barangayValue]);

  // Get selected status label for display
  const selectedStatusLabel = useMemo(() => {
    if (statusValue === "all") return "All statuses";
    const status = STATUSES.find((s) => s.value === statusValue);
    return status?.label || "All statuses";
  }, [statusValue]);

  // Fetch daily crime counts
  const { data: dailyCounts, isLoading: isLoadingCounts } = useDailyCrimeCounts(
    {
      dateRange,
      crimeType: crimeTypeValue,
      barangayId: barangayValue,
      status: statusValue,
    },
  );

  // Format chart data
  const chartData = useMemo(() => {
    if (!dailyCounts) return [];
    return dailyCounts.map((point) => ({
      date: point.label,
      count: point.count,
    }));
  }, [dailyCounts]);

  // Get selected crime type label
  const selectedCrimeTypeLabel = useMemo(() => {
    if (crimeTypeValue === 0) return "All crime types";
    if (!crimeTypes) return "";
    const crimeType = crimeTypes.find((ct) => ct.id === crimeTypeValue);
    return crimeType?.label || "";
  }, [crimeTypes, crimeTypeValue]);

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

  return (
    <div className="mt-4 flex w-full flex-col gap-4 rounded-md border border-neutral-300 bg-white p-4">
      <div className="flex gap-2">
        <Popover open={crimeTypeOpen} onOpenChange={setCrimeTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={"w-[200px] justify-between"}
            >
              {selectedCrimeTypeLabel || "Select crime type..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search crime type..." />
              <CommandList>
                <CommandEmpty>No crime type found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="0"
                    onSelect={() => {
                      setCrimeTypeValue(0);
                      setCrimeTypeOpen(false);
                    }}
                  >
                    <Check
                      className={`${crimeTypeValue === 0 ? "opacity-100" : "opacity-0"}`}
                    />
                    All crime types
                  </CommandItem>
                  {crimeTypes?.map((type) => (
                    <CommandItem
                      value={String(type.id)}
                      key={type.id}
                      onSelect={() => {
                        setCrimeTypeValue(type.id);
                        setCrimeTypeOpen(false);
                      }}
                    >
                      <Check
                        className={`${crimeTypeValue === type.id ? "opacity-100" : "opacity-0"}`}
                      />
                      {type.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover open={barangayOpen} onOpenChange={setBarangayOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={"w-[200px] justify-between"}
            >
              {barangayValue
                ? BARANGAY_OPTIONS_WITH_ALL.find(
                    (barangay) => barangayValue === barangay.id,
                  )?.value
                : "Select barangay..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search crime type..." />
              <CommandList>
                <CommandEmpty>No barangay found.</CommandEmpty>
                <CommandGroup>
                  {BARANGAY_OPTIONS_WITH_ALL.map((barangay) => (
                    <CommandItem
                      value={String(barangay.id)}
                      key={barangay.id}
                      onSelect={() => {
                        setBarangayValue(barangay.id);
                        setBarangayOpen(false);
                      }}
                    >
                      <Check
                        className={`${barangayValue === barangay.id ? "opacity-100" : "opacity-0"}`}
                      />
                      {barangay.value}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={"w-[200px] justify-between"}
            >
              {selectedStatusLabel}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search status..." />
              <CommandList>
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      setStatusValue("all");
                      setStatusOpen(false);
                    }}
                  >
                    <Check
                      className={`${statusValue === "all" ? "opacity-100" : "opacity-0"}`}
                    />
                    All statuses
                  </CommandItem>
                  {STATUSES.map((status) => (
                    <CommandItem
                      value={status.value}
                      key={status.value}
                      onSelect={() => {
                        setStatusValue(status.value);
                        setStatusOpen(false);
                      }}
                    >
                      <Check
                        className={`${statusValue === status.value ? "opacity-100" : "opacity-0"}`}
                      />
                      {status.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Chart description */}
      {isLoadingCounts ? (
        <Skeleton className="mx-auto h-4 w-64 rounded" />
      ) : (
        dateRangeLabel && (
          <p className="text-center text-sm text-neutral-700 italic">
            {selectedCrimeTypeLabel} cases from {dateRangeLabel}
            {barangayValue !== 0 && ` in ${selectedBarangayLabel}`}
            {statusValue !== "all" && ` (${selectedStatusLabel})`}
          </p>
        )
      )}

      {/* Chart area */}
      <div className="mb-2 flex w-full items-center justify-between">
        {isLoadingCounts ? (
          <div className="flex h-[10rem] w-full items-center justify-center">
            <Skeleton className="h-[10rem] w-full rounded-md" />
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[10rem] w-full">
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
                  <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
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
        ) : (
          <div className="text-muted-foreground flex h-[10rem] w-full items-center justify-center">
            No data available for the selected filters
          </div>
        )}
      </div>
      {/* AI Insights */}
      {isLoadingCounts ? (
        <div className="mt-4 rounded-sm border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>
        </div>
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
              contributing.
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
