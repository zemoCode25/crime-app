"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CrimeCaseItem = {
  id: string | number;
  crime_type: string;
  case_status: string;
  suspect: string;
  complainant: string;
};

export const columns: ColumnDef<CrimeCaseItem>[] = [
  {
    accessorKey: "complainant",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-left !p-0 font-bold"
      >
        Complainant
        <ArrowUpDown className="ml-2 h-4 w-4" />
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
        className="text-left !p-0 font-bold"
      >
        Suspect
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const suspect = row.original.suspect;
      return <div className="text-left font-medium">{suspect}</div>;
    },
    enableGlobalFilter: true,
  },
  {
    accessorKey: "crime_type",
    header: "Type",
    cell: ({ row }) => <span>{row.original.crime_type}</span>,
  },
  {
    accessorKey: "case_status",
    header: "Status",
    cell: ({ row }) => <span>{row.original.case_status}</span>,
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
