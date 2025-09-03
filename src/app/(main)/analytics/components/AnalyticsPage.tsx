import CrimeChart from "./CrimeChart";
import PieChartSection from "./PieChartSection";
import { CrimeBar } from "./CrimeBar";
export default function AnalyticsPage() {
  return (
    <div className="px-1 py-4">
      <h1 className="mb-4 text-2xl font-bold">Analytics</h1>
      <CrimeChart />
      <PieChartSection />
      <CrimeBar />
    </div>
  );
}
