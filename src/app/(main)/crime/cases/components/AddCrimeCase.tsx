import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import AdditionalNotes from "./multi-step/AdditionalNotes";
import CrimeForm from "./multi-step/CrimeForm";
import PersonInformation from "./multi-step/PersonInformation";
import React, { useState } from "react";
import StepNavigation from "./StepNavigation";

export default function AddCrimeCase() {
  const [step, setStep] = useState(0);
  const stepFormMap: Record<
    number,
    { title: string; formComponent: React.ReactNode }
  > = {
    0: { title: "Crime Information", formComponent: <CrimeForm /> },
    1: { title: "Person Information", formComponent: <PersonInformation /> },
    2: { title: "Additional Notes", formComponent: <AdditionalNotes /> },
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-orange-600 hover:bg-amber-500 dark:text-white">
          <Plus /> Add crime record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <StepNavigation step={step} setStep={setStep} />
        {stepFormMap[step]?.formComponent ?? <div>Unknown step</div>}
      </DialogContent>
    </Dialog>
  );
}
