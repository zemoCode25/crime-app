"use client";
import { useState } from "react";
import PushForm from "./PushForm";
import EmailForm from "./EmailForm";
import SMSForm from "./SMSForm";

export default function EmergencyPage() {
  const [emergencyType, setEmergencyType] = useState("sms");

  return (
    <div>
      {emergencyType === "push" && <PushForm />}
      {emergencyType === "email" && <EmailForm />}
      {emergencyType === "sms" && <SMSForm />}
    </div>
  );
}
