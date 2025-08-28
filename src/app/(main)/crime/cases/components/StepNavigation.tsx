import { ArrowLeft } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

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
    <div className="sticky top-0 right-0 left-0 mt-4 flex w-full items-center justify-between">
      <Button
        className="cursor-pointer border bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-neutral-800"
        onClick={handlePrev}
      >
        <ArrowLeft className="text-black dark:text-white" />
      </Button>
      <DialogTitle className="rounded-sm bg-white px-6 py-1 font-bold shadow dark:bg-black">
        {stepTitleMap[step] ?? ""}
      </DialogTitle>
      <Button
        className="cursor-pointer border bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-neutral-800"
        onClick={handleNext}
      >
        <ArrowRight className="text-black dark:text-white" />
      </Button>
    </div>
  );
}
