"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMapboxSearch } from "@/hooks/map/useMapboxSearch";
import { STATUSES } from "@/constants/crime-case";
import { BARANGAY_OPTIONS_WITH_ALL } from "@/constants/crime-case";
import { SelectedLocation } from "@/types/map";
import {
  ChevronsUpDownIcon,
  CirclePlus,
  MapPinIcon,
  Search,
  X,
  MapPinned,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CircleArrowOutUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MapSettingProps {
  selectedLocation: SelectedLocation | null;
  onLocationChange: (location: SelectedLocation | null) => void; // ✅ Single callback
}

export default function MapSetting({
  selectedLocation,
  onLocationChange,
}: MapSettingProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [barangayOpen, setBarangayOpen] = useState(false);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [barangayFilters, setBarangayFilters] = useState<string[]>([]);
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const handleCheckboxChange = (
    value: string,
    setFilters: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setFilters((prevFilters) => {
      if (prevFilters.includes(value)) {
        console.log("Updated Filters:", statusFilters, typeFilters);
        return prevFilters.filter((filter) => filter !== value);
      } else {
        return [...prevFilters, value];
      }
    });
  };

  const { suggestions, loading, searchLocation, retrieveLocation } =
    useMapboxSearch();

  // ✅ Move to constants file or fetch from backend
  const crimeTypes = [
    { value: "theft", label: "Theft" },
    { value: "murder", label: "Murder" },
    { value: "assault", label: "Assault" },
  ];

  const LOCATION_HAZARD_CONFIG: Record<
    string,
    {
      label: string;
      icon: LucideIcon;
      colors: { bg: string; text: string; border: string };
    }
  > = {
    low: {
      label: "Low Risk Area",
      icon: ShieldCheck,
      colors: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-900",
      },
    },
    medium: {
      label: "Medium Risk Area",
      icon: ShieldAlert,
      colors: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-900",
      },
    },
    high: {
      label: "High Risk Area",
      icon: ShieldX,
      colors: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-900",
      },
    },
  };

  function HazardWarning({ warningLevel }: { warningLevel: string }) {
    const Icon = LOCATION_HAZARD_CONFIG[warningLevel]?.icon;
    const colors = LOCATION_HAZARD_CONFIG[warningLevel]?.colors;
    return (
      <div
        className={`flex items-center gap-2 rounded-md py-2 ${colors.bg} border ${colors.border} w-full justify-center`}
      >
        {Icon && <Icon className={`${colors.text} h-5 w-5 flex-shrink-0`} />}
        <p className={`text-sm font-semibold ${colors.text}`}>
          {LOCATION_HAZARD_CONFIG[warningLevel].label}
        </p>
      </div>
    );
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 2) {
      searchLocation(value);
      setSearchOpen(true);
    } else {
      setSearchOpen(false);
    }
  };

  const handleSelectLocation = async (mapboxId: string, name: string) => {
    const result = await retrieveLocation(mapboxId);

    if (result) {
      onLocationChange({
        lat: result.coordinates.lat,
        lng: result.coordinates.lng,
        address: result.full_address,
      });
      setSearchQuery(name);
      setSearchOpen(false);
    }
  };

  const handleClearLocation = () => {
    onLocationChange(null);
    setSearchQuery("");
  };

  return (
    <div className="w-[40%] overflow-y-auto rounded-l-sm border border-gray-300 bg-white/95 p-4 pr-4 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="w-full rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-sm text-orange-900">
              {selectedLocation.address}
            </p>
            <p className="mt-1 font-mono text-xs text-orange-600">
              <MapPinned className="mr-1 mb-1 inline-block h-4 w-4 text-orange-600" />
              {selectedLocation.lat.toFixed(6)},{" "}
              {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}
        <HazardWarning warningLevel="medium" />
        <div className="rounded-sm border border-yellow-900 p-2 text-sm">
          <h2 className="font-semibold">AI Insights:</h2>
          <p className="w-full">
            This location falls within a mixed commercial-residential zone of
            Alabang, known for high activity near major landmarks such as
            Alabang Town Center and Madrigal Business Park. The area exhibits
            moderate to high human mobility, especially during work hours (8 AM
            – 7 PM).
          </p>
        </div>
      </div>
    </div>
  );
}
