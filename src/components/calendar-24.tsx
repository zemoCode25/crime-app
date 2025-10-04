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
  value?: string; // ISO string
  onChange?: (value: string) => void; // Returns ISO string
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

  // Helper function to format time in PH timezone
  function formatTimeForPHTimezone(date: Date): string {
    return date.toLocaleTimeString("en-PH", {
      timeZone: "Asia/Manila",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  // Helper function to format date for display
  function formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Helper function to create PH timezone date and return ISO string
  function createPHDateTimeISO(date: Date, timeString: string): string {
    try {
      const [hours, minutes, seconds = 0] = timeString.split(":").map(Number);

      // Create date in PH timezone (UTC+8)
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      // Create date in local timezone first
      const localDate = new Date(year, month, day, hours, minutes, seconds);

      // Convert to PH timezone by adjusting for timezone difference
      const phOffset = 8 * 60; // PH is UTC+8
      const localOffset = localDate.getTimezoneOffset();
      const offsetDiff = localOffset + phOffset;

      const phDate = new Date(localDate.getTime() + offsetDiff * 60 * 1000);

      return phDate.toISOString();
    } catch (error) {
      console.error("Error creating PH DateTime:", error);
      return new Date().toISOString(); // Fallback to current time
    }
  }

  // Parse ISO string to extract date and time
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        setSelectedDate(date);
        setTimeValue(formatTimeForPHTimezone(date));
      } catch (error) {
        console.error("Error parsing ISO date:", error);
        // Reset to defaults if invalid
        setSelectedDate(undefined);
        setTimeValue("10:30:00");
      }
    } else {
      setSelectedDate(undefined);
      setTimeValue("10:30:00");
    }
  }, [value]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);
    setOpen(false);

    if (onChange) {
      const isoString = createPHDateTimeISO(date, timeValue);
      onChange(isoString);
    }
  };

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate && onChange) {
      const isoString = createPHDateTimeISO(selectedDate, newTime);
      onChange(isoString);
    }
  };

  // Handle manual input clearing
  const handleClear = () => {
    setSelectedDate(undefined);
    setTimeValue("10:30:00");
    if (onChange) {
      onChange("");
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
          disabled={!selectedDate} // Disable time input if no date selected
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
