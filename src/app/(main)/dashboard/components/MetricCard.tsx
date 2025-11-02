import React from "react";
import { TrendingDown, TrendingUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string | number;
    percentage: string | number;
    isPositive?: boolean;
  };
  className?: string;
  icon?: LucideIcon;
  iconColor?: string; // ✅ Add this
  customTrendIcon?: LucideIcon;
  color?: string; // ✅ Add this
}

export default function MetricCard({
  title,
  value,
  trend,
  className,
  icon: Icon,
  customTrendIcon: CustomTrendIcon,
  color,
}: MetricCardProps) {
  // Determine trend icon and color
  const getTrendIcon = () => {
    if (CustomTrendIcon) {
      return CustomTrendIcon;
    }
    return trend?.isPositive ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (trend?.isPositive) {
      return "text-green-500";
    }
    return "text-red-500";
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-2 rounded-sm border border-neutral-300 bg-white p-6",
        "dark:border-orange-900/30 dark:bg-[var(--dark-bg)] dark:shadow-none",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-medium sm:text-base dark:text-orange-100">
          {title}
        </h1>

        {/* ✅ Render icon with custom color */}
        <span
          className={cn(
            "flex items-center justify-center rounded-sm p-1",
            color,
          )}
        >
          {Icon && <Icon className="text-white dark:text-orange-100" />}
        </span>
      </div>

      <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-orange-50">
        {value}
      </p>

      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <TrendIcon className={cn("h-4 w-4", getTrendColor())} />
          <span className="text-muted-foreground text-xs dark:text-orange-200/70">
            {trend.isPositive ? "+" : ""}
            {trend.value} ({trend.percentage}%)
          </span>
        </div>
      )}
    </div>
  );
}
