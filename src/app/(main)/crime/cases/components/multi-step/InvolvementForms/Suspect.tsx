import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormSchemaType } from "../../../../../../../../types/crime-case-type";

export default function Suspect({
  form,
  index,
}: {
  form: UseFormReturn<FormSchemaType, any, FormSchemaType>;
  index: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={form.control}
        name={`persons.${index}.motive`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motive</FormLabel>
            <FormControl>
              <Textarea
                placeholder=""
                className="min-h-30 resize-none"
                {...field}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`persons.${index}.weapon_used`}
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
