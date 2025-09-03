"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import PushForm from "./PushForm";
import EmailForm from "./EmailForm";
import SMSForm from "./SMSForm";

export default function EmergencyPage() {
  const [emergencyType, setEmergencyType] = useState("sms");

  return (
    <div>
      <Tabs defaultValue="sms" className="g-neu w-[400px]">
        <TabsList className="flex items-center gap-3 bg-neutral-200">
          <TabsTrigger value="push" onClick={() => setEmergencyType("push")}>
            Push Notification
          </TabsTrigger>
          <TabsTrigger value="email" onClick={() => setEmergencyType("email")}>
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" onClick={() => setEmergencyType("sms")}>
            SMS
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {emergencyType === "push" && <PushForm />}
      {emergencyType === "email" && <EmailForm />}
      {emergencyType === "sms" && <SMSForm />}
    </div>
  );
}
