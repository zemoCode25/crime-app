"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple bar chart";

const chartData = [
  { month: "January", theft: 186, threat: 80 },
  { month: "February", theft: 305, threat: 200 },
  { month: "March", theft: 237, threat: 120 },
  { month: "April", theft: 73, threat: 190 },
  { month: "May", theft: 209, threat: 130 },
  { month: "June", theft: 214, threat: 140 },
];

const chartConfig = {
  theft: {
    label: "Theft",
    color: "#155DFC",
  },
  threat: {
    label: "Threat",
    color: "#FDC700",
  },
} satisfies ChartConfig;

export function CrimeBar() {
  return (
    <div className="mt-4 rounded-md border border-gray-300 p-4">
      <div>
        <CardTitle>Bar chart comparison</CardTitle>
        <CardDescription>
          January - June 2025 | Total Crime cases
        </CardDescription>
      </div>
      <div>
        <ChartContainer config={chartConfig} className="">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="theft" fill="var(--color-theft)" radius={4} />
            <Bar dataKey="threat" fill="var(--color-threat)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
