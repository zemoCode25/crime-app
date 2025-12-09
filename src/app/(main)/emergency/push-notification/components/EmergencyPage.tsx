"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import DateTime from "./DateTime";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for push notification form
const pushNotificationSchema = z
  .object({
    subject: z
      .string()
      .min(1, "Subject is required")
      .min(3, "Subject must be at least 3 characters")
      .max(100, "Subject must not exceed 100 characters"),
    message: z
      .string()
      .min(1, "Message is required")
      .min(10, "Message must be at least 10 characters")
      .max(1000, "Message must not exceed 1000 characters"),
    isScheduled: z.boolean(),
    scheduledDate: z.date().optional(),
  })
  .refine(
    (data) => {
      // If scheduled, date must be provided and in the future
      if (data.isScheduled) {
        return data.scheduledDate && data.scheduledDate > new Date();
      }
      return true;
    },
    {
      message: "Scheduled date must be in the future",
      path: ["scheduledDate"],
    },
  );

// Infer TypeScript type from schema
type PushNotificationFormData = z.infer<typeof pushNotificationSchema>;

export default function EmergencyPage() {
  const [date, setDate] = useState<Date>();
  const [isScheduled, setIsScheduled] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PushNotificationFormData>({
    resolver: zodResolver(pushNotificationSchema),
    defaultValues: {
      subject: "",
      message: "",
      isScheduled: false,
      scheduledDate: undefined,
    },
  });

  // Handle schedule toggle
  const handleScheduleChange = (checked: boolean) => {
    setIsScheduled(checked);
    setValue("isScheduled", checked);
    if (!checked) {
      setDate(undefined);
      setValue("scheduledDate", undefined);
    }
  };

  // Handle date change
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    setValue("scheduledDate", newDate);
  };

  // Form submission handler
  const onSubmit = async (data: PushNotificationFormData) => {
    try {
      console.log("Form data:", data);
      // TODO: Implement API call to send notification
      // await sendPushNotification(data);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-medium">Push Notification</h1>
          <p className="text-xs text-gray-600">
            Create and{" "}
            <span className="font-medium">send instant emergency alerts</span>{" "}
            to residents about incidents, threats, and safety advisories.
          </p>
        </div>
        <div>
          <p className="mb-2">Subject</p>
          <Input
            {...register("subject")}
            placeholder="Enter your subject line..."
            className="border bg-white"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subject.message}
            </p>
          )}
        </div>
        <div>
          <p className="mb-2">Message</p>
          <Textarea
            {...register("message")}
            placeholder="Enter your message here..."
            className="h-24 min-h-[300px] resize-none border bg-white"
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.message.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Switch
              id="schedule"
              checked={isScheduled}
              onCheckedChange={handleScheduleChange}
              className="mr-2"
            />
            <p>Schedule notification for later?</p>
          </div>
          <DateTime
            date={date}
            setDate={handleDateChange}
            isScheduled={isScheduled}
          />
          {errors.scheduledDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.scheduledDate.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer border border-orange-600 bg-orange-100 text-orange-600 hover:bg-orange-200"
        >
          {isSubmitting ? "Sending..." : "Send Notification"} <Send />
        </Button>
      </form>
    </div>
  );
}
