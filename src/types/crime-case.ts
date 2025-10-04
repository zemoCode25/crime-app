import {CaseStatus} from "@/types/form-schema"
import {Sex} from "@/types/form-schema"
import {CivilStatus} from "@/types/form-schema"
import {CaseRole} from "@/types/form-schema"

export interface CrimeCaseData {
  case_number?: string;
  crime_type?: number;
  case_status?: CaseStatus;
  description?: string;
  incident_datetime?: string;
  report_datetime?: string;
  investigator?: string;
  responder?: string;
  investigator_notes?: string;
  remarks?: string;
  follow_up?: string;
}

export interface LocationData {
  barangay?: number
  crime_location?: string;
  landmark?: string;
  lat?: number;
  long?: number;
  pin?: number;
}

export interface PersonData {
  // Person profile fields
  first_name?: string;
  last_name?: string;
  birth_date?: Date;
  sex?: Sex;
  civil_status?: CivilStatus;
  address?: string;
  contact_number?: string;
  person_notified?: string;
  related_contact?: string;
  
  // Case involvement
  case_role: CaseRole;
  
  // Role-specific fields
  motive?: string; // for suspects
  weapon_used?: string; // for suspects
  narrative?: string; // for complainants
  testimony?: string; // for witnesses
}

export interface CrimeCaseTransactionResult {
  case_id?: number;
  location_id?: number;
  success: boolean;
  message: string;
  error?: string;
}