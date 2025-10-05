"use client";
import { getCrimeCases } from "@/server/actions/getCrimeCases";
import { DataTable } from "./DataTable";
import { columns } from "./columns";

export default function CrimePage() {
  const { data, isLoading, error } = getCrimeCases();

  if (isLoading) {
    return (
      <main className="flex flex-col">
        <h1 className="mb-4 text-2xl font-bold">Crime Cases</h1>
        <div className="animate-pulse">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-1 py-4">
        <h1 className="mb-4 text-2xl font-bold">Crime Cases</h1>
        <div className="text-red-500">Error: {error.message}</div>
      </main>
    );
  }

  return (
    <main className="px-1 py-4">
      <h1 className="mb-4 text-2xl font-bold">Crime Cases</h1>
      <DataTable columns={columns} data={data || []} />
    </main>
  );
}
