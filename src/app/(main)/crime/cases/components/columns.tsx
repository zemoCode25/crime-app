"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { CaseStatus } from "@/types/form-schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ✅ Update type to match what getTableCases actually returns
type CrimeTableRow = {
  id: number;
  crime_type: number | null;
  case_status: CaseStatus | null;
  suspect: string; // ✅ Already processed as string
  complainant: string; // ✅ Already processed as string
};

export const columns: ColumnDef<CrimeTableRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <div className="font-medium">{`CASE-${row.getValue("id")}`}</div>;
    },
  },
  {
    accessorKey: "crime_type",
    header: "Crime Type",
    cell: ({ row }) => {
      const crimeType = row.getValue("crime_type") as number | null;
      // You might want to create a helper function to map crime type numbers to names
      return <div>{crimeType || "Unknown"}</div>;
    },
  },
  {
    accessorKey: "case_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("case_status") as string | null;
      return <div className="capitalize">{status || "Unknown"}</div>;
    },
  },
  {
    accessorKey: "complainant",
    header: "Complainant",
    cell: ({ row }) => {
      return <div>{row.getValue("complainant")}</div>;
    },
  },
  {
    accessorKey: "suspect",
    header: "Suspect",
    cell: ({ row }) => {
      return <div>{row.getValue("suspect")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const crime = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => console.log("Delete case", crime.id)}
              className="hover:bg-red-500 hover:text-white"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
