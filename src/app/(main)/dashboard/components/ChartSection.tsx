"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DateRange } from "react-day-picker";
import CrimeTypeChart from "@/app/(main)/analytics/components/CrimeTypePie";

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

export default function ChartSection({
  dateRange,
}: {
  dateRange: DateRange | undefined;
}) {
  console.log("Date Range in ChartSection:", dateRange);
  return (
    <div className="flex justify-between gap-4 rounded-sm p-1">
      <div className="flex w-full flex-col justify-center gap-2 rounded-sm border border-neutral-300 bg-white p-2">
        <Tabs defaultValue="account" className="max-w-[30rem]">
          <TabsList className="w-full gap-5 bg-neutral-200/50 dark:bg-neutral-900">
            <TabsTrigger
              value="account"
              className="cursor-pointer active:bg-neutral-100"
            >
              Theft
            </TabsTrigger>
            <TabsTrigger value="assault" className="cursor-pointer">
              Assault
            </TabsTrigger>
            <TabsTrigger value="homicide" className="cursor-pointer">
              Homicide
            </TabsTrigger>
            <TabsTrigger value="fraud" className="cursor-pointer">
              Fraud
            </TabsTrigger>
            <TabsTrigger value="burglary" className="cursor-pointer">
              Burglary
            </TabsTrigger>
          </TabsList>
          <TabsContent value="">Make changes to your account here.</TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
        <CardContent className="flex h-full w-full flex-col justify-center bg-white p-0">
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
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
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
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 leading-none font-medium">
                  Trending up by 5.2% this month{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  January - June 2024
                </div>
              </div>
            </div>
          </CardFooter>
        </CardContent>
      </div>
      <CrimeTypeChart />
    </div>
  );
}
