"use client";

import { Input } from "@/components/ui/input";
import { LaptopMinimalCheck } from "lucide-react";
import { STATUSES } from "@/constants/crime-case";

export default function Status() {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-1 text-base font-semibold">
          <LaptopMinimalCheck className="h-4 w-4" />
          Status
        </h1>
        <p className="text-xs text-neutral-500">
          Statuses are predefined and cannot be modified
        </p>
      </div>
      <div className="grid max-h-70 w-full grid-cols-3 gap-2 overflow-y-auto p-2">
        {STATUSES.map((status) => (
          <div key={status.value} className="relative">
            <Input
              value={status.label}
              disabled
              className="disabled:cursor-default disabled:opacity-100"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: status.dark,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
