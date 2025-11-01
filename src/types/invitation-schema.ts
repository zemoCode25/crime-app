import { z } from "zod";

export const InvitationSchema = z
  .object({
    first_name: z.string().min(1, "First name is required").max(100),
    last_name: z.string().min(1, "Last name is required").max(100),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email")
      .refine((v) => v.toLowerCase().endsWith("@gmail.com"), {
        message: "Only Gmail addresses are allowed",
      }),
    role: z.enum(["system_admin", "barangay_admin"] as const),
    barangay: z.number().optional(),
  })
  .refine((val) => (val.role === "barangay_admin" ? !!val.barangay : true), {
    path: ["barangay"],
    message: "Barangay is required for Barangay Admin",
  });

export type InvitationForm = z.infer<typeof InvitationSchema>;
