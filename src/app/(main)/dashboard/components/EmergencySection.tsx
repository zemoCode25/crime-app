"use client";

import EmergencyCard from "./EmergencyCard";
import { Phone } from "lucide-react";
import { useGetHotlines } from "@/hooks/configuration/use-get-hotlines";
import { Skeleton } from "@/components/ui/skeleton";

function EmergencyCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm sm:w-[calc(33.333%_-_0.75rem)] dark:border-orange-900/20 dark:bg-[var(--dark-card)]">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="mt-1 h-9 w-full rounded-md" />
    </div>
  );
}

export default function EmergencySection() {
  const { data: hotlines, isLoading, error } = useGetHotlines();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-orange-50">
          Emergency Hotlines
        </h1>
      </div>

      <div className="flex flex-wrap items-stretch gap-3">
        {isLoading ? (
          // Show loading skeletons
          <>
            <EmergencyCardSkeleton />
            <EmergencyCardSkeleton />
            <EmergencyCardSkeleton />
          </>
        ) : error ? (
          // Show error state
          <div className="flex w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center dark:border-red-900/30 dark:bg-red-900/10">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load emergency hotlines. Please try again later.
            </p>
          </div>
        ) : hotlines && hotlines.length > 0 ? (
          // Show hotline cards
          hotlines.map((hotline) => (
            <EmergencyCard
              key={hotline.id}
              title={hotline.label || "Emergency"}
              phoneNumber={hotline.number || "N/A"}
              icon={Phone}
            />
          ))
        ) : (
          // Show empty state
          <div className="flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-8 text-center dark:border-orange-900/20 dark:bg-[var(--dark-card)]">
            <p className="text-sm text-neutral-500 dark:text-orange-200/60">
              No emergency hotlines available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
