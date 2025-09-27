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
import { FormSchemaType } from "../../../../../../../types/crime-case-type";

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
        name={`persons.${index}.testimony`}
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
