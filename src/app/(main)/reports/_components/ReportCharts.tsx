"use client";

import { ReportData } from "@/server/queries/reports";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { CRIME_TYPE_COLORS } from "@/constants/crime-case";

interface ReportChartsProps {
  type: "trend" | "status" | "crimeType" | "barangay";
  data: ReportData;
}

export function ReportCharts({ type, data }: ReportChartsProps) {
  // 1. Trend Chart Configuration - use first color from palette
  const trendConfig = {
    count: {
      label: "Incidents",
      color: CRIME_TYPE_COLORS[0], // Blue-500
    },
  } satisfies ChartConfig;

  // 2. Status Chart Configuration - dynamically builds from data with proper colors
  const statusConfig = {
    count: {
      label: "Cases",
    },
    ...data.statusDistribution.reduce(
      (acc, curr) => {
        acc[curr.status] = {
          label: curr.status,
          color: curr.fill,
        };
        return acc;
      },
      {} as Record<string, { label: string; color: string }>,
    ),
  } satisfies ChartConfig;

  // 3. Barangay Chart Configuration - use a distinct color
  const barangayConfig = {
    count: {
      label: "Incidents",
      color: CRIME_TYPE_COLORS[6], // Cyan-500
    },
  } satisfies ChartConfig;

  if (type === "trend") {
    return (
      <ChartContainer config={trendConfig} className="h-[350px] w-full">
        <BarChart accessibilityLayer data={data.trendData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickMargin={10}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    );
  }

  if (type === "status") {
    return (
      <ChartContainer
        config={statusConfig}
        className="mx-auto aspect-square h-[350px] max-h-[350px] w-full"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data.statusDistribution}
            dataKey="count"
            nameKey="status"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.statusDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="status" />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ChartContainer>
    );
  }

  if (type === "barangay") {
    return (
      <ChartContainer config={barangayConfig} className="h-[350px] w-full">
        <BarChart
          accessibilityLayer
          data={data.barangayDistribution}
          layout="vertical"
          margin={{
            left: 0,
          }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            width={120}
            className="text-[10px]"
          />
          <XAxis dataKey="count" type="number" hide />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ChartContainer>
    );
  }

  return null;
}
