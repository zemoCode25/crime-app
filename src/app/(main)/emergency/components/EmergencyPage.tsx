"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import PushForm from "./PushForm";
import EmailForm from "./EmailForm";
import SMSForm from "./SMSForm";

export default function EmergencyPage() {
  const [emergencyType, setEmergencyType] = useState("sms");

  return (
    <div>
      <Tabs defaultValue="sms" className="w-[400px]">
        <TabsList className="w-full gap-5 bg-neutral-200/50 dark:bg-neutral-900">
          <TabsTrigger
            value="push"
            className=""
            onClick={() => setEmergencyType("push")}
          >
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
