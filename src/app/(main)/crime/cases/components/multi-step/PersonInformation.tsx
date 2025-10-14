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
import { SEXES } from "@/constants/personal-information";
import { CIVIL_STATUSES } from "@/constants/personal-information";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import Calendar22 from "@/components/calendar-22";
import { cn } from "@/lib/utils";
import "react-phone-number-input/style.css";
import { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { PhoneInput } from "@/components/ui/phone-input";
import { CASE_ROLES } from "@/constants/personal-information";
import { useEffect, useState } from "react";
import Suspect from "./InvolvementForms/Suspect";
import Complainant from "./InvolvementForms/Complainant";
import Witness from "./InvolvementForms/Witness";
import { formSchema, type FormSchemaType } from "@/types/form-schema";
import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";

export default function PersonInformation({
  formFieldArray,
}: {
  formFieldArray: UseFieldArrayReturn<FormSchemaType, "persons", "id">;
}) {
  const { fields, append, remove } = formFieldArray;
  const form = useFormContext<FormSchemaType>();
  return (
    <div className="flex w-full flex-col gap-4">
      {fields.map((field, index) => {
        const currentRole = form.watch(`persons.${index}.case_role`);
        return (
          <div key={field.id} className="flex flex-col gap-3">
            <div className="flex w-full items-center justify-between">
              <p className="font-semibold">{`Person of Concern #${index + 1}`}</p>
              {index > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="p-1"
                  onClick={() => {
                    if (index !== 0) remove(index);
                  }}
                >
                  <X />
                </Button>
              )}
            </div>
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
                            ? CASE_ROLES.find(
                                (role) => role.value === field.value,
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
                            {CASE_ROLES?.map((role) => (
                              <CommandItem
                                value={role.label}
                                key={role.value}
                                onSelect={() => {
                                  form.setValue(
                                    `persons.${index}.case_role`,
                                    role.value,
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    role.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {role.label}
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

            {currentRole === "suspect" && <Suspect form={form} index={index} />}
            {currentRole === "complainant" && (
              <Complainant form={form} index={index} />
            )}
            {currentRole === "witness" && <Witness form={form} index={index} />}

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
                            ? CIVIL_STATUSES.find(
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
                            {CIVIL_STATUSES.map((status) => (
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
                            ? SEXES.find((sex) => sex.value === field.value)
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
                            {SEXES.map((sex) => (
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
                  <FormControl>
                    <Calendar22
                      value={
                        field.value instanceof Date ? field.value : undefined
                      }
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      placeholder="Pick a date"
                      className="w-[100px] text-left"
                    />
                  </FormControl>
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
      <Button
        type="button"
        onClick={() =>
          append({
            first_name: "",
            last_name: "",
            address: "",
            civil_status: "single",
            contact_number: "",
            sex: "male",
            birth_date: new Date(),
            case_role: "complainant",
            motive: "",
            weapon_used: "",
            narrative: "",
            testimony: "",
            person_notified: "",
            related_contact: "",
          })
        }
      >
        Add Another Person
      </Button>
    </div>
  );
}
