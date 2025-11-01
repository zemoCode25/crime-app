"use server";

import { z } from "zod";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/utils/EmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY!); // use secret, not NEXT_PUBLIC

const InvitePayload = z.object({
  email: z.string().email("Enter a valid email"),
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  role: z.enum(["system_admin", "barangay_admin"]),
  barangay: z.string().optional(),
});
export type InvitePayload = z.infer<typeof InvitePayload>;

export async function sendInvitation(input: InvitePayload) {
  const parsed = InvitePayload.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() } as const;
  }

  const { email, role, barangay } = parsed.data;

  try {
    const { data, error } = await resend.emails.send({
      from: "crime-app <onboarding@resend.dev>",
      to: [email],
      subject: `Invitation: ${role.replace("_", " ")}`,
      react: EmailTemplate({ firstName: input?.first_name, lastName: input?.last_name, role, barangay }),
    });

    if (error) return { ok: false, error: error.message } as const;
    return { ok: true, data } as const;
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to send invitation" } as const;
  }
}

