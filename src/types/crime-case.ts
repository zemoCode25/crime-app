import {CaseStatus} from "@/types/form-schema"
import {Sex} from "@/types/form-schema"
import {CivilStatus} from "@/types/form-schema"
import {CaseRole} from "@/types/form-schema"

export interface CrimeCaseData {
  case_number?: string;
  crime_type: number; // ✅ Required field, remove optional
  case_status: CaseStatus; // ✅ Required field, remove optional
  description: string; // ✅ Required field, remove optional
  incident_datetime: string; // ✅ Required field, remove optional
  report_datetime: string; // ✅ Required field, remove optional
  investigator: string | null; // ✅ Nullable instead of optional
  responder: string | null; // ✅ Nullable instead of optional
  investigator_notes: string | null; // ✅ Nullable instead of optional
  remarks: string | null; // ✅ Nullable instead of optional
  follow_up: string | null; // ✅ Nullable instead of optional
}

export interface LocationData {
  barangay: number; // ✅ Required field, remove optional
  crime_location: string; // ✅ Required field, remove optional
  landmark: string | null; // ✅ Nullable instead of optional
  lat: number; // ✅ Required field, remove optional
  long: number; // ✅ Required field, remove optional
  pin: number | null; // ✅ Nullable instead of optional
}

export interface PersonData {
  // Person profile fields (required)
  first_name: string; // ✅ Required field, remove optional
  last_name: string; // ✅ Required field, remove optional
  birth_date: Date; // ✅ Required field, use Date for consistency
  sex: Sex; // ✅ Required field, remove optional
  civil_status: CivilStatus; // ✅ Required field, remove optional
  address: string; // ✅ Required field, remove optional
  contact_number: string; // ✅ Required field, remove optional
  case_role: CaseRole; // ✅ Required field
  
  // Optional fields (nullable)
  person_notified: string | null; // ✅ Nullable instead of optional
  related_contact: string | null; // ✅ Nullable instead of optional
  
  // Role-specific fields (nullable)
  motive: string | null; // ✅ for suspects
  weapon_used: string | null; // ✅ for suspects
  narrative: string | null; // ✅ for complainants
  testimony: string | null; // ✅ for witnesses
}

export interface CrimeCaseTransactionResult {
  case_id?: number;
  location_id?: number;
  success: boolean;
  message: string;
  error?: string;
}