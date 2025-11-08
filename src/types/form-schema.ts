import { z } from "zod";

// ===== ENUMS =====
export const CrimeTypeEnum = z.enum(
  ["murder", "assault", "robbery", "homicide", "fraud"], {
    error: () => "Crime type field is required",
  }
);

export const CaseStatusEnum = z.enum([
  "open", "under investigation", "case settled", "lupon", "direct filing", "for record", "turn-over",
], {
  error: () => "Case status field is required",
});

export const SexEnum = z.enum(["male", "female"]);

export const CivilStatusEnum = z.enum([
  "single",
  "married",
  "widowed",
  "divorced",
  "legally separated",
  "annulled"
], {
  error: () => "Civil status field is required",
});

export const CaseRoleEnum = z.enum([
  "suspect",
  "complainant",
  "witness",
], {
  error: () => "Case role field is required",
});

export const VisibilityEnum = z.enum(["public", "private"], {
  error: () => "Visibility field is required",
});

// ===== SCHEMAS =====

// Crime Case Schema
export const caseDataSchema = z.object({
  description: z.string().min(1, "Description is required"),
  crime_type: z.number().min(1, "Crime type field is required"),
  case_status: CaseStatusEnum,
  report_datetime: z.date("Invalid date format"),
  incident_datetime: z.date("Invalid date format"),
  investigator: z.string().optional(),
  responder: z.string().optional(),
  investigator_notes: z.string().optional(),
  follow_up: z.string().optional(),
  remarks: z.string().optional(),
  visibility: VisibilityEnum,
});

// Location Schema
export const locationDataSchema = z.object({
  barangay: z.number().min(1, "Barangay field is required"),
  crime_location: z.string().min(1, "Location field is required"),
  landmark: z.string().optional(),
  pin: z.number().optional(),
  lat: z.number(),
  long: z.number(),
});

// Person Schema
export const personDataSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  civil_status: CivilStatusEnum,
  contact_number: z
    .string()
    .min(1, "Contact number is required")
    .max(15, "Contact number must be at most 15 characters"),
  sex: SexEnum,
  birth_date: z.date("Invalid date format"),
  person_notified: z.string().optional(),
  related_contact: z.string().max(15).optional(),
  case_role: CaseRoleEnum,
  motive: z.string().optional(),
  weapon_used: z.string().optional(),
  narrative: z.string().optional(),
  testimony: z.string().optional(),
});

// Combined Form Schema
export const formSchema = z.object({
  ...caseDataSchema.shape,
  ...locationDataSchema.shape,
  persons: z.array(personDataSchema),
});

export type CaseData = z.infer<typeof caseDataSchema>;
export type LocationData = z.infer<typeof locationDataSchema>;
export type PersonData = z.infer<typeof personDataSchema>;
export type FormSchemaType = z.infer<typeof formSchema>;

// ===== TYPE EXPORTS =====
export type CaseStatus = z.infer<typeof CaseStatusEnum>;
export type Sex = z.infer<typeof SexEnum>;
export type CivilStatus = z.infer<typeof CivilStatusEnum>;
export type CaseRole = z.infer<typeof CaseRoleEnum>;
export type Visibility = z.infer<typeof VisibilityEnum>;