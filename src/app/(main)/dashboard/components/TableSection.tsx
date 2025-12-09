"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRecentCrimeCases } from "@/hooks/dashboard/useCrimeChartData";
import { STATUSES } from "@/constants/crime-case";

interface TableSectionProps {
  limit?: number;
}

export default function TableSection({ limit = 5 }: TableSectionProps) {
  const router = useRouter();
  const { data: recentCases, isLoading } = useRecentCrimeCases(limit);

  // Get status label from value
  const getStatusLabel = (statusValue: string | null) => {
    if (!statusValue) return "Unknown";
    const status = STATUSES.find((s) => s.value === statusValue);
    return status?.label || statusValue;
  };

  // Get status badge variant
  const getStatusVariant = (statusValue: string | null) => {
    switch (statusValue) {
      case "open":
        return "destructive";
      case "under investigation":
        return "default";
      case "case settled":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold dark:text-orange-100">
        Table of recent crime cases
      </h2>
      <Table className="w-full rounded-sm border border-neutral-300 bg-white shadow-sm dark:border-orange-900/30 dark:bg-[var(--dark-card)] dark:shadow-none">
        <TableCaption className="dark:text-orange-200/60">
          {isLoading ? "Loading..." : `Recent ${limit} crime cases`}
        </TableCaption>
        <TableHeader>
          <TableRow className="dark:bg-orange-900/10">
            <TableHead className="w-[100px] dark:text-orange-100">
              Case Code
            </TableHead>
            <TableHead className="dark:text-orange-100">Complainant</TableHead>
            <TableHead className="dark:text-orange-100">Suspect</TableHead>
            <TableHead className="text-right dark:text-orange-100">
              Type
            </TableHead>
            <TableHead className="text-right dark:text-orange-100">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: limit }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-24" />
                </TableCell>
              </TableRow>
            ))
          ) : recentCases && recentCases.length > 0 ? (
            // Actual data
            recentCases.map((crimeCase) => (
              <TableRow
                key={crimeCase.id}
                className="cursor-pointer transition-colors hover:bg-neutral-100 dark:hover:bg-orange-900/20"
                onClick={() => router.push(`/crime/cases/${crimeCase.id}`)}
              >
                <TableCell className="font-medium dark:text-orange-100">
                  {crimeCase.case_code}
                </TableCell>
                <TableCell className="dark:text-orange-200/80">
                  {crimeCase.complainant_name}
                </TableCell>
                <TableCell className="dark:text-orange-200/80">
                  {crimeCase.suspect_name}
                </TableCell>
                <TableCell className="text-right dark:text-orange-200/80">
                  {crimeCase.crime_type_label}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={getStatusVariant(crimeCase.case_status)}
                    className="text-xs"
                  >
                    {getStatusLabel(crimeCase.case_status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            // Empty state
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground h-24 text-center"
              >
                No recent crime cases found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
