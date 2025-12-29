"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Gavel, Plus, SquarePen, X } from "lucide-react";
import { useCrimeTypes } from "@/hooks/crime-case/useCrimeTypes";
import {
  useUpdateCrimeTypes,
  useAddCrimeType,
  useDeleteCrimeType,
} from "@/hooks/crime-case/use-mutate-crime-types";
import type { CrimeTypeUpdate, CrimeType } from "@/server/queries/crime-type";
import AddCrimeTypeModal, {
  type AddCrimeTypeFormData,
} from "./add-crime-type-modal";
import DeleteCrimeTypeModal from "./delete-crime-type-modal";

// Zod schema for crime type label validation
const crimeTypeLabelSchema = z
  .string()
  .min(1, "Crime type label is required")
  .max(100, "Label must not exceed 100 characters");

function CrimeTypeSkeleton() {
  return (
    <div className="grid max-h-70 w-full grid-cols-3 gap-2 overflow-y-auto p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export default function CrimeTypeComponent() {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [crimeTypeToDelete, setCrimeTypeToDelete] = useState<CrimeType | null>(
    null,
  );
  // Track edited values: { [crimeTypeId]: newLabel }
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  // Track validation errors: { [crimeTypeId]: errorMessage }
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string>
  >({});

  const { data: crimeTypes, isLoading, error } = useCrimeTypes();
  const { mutate: updateCrimeTypes, isPending: isUpdating } =
    useUpdateCrimeTypes();
  const { mutate: addCrimeType, isPending: isAdding } = useAddCrimeType();
  const { mutate: deleteCrimeType, isPending: isDeleting } =
    useDeleteCrimeType();

  // Reset edited values when crimeTypes data changes (e.g., after successful update)
  useEffect(() => {
    if (crimeTypes) {
      setEditedValues({});
      setValidationErrors({});
    }
  }, [crimeTypes]);

  const handleInputChange = (id: number, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Validate the input
    const result = crimeTypeLabelSchema.safeParse(value);
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

  const getInputValue = (crimeType: { id: number; label: string | null }) => {
    // If we have an edited value, use it; otherwise use original
    if (editedValues[crimeType.id] !== undefined) {
      return editedValues[crimeType.id];
    }
    return crimeType.label || "";
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedValues({});
    setValidationErrors({});
  };

  const handleConfirmUpdate = () => {
    if (!crimeTypes) return;

    // Get only the changed values
    const updates: CrimeTypeUpdate[] = [];

    for (const [idStr, newLabel] of Object.entries(editedValues)) {
      const id = parseInt(idStr, 10);
      const original = crimeTypes.find((ct) => ct.id === id);

      // Only include if the value actually changed
      if (original && newLabel !== (original.label || "")) {
        updates.push({ id, label: newLabel });
      }
    }

    if (updates.length === 0) {
      // No changes, just exit edit mode
      setIsEditing(false);
      return;
    }

    updateCrimeTypes(updates, {
      onSuccess: () => {
        setIsEditing(false);
        setEditedValues({});
      },
    });
  };

  const handleAddCrimeType = (data: AddCrimeTypeFormData) => {
    addCrimeType(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!crimeTypeToDelete) return;
    deleteCrimeType(crimeTypeToDelete.id, {
      onSuccess: () => {
        setCrimeTypeToDelete(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-1 text-base font-semibold">
          <Gavel className="h-4 w-4" />
          Crime Type
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <Button
            className="flex items-center border border-orange-800 bg-orange-100 text-orange-800 hover:bg-orange-200"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus />
            Add crime type
          </Button>
          {isEditing ? (
            <>
              <Button
                className="flex items-center"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <X />
                Cancel
              </Button>
              <Button
                className="flex items-center"
                variant="outline"
                onClick={handleConfirmUpdate}
                disabled={isUpdating || hasValidationErrors}
              >
                <Check />
                {isUpdating ? "Saving..." : "Confirm update"}
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
              <div key={crimeType.id} className="flex flex-col gap-1">
                <div className="relative">
                  <Input
                    value={getInputValue(crimeType)}
                    onChange={(e) =>
                      handleInputChange(crimeType.id, e.target.value)
                    }
                    disabled={!isEditing || isUpdating}
                    className={`disabled:cursor-default disabled:opacity-100 ${
                      isEditing ? "pr-8" : ""
                    } ${validationErrors[crimeType.id] ? "border-red-500" : ""}`}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setCrimeTypeToDelete({
                          id: crimeType.id,
                          label: crimeType.label,
                        })
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {validationErrors[crimeType.id] && (
                  <p className="text-xs text-red-500">
                    {validationErrors[crimeType.id]}
                  </p>
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

      {/* Add Crime Type Modal */}
      <AddCrimeTypeModal
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddCrimeType}
        isAdding={isAdding}
      />

      {/* Delete Crime Type Confirmation Modal */}
      <DeleteCrimeTypeModal
        open={!!crimeTypeToDelete}
        onOpenChange={(open: boolean) => !open && setCrimeTypeToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        crimeTypeLabel={crimeTypeToDelete?.label || undefined}
      />
    </div>
  );
}
