import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export default function Complainant({
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
            <FormLabel>Narrative</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g. Dela Cruz"
                className="min-h-30 resize-none"
                {...field}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
