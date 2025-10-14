import { ArrowLeft, ArrowRight } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormSchemaType } from "@/types/form-schema";
import toast from "react-hot-toast";

interface StepNavigationProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  form: UseFormReturn<FormSchemaType>; // ✅ Add form prop
}

export default function StepNavigation({
  step,
  setStep,
  form,
}: StepNavigationProps) {
  const stepTitleMap: Record<number, string> = {
    0: "Crime Information",
    1: "Person Information",
    2: "Location Information",
    3: "Additional Notes",
  };

  // ✅ Function to validate current step
  async function validateCurrentStep(): Promise<boolean> {
    const errors = form.formState.errors;

    switch (step) {
      case 0: // Crime Information
        // Trigger validation for crime fields
        const crimeFields = await form.trigger([
          "description",
          "crime_type",
          "case_status",
          "report_datetime",
          "incident_datetime",
        ]);

        if (!crimeFields) {
          toast.error("Invalid input in crime information");
          return false;
        }
        break;

      case 1: // Person Information
        const personFields = await form.trigger(["persons"]);

        if (!personFields || errors.persons) {
          // Check specific person errors
          const persons = form.getValues("persons");
          for (let i = 0; i < persons.length; i++) {
            const personError = errors.persons?.[i];
            if (personError?.first_name) {
              toast.error(`Person ${i + 1}: First name is required`);
              return false;
            }
            if (personError?.last_name) {
              toast.error(`Person ${i + 1}: Last name is required`);
              return false;
            }
            if (personError?.address) {
              toast.error(`Person ${i + 1}: Address is required`);
              return false;
            }
            if (personError?.contact_number) {
              toast.error(`Person ${i + 1}: Contact number is required`);
              return false;
            }
            if (personError?.case_role) {
              toast.error(`Person ${i + 1}: Case role is required`);
              return false;
            }
          }

          if (persons.length === 0) {
            toast.error("At least one person must be added");
            return false;
          }

          toast.error("Please fix the errors in Person Information");
          return false;
        }
        break;

      case 2: // Address Information
        const addressFields = await form.trigger([
          "barangay",
          "crime_location",
          "lat",
          "long",
        ]);

        if (!addressFields) {
          if (errors.barangay) toast.error("Barangay is required");
          else if (errors.crime_location)
            toast.error("Crime location is required");
          else if (errors.lat) toast.error("Latitude is required");
          else if (errors.long) toast.error("Longitude is required");
          return false;
        }
        break;

      case 3: // Additional Notes - usually optional, so always valid
        return true;
    }

    return true;
  }

  // ✅ Handle next with validation
  async function handleNext() {
    if (step < 3) {
      const isValid = await validateCurrentStep();
      if (isValid) {
        setStep(step + 1);
        toast.success("Step validated successfully!");
      }
    }
  }

  function handlePrev() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  return (
    <div className="sticky top-0 right-0 left-0 mt-4 flex w-full items-center justify-between">
      <Button
        className="cursor-pointer border"
        variant="outline"
        onClick={handlePrev}
        disabled={step === 0} // ✅ Disable on first step
      >
        <ArrowLeft className="text-black dark:text-white" />
      </Button>

      <DialogTitle className="rounded-sm bg-white/70 px-6 py-1 font-bold shadow dark:bg-neutral-800/90">
        {stepTitleMap[step] ?? ""}
      </DialogTitle>

      <Button
        className="cursor-pointer border"
        variant="outline"
        onClick={handleNext}
        disabled={step === 3} // ✅ Disable on last step
      >
        <ArrowRight className="text-black dark:text-white" />
      </Button>
    </div>
  );
}
