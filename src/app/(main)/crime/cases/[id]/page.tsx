import CrimeReport from "./_components/CrimeReport";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-4">
      <CrimeReport id={Number(id)} />
    </div>
  );
}
