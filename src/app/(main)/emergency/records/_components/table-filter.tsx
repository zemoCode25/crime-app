"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TableFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function TableFilter({
  searchQuery,
  onSearchChange,
}: TableFilterProps) {
  return (
    <div className="relative max-w-md flex-1">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder="Search by subject..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bg-white pl-10"
      />
    </div>
  );
}
