import React from "react";

export default function ConfigurationPage() {
  return (
    <div className="text-sm">
      <div className="flex flex-col gap-2 p-2">
        <h1 className="text-base font-semibold">Hotlines</h1>
        <div className="grid w-full grid-cols-3 gap-2">
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
      </div>
      <div className="flex flex-col gap-2 p-2"></div>
    </div>
  );
}
