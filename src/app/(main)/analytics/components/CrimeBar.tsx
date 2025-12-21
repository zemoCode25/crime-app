"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Sparkles } from "lucide-react";

import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple bar chart";

const chartData = [
  { month: "January", theft: 186 },
  { month: "February", theft: 305 },
  { month: "March", theft: 237 },
  { month: "April", theft: 73 },
  { month: "May", theft: 209 },
  { month: "June", theft: 214 },
];

const chartConfig = {
  theft: {
    label: "Theft",
    color: "#155DFC",
  },
} satisfies ChartConfig;

export function CrimeBar() {
  return (
    <div className="mt-4 rounded-md border border-gray-300 bg-white p-4">
      <div>
        <CardTitle>Bar chart comparison</CardTitle>
        <CardDescription>
          January - June 2025 | Total Crime cases
        </CardDescription>
      </div>
      <div>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: -20 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="theft"
              stackId="a"
              fill="var(--color-theft)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
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
            contributing factors.
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
    </div>
  );
}
