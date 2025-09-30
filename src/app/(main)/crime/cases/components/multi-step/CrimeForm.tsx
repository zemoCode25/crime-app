"use client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
// constants
import { types } from "@/constants/crime-case";
import { statuses } from "@/constants/crime-case";
import { ErrorMessage } from "@hookform/error-message";
import { formSchema, type FormSchemaType } from "@/types/form-schema";
// tanstack
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { getCrimeTypes } from "@/lib/queries/crime-type";
import useSupabaseBrowser from "@/lib/supabase/client";
import Calendar24 from "@/components/calendar-24";
// Report Date
// Incident Date
// Status
// Type
// Description

interface CrimeType {
  id: number;
  label: string | null;
}

export default function CrimeForm({
  form,
}: {
  form: UseFormReturn<FormSchemaType, any, FormSchemaType>;
}) {
  const supabase = useSupabaseBrowser();
  const {
    data: crimeTypes,
    isLoading,
    isError,
  } = useQuery(getCrimeTypes(supabase));

  return (
    <>
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder=""
                className="min-h-30 resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Describe the details of the crime case
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="crime_type"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Type</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-[200px] justify-between",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value
                      ? crimeTypes?.find(
                          (type: CrimeType) => type.label === field.value,
                        )?.label
                      : "Select type"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search type..." />
                  <CommandList>
                    <CommandEmpty>No type found.</CommandEmpty>
                    <CommandGroup>
                      {crimeTypes?.map((type: CrimeType) => (
                        <CommandItem
                          value={type.label || undefined}
                          key={type.label}
                          onSelect={() => {
                            form.setValue("crime_type", type.label || "");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              type?.label === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {type?.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <ErrorMessage
              name={field.name}
              render={({ message }) => <FormMessage>{message}</FormMessage>}
            />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="case_status"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Status</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-[200px] justify-between",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value
                      ? statuses.find((status) => status.value === field.value)
                          ?.label
                      : "Select status"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search type..." />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {statuses.map((status) => (
                        <CommandItem
                          value={status.label}
                          key={status.value}
                          onSelect={() => {
                            form.setValue("case_status", status.value);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              status.value === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {status.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormDescription>
              This is the language that will be used in the dashboard.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="report_datetime"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Report Date</FormLabel>
            <FormControl>
              <Calendar24
                value={field.value as Date}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="incident_datetime"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Incident Date</FormLabel>
            <FormControl>
              <Calendar24
                value={field.value as Date}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
