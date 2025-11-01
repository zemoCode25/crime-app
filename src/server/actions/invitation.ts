"use server";

import { z } from "zod";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/utils/EmailTemplate";
import { createInvitation } from "../queries/invitation";
import { createClient } from "../supabase/server";

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

  const { data: invitation, error: invitationError, token } = await createInvitation(
    supabase,
    {
      email: parsed.data.email,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      role: parsed.data.role,
      barangay: parsed.data.barangay,
    }
  );

  if (invitationError || !invitation || !token) {
    return { ok: false, error: invitationError?.message || "Failed to create invitation" } as const;
  }

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/activate-admin?token=${token}`;

  const { email, role, barangay } = parsed.data;

  try {
    const { data, error } = await resend.emails.send({
      from: "crime-app <onboarding@resend.dev>",
      to: [email],
      subject: `Invitation: ${role.replace("_", " ")}`,
      react: EmailTemplate({ firstName: input?.first_name, lastName: input?.last_name, role, barangay, inviteLink }),
    });

    if (error) return { ok: false, error: error.message } as const;
    return { ok: true, data } as const;
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to send invitation" } as const;
  }
}

