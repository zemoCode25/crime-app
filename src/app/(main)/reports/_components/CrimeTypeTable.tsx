"use client";

import { CrimeTypeStat } from "@/server/queries/reports";
import { Progress } from "@/components/ui/progress";

interface CrimeTypeTableProps {
  data: CrimeTypeStat[];
}

export function CrimeTypeTable({ data }: CrimeTypeTableProps) {
  // Take top 8 or all
  const displayData = data;

  return (
    <div className="w-full overflow-hidden">
      <div className="mb-4 grid grid-cols-12 gap-2 border-b border-gray-100 pb-4 text-xs font-semibold text-gray-500">
        <div className="col-span-6">Crime Type</div>
        <div className="col-span-2 text-right">Count</div>
        <div className="col-span-4 text-right">Distribution</div>
      </div>

      <div className="flex max-h-[350px] flex-col gap-2 overflow-y-auto pr-2">
        {displayData.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 items-center gap-2">
            {/* Name */}
            <div className="col-span-6 flex items-center gap-2">
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color || "#9ca3af" }}
              />
              <span
                className="truncate text-sm font-medium text-gray-700"
                title={item.name}
              >
                {item.name}
              </span>
            </div>

            {/* Count */}
            <div className="col-span-2 text-right text-sm font-medium text-gray-900">
              {item.count}
            </div>

            {/* Graph */}
            <div className="col-span-4 flex items-center gap-2">
              <Progress value={item.percentage} className="h-2" />
              <span className="w-8 text-right text-xs text-gray-500">
                {Math.round(item.percentage)}%
              </span>
            </div>
          </div>
        ))}
        {displayData.length === 0 && (
          <div className="py-4 text-center text-sm text-gray-400 italic">
            No crime types recorded.
          </div>
        )}
      </div>
    </div>
  );
}
