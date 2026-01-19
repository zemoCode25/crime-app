import { ArrowLeft, ArrowRight } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { FormSchemaType } from "@/types/form-schema";
import toast from "react-hot-toast";
import { useFormContext } from "react-hook-form";

interface StepNavigationProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function StepNavigation({ step, setStep }: StepNavigationProps) {
  const stepTitleMap: Record<number, string> = {
    0: "Crime Information",
    1: "Person Information",
    2: "Location Information",
    3: "Additional Notes",
  };

  const form = useFormContext<FormSchemaType>();

  // Function to validate current step
  async function validateCurrentStep(): Promise<boolean> {
    switch (step) {
      case 0: {
        // Crime Information - validate base fields first
        const baseFieldsValid = await form.trigger([
          "description",
          "crime_type",
          "case_status",
          "report_datetime",
          "incident_datetime",
        ]);

        // Validate image_files separately if present
        const imageFiles = form.getValues("image_files");
        let imageFieldsValid = true;
        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          imageFieldsValid = await form.trigger("image_files");
        }

        const crimeFields = baseFieldsValid && imageFieldsValid;

        if (!crimeFields) {
          toast.error("Please fix the errors in Crime Information");
          return false;
        }

        return true;
      }

      case 1: {
        // Person Information
        const personFields = await form.trigger(["persons"]);
        const persons = form.getValues("persons") ?? [];

        if (!Array.isArray(persons) || persons.length === 0) {
          toast.error("At least one person must be added");
          return false;
        }

        if (!personFields) {
          toast.error("Please fix the errors in Person Information");
          return false;
        }

        return true;
      }

      case 2: {
        // Address / Location Information
        const addressFields = await form.trigger([
          "barangay",
          "crime_location",
          "lat",
          "long",
        ]);

        if (!addressFields) {
          toast.error("Please complete the required Location fields");
          return false;
        }

        return true;
      }

      case 3:
        // Additional Notes - optional, always valid
        return true;

      default:
        return true;
    }
  }

  // Handle next with validation
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
        disabled={step === 0}
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
        disabled={step === 3}
      >
        <ArrowRight className="text-black dark:text-white" />
      </Button>
    </div>
  );
}
