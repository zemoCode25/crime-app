export type FormSchemaType = {
  description: string;
  crime_type: string;
  case_status: string;
  report_datetime: unknown;
  incident_datetime: unknown;
  investigator_notes?: string;
  follow_up?: string;
  remarks?: string;
  persons: {
    first_name: string;
    last_name: string;
    address: string;
    civil_status: string;
    contact_number: string;
    sex: string;
    birth_date: unknown;
    person_notified?: string;
    related_contact?: string;
    case_role: string;
    motive?: string;
    weapon_used?: string;
    narrative?: string;
    testimony?: string;
  }[];
};
