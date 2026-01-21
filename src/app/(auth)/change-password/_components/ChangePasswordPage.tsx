"use client";
import React, { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

import { calcPasswordStrength, passwordChecks } from "../../signup/_lib/utils";
import { changePasswordAction } from "@/server/queries/auth";
import { useSearchParams } from "next/navigation";

const ChangePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Min 8 characters")
      .max(30, "Max 30 characters")
      .refine((v) => /[A-Z]/.test(v), {
        message: "Must contain an uppercase letter",
      })
      .refine((v) => /[a-z]/.test(v), {
        message: "Must contain a lowercase letter",
      })
      .refine((v) => /\d/.test(v), { message: "Must contain a number" })
      .refine((v) => /[^A-Za-z0-9]/.test(v), {
        message: "Must contain a special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>;

export default function ChangePasswordPage() {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const password = form.watch("password");
  const strength = useMemo(() => calcPasswordStrength(password), [password]);
  const { meetsRequirements } = useMemo(
    () => passwordChecks(password),
    [password],
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hue = Math.round((strength / 100) * 120);
  const barColor = `hsl(${hue} 90% 40%)`;
  const strengthLabel = meetsRequirements
    ? "Strong"
    : strength < 50
      ? "Weak"
      : "Medium";

  const search = useSearchParams();
  const error = search?.get("error");
  const success = search?.get("success");

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <form action={changePasswordAction} noValidate>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-xl font-medium">Change Password</h1>
                <p className="text-muted-foreground text-xs text-balance">
                  Set a new strong password
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={30}
                    className="pr-10"
                    {...form.register("password")}
                  />
                  <input type="hidden" name="new-password" value={password} />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 flex items-center justify-center rounded p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-1">
                  <div
                    className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800"
                    aria-hidden
                  >
                    <div
                      className="h-2 rounded-full transition-[width] duration-200"
                      style={{
                        width: `${strength}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Strength: {strengthLabel}
                    </span>
                    <span className="text-muted-foreground">{strength}%</span>
                  </div>
                  <div className="text-muted-foreground mt-1 text-[11px]">
                    Must be 8-30 chars and include uppercase, lowercase, number,
                    and a special character.
                  </div>
                </div>

                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && (
                <p className="text-sm text-green-600">
                  Password updated successfully.
                </p>
              )}

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={30}
                    className="pr-10"
                    {...form.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm((p) => !p)}
                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 flex items-center justify-center rounded p-1"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
              >
                {form.formState.isSubmitting
                  ? "Updating..."
                  : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
