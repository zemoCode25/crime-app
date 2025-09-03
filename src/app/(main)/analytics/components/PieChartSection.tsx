import PieChartStats from "./PieChartStats";
import CrimeTypeChart from "./CrimeTypePie";

export default function PieChartSection() {
  return (
    <section className="mt-4 flex justify-between gap-4 rounded-md border border-neutral-300 p-4">
      <PieChartStats />
      <CrimeTypeChart />
      <PieChartStats />
    </section>
  );
}
