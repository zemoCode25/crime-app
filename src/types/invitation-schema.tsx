import { z } from "zod";

export const InvitationSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email")
      .refine((v) => v.toLowerCase().endsWith("@gmail.com"), {
        message: "Only Gmail addresses are allowed",
      }),
    role: z.enum(["system_admin", "barangay_admin"] as const),
    barangay: z.string().optional(),
  })
  .refine((val) => (val.role === "barangay_admin" ? !!val.barangay : true), {
    path: ["barangay"],
    message: "Barangay is required for Barangay Admin",
  });

export type InvitationForm = z.infer<typeof InvitationSchema>;
