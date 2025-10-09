"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Calendar24Props {
  value?: Date; // ✅ Changed from string to Date
  onChange?: (value: Date | undefined) => void; // ✅ Changed to return Date
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
}

export default function Calendar24({
  value,
  onChange,
  onBlur,
  name,
  placeholder = "Select date",
}: Calendar24Props) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeValue, setTimeValue] = useState<string>("10:30:00");

  // Helper function to format time from Date
  function formatTimeFromDate(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  // Helper function to format date for display
  function formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Helper function to create new Date with time
  function createDateWithTime(date: Date, timeString: string): Date {
    try {
      const [hours, minutes, seconds = 0] = timeString.split(":").map(Number);

      // Create new date with the same date but new time
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, seconds, 0);

      return newDate;
    } catch (error) {
      console.error("Error creating DateTime:", error);
      return new Date(); // Fallback to current time
    }
  }

  // ✅ Initialize from Date value
  useEffect(() => {
    if (value && value instanceof Date && !isNaN(value.getTime())) {
      setSelectedDate(value);
      setTimeValue(formatTimeFromDate(value));
    } else {
      setSelectedDate(undefined);
      setTimeValue("10:30:00");
    }
  }, [value]);

  // ✅ Handle date selection - returns Date
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);
    setOpen(false);

    if (onChange) {
      const dateWithTime = createDateWithTime(date, timeValue);
      onChange(dateWithTime); // ✅ Returns Date object
    }
  };

  // ✅ Handle time change - returns Date
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate && onChange) {
      const dateWithTime = createDateWithTime(selectedDate, newTime);
      onChange(dateWithTime); // ✅ Returns Date object
    }
  };

  // ✅ Handle clearing - returns undefined
  const handleClear = () => {
    setSelectedDate(undefined);
    setTimeValue("10:30:00");
    if (onChange) {
      onChange(undefined); // ✅ Returns undefined instead of empty string
    }
  };

  return (
    <div className="flex items-start gap-2">
      {/* Date Picker */}
      <div className="flex flex-col">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-36 justify-between text-left font-normal"
              onBlur={onBlur}
              type="button"
            >
              <span className="truncate">
                {selectedDate
                  ? formatDateForDisplay(selectedDate)
                  : placeholder}
              </span>
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              captionLayout="dropdown"
              fromYear={1900}
              toYear={2100}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Picker */}
      <div className="flex flex-col">
        <Input
          type="time"
          step="1"
          value={timeValue}
          onChange={handleTimeChange}
          onBlur={onBlur}
          name={name}
          className="bg-background w-32"
          disabled={!selectedDate}
        />
      </div>

      {/* Clear Button */}
      {selectedDate && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="px-2"
        >
          ✕
        </Button>
      )}
    </div>
  );
}
