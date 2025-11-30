import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { useFormContext } from "react-hook-form";
import { type FormSchemaType } from "@/types/form-schema";

export default function Complainant({ index }: { index: number }) {
  const form = useFormContext<FormSchemaType>();
  return (
    <div>
      <FormField
        control={form.control}
        name={`persons.${index}.narrative`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Narrative</FormLabel>
            <FormControl>
              <Textarea className="min-h-50 resize-none" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
