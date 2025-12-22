"use client";
import CrimeChart from "./CrimeChart";
import PieChartSection from "./PieChartSection";
import { CrimeBar } from "./CrimeBar";
import DateRangeSelectorControlled from "./DateRangeSelectorControlled";
import { DateRangeProvider } from "@/context/DateRangeProvider";

export default function AnalyticsPage() {
  return (
    <DateRangeProvider>
      <div className="mx-auto my-20 max-w-[70rem] 2xl:max-w-[80rem]">
        <div>
          <div>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="text-sm text-neutral-600">
              Explore detailed insights and trends based on crime data.
            </p>
          </div>
          <DateRangeSelectorControlled />
        </div>
        <CrimeChart />
        <PieChartSection />
        <CrimeBar />
      </div>
    </DateRangeProvider>
  );
}
