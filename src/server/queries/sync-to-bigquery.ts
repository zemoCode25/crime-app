// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncCrimeCases() {
  // Dynamically import BigQuery after env vars are loaded
  const { dataset } = await import('@/lib/bigquery');
  console.log('Starting crime cases sync...');

  // Fetch crime types first
  const { data: crimeTypes, error: typesError } = await supabase
    .from('crime-type')
    .select('*');

  if (typesError) {
    console.error('Error fetching crime types:', typesError);
    return;
  }

  // Create a map for quick lookup
  const crimeTypeMap = new Map(crimeTypes.map(type => [type.id, type]));

  // Fetch data from Supabase
  const { data: crimes, error } = await supabase
    .from('crime_case')
    .select(`
      *,
      location (*)
    `);

  if (error) {
    console.error('Error fetching crimes:', error);
    return;
  }

  // Transform data for BigQuery
  const rows = crimes.map(crime => {
    const crimeType = crime.crime_type ? crimeTypeMap.get(crime.crime_type) : null;

    return {
      id: crime.id,
      case_number: crime.case_number,
      case_status: crime.case_status,
      crime_type_id: crime.crime_type,
      crime_type_name: crimeType?.name,
      description: crime.description,
      incident_datetime: crime.incident_datetime,
      report_datetime: crime.report_datetime,
      location_id: crime.location_id,
      latitude: crime.location?.lat,
      longitude: crime.location?.long,
      crime_location: crime.location?.crime_location,
      landmark: crime.location?.landmark,
      barangay: crime.location?.barangay,
      visibility: crime.visibility,
      investigator: crime.investigator,
      created_at: crime.created_at,
      // Computed fields for analytics
      incident_date: crime.incident_datetime ? new Date(crime.incident_datetime).toISOString().split('T')[0] : null,
      incident_hour: crime.incident_datetime ? new Date(crime.incident_datetime).getHours() : null,
      incident_day_of_week: crime.incident_datetime ? new Date(crime.incident_datetime).toLocaleDateString('en-US', { weekday: 'long' }) : null,
      incident_month: crime.incident_datetime ? new Date(crime.incident_datetime).getMonth() + 1 : null,
      incident_year: crime.incident_datetime ? new Date(crime.incident_datetime).getFullYear() : null,
    };
  });

  // Insert into BigQuery
  const { bigquery } = await import('@/lib/bigquery');
  const table = dataset.table('crime_cases');

  console.log(`Preparing to sync ${rows.length} crime cases...`);

  try {
    // Create table if it doesn't exist
    const [exists] = await table.exists();
    if (!exists) {
      console.log('Creating crime_cases table...');
      await table.create({
        schema: [
          { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
          { name: 'case_number', type: 'STRING' },
          { name: 'case_status', type: 'STRING' },
          { name: 'crime_type_id', type: 'INTEGER' },
          { name: 'crime_type_name', type: 'STRING' },
          { name: 'description', type: 'STRING' },
          { name: 'incident_datetime', type: 'TIMESTAMP' },
          { name: 'report_datetime', type: 'TIMESTAMP' },
          { name: 'location_id', type: 'INTEGER' },
          { name: 'latitude', type: 'FLOAT' },
          { name: 'longitude', type: 'FLOAT' },
          { name: 'crime_location', type: 'STRING' },
          { name: 'landmark', type: 'STRING' },
          { name: 'barangay', type: 'INTEGER' },
          { name: 'visibility', type: 'STRING' },
          { name: 'investigator', type: 'STRING' },
          { name: 'created_at', type: 'TIMESTAMP' },
          { name: 'incident_date', type: 'DATE' },
          { name: 'incident_hour', type: 'INTEGER' },
          { name: 'incident_day_of_week', type: 'STRING' },
          { name: 'incident_month', type: 'INTEGER' },
          { name: 'incident_year', type: 'INTEGER' },
        ],
      });
      console.log('Table created successfully');
    } else {
      // Truncate existing data
      console.log('Truncating existing crime cases data...');
      await bigquery.query(`TRUNCATE TABLE \`muntin-crime-map.crime_analytics.crime_cases\``);
    }

    // Insert new data
    console.log('Inserting rows...');
    await table.insert(rows);
    console.log(`✅ Successfully synced ${rows.length} crime cases to BigQuery`);
  } catch (error) {
    console.error('❌ Error inserting crime cases to BigQuery:', error);
    throw error;
  }
}

async function syncCrimeTypes() {
  // Dynamically import BigQuery after env vars are loaded
  const { bigquery, dataset } = await import('@/lib/bigquery');
  console.log('Starting crime types sync...');

  const { data: types, error } = await supabase
    .from('crime-type')
    .select('*');

  if (error) {
    console.error('Error fetching crime types:', error);
    return;
  }

  const rows = types.map(type => ({
    id: type.id,
    name: type.name,
    label: type.label,
    color: type.color,
    severity_level: 'medium'
  }));

  const table = dataset.table('crime_types');

  console.log(`Preparing to sync ${rows.length} crime types...`);

  try {
    // Create table if it doesn't exist
    const [exists] = await table.exists();
    if (!exists) {
      console.log('Creating crime_types table...');
      await table.create({
        schema: [
          { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
          { name: 'name', type: 'STRING' },
          { name: 'label', type: 'STRING' },
          { name: 'color', type: 'STRING' },
          { name: 'severity_level', type: 'STRING' },
        ],
      });
      console.log('Table created successfully');
    } else {
      // Truncate existing data
      console.log('Truncating existing crime types data...');
      await bigquery.query(`TRUNCATE TABLE \`muntin-crime-map.crime_analytics.crime_types\``);
    }

    // Insert new data
    console.log('Inserting rows...');
    await table.insert(rows);
    console.log(`✅ Successfully synced ${rows.length} crime types to BigQuery`);
  } catch (error) {
    console.error('❌ Error inserting crime types to BigQuery:', error);
    throw error;
  }
}

// Run sync
(async () => {
  try {
    console.log('🚀 Starting BigQuery sync...\n');

    await syncCrimeTypes();
    console.log('');

    await syncCrimeCases();
    console.log('');

    console.log('✅ All syncs completed successfully!');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
})();