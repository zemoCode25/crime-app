import { Card } from "@/components/ui/card";
import { Contact } from "lucide-react";
import { BellPlus } from "lucide-react";
import { Mail } from "lucide-react";

export default function EmergencySection() {
  return (
    <section className="flex flex-col justify-between gap-4">
      <h1 className="font-semibold text-lg">Give the community a heads up</h1>
      <div className="flex flex-wrap flex-col md:flex-row items-center justify-between !gap-3">
        <Card className="px-3 py-4 w-full md:w-[calc(33.333%_-_1rem)] !gap-2 flex flex-row justify-center items-center">
          <Contact size={60} />
          <div>
            <h1 className="text-xl font-bold">SMS</h1>
            <p className="text-xs max-w-[7rem]">
              Send emergency alerts via SMS
            </p>
          </div>
        </Card>
        <Card className="px-3 py-4 w-full md:w-[calc(33.333%_-_1rem)] !gap-2 flex flex-row justify-center items-center">
          <BellPlus size={60} />
          <div>
            <h1 className="text-xl font-bold">Push Notification</h1>
            <p className="text-xs max-w-[8rem]">
              Send emergency via Push Notification
            </p>
          </div>
        </Card>
        <Card className="px-3 py-4 w-full md:w-[calc(33.333%_-_1rem)] !gap-2 flex flex-row justify-center items-center">
          <Mail size={60} />
          <div>
            <h1 className="text-xl font-bold">Email</h1>
            <p className="text-xs max-w-[7rem]">
              Send emergency alerts via Email
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
