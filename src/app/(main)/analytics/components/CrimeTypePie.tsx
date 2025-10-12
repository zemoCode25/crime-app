"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import { CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export const description = "A donut chart with text";

const chartData = [
  { browser: "theft", visitors: 275, fill: "#FF6467" },
  { browser: "threat", visitors: 20, fill: "#FF8904" },
  { browser: "assault", visitors: 287, fill: "#9AE600" },
  { browser: "fraud", visitors: 143, fill: "#7BF1A8" },
  { browser: "vandalism", visitors: 1567, fill: "#534AFD" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  theft: {
    label: "Theft",
    color: "var(--chart-1)",
  },
  threat: {
    label: "Threat",
    color: "var(--chart-2)",
  },
  assault: {
    label: "Assault",
    color: "var(--chart-3)",
  },
  fraud: {
    label: "Fraud",
    color: "var(--chart-4)",
  },
  vandalism: {
    label: "Vandalism",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export default function CrimeTypeChart() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <div className="flex h-full w-[40%] flex-col rounded-md border border-neutral-300 p-4">
      <div className="items-center pb-0">
        <CardTitle>Crime type chart</CardTitle>
        <CardDescription>January - June 2025</CardDescription>
      </div>
      <div className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
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
