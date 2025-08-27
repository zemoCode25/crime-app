import { ArrowLeft } from "lucide-react";
import { ArrowRight } from "lucide-react";

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
    <div className="w-full">
      <ArrowLeft onClick={handlePrev} />
      {stepTitleMap[step] ?? ""}
      <ArrowRight onClick={handleNext} />
    </div>
  );
}
