import { useState } from "react";
import { SelectedLocation } from "@/types/map";
import {
  MapPinIcon,
  Search,
  X,
  CircleArrowOutUpRight,
  ChevronsUpDownIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMapboxSearch } from "@/hooks/map/useMapboxSearch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BARANGAY_OPTIONS_WITH_ALL, STATUSES } from "@/constants/crime-case";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DateRangeSelector from "@/components/DateRangeSelector";
import { DateRangeValue } from "@/components/DateRangeSelector";

interface MapFiltersProps {
  selectedLocation: SelectedLocation | null;
  onLocationChange: (location: SelectedLocation | null) => void; // ✅ Single callback
}

export default function MapFilters({
  selectedLocation,
  onLocationChange,
}: MapFiltersProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [barangayOpen, setBarangayOpen] = useState(false);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [barangayFilters, setBarangayFilters] = useState<string[]>([]);
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>("last_7d");
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
    <div>
      <div className="relative w-fit">
        <div className="flex items-center gap-2">
          <div>
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="location-search"
              type="text"
              placeholder="Search in Muntinlupa City..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-white pr-10 pl-10"
            />
          </div>
          <Button className="cursor-pointer rounded-md bg-orange-600 px-3 py-2.5 text-white hover:bg-orange-700">
            <CircleArrowOutUpRight className="h-4 w-4 text-white" />
          </Button>
        </div>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(false);
            }}
            className="absolute top-1/2 right-15 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                suggestions.map((suggestion: any) => (
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
      {/* Filters Section */}
      <div className="my-2 flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={statusOpen}
              className="w-fit justify-between"
              size="sm"
            >
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
                      onSelect={() =>
                        handleCheckboxChange(status.value, setStatusFilters)
                      }
                    >
                      <Checkbox
                        id={status.value}
                        checked={statusFilters.includes(status.value)}
                      />
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
          <PopoverTrigger asChild className="w-fit">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={crimeTypeOpen}
              className="w-fit justify-between"
              size="sm"
            >
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
                        handleCheckboxChange(crimeType.value, setTypeFilters);
                      }}
                    >
                      <Checkbox
                        id={crimeType.value}
                        checked={typeFilters.includes(crimeType.value)}
                      />
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
        <Popover open={barangayOpen} onOpenChange={setBarangayOpen}>
          <PopoverTrigger asChild className="w-fit">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={barangayOpen}
              className="w-fit justify-between"
              size="sm"
            >
              Barangay
              <ChevronsUpDownIcon className="!m-0 ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Select barangay" />
              <CommandList>
                <CommandEmpty>No barangay found.</CommandEmpty>
                <CommandGroup className="max-h-36 overflow-auto">
                  {BARANGAY_OPTIONS_WITH_ALL.map((barangay) => (
                    <CommandItem
                      key={barangay.value}
                      value={barangay.value}
                      onSelect={() => {
                        handleCheckboxChange(
                          barangay.value,
                          setBarangayFilters,
                        );
                      }}
                    >
                      <Checkbox
                        id={barangay.value}
                        checked={barangayFilters.includes(barangay.value)}
                      />
                      <Label
                        htmlFor={barangay.value}
                        className="ml-2 cursor-pointer"
                      >
                        {barangay.value}
                      </Label>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <DateRangeSelector
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedTimeFrame={selectedTimeFrame}
          setSelectedTimeFrame={setSelectedTimeFrame}
        />
      </div>
    </div>
  );
}
