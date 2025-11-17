"use client";

import { useState, useMemo } from "react";
import {
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
import { Badge } from "@/components/ui/badge";

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
import { ChevronsUpDownIcon, CirclePlus, X, FilterX } from "lucide-react";
import { STATUSES } from "@/constants/crime-case";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import AddCrimeCase from "./AddCrimeCase";
import useSupabaseBrowser from "@/server/supabase/client";
import { getCrimeTypes } from "@/server/queries/crime-type";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { Toaster } from "react-hot-toast";
import UpdateCrimeCase from "./UpdateCrimeCase";
import { CrimeTableRow } from "@/app/(main)/crime/cases/components/columns";
import { createColumns } from "./columns";
import { useCrimeType } from "@/context/CrimeTypeProvider";

// ✅ Use specific type instead of generic
export function DataTable({ data }: { data: CrimeTableRow[] }) {
  // ✅ Hook called at component level (correct!)
  const { crimeTypeConverter } = useCrimeType();

  // ✅ Create columns with the converter injected
  const columns = useMemo(
    () => createColumns(crimeTypeConverter),
    [crimeTypeConverter],
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);

  // ✅ Multi-select status state
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]); // [open, closed]
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState<string[]>([]); // [Theft, Assault]

  const supabase = useSupabaseBrowser();
  const { data: crimeTypes } = useQuery(getCrimeTypes(supabase));

  const table = useReactTable<CrimeTableRow>({
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
    filterFns: {
      filterRows: (row, columnId, filterValue: string[]) => {
        if (!filterValue || filterValue.length === 0) return true;
        const cellValue = row.getValue(columnId) as string | null;
        return filterValue.includes(cellValue || "Unknown");
      },
    },
  });

  // ✅ Handle status selection
  const handleStatusToggle = (statusValue: string) => {
    setSelectedStatuses((prev) => {
      const newStatuses = prev.includes(statusValue)
        ? prev.filter((s) => s !== statusValue)
        : [...prev, statusValue];

      // Update table filter
      table
        .getColumn("case_status")
        ?.setFilterValue(newStatuses.length > 0 ? newStatuses : undefined);

      return newStatuses;
    });
  };

  // ✅ Handle crime type selection
  const handleCrimeTypeToggle = (crimeTypeLabel: string) => {
    setSelectedCrimeTypes((prev) => {
      const newTypes = prev.includes(crimeTypeLabel)
        ? prev.filter((t) => t !== crimeTypeLabel)
        : [...prev, crimeTypeLabel];

      // Update table filter
      table
        .getColumn("crime_type")
        ?.setFilterValue(newTypes.length > 0 ? newTypes : undefined);

      return newTypes;
    });
  };

  // ✅ Clear all filters
  const clearAllFilters = () => {
    setGlobalFilter("");
    setSelectedStatuses([]);
    setSelectedCrimeTypes([]);
    table.resetColumnFilters();
    table.resetGlobalFilter();
  };

  // ✅ Remove individual status filter
  const removeStatusFilter = (statusValue: string) => {
    handleStatusToggle(statusValue);
  };

  // ✅ Remove individual crime type filter
  const removeCrimeTypeFilter = (crimeTypeLabel: string) => {
    handleCrimeTypeToggle(crimeTypeLabel);
  };

  return (
    <div className="mx-10 overflow-hidden rounded-sm p-4 dark:border-orange-900 dark:bg-[var(--dark-card)] dark:shadow-none">
      <Toaster position="top-right" />

      <div className="flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center">
        {/* Search and Filter */}
        <div className="flex w-full flex-col gap-2 md:flex-row">
          <Input
            placeholder="Search person..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full bg-white sm:max-w-[17rem]"
          />

          {/* Filter Controls */}
          <div className="flex gap-2">
            {/* Status Filter */}
            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={statusOpen}
                  className="w-fit justify-between bg-white"
                >
                  {selectedStatuses.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <CirclePlus />
                      <p>Status ({selectedStatuses.length})</p>
                    </span>
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
                  <CommandInput placeholder="Select status" />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {STATUSES.map((status) => (
                        <CommandItem
                          key={status.value}
                          value={status.value}
                          onSelect={() => handleStatusToggle(status.value)}
                        >
                          <Checkbox
                            id={status.value}
                            checked={selectedStatuses.includes(status.value)}
                            onChange={() => handleStatusToggle(status.value)}
                          />
                          <Label htmlFor={status.value} className="ml-2">
                            {status.label}
                          </Label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Crime Type Filter */}
            <Popover open={crimeTypeOpen} onOpenChange={setCrimeTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={crimeTypeOpen}
                  className="w-fit justify-between bg-white"
                >
                  {selectedCrimeTypes.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <CirclePlus />
                      <p>Type ({selectedCrimeTypes.length})</p>
                    </span>
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
                  <CommandInput placeholder="Select type" />
                  <CommandList>
                    <CommandEmpty>No crime type found.</CommandEmpty>
                    <CommandGroup>
                      {crimeTypes?.map((crimeType) => (
                        <CommandItem
                          key={crimeType.label}
                          value={crimeType.label || ""}
                          onSelect={() =>
                            handleCrimeTypeToggle(crimeType.label || "")
                          }
                        >
                          <Checkbox
                            id={crimeType.label || ""}
                            checked={selectedCrimeTypes.includes(
                              crimeType.label || "",
                            )}
                            onChange={() =>
                              handleCrimeTypeToggle(crimeType.label || "")
                            }
                          />
                          <Label
                            htmlFor={crimeType.label || ""}
                            className="ml-2"
                          >
                            {crimeType.label}
                          </Label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Clear All Filters Button */}
            {(selectedStatuses.length > 0 ||
              selectedCrimeTypes.length > 0 ||
              globalFilter) && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="h-9 border border-neutral-300 bg-transparent px-2 text-base hover:bg-neutral-200/50 dark:border-orange-900"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </div>
        <AddCrimeCase />
      </div>

      {/* ✅ Filter Badges */}
      {(selectedStatuses.length > 0 || selectedCrimeTypes.length > 0) && (
        <div className="flex flex-wrap gap-2 pb-4">
          {/* Status Badges */}
          {selectedStatuses.map((statusValue) => {
            const status = STATUSES.find((s) => s.value === statusValue);
            return (
              <Badge
                key={statusValue}
                variant="outline"
                className="flex items-center gap-1 rounded-sm border border-neutral-300 px-2 py-1 dark:border-orange-900"
              >
                {status?.label}
                <Button
                  variant="ghost"
                  className="z-index h-3 w-3 cursor-pointer"
                  onClick={() => {
                    removeStatusFilter(statusValue);
                  }}
                >
                  <X />
                </Button>
              </Badge>
            );
          })}

          {/* Crime Type Badges */}
          {selectedCrimeTypes.map((crimeTypeLabel) => (
            <Badge
              key={crimeTypeLabel}
              variant="outline"
              className="flex items-center gap-1 rounded-sm border border-neutral-300 px-2 py-1 dark:border-orange-900"
            >
              {crimeTypeLabel}
              <Button
                variant="ghost"
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeCrimeTypeFilter(crimeTypeLabel)}
              >
                <X />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Table */}
      <div>
        <Table className="bg-white dark:bg-[var(--dark-card)]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-4 py-2">
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
              table.getRowModel().rows.map((row) => {
                return (
                  <Dialog key={row.id}>
                    <DialogTrigger asChild>
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-pointer hover:bg-neutral-200/50"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </DialogTrigger>
                    <UpdateCrimeCase caseId={row.original.id} />
                  </Dialog>
                );
              })
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
