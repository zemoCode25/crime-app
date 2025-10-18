"use client";

import { useCrimeCases } from "@/hooks/crime-case/useCrimeCases";
import { DataTable } from "./DataTable";
import { columns } from "./columns";

export default function CrimePage() {
  const { data, isLoading, error } = useCrimeCases();

  if (isLoading) {
    return (
      <main className="px-1 py-4">
        <h1 className="mb-4 text-2xl font-bold">Crime Cases</h1>

        {/* Skeleton for DataTable */}
        <div className="overflow-hidden rounded-sm border p-4 shadow-sm dark:border-orange-900 dark:bg-[var(--dark-card)] dark:shadow-none">
          {/* Skeleton for search bar and filters */}
          <div className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
            <div className="flex w-full flex-col gap-2 md:flex-row">
              {/* Search input skeleton */}
              <div className="h-10 w-full animate-pulse rounded bg-gray-200 sm:max-w-[17rem] dark:bg-gray-700"></div>

              {/* Filter buttons skeleton */}
              <div className="flex gap-2">
                <div className="h-10 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-10 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>

            {/* Add button skeleton */}
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Table skeleton */}
          <div className="rounded-md border">
            {/* Table header skeleton */}
            <div className="border-b bg-gray-50 dark:bg-gray-800/50">
              <div className="flex">
                <div className="h-12 flex-1 border-r border-gray-200 p-4 dark:border-gray-700">
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="h-12 flex-1 border-r border-gray-200 p-4 dark:border-gray-700">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="h-12 flex-1 border-r border-gray-200 p-4 dark:border-gray-700">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="h-12 flex-1 border-r border-gray-200 p-4 dark:border-gray-700">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="h-12 flex-1 p-4">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>

            {/* Table rows skeleton */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="border-b border-gray-200 last:border-b-0 dark:border-gray-700"
              >
                <div className="flex">
                  <div className="flex h-16 flex-1 items-center border-r border-gray-200 p-4 dark:border-gray-700">
                    <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="flex h-16 flex-1 items-center border-r border-gray-200 p-4 dark:border-gray-700">
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="flex h-16 flex-1 items-center border-r border-gray-200 p-4 dark:border-gray-700">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="flex h-16 flex-1 items-center border-r border-gray-200 p-4 dark:border-gray-700">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="flex h-16 flex-1 items-center p-4">
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-1 py-4">
        <h1 className="mb-4 text-2xl font-bold">Crime Cases</h1>
        <div className="text-red-500">Error: {error.message}</div>
      </main>
    );
  }

  return (
    <main className="px-1 py-4">
      <h1 className="mb-4 text-2xl font-bold">Crime Cases</h1>
      <DataTable data={data || []} />
    </main>
  );
}
