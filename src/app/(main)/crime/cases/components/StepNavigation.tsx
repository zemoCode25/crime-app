import { ArrowLeft } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function StepNavigation({
  step,
  setStep,
}: {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const stepTitleMap: Record<number, string> = {
    0: "Crime Information",
    1: "Person Information",
    2: "Additional Notes",
  };

  function handleNext() {
    if (step < 2) {
      setStep(step + 1);
    }
  }

  function handlePrev() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  return (
    <div className="mt-4 flex w-full justify-between">
      <ArrowLeft
        className="cursor-pointer rounded-sm border p-1 dark:border-neutral-600"
        onClick={handlePrev}
      />
      <DialogTitle className="font-bold">
        {stepTitleMap[step] ?? ""}
      </DialogTitle>
      <ArrowRight
        className="cursor-pointer rounded-sm border p-1 dark:border-neutral-600"
        onClick={handleNext}
      />
    </div>
  );
}
