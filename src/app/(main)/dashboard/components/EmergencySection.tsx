import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Contact, BellPlus, Mail, Send } from "lucide-react";
import Link from "next/link";

export default function EmergencySection() {
  return (
    <section className="flex flex-col justify-between gap-4">
      <h1 className="text-lg font-semibold">Give the community a heads up</h1>
      <div className="flex flex-col flex-wrap items-center justify-between !gap-1 sm:flex-row">
        <Card className="flex w-full flex-col !gap-0 px-6 py-4 sm:w-[calc(33.333%_-_1rem)]">
          <div className="flex items-center gap-1">
            <Contact size={20} />
            <h1 className="text-lg font-bold">SMS</h1>
          </div>
          <p className="mb-2 w-full text-sm">Send emergency alerts via SMS</p>
          <Link href="/dashboard/emergency/sms">
            <Button className="flex w-fit cursor-pointer items-center gap-1 !text-xs">
              <p>Send emergency</p>
              <Send size={12} />
            </Button>
          </Link>
        </Card>
        <Card className="flex w-full flex-col !gap-0 px-6 py-4 sm:w-[calc(33.333%_-_1rem)]">
          <div className="flex items-center gap-1">
            <BellPlus size={20} />
            <h1 className="text-lg font-bold">Push Notification</h1>
          </div>
          <p className="mb-2 w-full text-sm">
            Send emergency alerts via Notification
          </p>
          <Link href="/dashboard/emergency/push">
            <Button className="flex w-fit cursor-pointer items-center gap-1 !text-xs">
              <p>Send emergency</p>
              <Send size={12} />
            </Button>
          </Link>
        </Card>
        <Card className="flex w-full flex-col !gap-0 px-6 py-4 sm:w-[calc(33.333%_-_1rem)]">
          <div className="flex items-center gap-1">
            <Mail size={20} />
            <h1 className="text-lg font-bold">Email</h1>
          </div>
          <p className="mb-2 w-full text-sm">Send emergency alerts via Email</p>
          <Link href="/dashboard/emergency/sms">
            <Button className="flex w-fit cursor-pointer items-center gap-1 !text-xs">
              <p>Send emergency</p>
              <Send size={12} />
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}
