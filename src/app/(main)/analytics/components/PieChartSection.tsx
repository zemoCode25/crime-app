import BarangayDistributionPie from "./BarangayDistributionPie";
import StatusPie from "./StatusPie";

interface PieChartSectionProps {
  userBarangayId?: number;
}

export default function PieChartSection({ userBarangayId }: PieChartSectionProps) {
  return (
    <section className="mt-4 flex justify-between gap-4 rounded-md border border-neutral-300 bg-white p-4">
      <BarangayDistributionPie userBarangayId={userBarangayId} />
      <StatusPie userBarangayId={userBarangayId} />
    </section>
  );
}
