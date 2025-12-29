"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Gavel, Plus, SquarePen, X } from "lucide-react";
import { useCrimeTypes } from "@/hooks/crime-case/useCrimeTypes";

function CrimeTypeSkeleton() {
  return (
    <div className="grid max-h-70 w-full grid-cols-3 gap-2 overflow-y-auto p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export default function CrimeType() {
  const [isEditing, setIsEditing] = useState(false);

  const { data: crimeTypes, isLoading, error } = useCrimeTypes();

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleConfirmUpdate = () => {
    // TODO: Implement update logic
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-1 text-base font-semibold">
          <Gavel className="h-4 w-4" />
          Crime Type
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <Button className="flex items-center border border-orange-800 bg-orange-100 text-orange-800 hover:bg-orange-200">
            <Plus />
            Add crime type
          </Button>
          {isEditing ? (
            <>
              <Button
                className="flex items-center"
                variant="outline"
                onClick={handleCancelEdit}
              >
                <X />
                Cancel
              </Button>
              <Button
                className="flex items-center"
                variant="outline"
                onClick={handleConfirmUpdate}
              >
                <Check />
                Confirm update
              </Button>
            </>
          ) : (
            <Button
              className="flex items-center"
              variant="outline"
              onClick={handleStartEdit}
              disabled={isLoading || !crimeTypes?.length}
            >
              <SquarePen />
              Update
            </Button>
          )}
        </div>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {isLoading ? (
          <CrimeTypeSkeleton />
        ) : error ? (
          <div className="py-4 text-center text-sm text-red-500">
            Failed to load crime types
          </div>
        ) : crimeTypes && crimeTypes.length > 0 ? (
          <div className="grid max-h-70 w-full grid-cols-3 gap-2 overflow-y-auto p-2">
            {crimeTypes.map((crimeType) => (
              <div key={crimeType.id} className="relative">
                <Input
                  defaultValue={crimeType.label}
                  disabled={!isEditing}
                  className={`disabled:cursor-default disabled:opacity-100 ${isEditing ? "pr-8" : ""}`}
                />
                {isEditing && (
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-neutral-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-neutral-500">
            No crime types found. Add one to get started.
          </div>
        )}
      </form>
    </div>
  );
}
