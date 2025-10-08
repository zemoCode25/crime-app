import { TypedSupabaseClient } from "@/types/supabase-client";
import { CrimeCaseData, LocationData, PersonData } from "@/types/crime-case";

export async function getTableCrimeCases(client: TypedSupabaseClient) {
  return client
    .from("crime_case")
    .select(
      `
      id,
      crime_type,
      case_status,
      case_person (
        case_role,
        person_profile ( 
          first_name, 
          last_name 
        )
      )
      `
    )
    .order("id", { ascending: true });
}

export async function getCrimeCaseById(
  client: TypedSupabaseClient,
  caseId: number
) {
  return client
    .from("crime_case")
    .select(
      `
      id,
      crime_type,
      case_status,
      case_person (
        case_role,
        person_profile ( 
          first_name, 
          last_name 
        )
      )
      `
    ).eq("id", caseId)
  }
      

export async function createCrimeCaseTransaction(
  client: TypedSupabaseClient,
  caseData: CrimeCaseData,
  locationData: LocationData,
  personsData: PersonData[]
) {
  return client.rpc('insert_crime_case_transaction', {
    case_data: JSON.parse(JSON.stringify(caseData)),
    location_data: JSON.parse(JSON.stringify(locationData)),
    persons_data: JSON.parse(JSON.stringify(personsData))
  });
}

export async function updateCrimeCaseTransaction(
  client: TypedSupabaseClient,
  caseId: number,
  caseData: CrimeCaseData,
  locationData: LocationData,
  personsData: PersonData[]
) {
  return client.rpc('update_crime_case_transaction', {
    case_id: caseId,
    case_data: JSON.parse(JSON.stringify(caseData)),
    location_data: JSON.parse(JSON.stringify(locationData)),
    persons_data: JSON.parse(JSON.stringify(personsData))
  });
}

export async function deleteCrimeCaseTransaction(
  client: TypedSupabaseClient,
  caseId: number
) {
  return client.rpc('delete_crime_case_transaction', {
    case_id: caseId
  });
}

