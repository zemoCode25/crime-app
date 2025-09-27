"use client";
import { useState } from "react";
import CardSection from "./CardSection";
import ChartSection from "./ChartSection";
import EmergencySection from "./EmergencySection";
import TableSection from "./TableSection";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
const frameworks = [
  {
    value: "Last 7 days",
    label: "Last 7 days",
  },
  {
    value: "Last 28 days",
    label: "Last 28 days",
  },
  {
    value: "Last 60 days",
    label: "Last 60 days",
  },
  {
    value: "Last 365 days",
    label: "Last 365 days",
  },
];

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("Last 7 days");

  // Seperate the sections with some spacing
  // Seperate the popover component from the main dashboard component
  return (
    <section className="flex flex-col justify-between gap-4">
      <h1 className="mt-2 text-2xl font-bold">Dashboard</h1>
      <div className="flex w-full justify-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[150px] justify-between text-sm"
            >
              {value
                ? frameworks.find((framework) => framework.value === value)
                    ?.label
                : "Select framework..."}
              <ChevronDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {frameworks.map((framework) => (
                    <CommandItem
                      key={framework.value}
                      value={framework.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      {framework.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === framework.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-10">
        <CardSection />
        <ChartSection />
        <EmergencySection />
        <TableSection />
      </div>
    </section>
  );
}
