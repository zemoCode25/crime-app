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
import { formSchema, type FormSchemaType } from "@/types/form-schema";

export default function Complainant({
  form,
  index,
}: {
  form: UseFormReturn<FormSchemaType, any, FormSchemaType>;
  index: number;
}) {
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
