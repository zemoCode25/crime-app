"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { signup } from "@/server/queries/auth";
import { signInWithGoogle } from "@/server/queries/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Zod schema (now also requires a number)
const SignUpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
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
});
type SignUpValues = z.infer<typeof SignUpSchema>;

// Helper: requirement checks (added digit)
function passwordChecks(pw: string) {
  const hasMinLen = pw.length >= 8 && pw.length <= 30;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const meetsRequirements =
    hasMinLen && hasUpper && hasLower && hasDigit && hasSpecial;
  return {
    hasMinLen,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    meetsRequirements,
  };
}

// Strength calculator (0–100) based on 5 checks (20% each)
function calcPasswordStrength(pw: string) {
  const { hasMinLen, hasUpper, hasLower, hasDigit, hasSpecial } =
    passwordChecks(pw);
  const score =
    (hasMinLen ? 20 : 0) +
    (hasUpper ? 20 : 0) +
    (hasLower ? 20 : 0) +
    (hasDigit ? 20 : 0) +
    (hasSpecial ? 20 : 0);
  return score; // 0..100
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: SignUpValues) => {
    const fd = new FormData();
    fd.append("email", values.email);
    fd.append("password", values.password);
    await signup(fd);
  };

  const password = form.watch("password");
  const strength = useMemo(() => calcPasswordStrength(password), [password]);
  const { meetsRequirements } = useMemo(
    () => passwordChecks(password),
    [password],
  );
  const [showPassword, setShowPassword] = useState(false);

  // Color: 0 (red) -> 120 (green). Requirements met => green (100%).
  const hue = Math.round((strength / 100) * 120);
  const barColor = `hsl(${hue} 90% 40%)`;
  const strengthLabel = meetsRequirements
    ? "Strong"
    : strength < 50
      ? "Weak"
      : "Medium";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your Account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Sign up for Muntinlupa Crime Map
                </p>
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password + strength meter */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>

                {/* Input with eye toggle */}
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={30}
                    className="pr-10"
                    {...form.register("password")}
                  />
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

                {/* Strength bar */}
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
                    Must be 8–30 chars and include uppercase, lowercase, number,
                    and a special character.
                  </div>
                </div>

                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing up..." : "Signup"}
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="text-muted-foreground relative z-10 px-2">
                  OR
                </span>
              </div>

              <div className="w-full">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={signInWithGoogle}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l 2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </Button>
              </div>
            </div>
          </form>

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
