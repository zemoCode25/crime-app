import { getTableCases } from "../action";
import { columns } from "./columns";
import { DataTable } from "./DataTable";

// async function fetchData(): Promise<CrimeCase[]> {
//   return [
//     {
//       id: "C001",
//       complainant: "John Doe",
//       status: "settled",
//       type: "theft",
//       suspect: "Mark Cruz",
//     },
//     {
//       id: "C002",
//       complainant: "Jane Smith",
//       status: "under investigation",
//       type: "murder",
//       suspect: "Unknown",
//     },
//     {
//       id: "C003",
//       complainant: "Albert Ramos",
//       status: "on hold",
//       type: "assault",
//       suspect: "Victor Santos",
//     },
//     {
//       id: "C004",
//       complainant: "Maria Lopez",
//       status: "rejected",
//       type: "theft",
//       suspect: "Carlos Garcia",
//     },
//     {
//       id: "C005",
//       complainant: "David Tan",
//       case_status: "settled",
//       crime_type: "assault",
//       suspect: "Leo Mendoza",
//     },
//     {
//       id: "C006",
//       complainant: "Emily Reyes",
//       status: "under investigation",
//       type: "murder",
//       suspect: "Miguel Torres",
//     },
//     {
//       id: "C007",
//       complainant: "Patrick Lim",
//       status: "on hold",
//       type: "theft",
//       suspect: "Antonio Perez",
//     },
//     {
//       id: "C008",
//       complainant: "Sophia Cruz",
//       status: "settled",
//       type: "assault",
//       suspect: "Daniel Navarro",
//     },
//     {
//       id: "C009",
//       complainant: "Michael Ong",
//       status: "rejected",
//       type: "murder",
//       suspect: "Unknown",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//     {
//       id: "C010",
//       complainant: "Angela Santos",
//       status: "under investigation",
//       type: "theft",
//       suspect: "Jose Fernandez",
//     },
//   ];
// }

export default async function CrimePage() {
  const data = await getTableCases();

  return (
    <main className="px-1 py-4">
      <h1 className="mb-4 text-2xl font-bold">Crime Cases</h1>
      <DataTable columns={columns} data={data} />
    </main>
  );
}
