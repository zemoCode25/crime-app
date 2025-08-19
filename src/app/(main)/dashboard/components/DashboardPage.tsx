"use client";
import { Card } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
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

  return (
    <section className="flex flex-col justify-between gap-4">
      <h1 className="text-2xl font-bold mt-2">Dashboard</h1>
      <div className="w-full flex justify-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[150px] text-sm justify-between"
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
                            : "opacity-0"
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
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Card className="w-full h-fit !gap-0 p-4">
          <h2>Total Crimes</h2>
          <p className="text-4xl font-bold">1</p>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">-2 (2%)</span>
          </div>
        </Card>
        <Card className="w-full h-30 !gap-0 p-4">
          <h1>Crime Rate</h1>
          <p className="text-4xl font-bold">5%</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-gray-700" />
            <span className="text-sm text-muted-foreground">22 (19%)</span>
          </div>
        </Card>
        <Card className="w-full h-30 !gap-0 p-4">
          <h1>Under Investigation</h1>
          <p className="text-4xl font-bold">20</p>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">-2 (2%)</span>
          </div>
        </Card>
        <Card className="w-full h-30 !gap-0 p-4">
          <h1>Settled Case</h1>
          <p className="text-4xl font-bold">40</p>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">-2 (2%)</span>
          </div>
        </Card>
      </div>
    </section>
  );
}
