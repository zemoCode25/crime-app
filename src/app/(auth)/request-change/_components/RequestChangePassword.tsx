"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/server/queries/auth";

export default function RequestChangePassword() {
  const search = useSearchParams();
  const error = search?.get("error");
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <form action={requestPasswordResetAction} noValidate>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-xl font-medium">Request Password Change</h1>
                <p className="text-muted-foreground text-xs text-balance">
                  Enter your account email to receive a reset link.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Send reset link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
