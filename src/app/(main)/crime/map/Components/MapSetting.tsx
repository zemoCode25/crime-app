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
import {
  ChevronsUpDownIcon,
  CirclePlus,
  MapPinIcon,
  Search,
} from "lucide-react";
import { useState } from "react";
import Map from "./MainMap";
import { SelectedLocation } from "@/types/map";
import { STATUSES } from "@/constants/crime-case";

export default function MapSetting() {
  const [statusOpen, setStatusOpen] = useState(false);
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [crimeTypeValue, setCrimeTypeValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const { suggestions, loading, searchLocation, retrieveLocation } =
    useMapboxSearch();

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
      setSelectedLocation({
        lat: result.coordinates.lat,
        lng: result.coordinates.lng,
        address: result.full_address,
      });
      setSearchQuery(name);
      setSearchOpen(false);

      console.log("Selected location:", result);
    }
  };

  const handleLocationChange = (location: SelectedLocation) => {
    setSelectedLocation(location);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="z-50 flex w-full flex-col gap-2">
        {/* ✅ Search Input - Fixed positioning */}
        <div className="relative w-full max-w-md">
          {" "}
          {/* ✅ Added relative + max-w */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search location in Muntinlupa City..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-4 pl-10"
            />
          </div>
          {/* ✅ Search Suggestions Dropdown - Now positioned correctly */}
          {searchOpen && suggestions.length > 0 && (
            <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Searching...
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          )}
          {/* ✅ No results message */}
          {searchOpen &&
            !loading &&
            suggestions.length === 0 &&
            searchQuery.length > 2 && (
              <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
                <div className="p-4 text-center text-sm text-gray-500">
                  No locations found
                </div>
              </div>
            )}
        </div>

        {/* Filter status and types */}
        <div className="flex gap-2">
          <Popover open={statusOpen} onOpenChange={setStatusOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={statusOpen}
                className="w-fit justify-between bg-transparent"
              >
                {statusValue ? (
                  STATUSES.find((status) => status.value === statusValue)?.label
                ) : (
                  <span className="flex items-center gap-1">
                    <CirclePlus /> <p>Status</p>
                  </span>
                )}
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
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Checkbox id={status.value} />
                        <Label htmlFor={status.value}>{status.label}</Label>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover open={crimeTypeOpen} onOpenChange={setCrimeTypeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={crimeTypeOpen}
                className="w-fit justify-between bg-transparent"
              >
                {crimeTypeValue ? (
                  crimeTypes.find(
                    (crimeType) => crimeType.value === crimeTypeValue,
                  )?.label
                ) : (
                  <span className="flex items-center gap-1">
                    <CirclePlus /> <p>Type</p>
                  </span>
                )}
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
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Checkbox id={crimeType.value} />
                        <Label htmlFor={crimeType.value}>
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

      {/* Display selected location */}
      {selectedLocation && (
        <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs font-medium text-orange-900">
            Selected Location:
          </p>
          <p className="mt-1 text-sm text-orange-700">
            {selectedLocation.address}
          </p>
          <p className="mt-1 text-xs text-orange-600">
            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      <Map
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
      />
    </div>
  );
}
