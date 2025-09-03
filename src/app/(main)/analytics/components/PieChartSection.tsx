import PieChartStats from "./PieChartStats";

export default function PieChartSection() {
  return (
    <section className="mt-4 flex justify-between gap-4 rounded-md border border-neutral-300 p-4">
      <PieChartStats />
      <PieChartStats />
      <PieChartStats />
    </section>
  );
}
