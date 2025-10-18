"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";

export default function AdditionalNotes() {
  const form = useFormContext();

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
                placeholder="Enter investigator notes..."
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
              <Textarea
                placeholder="Enter follow up actions..."
                className="resize-none"
                {...field}
              />
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
              <Textarea
                placeholder="Enter additional remarks..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
