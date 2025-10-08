import React from "react";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function UpdateCrimeCase({ caseId }: { caseId: number }) {
  return (
    <DialogContent>
      <DialogTitle>Update Crime Case</DialogTitle>
      <div>UpdateCrimeCase {caseId}</div>
    </DialogContent>
  );
}
