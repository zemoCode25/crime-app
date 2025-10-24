"use client";

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
import { SelectedLocation } from "@/types/map";
import {
  ChevronsUpDownIcon,
  CirclePlus,
  MapPinIcon,
  Search,
  X,
  MapPinned,
} from "lucide-react";
import { useState } from "react";

interface MapSettingProps {
  selectedLocation: SelectedLocation | null;
  onLocationChange: (location: SelectedLocation | null) => void; // ✅ Single callback
}

export default function MapSetting({
  selectedLocation,
  onLocationChange,
}: MapSettingProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const { suggestions, loading, searchLocation, retrieveLocation } =
    useMapboxSearch();

  // ✅ Move to constants file or fetch from backend
  const crimeTypes = [
    { value: "theft", label: "Theft" },
    { value: "murder", label: "Murder" },
    { value: "assault", label: "Assault" },
  ];

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
      <div className="space-y-4">
        {/* Search Section */}
        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="location-search"
                type="text"
                placeholder="Search in Muntinlupa City..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10 pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {/* Suggestions Dropdown */}
              {searchOpen && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="max-h-60 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Searching...
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion) => (
                        <button
                          key={suggestion.mapbox_id}
                          onClick={() =>
                            handleSelectLocation(
                              suggestion.mapbox_id,
                              suggestion.name,
                            )
                          }
                          className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                        >
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {suggestion.name}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                {suggestion.place_formatted}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      searchQuery.length > 2 && (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No locations found
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Filters Section */}
          <div className="flex w-full gap-2">
            {/* Status Filter */}
            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={statusOpen}
                  className="flex-1 justify-between"
                  size="sm"
                >
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Status
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Select status" />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {STATUSES.map((status) => (
                        <CommandItem
                          key={status.value}
                          value={status.value}
                          onSelect={() => {
                            // TODO: Implement multi-select filter
                            setStatusOpen(false);
                          }}
                        >
                          <Checkbox id={status.value} />
                          <Label
                            htmlFor={status.value}
                            className="ml-2 cursor-pointer"
                          >
                            {status.label}
                          </Label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* Crime Type Filter */}
            <Popover open={crimeTypeOpen} onOpenChange={setCrimeTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={crimeTypeOpen}
                  className="flex-1 justify-between"
                  size="sm"
                >
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Type
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Select crime type" />
                  <CommandList>
                    <CommandEmpty>No crime type found.</CommandEmpty>
                    <CommandGroup>
                      {crimeTypes.map((crimeType) => (
                        <CommandItem
                          key={crimeType.value}
                          value={crimeType.value}
                          onSelect={() => {
                            // TODO: Implement multi-select filter
                            setCrimeTypeOpen(false);
                          }}
                        >
                          <Checkbox id={crimeType.value} />
                          <Label
                            htmlFor={crimeType.value}
                            className="ml-2 cursor-pointer"
                          >
                            {crimeType.label}
                          </Label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="w-full rounded-lg border border-orange-200 bg-orange-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-medium text-orange-900">
                  <MapPinned className="mr-1 mb-1 inline-block h-4 w-4 text-orange-900" />
                  Pinned Location
                </p>
                <p className="text-sm text-orange-900">
                  {selectedLocation.address}
                </p>
                <p className="mt-1 font-mono text-xs text-orange-600">
                  {selectedLocation.lat.toFixed(6)},{" "}
                  {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
