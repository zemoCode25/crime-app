"use client";

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

export type CrimeTableRow = {
  id: number;
  crime_type: number | null;
  case_status: CaseStatus | null;
  suspect: string;
  complainant: string;
};

export const columns: ColumnDef<CrimeTableRow>[] = [
  {
    accessorKey: "id",
    header: "Case ID",
    cell: ({ row }) => {
      return <div className="font-medium">{`CASE-${row.getValue("id")}`}</div>;
    },
  },
  {
    accessorKey: "crime_type",
    header: "Crime Type",
    cell: ({ row }) => {
      const crimeType = row.getValue("crime_type") as number | null;
      return <div>{crimeType || "Unknown"}</div>;
    },
  },
  {
    accessorKey: "case_status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="!p-0 text-left font-bold"
      >
        Status
        {/* ✅ Dynamic sort icon */}
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
      const status = row.getValue("case_status") as string | null;
      return <div className="capitalize">{status || "Unknown"}</div>;
    },
    enableGlobalFilter: true,
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
        {/* ✅ Dynamic sort icon based on current sort state */}
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
        {/* ✅ Dynamic sort icon based on current sort state */}
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
