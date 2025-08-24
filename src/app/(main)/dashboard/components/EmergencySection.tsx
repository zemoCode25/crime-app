import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Contact, BellPlus, Mail, Send } from "lucide-react";
import Link from "next/link";

export default function EmergencySection() {
  return (
    <section className="flex flex-col justify-between gap-4">
      <h1 className="font-semibold text-lg">Give the community a heads up</h1>
      <div className="flex flex-wrap flex-col sm:flex-row items-center justify-between !gap-1">
        <Card className="px-6 py-4 flex-col w-full sm:w-[calc(33.333%_-_1rem)] !gap-0 flex">
          <div className="flex items-center gap-1">
            <Contact size={20} />
            <h1 className="text-lg font-bold">SMS</h1>
          </div>
          <p className="text-sm w-full mb-2">Send emergency alerts via SMS</p>
          <Link href="/dashboard/emergency/sms">
            <Button className="!text-xs w-fit flex items-center gap-1 cursor-pointer">
              <p>Send emergency</p>
              <Send size={12} />
            </Button>
          </Link>
        </Card>
        <Card className="px-6 py-4 flex-col w-full sm:w-[calc(33.333%_-_1rem)] !gap-0 flex">
          <div className="flex items-center gap-1">
            <Contact size={20} />
            <h1 className="text-lg font-bold">Push Notification</h1>
          </div>
          <p className="text-sm w-full mb-2">
            Send emergency alerts via Notification
          </p>
          <Link href="/dashboard/emergency/push">
            <Button className="!text-xs w-fit flex items-center gap-1 cursor-pointer">
              <p>Send emergency</p>
              <Send size={12} />
            </Button>
          </Link>
        </Card>
        <Card className="px-6 py-4 flex-col w-full sm:w-[calc(33.333%_-_1rem)] !gap-0 flex">
          <div className="flex items-center gap-1">
            <Mail size={20} />
            <h1 className="text-lg font-bold">Email</h1>
          </div>
          <p className="text-sm w-full mb-2">Send emergency alerts via Email</p>
          <Link href="/dashboard/emergency/sms">
            <Button className="!text-xs w-fit flex items-center gap-1 cursor-pointer">
              <p>Send emergency</p>
              <Send size={12} />
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}
