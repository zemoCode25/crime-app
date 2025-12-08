import { TypedSupabaseClient } from "@/types/supabase-client";
import type { Database } from "@/server/supabase/database.types";

export type DashboardMetricKey =
  | "totalReportedCrimes"
  | "crimeRate"
  | "underInvestigation"
  | "settledCase"
  | "emergencyReports"
  | "detectedHeatZones";

export interface DashboardTrend {
  value: number;
  percentage: number;
  isPositive: boolean;
  periodLabel: string;
  isSignificant: boolean;
}

export interface DashboardMetricValue {
  value: number;
  trend: DashboardTrend | null;
}

export type DashboardMetricMap = Record<DashboardMetricKey, DashboardMetricValue>;

export interface DashboardMetricsParams {
  startDate?: Date;
  endDate?: Date;
}

interface CountCasesParams {
  startDate?: Date;
  endDate?: Date;
  status?: Database["public"]["Tables"]["crime_case"]["Row"]["case_status"];
}

async function countCases(
  client: TypedSupabaseClient,
  params: CountCasesParams,
): Promise<number> {
  const { startDate, endDate, status } = params;

  let query = client
    .from("crime_case")
    .select("id", { count: "exact", head: true });

  if (status) {
    query = query.eq("case_status", status);
  }

  if (startDate) {
    query = query.gte("report_datetime", startDate.toISOString());
  }

  if (endDate) {
    query = query.lte("report_datetime", endDate.toISOString());
  }

  const { error, count } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

function calculateTrend(
  current: number,
  previous: number,
  positiveDirection: "up" | "down",
  daysInPeriod: number,
): DashboardTrend {
  const change = current - previous;

  let percentage: number;
  if (previous === 0) {
    percentage = current === 0 ? 0 : 100;
  } else {
    percentage = (change / previous) * 100;
  }

  const isPositive =
    positiveDirection === "up" ? change >= 0 : change <= 0;

  // Statistical significance: require at least 5 cases to show meaningful trend
  const isSignificant = current >= 5 || previous >= 5;

  // Generate period label
  const periodLabel = daysInPeriod === 1
    ? "vs. yesterday"
    : `vs. previous ${daysInPeriod} days`;

  return {
    value: change,
    percentage: Number(percentage.toFixed(1)),
    isPositive,
    periodLabel,
    isSignificant,
  };
}

export async function getDashboardMetrics(
  client: TypedSupabaseClient,
  params: DashboardMetricsParams = {},
): Promise<DashboardMetricMap> {
  const { startDate, endDate } = params;

  if (!startDate || !endDate) {
    const [total, underInvestigation, settled] = await Promise.all([
      countCases(client, {}),
      countCases(client, { status: "under investigation" }),
      countCases(client, { status: "case settled" }),
    ]);

    return {
      totalReportedCrimes: {
        value: total,
        trend: null,
      },
      crimeRate: {
        value: 0,
        trend: null,
      },
      underInvestigation: {
        value: underInvestigation,
        trend: null,
      },
      settledCase: {
        value: settled,
        trend: null,
      },
      emergencyReports: {
        value: 0,
        trend: null,
      },
      detectedHeatZones: {
        value: 0,
        trend: null,
      },
    };
  }

  const periodMs = endDate.getTime() - startDate.getTime();
  const safePeriodMs = periodMs > 0 ? periodMs : 24 * 60 * 60 * 1000;

  const previousEnd = new Date(startDate.getTime());
  const previousStart = new Date(startDate.getTime() - safePeriodMs);

  const [
    currentTotal,
    previousTotal,
    currentUnderInvestigation,
    previousUnderInvestigation,
    currentSettled,
    previousSettled,
  ] = await Promise.all([
    countCases(client, { startDate, endDate }),
    countCases(client, { startDate: previousStart, endDate: previousEnd }),
    countCases(client, {
      startDate,
      endDate,
      status: "under investigation",
    }),
    countCases(client, {
      startDate: previousStart,
      endDate: previousEnd,
      status: "under investigation",
    }),
    countCases(client, {
      startDate,
      endDate,
      status: "case settled",
    }),
    countCases(client, {
      startDate: previousStart,
      endDate: previousEnd,
      status: "case settled",
    }),
  ]);

  const daysInPeriod = Math.max(
    1,
    Math.round(safePeriodMs / (24 * 60 * 60 * 1000)),
  );

  const totalTrend = calculateTrend(currentTotal, previousTotal, "down", daysInPeriod);
  const underInvestigationTrend = calculateTrend(
    currentUnderInvestigation,
    previousUnderInvestigation,
    "down",
    daysInPeriod,
  );
  const settledTrend = calculateTrend(
    currentSettled,
    previousSettled,
    "up",
    daysInPeriod,
  );

  const currentCrimeRate = currentTotal / daysInPeriod;
  const previousCrimeRate = previousTotal / daysInPeriod;
  const crimeRateTrend = calculateTrend(
    currentCrimeRate,
    previousCrimeRate,
    "down",
    daysInPeriod,
  );

  return {
    totalReportedCrimes: {
      value: currentTotal,
      trend: totalTrend,
    },
    crimeRate: {
      value: Number(currentCrimeRate.toFixed(2)),
      trend: crimeRateTrend,
    },
    underInvestigation: {
      value: currentUnderInvestigation,
      trend: underInvestigationTrend,
    },
    settledCase: {
      value: currentSettled,
      trend: settledTrend,
    },
    emergencyReports: {
      value: 0,
      trend: null,
    },
    detectedHeatZones: {
      value: 0,
      trend: null,
    },
  };
}

