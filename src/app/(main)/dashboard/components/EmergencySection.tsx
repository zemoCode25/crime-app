import { Card } from "@/components/ui/card";
import { Contact } from "lucide-react";
import { BellPlus } from "lucide-react";
import { Mail } from "lucide-react";

export default function EmergencySection() {
  return (
    <section>
      <Card className="flex flex-wrap flex-row items-center justify-between p-2 !gap-3">
        <Card className="px-3 py-4  w-[calc(33.333%_-_1rem)] !gap-2 flex flex-row justify-center items-center">
          <Contact size={60} />
          <div>
            <h1>SMS</h1>
            <p className="text-xs max-w-[7rem]">
              Send emergency alerts via SMS
            </p>
          </div>
        </Card>
        <Card className="px-3 py-4  w-[calc(33.333%_-_1rem)] !gap-2 flex flex-row justify-center items-center">
          <BellPlus size={60} />
          <div>
            <h1>Push Notification</h1>
            <p className="text-xs max-w-[7rem]">
              Send emergency alerts via Push Notification
            </p>
          </div>
        </Card>
        <Card className="px-3 py-4  w-[calc(33.333%_-_1rem)] !gap-2 flex flex-row justify-center items-center">
          <Mail size={60} />
          <div>
            <h1>Email</h1>
            <p className="text-xs max-w-[7rem]">
              Send emergency alerts via Email
            </p>
          </div>
        </Card>
      </Card>
    </section>
  );
}
