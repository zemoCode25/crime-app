"use client";
import CardSection from "./CardSection";
import ChartSection from "./ChartSection";
import EmergencySection from "./EmergencySection";
import TableSection from "./TableSection";
import DateRangeSelector from "@/app/(main)/dashboard/components/DateRangeSelector";
import { DateRange } from "react-day-picker";

export default function DashboardPage() {
  return (
    <section className="mt-4 flex flex-col justify-between gap-4 px-8 py-4">
      <DateRangeSelector>
        {(dateRange: DateRange | undefined) => (
          <div className="flex flex-col gap-10">
            <CardSection dateRange={dateRange} />
            <ChartSection dateRange={dateRange} />
            <EmergencySection />
            <TableSection />
          </div>
        )}
      </DateRangeSelector>
    </section>
  );
}
