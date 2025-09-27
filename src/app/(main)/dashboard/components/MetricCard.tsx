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
  customTrendIcon?: LucideIcon;
}

export default function MetricCard({
  title,
  value,
  trend,
  className,
  icon: Icon,
  customTrendIcon: CustomTrendIcon,
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
        "h-full w-[calc(50%-1rem)] !gap-0 rounded-sm border border-neutral-300 bg-white p-4 shadow-sm md:w-[calc(25%-1.5rem)]",
        "dark:border-orange-900/30 dark:bg-[var(--dark-bg)] dark:shadow-none",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-medium text-gray-600 sm:text-base dark:text-orange-100">
          {title}
        </h1>
        {Icon && (
          <Icon className="h-5 w-5 text-gray-400 dark:text-orange-300/70" />
        )}
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
