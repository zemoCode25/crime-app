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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDownIcon, CirclePlus } from "lucide-react";
import { STATUSES } from "@/constants/crime-case";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import AddCrimeCase from "./AddCrimeCase";
import useSupabaseBrowser from "@/server/supabase/client";
import { getCrimeTypes } from "@/server/queries/crime-type";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { Toaster } from "react-hot-toast";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[]; // ✅ Changed from initialData to data
}

export function DataTable<TData, TValue>({
  columns,
  data, // ✅ Direct data prop
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [value, setValue] = useState("");

  const supabase = useSupabaseBrowser();

  const { data: crimeTypes } = useQuery(getCrimeTypes(supabase));

  const table = useReactTable<TData>({
    data, // ✅ Use data directly from props
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
    <div className="overflow-hidden rounded-sm border p-4 shadow-sm dark:border-orange-900 dark:bg-[var(--dark-card)] dark:shadow-none">
      <Toaster position="top-center" />

      <div className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
        {/* Search and Filter */}
        <div className="flex w-full flex-col gap-2 md:flex-row">
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
                    STATUSES.find((status) => status.value === value)?.label
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
                      {STATUSES.map((status) => (
                        <CommandItem
                          key={status.value}
                          value={status.value}
                          onMouseDown={(e) => {
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
                    crimeTypes?.find((crimeType) => crimeType.label === value)
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
                  <CommandInput placeholder={`Select type`} />
                  <CommandList>
                    <CommandEmpty>No crime type found.</CommandEmpty>
                    <CommandGroup>
                      {crimeTypes?.map((crimeType) => (
                        <CommandItem
                          key={crimeType.label}
                          value={crimeType.label || ""}
                          onMouseDown={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <Checkbox id={crimeType?.label || ""} />
                          <Label htmlFor={crimeType?.label || ""}>
                            {crimeType?.label}
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
        <AddCrimeCase />
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
                            header.getContext(),
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
                <Dialog key={row.id}>
                  <DialogTrigger asChild>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-neutral-200/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </DialogTrigger>
                </Dialog>
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
