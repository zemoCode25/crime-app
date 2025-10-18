import MetricCard from "./MetricCard";
import { DateRange } from "react-day-picker";
import { Scan, Gavel, CirclePercent } from "lucide-react";

export default function CardSection({
  dateRange,
}: {
  dateRange: DateRange | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      <MetricCard
        title="Total Crimes"
        value={2}
        trend={{
          value: -2,
          percentage: 2,
          isPositive: false,
        }}
        icon={Scan}
      />

      <MetricCard
        title="Crime Rate"
        value="5%"
        trend={{
          value: 22,
          percentage: 19,
          isPositive: true,
        }}
        icon={CirclePercent}
      />

      <MetricCard
        title="Under Investigation"
        value={20}
        trend={{
          value: -2,
          percentage: 2,
          isPositive: false,
        }}
      />

      <MetricCard
        title="Settled Case"
        value={40}
        trend={{
          value: -2,
          percentage: 2,
          isPositive: false,
        }}
        icon={Gavel}
      />
    </div>
  );
}
