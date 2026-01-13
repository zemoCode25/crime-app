"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyCardProps {
  title: string;
  phoneNumber: string;
  icon?: LucideIcon;
  className?: string;
}

export default function EmergencyCard({
  title,
  phoneNumber,
  className,
}: EmergencyCardProps) {
  const handleCall = () => {
    window.location.href = `tel:${phoneNumber.replace(/[^0-9+]/g, "")}`;
  };

  return (
    <div
      className={cn(
        "group relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md sm:w-[calc(33.333%_-_0.75rem)]",
        "dark:border-orange-900/20 dark:from-[var(--dark-card)] dark:to-[#1a1410] dark:shadow-none dark:hover:border-orange-800/40",
        className,
      )}
    >
      <div className="relative flex items-center gap-2">
        <h2 className="text-base font-medium text-gray-900 dark:text-orange-50">
          {title}
        </h2>
      </div>

      <p className="relative text-3xl font-bold tracking-wide text-gray-700 dark:text-orange-200/90">
        {phoneNumber}
      </p>
      <Button
        onClick={handleCall}
        className="relative mt-1 flex w-full cursor-pointer items-center justify-center gap-2 border border-orange-600 bg-orange-100 text-orange-600 transition-all duration-200 hover:bg-orange-200 dark:bg-orange-700 dark:hover:bg-orange-600"
      >
        <Phone size={14} />
        <span className="text-sm font-medium">Call Now</span>
      </Button>
    </div>
  );
}
