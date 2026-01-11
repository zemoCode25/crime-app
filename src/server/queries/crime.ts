import { TypedSupabaseClient } from "@/types/supabase-client";
import { CrimeCaseData, LocationData, PersonData } from "@/types/crime-case";

export async function getTableCrimeCases(
  client: TypedSupabaseClient,
  barangayId?: number
) {
  console.log('Fetching crime cases with barangayId:', barangayId);
  
  // Use different select based on whether we need to filter by barangay
  // When filtering by barangay, we use !inner to perform an inner join
  // which ensures only crime cases with matching location.barangay are returned
  const selectQuery = barangayId !== undefined
    ? `
      id,
      case_number,
      crime_type,
      case_status,
      incident_datetime,
      report_datetime,
      location:location_id!inner (
        barangay
      ),
      case_person (
        case_role,
        person_profile (
          first_name,
          last_name
        )
      )
      `
    : `
      id,
      case_number,
      crime_type,
      case_status,
      incident_datetime,
      report_datetime,
      location:location_id (
        barangay
      ),
      case_person (
        case_role,
        person_profile (
          first_name,
          last_name
        )
      )
      `;

  let query = client
    .from("crime_case")
    .select(selectQuery);

  // Filter by barangay if provided (for barangay_admin users)
  if (barangayId !== undefined) {
    query = query.eq("location.barangay", barangayId);
  }

  return query.order("id", { ascending: false });
}

export async function getCrimeCasesForMap(
  client: TypedSupabaseClient,
  barangayId?: number
) {
  // Use different select based on whether we need to filter by barangay
  // When filtering by barangay, we use !inner to perform an inner join
  const selectQuery = barangayId !== undefined
    ? `
      id,
      case_number,
      case_status,
      crime_type,
      description,
      incident_datetime,
      report_datetime,
      location:location_id!inner (
        lat,
        long,
        crime_location,
        landmark,
        barangay
      )
      `
    : `
      id,
      case_number,
      case_status,
      crime_type,
      description,
      incident_datetime,
      report_datetime,
      location:location_id (
        lat,
        long,
        crime_location,
        landmark,
        barangay
      )
      `;

  let query = client
    .from("crime_case")
    .select(selectQuery);

  // Filter by barangay if provided (for barangay_admin users)
  if (barangayId !== undefined) {
    query = query.eq("location.barangay", barangayId);
  }

  return query.order("id", { ascending: false });
}

export async function getCrimeCaseById(client: TypedSupabaseClient, caseId: number) {
  const result = await client
    .from("crime_case")
    .select(`
      *,
      location (*),
      case_person (
        *,
        person_profile (*),
        suspect!suspect_id_fkey (*),
        complainant!complainant_id_fkey (*),
        witness!witness_id_fkey (*)
      )
    `)
    .eq("id", caseId)
    .single();
  return result;
}

// ✅ Export the inferred type
export type CrimeCaseByIdResult = Awaited<ReturnType<typeof getCrimeCaseById>>;
export type CrimeCaseById = CrimeCaseByIdResult['data'];

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
  console.log('Updating crime case with ID:', caseId);
  console.log('Case ID type:', typeof caseId);
  
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
  return client.from('crime_case').delete().eq('id', caseId);
}



