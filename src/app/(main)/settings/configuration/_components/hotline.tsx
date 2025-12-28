"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Phone, Plus, SquarePen, X } from "lucide-react";
import { useGetHotlines } from "@/hooks/configuration/use-get-hotlines";
import { useUpdateHotlines } from "@/hooks/configuration/use-mutate-hotlines";
import type { HotlineUpdate } from "@/server/queries/hotline";

// Zod schema for hotline number validation
const hotlineNumberSchema = z
  .string()
  .regex(/^[\d-]*$/, "Only numbers and dashes are allowed")
  .min(1, "Hotline number is required");

function HotlineSkeleton() {
  return (
    <div className="grid max-h-70 w-full grid-cols-3 gap-2 overflow-y-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function Hotline() {
  const [isEditing, setIsEditing] = useState(false);
  // Track edited values: { [hotlineId]: newNumber }
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  // Track validation errors: { [hotlineId]: errorMessage }
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  const { data: hotlines, isLoading, error } = useGetHotlines();
  const { mutate: updateHotlines, isPending } = useUpdateHotlines();

  // Reset edited values when hotlines data changes (e.g., after successful update)
  useEffect(() => {
    if (hotlines) {
      setEditedValues({});
      setValidationErrors({});
    }
  }, [hotlines]);

  const handleInputChange = (id: number, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Validate the input
    const result = hotlineNumberSchema.safeParse(value);
    if (!result.success) {
      setValidationErrors((prev) => ({
        ...prev,
        [id]: result.error.issues[0].message,
      }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const getInputValue = (hotline: { id: number; number: string | null }) => {
    // If we have an edited value, use it; otherwise use original
    if (editedValues[hotline.id] !== undefined) {
      return editedValues[hotline.id];
    }
    return hotline.number || "";
  };

  const handleConfirmUpdate = () => {
    if (!hotlines) return;

    // Get only the changed values
    const updates: HotlineUpdate[] = [];

    for (const [idStr, newNumber] of Object.entries(editedValues)) {
      const id = parseInt(idStr, 10);
      const original = hotlines.find((h) => h.id === id);

      // Only include if the value actually changed
      if (original && newNumber !== (original.number || "")) {
        updates.push({ id, number: newNumber });
      }
    }

    if (updates.length === 0) {
      // No changes, just exit edit mode
      setIsEditing(false);
      return;
    }

    updateHotlines(updates, {
      onSuccess: () => {
        setIsEditing(false);
        setEditedValues({});
      },
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedValues({});
    setValidationErrors({});
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-1 text-base font-semibold">
          <Phone className="h-4 w-4" /> Hotlines
        </h1>
        <div className="flex items-center gap-2">
          <Button className="flex items-center border border-orange-800 bg-orange-100 text-orange-800 hover:bg-orange-200">
            <Plus />
            Add hotline
          </Button>
          {isEditing ? (
            <>
              <Button
                className="flex items-center"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                <X />
                Cancel
              </Button>
              <Button
                className="flex items-center"
                variant="outline"
                onClick={handleConfirmUpdate}
                disabled={isPending || hasValidationErrors}
              >
                <Check />
                {isPending ? "Saving..." : "Confirm update"}
              </Button>
            </>
          ) : (
            <Button
              className="flex items-center"
              variant="outline"
              onClick={handleStartEdit}
              disabled={isLoading || !hotlines?.length}
            >
              <SquarePen />
              Update
            </Button>
          )}
        </div>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {isLoading ? (
          <HotlineSkeleton />
        ) : error ? (
          <div className="py-4 text-center text-sm text-red-500">
            Failed to load hotlines
          </div>
        ) : hotlines && hotlines.length > 0 ? (
          <div className="grid max-h-70 w-full grid-cols-3 gap-2 overflow-y-auto p-2">
            {hotlines.map((hotline) => (
              <div key={hotline.id} className="flex flex-col gap-1">
                <p className="text-neutral-700">
                  {hotline.label || "Untitled"}
                </p>
                <Input
                  value={getInputValue(hotline)}
                  onChange={(e) => handleInputChange(hotline.id, e.target.value)}
                  disabled={!isEditing || isPending}
                  className={`disabled:cursor-default disabled:opacity-100 ${
                    validationErrors[hotline.id] ? "border-red-500" : ""
                  }`}
                />
                {validationErrors[hotline.id] && (
                  <p className="text-xs text-red-500">
                    {validationErrors[hotline.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-neutral-500">
            No hotlines found. Add one to get started.
          </div>
        )}
      </form>
    </div>
  );
}
