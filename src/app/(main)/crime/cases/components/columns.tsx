"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
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
import DeleteModal from "@/components/delete-modal";
import { Eye } from "lucide-react";

export type CrimeTableRow = {
  id: number;
  crime_type: number | null;
  case_status: CaseStatus | null;
  suspect: string;
  complainant: string;
};

type ActionsCellProps = {
  crime: CrimeTableRow;
};

const ActionsCell = ({ crime }: ActionsCellProps) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  function closeDropdown() {
    setOpenDropdown(false);
  }

  return (
    <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DeleteModal caseId={crime.id} closeDropdown={closeDropdown} />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/crime/cases/${crime.id}`;
          }}
          className="flex w-full cursor-pointer items-center gap-2"
        >
          <Eye />
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ✅ Function that creates columns with dependencies injected
export const createColumns = (
  crimeTypeConverter: (id: number) => string | null,
): ColumnDef<CrimeTableRow>[] => [
  {
    accessorKey: "id",
    header: "Case ID",
    cell: ({ row }) => {
      return <div className="font-medium">{`CASE-${row.getValue("id")}`}</div>;
    },
  },
  {
    accessorKey: "crime_type",
    header: "Type",
    cell: ({ row }) => {
      const crimeTypeId = row.getValue("crime_type") as number | null;
      const crimeType = crimeTypeConverter(crimeTypeId || 0);
      return <div>{crimeType || "Unknown"}</div>;
    },
    // ✅ Now we can use the injected converter (no hooks!)
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const crimeTypeId = row.getValue(columnId) as number | null;
      const cellCrimeType = crimeTypeConverter(crimeTypeId || 0);
      return filterValue.includes(cellCrimeType || "Unknown");
    },
  },
  {
    accessorKey: "case_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("case_status") as string | null;
      return <div className="capitalize">{status || "Unknown"}</div>;
    },
    enableGlobalFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true;
      const status = row.getValue(columnId) as string | null;
      return filterValue.includes(status || "Unknown");
    },
  },
  {
    accessorKey: "complainant",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="!p-0 text-left font-bold"
      >
        Complainant
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const complainant = row.original.complainant;
      return <div className="text-left font-medium">{complainant}</div>;
    },
    enableGlobalFilter: true,
  },
  {
    accessorKey: "suspect",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="!p-0 text-left font-bold"
      >
        Suspect
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const suspect = row.original.suspect;
      return <div className="text-left font-medium">{suspect}</div>;
    },
    enableGlobalFilter: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell crime={row.original} />,
  },
];

// ✅ Keep backward compatibility (without filter functions)
export const columns: ColumnDef<CrimeTableRow>[] = createColumns(() => null);





