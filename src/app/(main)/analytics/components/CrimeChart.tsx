"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Check,
  ChevronsUpDown,
  ChevronsUpDownIcon,
  CirclePlus,
  TrendingUp,
} from "lucide-react";
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
import { types, statuses, barangays } from "@/constants/crime-case";
import { useState } from "react";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Label } from "@/components/ui/label";

export const description = "An area chart with gradient fill";
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-4)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export default function CrimeChart() {
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [crimeTypeValue, setCrimeTypeValue] = useState("all");
  const [barangayOpen, setBarangayOpen] = useState(false);
  const [barangayValue, setBarangayValue] = useState("all");
  return (
    <div className="mt-4 flex w-full flex-col gap-4 rounded-md border border-neutral-300 p-4">
      <div className="flex gap-2">
        <Popover open={crimeTypeOpen} onOpenChange={setCrimeTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={"w-[200px] justify-between"}
            >
              {crimeTypeValue
                ? types.find((type) => crimeTypeValue === type.value)?.label
                : "Select crime type..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search crime type..." />
              <CommandList>
                <CommandEmpty>No crime type found.</CommandEmpty>
                <CommandGroup>
                  {types.map((type) => (
                    <CommandItem
                      value={type.value}
                      key={type.value}
                      onSelect={() => {
                        setCrimeTypeValue(type.value);
                        setCrimeTypeOpen(false);
                      }}
                    >
                      <Check
                        className={`${crimeTypeValue === type.value ? "opacity-100" : "opacity-0"}`}
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
                ? barangays.find((barangay) => barangayValue === barangay.value)
                    ?.label
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
                  {barangays.map((barangay) => (
                    <CommandItem
                      value={barangay.value}
                      key={barangay.value}
                      onSelect={() => {
                        setBarangayValue(barangay.value);
                        setBarangayOpen(false);
                      }}
                    >
                      <Check
                        className={`${barangayValue === barangay.value ? "opacity-100" : "opacity-0"}`}
                      />
                      {barangay.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="mb-2 flex w-full items-center justify-between">
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
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="desktop"
                type="linear"
                fill="url(#fillDesktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
