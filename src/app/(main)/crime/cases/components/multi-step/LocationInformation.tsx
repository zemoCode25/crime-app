"use client";

import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { FormSchemaType } from "@/types/form-schema";
import {
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
import { BARANGAY_OPTIONS } from "@/constants/crime-case";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorMessage } from "@hookform/error-message";
import { useEffect, useState } from "react";
import { Coordinates } from "@/types/map";
import { useFormContext } from "react-hook-form";

const Map = dynamic(() => import("./Map"), {
  ssr: false, // ✅ prevent SSR errors
});

type Barangay = {
  id: number;
  value:
    | "Alabang"
    | "Ayala Alabang"
    | "Bayanan"
    | "Buli"
    | "Cupang"
    | "Poblacion"
    | "Putatan"
    | "Sucat"
    | "Tunasan";
};

export default function LocationInformation() {
  const form = useFormContext<FormSchemaType>();
  const lat = form.getValues("lat");
  const long = form.getValues("long");

  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: lat || 14.3731,
    long: long || 121.0218,
  });

  // ✅ Sync coordinates with form when they change from map
  useEffect(() => {
    form.setValue("lat", coordinates.lat, { shouldValidate: true });
    form.setValue("long", coordinates.long, { shouldValidate: true });
  }, [coordinates, form]);

  return (
    <div className="w-full p-4">
      <FormField
        control={form.control}
        name="crime_location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="Location" className="w-full" {...field} />
            </FormControl>
            <FormDescription className="text-xs">
              Specify the exact location of the crime
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Map coordinates={coordinates} setCoordinates={setCoordinates} />

      <div className="mt-4 mb-4">
        <label className="mb-2 block text-sm font-medium">Landmark</label>
        <Input placeholder="Enter landmark" {...form.register("landmark")} />
      </div>

      <FormField
        control={form.control}
        name="barangay"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Barangay</FormLabel>
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
                      ? BARANGAY_OPTIONS?.find(
                          (barangay: Barangay) => barangay.id === field.value,
                        )?.value
                      : "Select type"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search barangay..." />
                  <CommandList>
                    <CommandEmpty>No barangay found.</CommandEmpty>
                    <CommandGroup>
                      {BARANGAY_OPTIONS?.map((barangay) => (
                        <CommandItem
                          value={barangay.value}
                          key={barangay.id}
                          onSelect={() => {
                            form.setValue("barangay", barangay.id);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              barangay?.id === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {barangay?.value}
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
