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
  { browser: "open", visitors: 60, fill: "#FF6467" },
  { browser: "under_investigation", visitors: 20, fill: "#FF8904" },
  { browser: "case_settled", visitors: 34, fill: "#9AE600" },
  { browser: "lupon", visitors: 43, fill: "#7BF1A8" },
  { browser: "direct_filing", visitors: 90, fill: "#53EAFD" },
  { browser: "for_record", visitors: 75, fill: "#8EC5FF" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  open: {
    label: "Open",
    color: "var(--chart-1)",
  },
  under_investigation: {
    label: "Under Investigation",
    color: "var(--chart-2)",
  },
  case_settled: {
    label: "Case Settled",
    color: "var(--chart-3)",
  },
  lupon: {
    label: "Lupon",
    color: "var(--chart-4)",
  },
  direct_filing: {
    label: "Direct Filing",
    color: "var(--chart-5)",
  },
  for_record: {
    label: "For Record",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export default function StatusPie() {
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
