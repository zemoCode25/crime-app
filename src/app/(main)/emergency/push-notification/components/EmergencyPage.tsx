"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import DateTime from "./DateTime";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddEmergencyNotification } from "@/hooks/emergency/useAddEmergencyNotification";

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
    channels: z.array(z.string()).refine((value) => value.length > 0, {
      message: "You must select at least one notification channel.",
    }),
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

  const { mutate: addNotification, isPending } = useAddEmergencyNotification();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<PushNotificationFormData>({
    resolver: zodResolver(pushNotificationSchema),
    defaultValues: {
      subject: "",
      message: "",
      isScheduled: false,
      scheduledDate: undefined,
      channels: ["sms", "email"], // Default to both
    },
  });

  const selectedChannels = watch("channels");

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

  // Handle channel toggle
  const handleChannelToggle = (channel: string, checked: boolean) => {
    const currentChannels = selectedChannels || [];
    let newChannels;
    if (checked) {
      newChannels = [...currentChannels, channel];
    } else {
      newChannels = currentChannels.filter((c) => c !== channel);
    }
    setValue("channels", newChannels, { shouldValidate: true });
  };

  // Form submission handler
  const onSubmit = (data: PushNotificationFormData) => {
    // Note: The backend currently doesn't support 'channels' distinctively in the DB schema,
    // but the UI collects it. In a real scenario, we'd pass this to the API.
    // For now, we proceed if validation passes.
    addNotification(
      {
        subject: data.subject,
        body: data.message,
        schedule: data.scheduledDate?.toISOString() ?? null,
      },
      {
        onSuccess: () => {
          // Reset form on success
          reset({
            subject: "",
            message: "",
            isScheduled: false,
            scheduledDate: undefined,
            channels: ["sms", "email"],
          });
          setDate(undefined);
          setIsScheduled(false);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-medium">Push Notification</h1>
          <p className="text-xs text-gray-600">
            Create and{" "}
            <span className="font-medium">send instant emergency alerts</span>{" "}
            to residents about incidents, threats, and safety advisories.
          </p>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Subject</label>
          <Input
            {...register("subject")}
            placeholder="Enter your subject line..."
            className="border bg-white"
          />
          {errors.subject && (
            <p className="text-xs text-red-600">{errors.subject.message}</p>
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            {...register("message")}
            placeholder="Enter your message here..."
            className="h-24 min-h-[350px] resize-none border bg-white"
          />
          {errors.message && (
            <p className="text-xs text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Delivery Options */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Delivery Options</label>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="channel-sms"
                checked={selectedChannels?.includes("sms")}
                onCheckedChange={(checked) =>
                  handleChannelToggle("sms", checked as boolean)
                }
              />
              <label
                htmlFor="channel-sms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send via SMS
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="channel-email"
                checked={selectedChannels?.includes("email")}
                onCheckedChange={(checked) =>
                  handleChannelToggle("email", checked as boolean)
                }
              />
              <label
                htmlFor="channel-email"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send via Email
              </label>
            </div>

            <div className="h-4 w-px bg-neutral-200" />

            <div className="flex items-center space-x-2">
              <Switch
                id="schedule"
                checked={isScheduled}
                onCheckedChange={handleScheduleChange}
              />
              <label
                htmlFor="schedule"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Schedule for later
              </label>
            </div>
          </div>

          {errors.channels && (
            <p className="text-xs text-red-600">{errors.channels.message}</p>
          )}

          {isScheduled && (
            <div className="animate-in fade-in slide-in-from-top-2 mt-2">
              <DateTime
                date={date}
                setDate={handleDateChange}
                isScheduled={isScheduled}
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.scheduledDate.message}
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer border border-orange-600 bg-orange-100 text-orange-600 hover:bg-orange-200"
          size="lg"
        >
          {isPending ? "Sending..." : "Send Notification"}{" "}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
