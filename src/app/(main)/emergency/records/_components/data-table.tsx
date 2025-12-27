"use client";

import * as React from "react";
import { format, isFuture } from "date-fns";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Calendar,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEmergencyRecords } from "@/hooks/emergency/useEmergencyRecords";
import type { EmergencyRecord } from "@/server/queries/emergency";
import { cn } from "@/lib/utils";
import TableFilter from "./table-filter";

function TableSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-md border border-transparent px-4 py-3"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

interface EmailRowProps {
  record: EmergencyRecord;
  onClick: () => void;
}

function EmailRow({ record, onClick }: EmailRowProps) {
  const isScheduled = record.schedule && isFuture(new Date(record.schedule));
  const displayDate = record.created_at
    ? format(new Date(record.created_at), "MMM d")
    : "";
  const truncatedBody = record.body
    ? record.body.length > 60
      ? `${record.body.slice(0, 60)}...`
      : record.body
    : "No content";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-md border border-transparent px-4 py-3 transition-colors",
        "hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm",
        "active:bg-gray-100",
      )}
    >
      {/* Sender name */}
      <div className="w-40 shrink-0 truncate font-medium text-gray-900">
        {record.sender_name || "Unknown"}
      </div>

      {/* Subject and preview */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 truncate font-medium text-gray-900">
          {record.subject || "No subject"}
        </span>
        <span className="mx-1 text-gray-400">-</span>
        <span className="truncate text-gray-500">{truncatedBody}</span>
      </div>

      {/* Scheduled badge */}
      {isScheduled && (
        <Badge
          variant="outline"
          className="shrink-0 border-amber-300 bg-amber-50 text-amber-700"
        >
          <Clock className="mr-1 h-3 w-3" />
          Scheduled
        </Badge>
      )}

      {/* Date */}
      <div className="w-20 shrink-0 text-right text-sm text-gray-500">
        {displayDate}
      </div>
    </div>
  );
}

interface EmailDetailDialogProps {
  record: EmergencyRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EmailDetailDialog({
  record,
  open,
  onOpenChange,
}: EmailDetailDialogProps) {
  if (!record) return null;

  const isScheduled = record.schedule && isFuture(new Date(record.schedule));
  const formattedDate = record.created_at
    ? format(new Date(record.created_at), "MMMM d, yyyy 'at' h:mm a")
    : "Unknown date";
  const scheduledDate = record.schedule
    ? format(new Date(record.schedule), "MMMM d, yyyy 'at' h:mm a")
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl">
                {record.subject || "No subject"}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>From: {record.sender_name || "Unknown"}</span>
              </DialogDescription>
            </div>
            {isScheduled && (
              <Badge
                variant="outline"
                className="shrink-0 border-amber-300 bg-amber-50 text-amber-700"
              >
                <Clock className="mr-1 h-3 w-3" />
                Scheduled
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Time info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Sent: {formattedDate}</span>
            </div>
            {scheduledDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Scheduled for: {scheduledDate}</span>
              </div>
            )}
          </div>

          {/* Message body */}
          <div className="rounded-md border border-neutral-200 p-4 text-sm">
            <p className="whitespace-pre-wrap">{record.body || "No content"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DataTable() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [selectedRecord, setSelectedRecord] =
    React.useState<EmergencyRecord | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, error } = useEmergencyRecords({
    searchQuery: debouncedSearch,
    sortOrder,
    page,
  });

  const records = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleRowClick = (record: EmergencyRecord) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header with search and sort */}
      <div className="flex items-center justify-between gap-4">
        <TableFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Table content */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500">
          <div className="w-40 shrink-0">Sender</div>
          <div className="flex-1">Subject & Preview</div>
          <div className="w-20 shrink-0 text-right">
            <button
              onClick={toggleSortOrder}
              className="inline-flex items-center gap-1 hover:text-gray-900"
            >
              Date
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Table body */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Mail className="mb-2 h-8 w-8" />
              <p>Failed to load records</p>
              <p className="text-sm">{error.message}</p>
            </div>
          ) : records && records.length > 0 ? (
            records.map((record) => (
              <EmailRow
                key={record.id}
                record={record}
                onClick={() => handleRowClick(record)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Mail className="mb-2 h-8 w-8" />
              <p>No emergency notifications found</p>
              {debouncedSearch && (
                <p className="text-sm">Try adjusting your search query</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Record count */}
      {records && records.length > 0 && (
        <div className="text-sm text-gray-500">
          {records.length} notification{records.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Detail dialog */}
      <EmailDetailDialog
        record={selectedRecord}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
