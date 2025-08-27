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

  return (
    <DialogContent>
      {step === 0 && <CrimeForm />}
      {step === 1 && <PersonInformation />}
      {step === 2 && <AdditionalNotes />}
    </DialogContent>
  );
}
