import {CaseStatus} from "@/types/form-schema"
import {Sex} from "@/types/form-schema"
import {CivilStatus} from "@/types/form-schema"
import {CaseRole} from "@/types/form-schema"
import {Visibility} from "@/types/form-schema"  
import type { Database } from "@/server/supabase/database.types"

export interface CrimeCaseData {
  case_number?: string;
  crime_type: number; // ✅ Required field, remove optional
  case_status: CaseStatus; // ✅ Required field, remove optional
  description: string; // ✅ Required field, remove optional
  incident_datetime: Date; // ✅ Required field, remove optional
  report_datetime: Date; // ✅ Required field, remove optional
  investigator: string | null; // ✅ Nullable instead of optional
  responder: string | null; // ✅ Nullable instead of optional
  investigator_notes: string | null; // ✅ Nullable instead of optional
  remarks: string | null; // ✅ Nullable instead of optional
  follow_up: string | null; // ✅ Nullable instead of optional
  visibility: Visibility; // ✅ Required field, remove optional
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
  narrative: string | null; 
  testimony: string | null;
}

export interface CrimeCaseTransactionResult {
  case_id?: number;
  location_id?: number;
  success: boolean;
  message: string;
  error?: string;
}

export type CasePersonRecord =
  Database["public"]["Tables"]["case_person"]["Row"] & {
    person_profile: Database["public"]["Tables"]["person_profile"]["Row"] | null;
    suspect?: Database["public"]["Tables"]["suspect"]["Row"] | null;
    complainant?: Database["public"]["Tables"]["complainant"]["Row"] | null;
    witness?: Database["public"]["Tables"]["witness"]["Row"] | null;
  };

type CasePersonWithProfile = Pick<
  Database["public"]["Tables"]["case_person"]["Row"],
  "case_role"
> & {
  person_profile: Pick<
    Database["public"]["Tables"]["person_profile"]["Row"],
    "first_name" | "last_name"
  > | null;
};

export type CrimeCaseListRecord = Pick<
  Database["public"]["Tables"]["crime_case"]["Row"],
  "id" | "crime_type" | "case_status"
> & {
  case_person: CasePersonWithProfile[] | null;
};

export type CrimeCaseListItem = {
  id: number;
  crime_type: number | null;
  case_status: CaseStatus | null;
  suspect: string;
  complainant: string;
};

type LocationRow = Database["public"]["Tables"]["location"]["Row"];

export type CrimeLocationForMap = Pick<
  LocationRow,
  "lat" | "long" | "crime_location" | "landmark"
>;

export type CrimeCaseMapRecord = Pick<
  Database["public"]["Tables"]["crime_case"]["Row"],
  "id" | "case_number" | "case_status" | "crime_type" | "incident_datetime" | "location_id"
> & {
  location: CrimeLocationForMap | null;
};
