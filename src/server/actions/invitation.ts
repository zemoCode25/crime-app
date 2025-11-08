"use server";

import { z } from "zod";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/utils/EmailTemplate";
import { createInvitation, checkInvitationToken } from "../queries/invitation";
import { createClient } from "../supabase/server";
import { BARANGAY_OPTIONS } from "@/constants/crime-case";
import { getUser } from "./getUser";

const resend = new Resend(process.env.RESEND_API_KEY!); // use secret, not NEXT_PUBLIC

const InvitePayload = z.object({
  email: z.string().email("Enter a valid email"),
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  role: z.enum(["system_admin", "barangay_admin"]),
  barangay: z.number().optional(),
});
export type InvitePayload = z.infer<typeof InvitePayload>;

export async function sendInvitation(input: InvitePayload) {
  const parsed = InvitePayload.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() } as const;
  }

  const supabase = await createClient();
  const activeUser = await getUser();

  if (!activeUser) {
    return { ok: false, error: "unauthenticated" as const } as const;
  }

  const userId = activeUser.id;

  const { data: invitation, error: invitationError, token } = await createInvitation(
    supabase,
    {
      email: parsed.data.email,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      role: parsed.data.role,
      barangay: parsed.data.barangay,
      created_by_id: userId,
    }
  );


  if (invitationError || !invitation || !token) {
    return { ok: false, error: invitationError?.message || "Failed to create invitation" } as const;
  }

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/signup?token=${token}`;

  const { email, role, barangay } = parsed.data;

  const barangayName = BARANGAY_OPTIONS.find(b => b.id === barangay)?.value;

  try {
    const { data, error } = await resend.emails.send({
      from: "crime-app <onboarding@resend.dev>",
      to: [email],
      subject: `Invitation as an Administrator - Muntinlupa Crime Mapping System`,
      react: EmailTemplate({ firstName: input?.first_name, lastName: input?.last_name, role, barangay: barangayName, inviteLink }),
    });

    if (error) return { ok: false, error: error.message } as const;
    return { ok: true, data } as const;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to send invitation";
    return { ok: false, error: message } as const;
  }

}

export async function getInvitationForToken(token?: string) {
  if (!token) {
    return { ok: false, error: "missing_token" as const };
  }

  const supabase = await createClient();
  const result = await checkInvitationToken(supabase, token);

  if (!result.valid || !result.invitation) {
    return { ok: false, error: result.reason } as const;
  }

  return {
    ok: true,
    data: {
      ...result.invitation,
      token,
    },
  } as const;
}

