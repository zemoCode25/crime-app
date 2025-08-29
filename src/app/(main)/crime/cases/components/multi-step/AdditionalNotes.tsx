"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

const formSchema = z.object({
  investigator_notes: z.string().optional(),
  follow_up: z.string().optional(),
  remarks: z.string().optional(),
});
import { UseFormReturn } from "react-hook-form";

// follow up
// remarks
// investigator notes

export default function AdditionalNotes({
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
      first_name: string;
      last_name: string;
      address: string;
      civil_status: string;
      contact_number: string;
      sex: string;
      birth_date: unknown;
      person_notified?: string | undefined;
      related_contact?: string | undefined;
      investigator_notes?: string | undefined;
      follow_up?: string | undefined;
      remarks?: string | undefined;
      case_role: string;
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
      investigator_notes?: string | undefined;
      follow_up?: string | undefined;
      remarks?: string | undefined;
      case_role: string;
    }
  >;
  onSubmit: (data: any) => void;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="investigator_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Investigator notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Placeholder"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              You can @mention other users and organizations.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="follow_up"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Follow up action</FormLabel>
            <FormControl>
              <Textarea placeholder="" className="resize-none" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="remarks"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Remarks</FormLabel>
            <FormControl>
              <Textarea placeholder="" className="resize-none" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="submit"
        onClick={() => {
          {
            console.log(form.formState.errors ? "GAGI ERROR" : "WLA NAMAN");
          }
          console.log(typeof Object.keys(form.formState.errors).length);
        }}
      >
        Submit
      </Button>
    </>
  );
}
