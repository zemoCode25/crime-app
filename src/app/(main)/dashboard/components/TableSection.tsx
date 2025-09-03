import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TableSection() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Table of recent crime cases</h2>
      <Table>
        <TableCaption>Recent 5 crime cases</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Case Code</TableHead>
            <TableHead>Complainant</TableHead>
            <TableHead>Suspect</TableHead>
            <TableHead className="text-right">Type</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">CR-001</TableCell>
            <TableCell>Maria Santos Cruz</TableCell>
            <TableCell>Ramon Dela Cruz</TableCell>
            <TableCell className="text-right">Theft</TableCell>
            <TableCell className="text-right">Open</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">CR-002</TableCell>
            <TableCell>Jose Reyes Garcia</TableCell>
            <TableCell>Antonio Ramos Lopez</TableCell>
            <TableCell className="text-right">Assault</TableCell>
            <TableCell className="text-right">Under investigation</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">CR-003</TableCell>
            <TableCell>Isabella Fernandez</TableCell>
            <TableCell>Miguel Torres Santos</TableCell>
            <TableCell className="text-right">Threat</TableCell>
            <TableCell className="text-right">Case settled</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">CR-004</TableCell>
            <TableCell>Carmen Bautista</TableCell>
            <TableCell>Federico Mendoza</TableCell>
            <TableCell className="text-right">Assault</TableCell>
            <TableCell className="text-right">Open</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">CR-005</TableCell>
            <TableCell>Roberto Villanueva</TableCell>
            <TableCell>Eduardo Rodriguez</TableCell>
            <TableCell className="text-right">Theft</TableCell>
            <TableCell className="text-right">Under investigation</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
