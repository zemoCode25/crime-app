import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Plus, SquarePen } from "lucide-react";
import React from "react";

export default function Hotline() {
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
          <Button className="flex items-center" variant={"outline"}>
            <SquarePen />
            Update
          </Button>
        </div>
      </div>
      <form action="">
        <div className="grid max-h-70 w-full grid-cols-3 gap-2 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <p className="text-neutral-700">Muntinlupa Emergency</p>
            <Input defaultValue="137-175" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-neutral-700">Muntinlupa Emergency</p>
            <Input defaultValue="137-175" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-neutral-700">Muntinlupa Emergency</p>
            <Input defaultValue="137-175" />
          </div>
        </div>
      </form>
    </div>
  );
}
