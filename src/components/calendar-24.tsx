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
  value?: Date;
  onChange?: (value: Date) => void;
  onBlur?: () => void;
  name?: string;
}

export default function Calendar24({
  value,
  onChange,
  onBlur,
  name,
}: Calendar24Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(value);
  const [time, setTime] = useState<string>(
    value ? formatTimeForPHTimezone(value) : "10:30:00",
  );

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

  // Helper function to create date in PH timezone
  function createPHDate(date: Date, timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    // Create a new date with PH timezone
    const phDate = new Date(date.toLocaleDateString("en-PH")); // YYYY-MM-DD format
    phDate.setHours(hours, minutes, seconds || 0);

    // Convert to PH timezone
    const phTimeOffset = 8 * 60; // PH is UTC+8 (480 minutes)
    const userTimeOffset = phDate.getTimezoneOffset();
    const offsetDiff = userTimeOffset + phTimeOffset;

    return new Date(phDate.getTime() + offsetDiff * 60 * 1000);
  }

  // Update internal state when value prop changes
  useEffect(() => {
    if (value instanceof Date) {
      setDate(value);
      setTime(formatTimeForPHTimezone(value));
    }
  }, [value]);

  // Combine date and time, then call onChange
  const handleDateTimeChange = (newDate?: Date, newTime?: string) => {
    const currentDate = newDate || date;
    const currentTime = newTime || time;

    if (currentDate && onChange) {
      const combined = createPHDate(currentDate, currentTime);
      onChange(combined);
      console.log("Combined DateTime (PH):", combined);
      console.log(
        "PH Time String:",
        combined.toLocaleString("en-PH", { timeZone: "Asia/Manila" }),
      );
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false);
    handleDateTimeChange(selectedDate, time);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    handleDateTimeChange(date, newTime);
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
              onBlur={onBlur}
            >
              {date
                ? date.toLocaleDateString("en-PH", { timeZone: "Asia/Manila" })
                : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={handleTimeChange}
          onBlur={onBlur}
          name={name}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
