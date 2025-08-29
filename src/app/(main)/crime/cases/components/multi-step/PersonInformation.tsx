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
import { Input } from "@/components/ui/input";
import { sexes } from "@/constants/personal-information";
import { civilStatus } from "@/constants/personal-information";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import "react-phone-number-input/style.css";
import { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { PhoneInput } from "@/components/ui/phone-input";
import { personInvolvementList } from "@/constants/personal-information";
import { useEffect, useState } from "react";
import Suspect from "./InvolvementForms/Suspect";
import Complainant from "./InvolvementForms/Complainant";
import Witness from "./InvolvementForms/Witness";
import { FormSchemaType } from "../../../../../../../types/crime-case-type";

// Combo box to select for suspect, complainant, witness
// Button to add person information
// ComboBox for role selection
// Suspect (weapon_used, motive)
// complainant (narrative, person-selection)
// witness (testimony, person-selection)

type TFormFieldArray = {
  description: string;
  crime_type: string;
  case_status: string;
  report_datetime: unknown;
  incident_datetime: unknown;
  persons: {
    first_name: string;
    last_name: string;
    address: string;
    civil_status: string;
    contact_number: string;
    sex: string;
    birth_date: unknown;
    case_role: string;
    person_notified?: string | undefined;
    related_contact?: string | undefined;
    motive?: string | undefined;
    weapon_used?: string | undefined;
    narrative?: string | undefined;
    testimony?: string | undefined;
  }[];
  investigator_notes?: string | undefined;
  follow_up?: string | undefined;
  remarks?: string | undefined;
};
export default function PersonInformation({
  form,
  formFieldArray,
}: {
  form: UseFormReturn<FormSchemaType, any, FormSchemaType>;
  formFieldArray: UseFieldArrayReturn<TFormFieldArray, "persons", "id">;
}) {
  const [involvement, setInvolvement] = useState<string>("complainant");

  const { fields, append, remove } = formFieldArray;

  return (
    <div>
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name={`persons.${index}.first_name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Juan" type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`persons.${index}.last_name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Dela Cruz"
                      type="text"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`persons.${index}.address`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Southville 3 Poblacion, Muntinlupa City"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter public address</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`persons.${index}.case_role`}
              defaultValue="suspect"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Involvement</FormLabel>
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
                            ? personInvolvementList.find(
                                (personItem) =>
                                  personItem.value === field.value,
                              )?.label
                            : "Select involvement"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search type..." />
                        <CommandList>
                          <CommandEmpty>No involvement found.</CommandEmpty>
                          <CommandGroup>
                            {personInvolvementList.map((personItem) => (
                              <CommandItem
                                value={personItem.label}
                                key={personItem.value}
                                onSelect={() => {
                                  setInvolvement(personItem.value);
                                  form.setValue(
                                    `persons.${index}.case_role`,
                                    personItem.value,
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    personItem.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {personItem.label}
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

            {involvement === "suspect" && <Suspect form={form} index={index} />}
            {involvement === "complainant" && (
              <Complainant form={form} index={index} />
            )}
            {involvement === "witness" && <Witness form={form} index={index} />}

            <FormField
              control={form.control}
              name={`persons.${index}.civil_status`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Civil status</FormLabel>
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
                            ? civilStatus.find(
                                (status) => status.value === field.value,
                              )?.label
                            : "Select civil status"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search civil status..." />
                        <CommandList>
                          <CommandEmpty>No civil status found.</CommandEmpty>
                          <CommandGroup>
                            {civilStatus.map((status) => (
                              <CommandItem
                                value={status.label}
                                key={status.value}
                                onSelect={() => {
                                  form.setValue(
                                    `persons.${index}.civil_status`,
                                    status.value,
                                  );
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

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`persons.${index}.contact_number`}
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Contact number</FormLabel>
                  <FormControl className="w-full">
                    <PhoneInput
                      placeholder="Placeholder"
                      {...field}
                      defaultCountry="PH"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`persons.${index}.sex`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Sex</FormLabel>
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
                            ? sexes.find((sex) => sex.value === field.value)
                                ?.label
                            : "Select sex"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search language..." />
                        <CommandList>
                          <CommandEmpty>No sex found.</CommandEmpty>
                          <CommandGroup>
                            {sexes.map((sex) => (
                              <CommandItem
                                value={sex.label}
                                key={sex.value}
                                onSelect={() => {
                                  form.setValue(
                                    `persons.${index}.sex`,
                                    sex.value,
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    sex.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {sex.label}
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
              name={`persons.${index}.birth_date`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value instanceof Date &&
                          !isNaN(field.value.getTime()) ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value instanceof Date ? field.value : undefined
                        }
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Your date of birth is used to calculate your age.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`persons.${index}.person_notified`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Person to be notified</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Juan Dela Cruz"
                      type="text"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`persons.${index}.related_contact`}
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Related person contact number</FormLabel>
                  <FormControl className="w-full">
                    <PhoneInput
                      placeholder="Placeholder"
                      {...field}
                      defaultCountry="PH"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
