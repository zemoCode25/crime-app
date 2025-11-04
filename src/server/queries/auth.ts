"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/server/supabase/server";
import { checkInvitationToken } from "@/server/queries/invitation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return error.message;
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const rawEmail = (formData.get("email") as string | null)?.trim();
  const password = (formData.get("password") as string | null) ?? "";
  const invitationToken = (formData.get("invitationToken") as string | null) ?? "";

  if (!password || !invitationToken) {
    redirect("/auth/auth-code-error");
  }

  const invitationResult = await checkInvitationToken(supabase, invitationToken);

  if (!invitationResult.valid || !invitationResult.invitation?.email) {
    redirect("/auth/auth-code-error");
  }

  const invitationEmail = invitationResult.invitation.email;

  if (rawEmail && rawEmail.toLowerCase() !== invitationEmail.toLowerCase()) {
    redirect("/auth/auth-code-error");
  }

  const { error } = await supabase.auth.signUp({
    email: invitationEmail,
    password,
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const expectedEmail =
    (formData.get("expectedEmail") as string | null)?.trim().toLowerCase() || undefined;
  const invitationToken = (formData.get("invitationToken") as string | null)?.trim() || undefined;

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const searchParams = new URLSearchParams();
  if (expectedEmail) searchParams.set("expectedEmail", expectedEmail);
  if (invitationToken) searchParams.set("inviteToken", invitationToken);

  const redirectTo =
    `${origin}/auth/callback` + (searchParams.size ? `?${searchParams.toString()}` : "");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      ...(expectedEmail ? { queryParams: { login_hint: expectedEmail } } : {}),
    },
  });

  if (error) {
    console.error("OAuth error:", error);
    redirect("/auth/auth-code-error?reason=oauth_error");
  }

  if (data?.url) {
    redirect(data.url); // throws; satisfies Promise<void>
  }

  redirect("/auth/auth-code-error?reason=no_redirect_url");
}
