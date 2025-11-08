"use client";

import React, { useState } from "react";
import type { PendingInvitation } from "@/server/actions/invitation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvitationTableProps {
  invitations: PendingInvitation[];
}

const columns: ColumnDef<PendingInvitation>[] = [
  {
    accessorKey: "inviteeName",
    header: "Invited User",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <p className="leading-tight font-medium">{row.original.inviteeName}</p>
        {row.original.inviteeEmail ? (
          <p className="text-muted-foreground text-sm">
            {row.original.inviteeEmail}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "invitedByName",
    header: "Invited By",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.invitedByName}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const { role, barangayName } = row.original;
      if (!role) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }

      return (
        <div className="flex flex-col">
          {role === "barangay_admin" ? (
            <Badge variant="secondary" className="py-1 capitalize">
              {`Assigned to ${barangayName ?? "Unknown Barangay"}`}
            </Badge>
          ) : (
            <Badge variant="secondary" className="py-1 capitalize">
              {role.replaceAll("_", " ")}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => <ExpiryCell isoDate={row.original.expiresAt} />,
  },
];

function ExpiryCell({ isoDate }: { isoDate?: string }) {
  if (!isoDate) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }
  const relative = formatDistanceToNow(date, { addSuffix: true });
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
        })}{" "}
        ({relative})
      </span>
    </div>
  );
}

export default function InvitationTable({ invitations }: InvitationTableProps) {
  const [isOpen, setIsOpen] = useState(true);
  const table = useReactTable({
    data: invitations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-8 overflow-hidden rounded-sm border border-neutral-200 bg-white">
      <Button
        type="button"
        variant={"ghost"}
        className="flex w-full cursor-pointer items-center justify-between border-b border-neutral-200 !px-4 py-8 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <div>
          <h2 className="text-base font-semibold">Pending Invitations</h2>
          <p className="text-muted-foreground text-sm">
            Showing unanswered invites that have not expired yet.
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </Button>
      {isOpen ? (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4">
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
                  className="text-muted-foreground h-24 text-center text-sm"
                >
                  No active invitations.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : null}
    </div>
  );
}
