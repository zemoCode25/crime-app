import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import React from "react";
import { UseFormReturn } from "react-hook-form";

export default function Suspect({
  form,
}: {
  form: UseFormReturn<
    {
      description: string;
      crime_type: string;
      case_status: string;
      report_datetime: unknown;
      incident_datetime: unknown;
      first_name: string;
      last_name: string;
      address: string;
      civil_status: string;
      contact_number: string;
      sex: string;
      birth_date: unknown;
      person_notified?: string | undefined;
      related_contact?: string | undefined;
      case_role: string;
      motive?: string | undefined;
      weapon_used?: string | undefined;
      narrative?: string | undefined;
      testimony?: string | undefined;
    },
    any,
    {
      description: string;
      crime_type: string;
      case_status: string;
      report_datetime: Date;
      incident_datetime: Date;
      first_name: string;
      last_name: string;
      address: string;
      civil_status: string;
      contact_number: string;
      sex: string;
      birth_date: Date;
      person_notified?: string | undefined;
      related_contact?: string | undefined;
      case_role: string;
      motive?: string | undefined;
      weapon_used?: string | undefined;
      narrative?: string | undefined;
      testimony?: string | undefined;
    }
  >;
}) {
  return (
    <div>
      <FormField
        control={form.control}
        name="motive"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motive</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Dela Cruz" type="text" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="weapon_used"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weapon Used</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Dela Cruz" type="text" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
