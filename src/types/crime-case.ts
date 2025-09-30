
export interface CrimeCaseData {
  case_number?: string;
  crime_type?: "murder" | "assault" | "robbery" | "homicide" | "fraud";
  case_status?: "Open" | "Under Investigation" | "Case Settled" | "Lupon" | "Direct filing" | "For Record" | "Turn-over";
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
  barangay?: "poblacion" | "tunasan" | "putatan" | "bayanan" | "alabang" | "ayala alabang" | "buli" | "cupang" | "sucat";
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
  birth_date?: string;
  sex?: "male" | "female";
  civil_status?: "single" | "married" | "widowed" | "divorced" | "legally separated" | "annulled";
  address?: string;
  contact_number?: string;
  person_notified?: string;
  related_contact?: string;
  
  // Case involvement
  case_role: "suspect" | "complainant" | "witness";
  
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