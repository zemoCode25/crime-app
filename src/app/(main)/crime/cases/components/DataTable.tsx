"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDownIcon, CirclePlus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const statuses = [
  {
    value: "open",
    label: "Open",
  },
  {
    value: "under investigation",
    label: "Under Investigation",
  },
  {
    value: "case settled",
    label: "Case Settled",
  },
  {
    value: "lupon",
    label: "Lupon",
  },
  {
    value: "direct filing",
    label: "Direct Filing",
  },
  {
    value: "for record",
    label: "For Record",
  },
  {
    value: "turn over",
    label: "Turn Over",
  },
];

const crimeTypes = [
  {
    value: "theft",
    label: "Theft",
  },
  {
    value: "murder",
    label: "Murder",
  },
  {
    value: "assault",
    label: "Assault",
  },
];

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>(""); // Added globalFilter state
  const [statusOpen, setStatusOpen] = useState(false);
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [value, setValue] = useState("");

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  return (
    <div className="overflow-hidden rounded-md border dark:border-neutral-600 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 gap-4 justify-between">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-2 w-full">
          <Input
            placeholder="Search person..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:max-w-[17rem]"
          />
          {/* filter status and types */}
          <div className="flex gap-2">
            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={statusOpen}
                  className="w-fit justify-between bg-transparent"
                >
                  {value ? (
                    statuses.find((status) => status.value === value)?.label
                  ) : (
                    <span className="flex items-center gap-1">
                      <CirclePlus /> <p>Status</p>
                    </span>
                  )}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder={`Select status`} />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {statuses.map((status) => (
                        <CommandItem
                          key={status.value}
                          value={status.value}
                          onMouseDown={(e) => {
                            // Prevent Radix from closing the popover on click
                            e.preventDefault();
                          }}
                        >
                          <Checkbox id={status.value} />
                          <Label htmlFor={status.value}>{status.label}</Label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover open={crimeTypeOpen} onOpenChange={setCrimeTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={crimeTypeOpen}
                  className="w-fit justify-between bg-transparent"
                >
                  {value ? (
                    crimeTypes.find((crimeType) => crimeType.value === value)
                      ?.label
                  ) : (
                    <span className="flex items-center gap-1">
                      <CirclePlus /> <p>Type</p>
                    </span>
                  )}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder={`Select status`} />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {crimeTypes.map((crimeType) => (
                        <CommandItem
                          key={crimeType.value}
                          value={crimeType.value}
                          onMouseDown={(e) => {
                            // Prevent Radix from closing the popover on click
                            e.preventDefault();
                          }}
                        >
                          <Checkbox id={crimeType.value} />
                          <Label htmlFor={crimeType.value}>
                            {crimeType.label}
                          </Label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button className="bg-orange-600 hover:bg-amber-500 cursor-pointer dark:text-white">
          <Plus /> Add crime record
        </Button>
      </div>
      <div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-neutral-200/50 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
