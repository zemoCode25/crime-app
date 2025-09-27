import MetricCard from "./MetricCard";
import { Shield, TrendingUp, Search, CheckCircle } from "lucide-react";

export default function CardSection() {
  return (
    <div className="flex flex-row flex-wrap gap-4 sm:gap-4">
      <MetricCard
        title="Total Crimes"
        value={2}
        trend={{
          value: -2,
          percentage: 2,
          isPositive: false,
        }}
      />

      <MetricCard
        title="Crime Rate"
        value="5%"
        trend={{
          value: 22,
          percentage: 19,
          isPositive: true,
        }}
      />

      <MetricCard
        title="Under Investigation"
        value={20}
        trend={{
          value: -2,
          percentage: 2,
          isPositive: false,
        }}
        className="md:w-[calc(27%-1.5rem)]"
      />

      <MetricCard
        title="Settled Case"
        value={40}
        trend={{
          value: -2,
          percentage: 2,
          isPositive: false,
        }}
        className="md:w-[calc(23%-1.5rem)]"
      />
    </div>
  );
}
