import BarangayDistributionPie from "./BarangayDistributionPie";
import StatusPie from "./StatusPie";

export default function PieChartSection() {
  return (
    <section className="mt-4 flex justify-between gap-4 rounded-md border border-neutral-300 bg-white p-4">
      <BarangayDistributionPie />
      <StatusPie />
    </section>
  );
}
