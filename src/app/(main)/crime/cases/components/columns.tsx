"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
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
import DeleteModal from "@/components/utils/delete-modal";
import { Eye } from "lucide-react";

export type CrimeTableRow = {
  id: number;
  case_number: string | null;
  crime_type: number | null;
  case_status: CaseStatus | null;
  suspect: string;
  complainant: string;
  incident_datetime: string | null;
  report_datetime: string | null;
};

type ActionsCellProps = {
  crime: CrimeTableRow;
};

// ✅ Function that creates columns with dependencies injected
export const createColumns = (
  crimeTypeConverter: (id: number) => string | null,
): ColumnDef<CrimeTableRow>[] => [
  {
    accessorKey: "case_number",
    header: "Case Number",
    cell: ({ row }) => {
      const caseNumber = row.getValue("case_number") as string | null;
      return (
        <div className="font-medium">
          {caseNumber || `ID-${row.original.id}`}
        </div>
      );
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
    accessorKey: "incident_datetime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="!p-0 text-left font-bold"
      >
        Incident Date
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
      const dateValue = row.getValue("incident_datetime") as string | null;
      if (!dateValue) return <div className="text-neutral-400">-</div>;
      return <div>{format(new Date(dateValue), "MMM d, yyyy")}</div>;
    },
  },
  {
    accessorKey: "report_datetime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="!p-0 text-left font-bold"
      >
        Date Reported
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
      const dateValue = row.getValue("report_datetime") as string | null;
      if (!dateValue) return <div className="text-neutral-400">-</div>;
      return <div>{format(new Date(dateValue), "MMM d, yyyy")}</div>;
    },
  },
];

// ✅ Keep backward compatibility (without filter functions)
export const columns: ColumnDef<CrimeTableRow>[] = createColumns(() => null);
