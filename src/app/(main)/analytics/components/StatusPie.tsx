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
import { Sparkles } from "lucide-react";
import { useDateRange } from "@/context/DateRangeProvider";

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
  const { dateRange } = useDateRange();
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
      <div className="mt-4 rounded-sm border border-orange-300 bg-orange-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-800">
            AI Insights
          </span>
        </div>
        <ul className="ml-4 list-disc space-y-1 text-sm text-orange-900">
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
        </ul>
      </div>
    </div>
  );
}
