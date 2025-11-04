"use client";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, // <-- add this
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";

const UserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});
type UserProfileValues = z.infer<typeof UserProfileSchema>;

export function UserProfilePage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<UserProfileValues>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: { firstName: "", lastName: "", phoneNumber: "" },
    mode: "onSubmit",
  });

  async function onSubmit(values: UserProfileValues) {
    try {
      console.log("Profile submit:", values);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save profile");
    }
  }

  const handlePickFile = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional client-side validation mirror
    if (
      !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type,
      )
    ) {
      setAvatarError("Only PNG, JPG, and WEBP are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("File must be 2MB or smaller");
      return;
    }

    const fd = new FormData();
    fd.append("avatar", file);
    setUploading(true);
    const res = await uploadAvatarAction(fd);
    setUploading(false);

    if (!res.ok) {
      setAvatarError(res.error);
      return;
    }

    setAvatarUrl(res.url);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Profile form */}
          <Form {...form}>
            <form
              className="p-6 md:p-8"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Complete your profile</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Tell us a bit about you to continue.
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Avatar uploader */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted relative h-20 w-20 overflow-hidden rounded-full">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt="Avatar"
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center text-sm">
                          No avatar
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePickFile}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Upload avatar"}
                      </Button>
                      <p className="text-muted-foreground text-xs">
                        PNG, JPG, WEBP • Max 2MB
                      </p>
                      {avatarError && (
                        <p className="text-xs text-red-600">{avatarError}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      autoComplete="given-name"
                      {...form.register("firstName")}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      autoComplete="family-name"
                      {...form.register("lastName")}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone (uses FormField so it needs the Form provider) */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col items-start">
                      <FormLabel>Contact number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder="+63 912 345 6789"
                          defaultCountry="PH"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </form>
          </Form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/img/muntinlupa-city-hall.jpg"
              alt="Sample"
              className="h-full w-full rounded-lg object-cover"
              fill
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-orange-700/70 to-orange-200/20 dark:from-orange-900/100 dark:to-orange-500/20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
