import { getTableCases } from "../action";
import { columns } from "./columns";
import { DataTable } from "./DataTable";

export default async function CrimePage() {
  const data = await getTableCases();

  return (
    <main className="px-1 py-4">
      <h1 className="mb-4 text-2xl font-bold">Crime Cases</h1>
      <DataTable columns={columns} data={data} />
    </main>
  );
}
