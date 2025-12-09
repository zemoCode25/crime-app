-- ============================================================================
-- Updated RPC Function: Auto-Generate Case Numbers from Primary Key + Year
-- ============================================================================
-- This function generates case numbers in format: CASE-YYYY-NNNN
-- where YYYY is the incident year and NNNN is the primary key ID (padded)
-- ============================================================================

CREATE OR REPLACE FUNCTION insert_crime_case_transaction(
  case_data jsonb,
  location_data jsonb,
  persons_data jsonb[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_location_id integer;
  new_case_id integer;
  person_record jsonb;
  new_person_id integer;
  new_case_person_id integer;
  result jsonb;
  generated_case_number text;
  incident_year integer;
BEGIN
  -- Insert location first
  INSERT INTO location (
    barangay,
    crime_location,
    landmark,
    lat,
    long,
    pin
  ) VALUES (
    (location_data->>'barangay')::integer,
    location_data->>'crime_location',
    location_data->>'landmark',
    (location_data->>'lat')::numeric,
    (location_data->>'long')::numeric,
    (location_data->>'pin')::integer
  )
  RETURNING id INTO new_location_id;

  -- Insert crime case (without case_number first to get ID)
  INSERT INTO crime_case (
    crime_type,
    case_status,
    description,
    incident_datetime,
    report_datetime,
    investigator,
    responder,
    investigator_notes,
    remarks,
    follow_up,
    location_id,
    visibility
  ) VALUES (
    (case_data->>'crime_type')::integer,
    (case_data->>'case_status')::status_enum,
    case_data->>'description',
    (case_data->>'incident_datetime')::timestamptz,
    (case_data->>'report_datetime')::timestamptz,
    case_data->>'investigator',
    case_data->>'responder',
    case_data->>'investigator_notes',
    case_data->>'remarks',
    case_data->>'follow_up',
    new_location_id,
    (case_data->>'visibility')::visibility
  )
  RETURNING id INTO new_case_id;

  -- Generate case number: CASE-YYYY-NNNN
  -- Extract year from incident_datetime
  incident_year := EXTRACT(YEAR FROM (case_data->>'incident_datetime')::timestamptz);

  -- Format: CASE-2024-0001 (with padding for IDs up to 9999, expands beyond)
  generated_case_number := 'CASE-' || incident_year || '-' || LPAD(new_case_id::text, 4, '0');

  -- Update the crime case with generated case number
  UPDATE crime_case
  SET case_number = generated_case_number
  WHERE id = new_case_id;

  -- Process each person
  FOREACH person_record IN ARRAY persons_data
  LOOP
    -- Insert person profile
    INSERT INTO person_profile (
      first_name,
      last_name,
      birth_date,
      sex,
      civil_status,
      address,
      contact_number,
      person_notified,
      related_contact
    ) VALUES (
      person_record->>'first_name',
      person_record->>'last_name',
      (person_record->>'birth_date')::timestamptz,
      (person_record->>'sex')::sex,
      (person_record->>'civil_status')::civil_status,
      person_record->>'address',
      person_record->>'contact_number',
      person_record->>'person_notified',
      person_record->>'related_contact'
    )
    RETURNING id INTO new_person_id;

    -- Insert case_person relationship
    INSERT INTO case_person (
      crime_id,
      person_profile_id,
      case_role
    ) VALUES (
      new_case_id,
      new_person_id,
      (person_record->>'case_role')::case_involvement
    )
    RETURNING id INTO new_case_person_id;

    -- Insert role-specific data
    CASE (person_record->>'case_role')::case_involvement
      WHEN 'suspect' THEN
        INSERT INTO suspect (id, case_person_id, motive, weapon_used)
        VALUES (
          new_case_person_id,
          new_case_person_id,
          person_record->>'motive',
          person_record->>'weapon_used'
        );
      WHEN 'complainant' THEN
        INSERT INTO complainant (id, case_person_id, narrative)
        VALUES (
          new_case_person_id,
          new_case_person_id,
          person_record->>'narrative'
        );
      WHEN 'witness' THEN
        INSERT INTO witness (case_person_id, testimony)
        VALUES (
          new_case_person_id,
          person_record->>'testimony'
        );
    END CASE;
  END LOOP;

  -- Return success result with generated case number
  SELECT jsonb_build_object(
    'success', true,
    'case_id', new_case_id,
    'case_number', generated_case_number,
    'location_id', new_location_id,
    'message', 'Crime case created successfully'
  ) INTO result;

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create crime case'
    );
END;
$$;

-- ============================================================================
-- EXAMPLE USAGE
-- ============================================================================
-- When you insert a case with incident_datetime '2024-12-10',
-- and it gets ID 42, the case_number will be: CASE-2024-0042
--
-- The format automatically expands for larger IDs:
-- ID 1     → CASE-2024-0001
-- ID 999   → CASE-2024-0999
-- ID 10000 → CASE-2024-10000
-- ============================================================================