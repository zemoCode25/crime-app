import EmergencyCard from "./EmergencyCard";
import { Contact, BellPlus, Mail } from "lucide-react";

export default function EmergencySection() {
  return (
    <section className="flex flex-col justify-between gap-4">
      <h1 className="text-lg font-semibold">Give the community a heads up</h1>
      <div className="flex flex-col flex-wrap items-center justify-between !gap-1 sm:flex-row">
        <EmergencyCard
          title="SMS"
          description="Send emergency alerts via SMS"
          href="/dashboard/emergency/sms"
          icon={Contact}
        />

        <EmergencyCard
          title="Push Notification"
          description="Send emergency alerts via Push"
          href="/dashboard/emergency/push"
          icon={BellPlus}
        />

        <EmergencyCard
          title="Email"
          description="Send emergency alerts via Email"
          href="/dashboard/emergency/email"
          icon={Mail}
        />
      </div>
    </section>
  );
}
