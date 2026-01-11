"use client";
import { useState } from "react";
import { Calendar, Check, ChevronsUpDown, Info } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useDateRange } from "@/context/DateRangeProvider";

interface TimeFrameOption {
  label: string;
  value: string;
  getDates?: () => { start: Date; end: Date };
}

const predefinedTimeFrames: TimeFrameOption[] = [
  {
    label: "Last 7 days",
    value: "last_7d",
    getDates: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  {
    label: "Last 30 days",
    value: "last_30d",
    getDates: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  {
    label: "Last 60 days",
    value: "last_60d",
    getDates: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 59);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  {
    label: "Last 365 days",
    value: "last_365d",
    getDates: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 364);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
];

export default function DateRangeSelectorControlled() {
  const { dateRange, setDateRange } = useDateRange();
  const [open, setOpen] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>("last_7d");
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();

  const handleTimeFrameSelect = (timeFrame: TimeFrameOption) => {
    setSelectedTimeFrame(timeFrame.value);
    setShowCustomCalendar(false);

    if (timeFrame.getDates) {
      const { start, end } = timeFrame.getDates();
      setDateRange({ from: start, to: end });
    }
  };

  const handleCustomRangeSelect = () => {
    setSelectedTimeFrame("custom");
    setShowCustomCalendar(true);
    setTempDateRange(dateRange);
  };

  const handleCustomRangeApply = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      setDateRange(tempDateRange);
      setShowCustomCalendar(false);
      setOpen(false);
    }
  };

  const handleCustomRangeCancel = () => {
    setTempDateRange(dateRange);
    setShowCustomCalendar(false);
    // Reset to last 7 days if no custom range was set
    if (!dateRange?.from || !dateRange?.to) {
      setSelectedTimeFrame("last_7d");
      const defaultTimeFrame = predefinedTimeFrames[0];
      if (defaultTimeFrame.getDates) {
        const { start, end } = defaultTimeFrame.getDates();
        setDateRange({ from: start, to: end });
      }
    }
  };

  // Smart date formatting - show year only when dates span different years
  const formatDateRange = (from: Date, to: Date) => {
    const fromYear = from.getFullYear();
    const toYear = to.getFullYear();
    const currentYear = new Date().getFullYear();

    // If dates are in different years
    if (fromYear !== toYear) {
      return `${from.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} - ${to.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    // If both dates are in the same year but not current year
    if (fromYear === toYear && fromYear !== currentYear) {
      return `${from.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${to.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    // If both dates are in current year, don't show year
    return `${from.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${to.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  };

  const getDisplayValue = () => {
    if (selectedTimeFrame === "custom" && dateRange?.from && dateRange?.to) {
      return formatDateRange(dateRange.from, dateRange.to);
    }

    const selected = predefinedTimeFrames.find(
      (timeFrame) => timeFrame.value === selectedTimeFrame,
    );
    return selected ? selected.label : "Last 7 days";
  };

  // Initialize with default range
  React.useEffect(() => {
    if (!dateRange) {
      const defaultTimeFrame = predefinedTimeFrames.find(
        (tf) => tf.value === selectedTimeFrame,
      );
      if (defaultTimeFrame?.getDates) {
        const { start, end } = defaultTimeFrame.getDates();
        setDateRange({ from: start, to: end });
      }
    }
  }, [dateRange, selectedTimeFrame, setDateRange]);

  // Safe date range handler to prevent errors
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      // Ensure dates are valid Date objects
      const fromDate = new Date(range.from);
      const toDate = new Date(range.to);

      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        setTempDateRange({ from: fromDate, to: toDate });
      }
    } else {
      setTempDateRange(range);
    }
  };

  return (
    <div className="fixed top-24 right-30 z-50 ml-auto flex items-center justify-end gap-2">
      {/* Info tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="text-muted-foreground h-3.5 w-3.5 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Filtering by <strong>report date</strong>, not incident date
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Date Range Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-fit justify-between text-base shadow-md",
              !selectedTimeFrame && "text-muted-foreground",
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {getDisplayValue()}
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0" align="end">
          {!showCustomCalendar ? (
            <Command>
              <CommandList>
                <CommandGroup>
                  {predefinedTimeFrames.map((timeFrame) => (
                    <CommandItem
                      key={timeFrame.value}
                      value={timeFrame.label}
                      onSelect={() => handleTimeFrameSelect(timeFrame)}
                      className="cursor-pointer text-sm"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3",
                          selectedTimeFrame === timeFrame.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {timeFrame.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCustomRangeSelect}
                    className="cursor-pointer text-sm"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        selectedTimeFrame === "custom"
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <Calendar className="mr-2 h-3 w-3" />
                    Custom range
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          ) : (
            <div className="p-3">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium">Select custom range</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCustomRangeCancel}
                  className="h-6 px-2 text-xs"
                >
                  Back
                </Button>
              </div>

              {/* Using default calendar to avoid compatibility issues */}
              <CalendarComponent
                mode="range"
                defaultMonth={tempDateRange?.from || new Date()}
                selected={tempDateRange}
                onSelect={handleDateRangeSelect}
                disabled={(date) => date > new Date()}
                className="rounded-md"
                captionLayout="dropdown"
              />

              {/* Show selected range info with smart formatting */}
              {tempDateRange?.from && (
                <div className="text-muted-foreground mt-2 text-center text-xs">
                  {tempDateRange.to ? (
                    <p>
                      {formatDateRange(tempDateRange.from, tempDateRange.to)}
                    </p>
                  ) : (
                    <p>Select end date</p>
                  )}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomRangeCancel}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCustomRangeApply}
                  disabled={!tempDateRange?.from || !tempDateRange?.to}
                  className="flex-1 text-xs"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
