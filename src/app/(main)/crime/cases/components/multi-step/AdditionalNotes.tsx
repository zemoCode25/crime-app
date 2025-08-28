import { Button } from "@/components/ui/button";
import React from "react";
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
    },
    any,
    {
      description: string;
      crime_type: string;
      case_status: string;
      report_datetime: Date;
      incident_datetime: Date;
    }
  >;
  onSubmit: (data: any) => void;
}) {
  return (
    <div>
      <h1>AdditionalNotes</h1>
      <Button type="submit" className="bg-orange-600 hover:bg-orange-600/90">
        Submit
      </Button>
    </div>
  );
}
