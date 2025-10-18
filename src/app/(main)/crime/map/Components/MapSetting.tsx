"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDownIcon, CirclePlus } from "lucide-react";
import { useState } from "react";
import Map from "./MainMap";

export default function MapSetting() {
  const [statusOpen, setStatusOpen] = useState(false);
  const [crimeTypeOpen, setCrimeTypeOpen] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [crimeTypeValue, setCrimeTypeValue] = useState("");
  const statuses = [
    {
      value: "open",
      label: "Open",
    },
    {
      value: "under investigation",
      label: "Under Investigation",
    },
    {
      value: "case settled",
      label: "Case Settled",
    },
    {
      value: "lupon",
      label: "Lupon",
    },
    {
      value: "direct filing",
      label: "Direct Filing",
    },
    {
      value: "for record",
      label: "For Record",
    },
    {
      value: "turn over",
      label: "Turn Over",
    },
  ];

  const crimeTypes = [
    {
      value: "theft",
      label: "Theft",
    },
    {
      value: "murder",
      label: "Murder",
    },
    {
      value: "assault",
      label: "Assault",
    },
  ];
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="z-50 flex w-full flex-col gap-2 md:flex-row">
        {/* filter status and types */}
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
                  statuses.find((status) => status.value === statusValue)?.label
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
                <CommandInput placeholder={`Select status`} />
                <CommandList>
                  <CommandEmpty>No framework found.</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => (
                      <CommandItem
                        key={status.value}
                        value={status.value}
                        onMouseDown={(e) => {
                          // Prevent Radix from closing the popover on click
                          e.preventDefault();
                        }}
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
                <CommandInput placeholder={`Select status`} />
                <CommandList>
                  <CommandEmpty>No framework found.</CommandEmpty>
                  <CommandGroup>
                    {crimeTypes.map((crimeType) => (
                      <CommandItem
                        key={crimeType.value}
                        value={crimeType.value}
                        onMouseDown={(e) => {
                          // Prevent Radix from closing the popover on click
                          e.preventDefault();
                        }}
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
      <Map />
    </div>
  );
}
