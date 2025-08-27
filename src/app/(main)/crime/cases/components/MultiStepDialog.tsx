"use client";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AdditionalNotes from "./multi-step/AdditionalNotes";
import CrimeForm from "./multi-step/CrimeForm";
import PersonInformation from "./multi-step/PersonInformation";
import React, { useState } from "react";

export default function MultiStepDialog() {
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
    <DialogContent>
      <div>
        <DialogTitle>{stepFormMap[step]?.title}</DialogTitle>
      </div>
      {stepFormMap[step]?.formComponent ?? <div>Unknown step</div>}
    </DialogContent>
  );
}
