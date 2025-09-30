"use client";

import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { UseFormReturn } from "react-hook-form";
import { FormSchemaType } from "@/types/form-schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Button } from "@/components/ui/button";
import { barangays } from "@/constants/crime-case";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorMessage } from "@hookform/error-message";

const Map = dynamic(() => import("./Map"), {
  ssr: false, // ✅ prevent SSR errors
});

type Barangay = {
  label: string;
  value: string;
};

export default function AddressInformation({
  form,
}: {
  form: UseFormReturn<FormSchemaType, any, FormSchemaType>;
}) {
  const barangayList = barangays.slice(1, barangays.length - 1);
  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Location</label>
        <Input
          placeholder="Enter location"
          {...form.register("crime_location")}
        />
      </div>
      <Map />
      <div className="mt-4 mb-4">
        <label className="mb-2 block text-sm font-medium">Landmark</label>
        <Input placeholder="Enter landmark" {...form.register("landmark")} />
      </div>
      <FormField
        control={form.control}
        name="barangay"
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
                      ? barangayList?.find(
                          (barangay: Barangay) =>
                            barangay.label === field.value,
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
                      {barangayList?.map((barangay: Barangay) => (
                        <CommandItem
                          value={barangay.label || undefined}
                          key={barangay.label}
                          onSelect={() => {
                            form.setValue("barangay", barangay.label || "");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              barangay?.label === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {barangay?.label}
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
    </div>
  );
}
