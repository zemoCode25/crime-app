"use client";

import React, { useMemo, useState, useTransition } from "react";
import type { ActiveUserRow } from "@/server/queries/users";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronsUpDownIcon,
  FilterX,
  X,
} from "lucide-react";
import { BARANGAY_OPTIONS } from "@/constants/crime-case";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { kickUser } from "@/server/actions/users";
import InviteUserDialog from "./InviteUserDialog";
import { useRouter } from "next/navigation";

type Props = {
  data: ActiveUserRow[];
};

const ROLE_OPTIONS = [
  { value: "main_admin", label: "Main Admin" },
  { value: "system_admin", label: "System Admin" },
  { value: "barangay_admin", label: "Barangay Admin" },
] as const;

export default function UserTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [barangayOpen, setBarangayOpen] = useState(false);
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([]);

  // Remove user modal state
  const [removeOpen, setRemoveOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<ActiveUserRow>[]>(
    () => [
      {
        id: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="!p-0 text-left font-medium"
          >
            Name
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        accessorFn: (row) =>
          [row.first_name, row.last_name].filter(Boolean).join(" ").trim(),
        cell: ({ row }) => {
          const fullName = [row.original.first_name, row.original.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();
          return (
            <div className="flex flex-col">
              <span className="leading-tight font-medium">
                {fullName || "-"}
              </span>
              <p className="text-muted-foreground text-xs">
                {row.original.email}
              </p>
            </div>
          );
        },
        enableGlobalFilter: true,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.role ?? undefined;
          if (!role)
            return <span className="text-muted-foreground text-sm">-</span>;
          const label = role.replaceAll("_", " ");
          return (
            <Badge
              variant="secondary"
              className="bg-neutral-200 py-1 capitalize"
            >
              {label}
            </Badge>
          );
        },
        filterFn: (row, columnId, filterValue: string[]) => {
          if (!filterValue || filterValue.length === 0) return true;
          const role = row.getValue(columnId) as string | null;
          return filterValue.includes(role || "");
        },
      },
      {
        id: "barangay_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="!p-0 text-left font-bold"
          >
            Barangay
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        accessorFn: (row) => {
          if (row.role !== "barangay_admin" || row.barangay == null) return "";
          return (
            BARANGAY_OPTIONS.find((b) => b.id === row.barangay)?.value || ""
          );
        },
        cell: ({ row }) => {
          const role = row.original.role;
          const id = row.original.barangay;
          const name =
            role === "barangay_admin"
              ? BARANGAY_OPTIONS.find((b) => b.id === id)?.value
              : "";
          return <span className="text-sm">{name || "-"}</span>;
        },
        filterFn: (row, columnId, filterValue: string[]) => {
          if (!filterValue || filterValue.length === 0) return true;
          const val = (row.getValue(columnId) as string) || "";
          return filterValue.includes(val);
        },
        enableGlobalFilter: true,
      },
      {
        accessorKey: "last_sign_in_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="!p-0 text-left font-bold"
          >
            Last Sign In
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        accessorFn: (row) => row.last_sign_in_at || "",
        cell: ({ row }) => {
          const iso = row.original.last_sign_in_at;
          if (!iso)
            return <span className="text-muted-foreground text-sm">-</span>;
          const date = new Date(iso);
          if (Number.isNaN(date.getTime()))
            return <span className="text-muted-foreground text-sm">-</span>;
          return (
            <div className="flex flex-col">
              <span className="text-sm leading-tight font-medium">
                {date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-muted-foreground text-xs">
                {date.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
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
                onClick={(e) => {
                  e.preventDefault();
                  setTargetUserId(row.original.id);
                  setSelectedReasons([]);
                  setOtherReason("");
                  setSubmitError("");
                  setRemoveOpen(true);
                }}
                className="cursor-pointer"
              >
                Remove user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const table = useReactTable<ActiveUserRow>({
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

  const handleRoleToggle = (roleValue: string) => {
    setSelectedRoles((prev) => {
      const next = prev.includes(roleValue)
        ? prev.filter((r) => r !== roleValue)
        : [...prev, roleValue];
      table
        .getColumn("role")
        ?.setFilterValue(next.length > 0 ? next : undefined);
      return next;
    });
  };

  const handleBarangayToggle = (barangayLabel: string) => {
    setSelectedBarangays((prev) => {
      const next = prev.includes(barangayLabel)
        ? prev.filter((b) => b !== barangayLabel)
        : [...prev, barangayLabel];
      table
        .getColumn("barangay_name")
        ?.setFilterValue(next.length > 0 ? next : undefined);
      return next;
    });
  };

  const clearAllFilters = () => {
    setGlobalFilter("");
    setSelectedRoles([]);
    setSelectedBarangays([]);
    table.resetColumnFilters();
    table.resetGlobalFilter();
  };

  const removeRoleFilter = (roleValue: string) => handleRoleToggle(roleValue);
  const removeBarangayFilter = (label: string) => handleBarangayToggle(label);

  const presetReasons = [
    "Inactivity",
    "Policy violation",
    "Spam or abuse",
    "No longer needed",
  ];

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason],
    );
  };

  const submitRemoval = async () => {
    setSubmitError("");
    const compiled = [...selectedReasons, otherReason.trim()]
      .filter(Boolean)
      .join(". ")
      .trim();
    if (compiled.length < 10) {
      setSubmitError(
        "Please provide at least 10 characters explaining the removal.",
      );
      return;
    }
    if (!targetUserId) return;
    startTransition(async () => {
      const res = await kickUser({ userId: targetUserId, reason: compiled });
      if (!res.ok) {
        const message =
          typeof res.error === "string" ? res.error : "Failed to remove user";
        setSubmitError(message);
        return;
      }
      setRemoveOpen(false);
      setTargetUserId(null);
      setSelectedReasons([]);
      setOtherReason("");
    });
  };

  return (
    <div className="overflow-hidden rounded-sm border border-neutral-300 p-4 dark:border-orange-900 dark:bg-[var(--dark-card)] dark:shadow-none">
      <div className="flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center">
        {/* Search and Filter */}
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <div className="flex justify-between gap-2">
            <Input
              placeholder="Search user or email..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full bg-white sm:max-w-[17rem] dark:bg-[var(--dark-input)]"
            />
            <div className="flex gap-2">
              {/* Role Filter */}
              <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={roleOpen}
                    className="w-fit justify-between bg-white dark:bg-[var(--dark-input)]"
                  >
                    {selectedRoles.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <ChevronsUpDownIcon />
                        <p>Role ({selectedRoles.length})</p>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ChevronsUpDownIcon /> <p>Role</p>
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Select role" />
                    <CommandList>
                      <CommandEmpty>No roles found.</CommandEmpty>
                      <CommandGroup>
                        {ROLE_OPTIONS.map((role) => (
                          <CommandItem
                            key={role.value}
                            value={role.value}
                            onSelect={() => handleRoleToggle(role.value)}
                          >
                            <Checkbox
                              id={role.value}
                              checked={selectedRoles.includes(role.value)}
                              onChange={() => handleRoleToggle(role.value)}
                            />
                            <Label
                              htmlFor={role.value}
                              className="ml-2 capitalize"
                            >
                              {role.label}
                            </Label>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {/* Barangay Filter */}
              <Popover open={barangayOpen} onOpenChange={setBarangayOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={barangayOpen}
                    className="w-fit justify-between bg-white dark:bg-[var(--dark-input)]"
                  >
                    {selectedBarangays.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <ChevronsUpDownIcon />
                        <p>Barangay ({selectedBarangays.length})</p>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ChevronsUpDownIcon /> <p>Barangay</p>
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0">
                  <Command>
                    <CommandInput placeholder="Select barangay" />
                    <CommandList>
                      <CommandEmpty>No barangay found.</CommandEmpty>
                      <CommandGroup>
                        {BARANGAY_OPTIONS.map((b) => (
                          <CommandItem
                            key={b.id}
                            value={b.value}
                            onSelect={() => handleBarangayToggle(b.value)}
                          >
                            <Checkbox
                              id={`barangay-${b.id}`}
                              checked={selectedBarangays.includes(b.value)}
                              onChange={() => handleBarangayToggle(b.value)}
                            />
                            <Label
                              htmlFor={`barangay-${b.id}`}
                              className="ml-2"
                            >
                              {b.value}
                            </Label>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {(selectedRoles.length > 0 ||
              selectedBarangays.length > 0 ||
              globalFilter) && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="h-9 border border-neutral-300 bg-transparent px-2 text-sm hover:bg-neutral-200/50 dark:border-orange-900"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
          <InviteUserDialog />
        </div>
      </div>

      {/* Active filters badges */}
      {(selectedRoles.length > 0 || selectedBarangays.length > 0) && (
        <div className="flex flex-wrap gap-2 pb-4">
          {selectedRoles.map((roleValue) => {
            const role = ROLE_OPTIONS.find((r) => r.value === roleValue);
            return (
              <Badge
                key={roleValue}
                variant="outline"
                className="flex items-center gap-1 rounded-sm border border-neutral-300 px-2 py-1 dark:border-orange-900"
              >
                {role?.label ?? roleValue}
                <Button
                  variant="ghost"
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeRoleFilter(roleValue)}
                >
                  <X />
                </Button>
              </Badge>
            );
          })}

          {selectedBarangays.map((label) => (
            <Badge
              key={label}
              variant="outline"
              className="flex items-center gap-1 rounded-sm border border-neutral-300 px-2 py-1 dark:border-orange-900"
            >
              {label}
              <Button
                variant="ghost"
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeBarangayFilter(label)}
              >
                <X />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border border-neutral-300 px-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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

      {/* Pagination */}
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

      {/* Remove User Modal */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Remove user</DialogTitle>
            <DialogDescription>
              Select one or more reasons and optionally provide more details.
              The user will receive an email notification.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            {presetReasons.map((reason) => (
              <label key={reason} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedReasons.includes(reason)}
                  onCheckedChange={() => toggleReason(reason)}
                />
                <span>{reason}</span>
              </label>
            ))}
            <div className="grid gap-2 pt-2">
              <Label htmlFor="other-reason">Other reason</Label>
              <Textarea
                id="other-reason"
                placeholder="Add any additional context..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={4}
              />
              {submitError ? (
                <span className="text-sm text-red-600">{submitError}</span>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={submitRemoval}
              disabled={isPending}
            >
              {isPending ? "Removing..." : "Remove user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
