"use client";

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

export const description = "A pie chart with a legend";

const chartData = [
  { browser: "alabang", visitors: 60, fill: "#FF6467" },
  { browser: "ayala_alabang", visitors: 20, fill: "#FF8904" },
  { browser: "bayanan", visitors: 34, fill: "#9AE600" },
  { browser: "buli", visitors: 43, fill: "#7BF1A8" },
  { browser: "cupang", visitors: 90, fill: "#53EAFD" },
  { browser: "putatan", visitors: 75, fill: "#8EC5FF" },
  { browser: "poblacion", visitors: 40, fill: "#C4B4FF" },
  { browser: "sucat", visitors: 87, fill: "#FDA5D5" },
  { browser: "tunasan", visitors: 90, fill: "#FFA1AD" },
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
        <CardTitle>Barangay crime distribution</CardTitle>
        <CardDescription>January - June 2025</CardDescription>
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
