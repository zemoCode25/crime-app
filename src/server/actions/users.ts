"use server";

import { z } from "zod";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

import { createClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service-client";
import {
  listUsersSchema,
  fetchActiveUsers,
  type GetActiveUsersInput,
  getUserRole,
  getUserBasicProfile,
  getAuthUserMetadata,
} from "@/server/queries/users";
import { KickUserEmail } from "@/components/utils/KickUserEmail";
import { redirect } from "next/navigation";
// Type exports are not allowed from a "use server" action file

const resend = new Resend(process.env.RESEND_API_KEY!);

// Schema moved to queries/users.ts

const kickUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(10).max(600),
});


export async function getActiveUsers(
  rawInput: Partial<GetActiveUsersInput>,
) {
  const supabase = await createClient();
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  if (!sessionUser) {
    return { ok: false, error: "unauthenticated" } as const;
  }

  const requesterRole = await getUserRole(sessionUser.id);

  if (!requesterRole || !["main_admin", "system_admin"].includes(requesterRole)) {
    return { ok: false, error: "forbidden" } as const;
  }

  const parsed = listUsersSchema.safeParse({
    page: 1,
    pageSize: 10,
    sortBy: "created_at",
    sortDir: "desc",
    ...rawInput,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() } as const;
  }

  try {
    const data = await fetchActiveUsers(parsed.data);
    return { ok: true, data } as const;
  } catch (err) {
    console.error("Failed to fetch users", err);
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    return { ok: false, error: message } as const;
  }
}

type KickInput = z.infer<typeof kickUserSchema>;

export async function kickUser(rawInput: KickInput) {
  const supabase = await createClient();
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  if (!sessionUser) {
    return { ok: false, error: "unauthenticated" } as const;
  }

  const requesterProfile = await getUserBasicProfile(sessionUser.id);

  if (!requesterProfile?.role || !["main_admin", "system_admin"].includes(requesterProfile.role)) {
    return { ok: false, error: "forbidden" } as const;
  }

  const parsed = kickUserSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() } as const;
  }

  const { userId, reason } = parsed.data;

  if (userId === sessionUser.id) {
    return { ok: false, error: "You cannot remove your own account." } as const;
  }

  const serviceClient = createServiceClient();

  const targetProfile = await getUserBasicProfile(userId);

  if (!targetProfile) {
    return { ok: false, error: "User not found." } as const;
  }

  if (targetProfile.role === "main_admin") {
    return { ok: false, error: "Main administrators cannot be removed." } as const;
  }

  const authMeta = await getAuthUserMetadata(userId);

  if (!authMeta?.email) {
    return { ok: false, error: "Unable to locate user's email address." } as const;
  }

  const removedBy = [requesterProfile.first_name, requesterProfile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim() || "System Administrator";

  const fullName = [targetProfile.first_name, targetProfile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim() || "Administrator";

  const { error: emailError } = await resend.emails.send({
    from: "crime-app <onboarding@resend.dev>",
    to: [authMeta.email],
    subject: "Your access has been removed",
    react: KickUserEmail({
      fullName,
      removedBy,
      reason,
    }),
  });

  if (emailError) {
    console.error("Failed to send removal email", emailError);
    return { ok: false, error: "Failed to send notification email." } as const;
  }

  const { error: deleteProfileError } = await serviceClient
    .from("users")
    .delete()
    .eq("id", userId);

  if (deleteProfileError) {
    console.error("Failed to delete profile", deleteProfileError);
    return { ok: false, error: "Failed to delete user profile." } as const;
  }

  const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(userId);

  if (deleteAuthError) {
    console.error("Failed to delete auth user", deleteAuthError);
    return { ok: false, error: "Failed to delete auth account." } as const;
  }

  // Revalidate the manage accounts page to reflect removals
  revalidatePath("/(main)/manage-accounts");

  return { ok: true } as const;
}

export async function logOutUser() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out user:", error);
    throw new Error("Failed to log out.");
  }
  redirect("/login");
}