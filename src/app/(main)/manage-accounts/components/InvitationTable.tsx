"use client";

import React from "react";
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

interface InvitationTableProps {
  invitations: PendingInvitation[];
}

const columns: ColumnDef<PendingInvitation>[] = [
  {
    accessorKey: "inviteeName",
    header: "Invited User",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="leading-tight font-medium">
          {row.original.inviteeName}
        </span>
        {row.original.inviteeEmail ? (
          <span className="text-muted-foreground text-sm">
            {row.original.inviteeEmail}
          </span>
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
    cell: ({ row }) =>
      row.original.role ? (
        <Badge variant="secondary" className="capitalize">
          {row.original.role.replace(/_/g, " ")}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => <ExpiryCell isoDate={row.original.expiresAt} />,
  },
];

function ExpiryCell({ isoDate }: { isoDate?: string }) {
  if (!isoDate) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return <span className="text-muted-foreground text-sm">—</span>;
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
  const table = useReactTable({
    data: invitations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-8 overflow-hidden rounded-md border-neutral-200">
      <div className="border-b border-neutral-200 py-3">
        <h2 className="text-base font-semibold">Pending Invitations</h2>
        <p className="text-muted-foreground text-sm">
          Showing unanswered invites that have not expired yet.
        </p>
      </div>
      <Table className="border bg-white">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    </div>
  );
}
