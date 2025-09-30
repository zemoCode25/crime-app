import { z } from "zod";

// Crime Case Schema
export const caseDataSchema = z.object({
  description: z.string(),
  crime_type: z.string().min(1, "Crime type field is required"),
  case_status: z.string().min(1, "Case status field is required"),
  report_datetime: z.date(),
  incident_datetime: z.date(),
  investigator: z.string().min(1, "Investigator field is required").optional(),
  responder: z.string().min(1, "Responder field is required").optional(),
  investigator_notes: z.string().optional(),
  follow_up: z.string().optional(),
  remarks: z.string().optional(),
});

// Location Schema
export const locationDataSchema = z.object({
  barangay: z.string().min(1, "Barangay field is required"),
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
  civil_status: z.string().min(1, "Civil status is required"),
  contact_number: z
    .string()
    .max(12, "Contact number must be at most 12 characters"),
  sex: z.string().min(1, "Sex is required"),
  birth_date: z.date(),
  person_notified: z.string().optional(),
  related_contact: z.string().max(12).optional(),
  case_role: z.string().min(1, "Involvement is required"),
  motive: z.string().optional(),
  weapon_used: z.string().optional(),
  narrative: z.string().optional(),
  testimony: z.string().optional(),
});

// Combined Form Schema
export const formSchema = z.object({
  // Case data
  ...caseDataSchema.shape,
  // Location data
  ...locationDataSchema.shape,
  // Persons array
  persons: z.array(personDataSchema),
});

export type FormSchemaType = z.infer<typeof formSchema>;