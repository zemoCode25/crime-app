"use client";

import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A pie chart with a legend";

const chartData = [
  { browser: "alabang", visitors: 275, fill: "#FF0000" },
  { browser: "ayala_alabang", visitors: 200, fill: "#00FF00" },
  { browser: "bayanan", visitors: 187, fill: "#0000FF" },
  { browser: "buli", visitors: 173, fill: "#FFFF00" },
  { browser: "cupang", visitors: 90, fill: "#FF00FF" },
  { browser: "putatan", visitors: 275, fill: "#00FFFF" },
  { browser: "poblacion", visitors: 200, fill: "#FF0000" },
  { browser: "sucat", visitors: 187, fill: "#00FF00" },
  { browser: "tunasan", visitors: 90, fill: "#0000FF" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  alabang: {
    label: "Alabang",
    color: "var(--chart-1)",
  },
  ayala_alabang: {
    label: "Ayala-Alabang",
    color: "var(--chart-2)",
  },
  bayanan: {
    label: "Bayanan",
    color: "var(--chart-3)",
  },
  buli: {
    label: "Buli",
    color: "var(--chart-4)",
  },
  cupang: {
    label: "Cupang",
    color: "var(--chart-5)",
  },
  putatan: {
    label: "Putatan",
    color: "var(--chart-5)",
  },
  poblacion: {
    label: "Poblacion",
    color: "var(--chart-5)",
  },
  sucat: {
    label: "Sucat",
    color: "var(--chart-5)",
  },
  tunasan: {
    label: "Tunasan",
    color: "var(--chart-6)",
  },
} satisfies ChartConfig;

export default function PieChartStats() {
  return (
    <div className="flex w-full flex-col rounded-md border border-neutral-300 p-4">
      <div className="items-center pb-0">
        <CardTitle>Pie Chart - Legend</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </div>
      <div className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="visitors" nameKey="browser" />
            <ChartLegend
              content={<ChartLegendContent nameKey="browser" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}
