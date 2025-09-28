"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { cn } from "@/lib/utils";

export interface Calendar23Props {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?(date: Date): boolean;
  fromYear?: number;
  toYear?: number;
  className?: string;
}

export function Calendar23({
  value,
  onChange,
  placeholder = "Select date range",
  disabled,
  fromYear = 2020,
  toYear = new Date().getFullYear(),
  className,
}: Calendar23Props) {
  const [open, setOpen] = React.useState(false);
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const formatLabel = () => {
    if (!value?.from) return placeholder;

    if (value.to) {
      const fromYear = value.from.getFullYear();
      const toYear = value.to.getFullYear();
      const currentYear = new Date().getFullYear();

      if (fromYear !== toYear) {
        return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`;
      }
      if (fromYear !== currentYear) {
        return `${format(value.from, "MMM d")} - ${format(value.to, "MMM d, yyyy")}`;
      }
      return `${format(value.from, "MMM d")} - ${format(value.to, "MMM d")}`;
    }

    return format(value.from, "MMM d, yyyy");
  };

  const handleDateClick = (date: Date) => {
    if (disabled?.(date)) return;

    if (!value?.from || (value.from && value.to)) {
      // Start new range
      onChange?.({ from: date, to: undefined });
    } else if (value.from && !value.to) {
      // Complete range
      if (date < value.from) {
        onChange?.({ from: date, to: value.from });
      } else {
        onChange?.({ from: value.from, to: date });
      }
      setOpen(false);
    }
  };

  const isDateInRange = (date: Date) => {
    if (!value?.from || !value?.to) return false;
    return isWithinInterval(date, { start: value.from, end: value.to });
  };

  const isDateRangeEnd = (date: Date) => {
    return (
      (value?.from && isSameDay(date, value.from)) ||
      (value?.to && isSameDay(date, value.to))
    );
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getYearOptions = () => {
    const years = [];
    for (let year = fromYear; year <= toYear; year++) {
      years.push(year);
    }
    return years;
  };

  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), i, 1);
      return {
        value: i,
        label: format(date, "MMMM"),
      };
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-between font-normal",
            !value?.from && "text-muted-foreground",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4" />
            {formatLabel()}
          </span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="end"
        side="bottom"
        sideOffset={4}
      >
        <div className="p-3">
          {/* Header with navigation */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select
                value={currentDate.getMonth().toString()}
                onValueChange={(month) => {
                  const newDate = new Date(
                    currentDate.getFullYear(),
                    parseInt(month),
                    1,
                  );
                  setCurrentDate(newDate);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentDate.getFullYear().toString()}
                onValueChange={(year) => {
                  const newDate = new Date(
                    parseInt(year),
                    currentDate.getMonth(),
                    1,
                  );
                  setCurrentDate(newDate);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getYearOptions().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Days grid */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-muted-foreground flex h-8 w-8 items-center justify-center text-center text-sm font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date) => {
              const isInRange = isDateInRange(date);
              const isRangeEnd = isDateRangeEnd(date);
              const isDisabled = disabled?.(date);

              return (
                <Button
                  key={date.toISOString()}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-sm",
                    isRangeEnd &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isInRange &&
                      !isRangeEnd &&
                      "bg-primary/20 hover:bg-primary/30",
                    isDisabled && "cursor-not-allowed opacity-50",
                    !isSameMonth(date, currentDate) &&
                      "text-muted-foreground opacity-50",
                  )}
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                >
                  {format(date, "d")}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Calendar23;
