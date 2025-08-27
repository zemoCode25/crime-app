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

// Report Date
// Incident Date
// Status
// Type
// Description

export default function CrimeForm({
  form,
  onSubmit,
}: {
  form: UseFormReturn<
    {
      description: string;
      crime_type: string;
      case_status: string;
      report_datetime: unknown;
      incident_datetime: unknown;
    },
    any,
    {
      description: string;
      crime_type: string;
      case_status: string;
      report_datetime: Date;
      incident_datetime: Date;
    }
  >;
  onSubmit: (data: any) => void;
}) {
  const types = [
    {
      label: "Theft",
      value: "theft",
    },
    {
      label: "Assault",
      value: "assault",
    },
    {
      label: "Fraud",
      value: "fraud",
    },
    {
      label: "Vandalism",
      value: "vandalism",
    },
  ];
  return (
    <>
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="" className="resize-none" {...field} />
            </FormControl>
            <FormDescription>
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
                      ? types.find((language) => language.value === field.value)
                          ?.label
                      : "Select language"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search language..." />
                  <CommandList>
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup>
                      {types.map((type) => (
                        <CommandItem
                          value={type.label}
                          key={type.value}
                          onSelect={() => {
                            form.setValue("crime_type", type.value);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              type.value === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {type.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <FormMessage />
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
                      ? types.find((type) => type.value === field.value)?.label
                      : "Select language"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search language..." />
                  <CommandList>
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup>
                      {types.map((type) => (
                        <CommandItem
                          value={type.label}
                          key={type.value}
                          onSelect={() => {
                            form.setValue("case_status", type.value);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              type.value === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {type.label}
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
            <DatetimePicker
              {...field}
              value={field.value as Date | undefined}
              format={[
                ["months", "days", "years"],
                ["hours", "minutes", "am/pm"],
              ]}
            />

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
            <DatetimePicker
              {...field}
              value={field.value as Date | undefined}
              format={[
                ["months", "days", "years"],
                ["hours", "minutes", "am/pm"],
              ]}
            />

            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
