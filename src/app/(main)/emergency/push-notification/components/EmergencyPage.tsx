"use client";

import { Loader2, Pencil, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import DateTime from "./DateTime";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddEmergencyNotification } from "@/hooks/emergency/useAddEmergencyNotification";
import toast from "react-hot-toast";

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const imageFileSchema = z
  .custom<File>(
    (file) => typeof File !== "undefined" && file instanceof File,
    { message: "Please upload a valid image file" },
  )
  .refine(
    (file) =>
      typeof File !== "undefined" &&
      file instanceof File &&
      file.size <= MAX_IMAGE_SIZE_BYTES,
    {
      message: `Image must be ${MAX_IMAGE_SIZE_MB}MB or less`,
    },
  )
  .refine(
    (file) =>
      typeof File !== "undefined" &&
      file instanceof File &&
      ACCEPTED_IMAGE_TYPES.includes(file.type),
    {
      message: "Only JPG, PNG, or WebP images are allowed",
    },
  );

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
    imageFile: imageFileSchema.optional(),
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputId = "emergency-image-upload";

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
      channels: ["push", "email"], // Default to both
      imageFile: undefined,
    },
  });

  const selectedChannels = watch("channels");
  const selectedImage = watch("imageFile");

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return previewUrl;
    });

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedImage]);

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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setValue("imageFile", file ?? undefined, { shouldValidate: true });
  };

  // Form submission handler
  const onSubmit = (data: PushNotificationFormData) => {
    // Note: The backend currently doesn't support 'channels' distinctively in the DB schema,
    // but the UI collects it. In a real scenario, we'd pass this to the API.
    // For now, we proceed if validation passes.
    toast.loading("Sending notification...", { id: "add-emergency" });
    addNotification(
      {
        subject: data.subject,
        body: data.message,
        schedule: data.scheduledDate?.toISOString() ?? null,
        imageFile: data.imageFile ?? null,
      },
      {
        onSuccess: () => {
          toast.dismiss("add-emergency");
          if (data.scheduledDate) {
            toast.success("Notification scheduled successfully!");
          } else {
            toast.success("Notification sent successfully!");
          }

          // Reset form on success
          reset({
            subject: "",
            message: "",
            isScheduled: false,
            scheduledDate: undefined,
            channels: ["push", "email"],
            imageFile: undefined,
          });
          setDate(undefined);
          setIsScheduled(false);
          setImagePreview(null);
        },
        onError: (error) => {
          toast.dismiss("add-emergency");

          if (error instanceof Error) {
            const msg = error.message.toLowerCase();

            if (msg.includes("not authenticated") || msg.includes("auth")) {
              toast.error("You must be logged in to send notifications.");
            } else if (msg.includes("permission")) {
              toast.error("You don't have permission to send notifications.");
            } else if (msg.includes("network")) {
              toast.error(
                "Network error. Please check your connection and try again.",
              );
            } else {
              toast.error(error.message || "Failed to send notification");
            }
          } else {
            toast.error("An unexpected error occurred. Please try again.");
          }

          console.error("Emergency notification error:", error);
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

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          {/* Image */}
          <div className="flex flex-col gap-2 md:w-64">
            <label className="text-sm font-medium">
              Notification Image (optional)
            </label>
            <div className="w-full max-w-[240px]">
              <input
                id={imageInputId}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handleImageChange}
                className="sr-only"
              />
              <label
                htmlFor={imageInputId}
                className="group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-300 bg-white text-gray-500 transition hover:border-orange-400 hover:bg-orange-50"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Notification preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100" />
                    <span className="relative z-10 inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 opacity-0 shadow transition group-hover:opacity-100">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit image
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-gray-400 text-gray-500">
                      <Plus className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-gray-600">
                      Add image
                    </span>
                    <span className="text-[11px] text-gray-400">
                      JPG, PNG, WebP (max {MAX_IMAGE_SIZE_MB}MB)
                    </span>
                  </div>
                )}
              </label>
            </div>
            {errors.imageFile && (
              <p className="text-xs text-red-600">{errors.imageFile.message}</p>
            )}
          </div>

          {/* Delivery Options */}
          <div className="flex flex-1 flex-col gap-3">
            <label className="text-sm font-medium">Delivery Options</label>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="channel-push"
                  checked={selectedChannels?.includes("push")}
                  onCheckedChange={(checked) =>
                    handleChannelToggle("push", checked as boolean)
                  }
                />
                <label
                  htmlFor="channel-push"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send via Push Notification
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
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer border border-orange-600 bg-orange-100 text-orange-600 hover:bg-orange-200"
          size="lg"
        >
          {isPending ? "Sending..." : "Send Notification"}
          {isPending ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="ml-2 h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
