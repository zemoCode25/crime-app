import { Button } from "@/components/ui/button";
import { Gavel, Plus, SquarePen } from "lucide-react";
import React from "react";

export default function CrimeType() {
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
          <Button className="flex items-center" variant={"outline"}>
            <SquarePen />
            Update
          </Button>
        </div>
      </div>
      <form action="">
        <div className="grid max-h-70 w-full grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-neutral-700">Muntinlupa Emergency</p>
            <p className="rounded-sm border p-2">137-175</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-neutral-700">PNP</p>
            <p className="rounded-sm border p-2">862-26-11</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-neutral-700">Bureau of Fire Protection</p>
            <p className="rounded-sm border p-2">137-175</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-neutral-700">City of Health Office</p>
            <p className="rounded-sm border p-2">137-175</p>
          </div>
        </div>
      </form>
    </div>
  );
}
