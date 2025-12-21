import CrimeChart from "./CrimeChart";
import PieChartSection from "./PieChartSection";
import { CrimeBar } from "./CrimeBar";
export default function AnalyticsPage() {
  return (
    <div className="mx-auto my-20 max-w-[70rem] 2xl:max-w-[80rem]">
      <div>
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-sm text-neutral-600">
          Explore detailed insights and trends based on crime data.
        </p>
      </div>
      <CrimeChart />
      <PieChartSection />
      <CrimeBar />
    </div>
  );
}
