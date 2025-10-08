"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Calendar22Props {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function Calendar22({
  value,
  onChange,
  onBlur,
  name,
  placeholder = "Select date",
  disabled = false,
  className,
}: Calendar22Props) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };
  return (
    <div className={cn("flex w-[100px] items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-between font-normal",
              !value && "text-muted-foreground",
            )}
            onBlur={onBlur}
            disabled={disabled}
            type="button"
          >
            <span className="truncate">
              {value instanceof Date && !isNaN(value.getTime())
                ? value.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : placeholder}
            </span>
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="font-inter w-auto overflow-hidden p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            onSelect={(date) => {
              handleDateSelect(date);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
