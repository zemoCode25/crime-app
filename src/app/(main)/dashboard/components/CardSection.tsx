import MetricCard from "./MetricCard";
import { DateRange } from "react-day-picker";
import {
  Scan,
  Gavel,
  CirclePercent,
  AlertTriangle,
  ScanSearch,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface MetricCardDefaults {
  title: string;
  icon?: LucideIcon;
}

interface MetricCardSampleValues {
  value: number | string;
  trend: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
}

const sampleValues: MetricCardSampleValues[] = [
  {
    value: 2,
    trend: {
      value: -2,
      percentage: 2,
      isPositive: false,
    },
  },
  {
    value: "5%",
    trend: {
      value: 22,
      percentage: 19,
      isPositive: true,
    },
  },
  {
    value: 20,
    trend: {
      value: -2,
      percentage: 2,
      isPositive: false,
    },
  },
  {
    value: 40,
    trend: {
      value: -2,
      percentage: 2,
      isPositive: false,
    },
  },
  {
    value: 8,
    trend: {
      value: -2,
      percentage: 2,
      isPositive: false,
    },
  },
  {
    value: 3,
    trend: {
      value: -2,
      percentage: 2,
      isPositive: false,
    },
  },
];

const defaultMetrics: MetricCardDefaults[] = [
  {
    title: "Total Reported Crimes",
    icon: Scan,
  },
  {
    title: "Crime Rate",
    icon: CirclePercent,
  },
  {
    title: "Under Investigation",
    icon: ScanSearch,
  },
  {
    title: "Settled Case",
    icon: Gavel,
  },
  {
    title: "Emergency Reports",
    icon: AlertTriangle,
  },
  {
    title: "Detected Heat Zones",
    icon: AlertTriangle,
  },
];

export default function CardSection({
  dateRange,
}: {
  dateRange: DateRange | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {defaultMetrics.map((metric, index) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={sampleValues[index].value}
          trend={sampleValues[index].trend}
          icon={metric.icon}
        />
      ))}
    </div>
  );
}
