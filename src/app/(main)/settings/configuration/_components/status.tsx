"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, LaptopMinimalCheck, Plus, SquarePen, X } from "lucide-react";

export default function Status() {
  const [isEditing, setIsEditing] = useState(false);

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
          <LaptopMinimalCheck className="h-4 w-4" />
          Status
        </h1>
        <div className="flex items-center gap-2">
          <Button className="flex items-center border border-orange-800 bg-orange-100 text-orange-800 hover:bg-orange-200">
            <Plus />
            Add status
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
            >
              <SquarePen />
              Update
            </Button>
          )}
        </div>
      </div>
      <div className="grid max-h-70 w-full grid-cols-3 gap-2 p-2">
        <div className="flex flex-col gap-1">
          <div className="relative">
            <Input
              defaultValue="Open"
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
        </div>
      </div>
    </div>
  );
}
