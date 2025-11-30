"use client";

import MetricCard from "./MetricCard";
import {
  Scan,
  Gavel,
  CirclePercent,
  AlertTriangle,
  ScanSearch,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useDashboardMetrics } from "@/hooks/dashboard/getDashboardMetrics";
import type { DashboardMetricKey } from "@/server/queries/dashboard";

interface MetricCardDefaults {
  key: DashboardMetricKey;
  title: string;
  icon?: LucideIcon;
  bgColor?: string;
}

const defaultMetrics: MetricCardDefaults[] = [
  {
    key: "totalReportedCrimes",
    title: "Total Reported Crimes",
    icon: Scan,
    bgColor: "bg-blue-500",
  },
  {
    key: "crimeRate",
    title: "Crime Rate",
    icon: CirclePercent,
    bgColor: "bg-green-500",
  },
  {
    key: "underInvestigation",
    title: "Under Investigation",
    icon: ScanSearch,
    bgColor: "bg-yellow-500",
  },
  {
    key: "settledCase",
    title: "Settled Case",
    icon: Gavel,
    bgColor: "bg-gray-500",
  },
  {
    key: "emergencyReports",
    title: "Emergency Reports",
    icon: AlertTriangle,
    bgColor: "bg-red-500",
  },
  {
    key: "detectedHeatZones",
    title: "Detected Heat Zones",
    icon: AlertTriangle,
    bgColor: "bg-orange-500",
  },
];

interface CardSectionProps {
  dateRange?: DateRange;
}

export default function CardSection({ dateRange }: CardSectionProps) {
  const { data, isLoading, error } = useDashboardMetrics({ dateRange });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {error && (
        <p className="col-span-full text-sm text-red-600">
          Failed to load dashboard metrics.
        </p>
      )}

      {defaultMetrics.map((metric) => {
        const metricData = data?.[metric.key];

        const value: number | string = isLoading
          ? "..."
          : metricData?.value ?? 0;

        const trend =
          !isLoading && metricData?.trend
            ? {
                value: metricData.trend.value,
                percentage: metricData.trend.percentage,
                isPositive: metricData.trend.isPositive,
              }
            : undefined;

        return (
          <MetricCard
            key={metric.key}
            title={metric.title}
            value={value}
            trend={trend}
            icon={metric.icon}
            color={metric.bgColor}
          />
        );
      })}
    </div>
  );
}

