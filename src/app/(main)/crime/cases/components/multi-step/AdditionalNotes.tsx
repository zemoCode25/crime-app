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
import { UseFormReturn } from "react-hook-form";
import { FormSchemaType } from "../../../../../../types/crime-case";
import MainButton from "@/components/utils/MainButton";

// follow up
// remarks
// investigator notes
export default function AdditionalNotes({
  form,
}: {
  form: UseFormReturn<FormSchemaType, any, FormSchemaType>;
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

      <MainButton type="submit">Create Case</MainButton>
    </>
  );
}
