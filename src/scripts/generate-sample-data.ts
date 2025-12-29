// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../server/supabase/database.types';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n[ERROR] Missing required environment variables:');
  if (!SUPABASE_URL) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_SERVICE_KEY) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure .env.local exists with these variables.\n');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// LOGGER UTILITY
// ============================================================================

const Logger = {
  info: (msg: string) => console.log(`[INFO]  ${msg}`),
  success: (msg: string) => console.log(`[OK]    ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN]  ${msg}`),

  header: (title: string) => {
    const line = '='.repeat(60);
    console.log(`\n${line}`);
    console.log(`  ${title}`);
    console.log(`${line}\n`);
  },

  section: (title: string) => {
    console.log(`\n--- ${title} ---\n`);
  },

  progress: (current: number, total: number, label: string) => {
    const percent = Math.round((current / total) * 100);
    const filled = Math.round(percent / 5);
    const bar = '[' + '#'.repeat(filled) + '-'.repeat(20 - filled) + ']';
    process.stdout.write(`\r${bar} ${percent}% | ${label} (${current}/${total})`);
  },

  table: (data: Record<string, string | number>[]) => {
    console.table(data);
  },
};

// ============================================================================
// CONFIGURATION
// ============================================================================

interface Hotspot {
  name: string;
  barangay: string;
  barangay_id: number;
  lat: number;
  lng: number;
  crimeCount: number;
  density: 'HIGH' | 'MEDIUM';
}

interface ScatteredArea {
  barangay: string;
  barangay_id: number;
  latRange: { min: number; max: number };
  lngRange: { min: number; max: number };
  count: number;
}

const CONFIG = {
  dateRange: {
    start: new Date('2024-06-01'),
    end: new Date('2024-12-31'),
  },
  visibilityPublicRate: 0.85,
  reportDelayHours: { min: 0, max: 24 },
  batchSize: 10, // Insert records in batches for better performance
  clustering: {
    high: 0.0004,   // ~22m radius for tight clustering
    medium: 0.0006, // ~33m radius for moderate clustering
  },
  investigators: ['PO1 Santos', 'PO2 Reyes', 'PO1 Cruz', 'PO2 Dela Cruz'],
} as const;

const CRIME_TYPES = [
  { id: 1, name: 'Theft', weight: 30 },
  { id: 2, name: 'Physical Injury', weight: 20 },
  { id: 3, name: 'Domestic Violence', weight: 15 },
  { id: 4, name: 'Drug-related', weight: 15 },
  { id: 5, name: 'Vandalism', weight: 10 },
  { id: 6, name: 'Trespassing', weight: 5 },
  { id: 7, name: 'Others', weight: 5 },
] as const;

const STATUSES = ['open', 'under investigation', 'case settled', 'lupon', 'for record', 'direct filing', 'turn-over'] as const;
type CaseStatus = (typeof STATUSES)[number];
type Visibility = 'public' | 'private';

const HOUR_WEIGHTS = [
  { range: [0, 6], weight: 5 },    // Late night
  { range: [6, 12], weight: 15 },  // Morning
  { range: [12, 14], weight: 5 },  // Noon
  { range: [14, 18], weight: 15 }, // Afternoon
  { range: [18, 22], weight: 40 }, // Evening (peak)
  { range: [22, 24], weight: 20 }, // Night
] as const;

// HIGH DENSITY HOTSPOTS (7-10 crimes each)
const HIGH_DENSITY_HOTSPOTS: Hotspot[] = [
  { name: 'Near New Bilibid Prison', barangay: 'Poblacion', barangay_id: 1, lat: 14.3850, lng: 121.0420, crimeCount: 10, density: 'HIGH' },
  { name: 'Poblacion Commercial Center', barangay: 'Poblacion', barangay_id: 1, lat: 14.3832, lng: 121.0432, crimeCount: 8, density: 'HIGH' },
  { name: 'Tunasan Market Area', barangay: 'Tunasan', barangay_id: 2, lat: 14.3755, lng: 121.0485, crimeCount: 8, density: 'HIGH' },
  { name: 'Putatan Main Road', barangay: 'Putatan', barangay_id: 3, lat: 14.3975, lng: 121.0395, crimeCount: 7, density: 'HIGH' },
  { name: 'Bayanan Commercial District', barangay: 'Bayanan', barangay_id: 4, lat: 14.3880, lng: 121.0525, crimeCount: 7, density: 'HIGH' },
];

// MEDIUM DENSITY ZONES (3 crimes each)
const MEDIUM_DENSITY_ZONES: Hotspot[] = [
  { name: 'Poblacion Residential Area', barangay: 'Poblacion', barangay_id: 1, lat: 14.3845, lng: 121.0415, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Tunasan Highway Junction', barangay: 'Tunasan', barangay_id: 2, lat: 14.3725, lng: 121.0505, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Putatan East Side', barangay: 'Putatan', barangay_id: 3, lat: 14.4000, lng: 121.0425, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Bayanan Purok 5', barangay: 'Bayanan', barangay_id: 4, lat: 14.3895, lng: 121.0545, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Sucat Town Center', barangay: 'Sucat', barangay_id: 9, lat: 14.4175, lng: 121.0455, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Sucat Residential Zone', barangay: 'Sucat', barangay_id: 9, lat: 14.4195, lng: 121.0435, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Alabang Commercial Zone', barangay: 'Alabang', barangay_id: 5, lat: 14.4225, lng: 121.0345, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Cupang Main Street', barangay: 'Cupang', barangay_id: 8, lat: 14.4025, lng: 121.0545, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Putatan North', barangay: 'Putatan', barangay_id: 3, lat: 14.4035, lng: 121.0405, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Bayanan West', barangay: 'Bayanan', barangay_id: 4, lat: 14.3865, lng: 121.0495, crimeCount: 3, density: 'MEDIUM' },
];

// SCATTERED AREAS (1 crime per random location)
const SCATTERED_AREAS: ScatteredArea[] = [
  { barangay: 'Poblacion', barangay_id: 1, latRange: { min: 14.380, max: 14.390 }, lngRange: { min: 121.040, max: 121.046 }, count: 5 },
  { barangay: 'Tunasan', barangay_id: 2, latRange: { min: 14.370, max: 14.380 }, lngRange: { min: 121.045, max: 121.055 }, count: 5 },
  { barangay: 'Putatan', barangay_id: 3, latRange: { min: 14.390, max: 14.405 }, lngRange: { min: 121.035, max: 121.045 }, count: 5 },
  { barangay: 'Bayanan', barangay_id: 4, latRange: { min: 14.380, max: 14.395 }, lngRange: { min: 121.048, max: 121.058 }, count: 4 },
  { barangay: 'Sucat', barangay_id: 9, latRange: { min: 14.410, max: 14.425 }, lngRange: { min: 121.040, max: 121.050 }, count: 4 },
  { barangay: 'Alabang', barangay_id: 5, latRange: { min: 14.410, max: 14.430 }, lngRange: { min: 121.030, max: 121.040 }, count: 3 },
  { barangay: 'Cupang', barangay_id: 8, latRange: { min: 14.395, max: 14.410 }, lngRange: { min: 121.050, max: 121.060 }, count: 2 },
  { barangay: 'Buli', barangay_id: 7, latRange: { min: 14.375, max: 14.390 }, lngRange: { min: 121.055, max: 121.065 }, count: 1 },
  { barangay: 'Ayala Alabang', barangay_id: 6, latRange: { min: 14.420, max: 14.430 }, lngRange: { min: 121.045, max: 121.060 }, count: 1 },
];

// ============================================================================
// RANDOM UTILITIES
// ============================================================================

const Random = {
  inRange: (min: number, max: number): number => min + Math.random() * (max - min),

  date: (start: Date, end: Date): Date =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),

  item: <T>(array: readonly T[]): T => array[Math.floor(Math.random() * array.length)],

  weighted: <T extends { weight: number }>(items: readonly T[]): T => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) return item;
    }
    return items[0];
  },

  hour: (): number => {
    const hw = Random.weighted(HOUR_WEIGHTS);
    const [min, max] = hw.range;
    return min + Math.floor(Math.random() * (max - min));
  },

  crimeType: (): number => Random.weighted(CRIME_TYPES).id,
};

// ============================================================================
// CRIME DATA GENERATION
// ============================================================================

interface CrimeRecord {
  location: {
    lat: number;
    long: number;
    crime_location: string;
    landmark: string;
    barangay: number;
  };
  crime: {
    crime_type: number;
    incident_datetime: string;
    report_datetime: string;
    case_status: CaseStatus;
    description: string;
    visibility: Visibility;
    investigator: string;
  };
}

function generateCrimeRecord(
  lat: number,
  lng: number,
  landmark: string,
  barangayId: number,
  barangayName: string
): CrimeRecord {
  const incident = Random.date(CONFIG.dateRange.start, CONFIG.dateRange.end);
  incident.setHours(Random.hour(), Math.floor(Math.random() * 60), 0, 0);

  const reportDelay = Random.inRange(CONFIG.reportDelayHours.min, CONFIG.reportDelayHours.max) * 3600000;
  const reportTime = new Date(incident.getTime() + reportDelay);

  return {
    location: {
      lat,
      long: lng,
      crime_location: `${landmark} vicinity`,
      landmark,
      barangay: barangayId,
    },
    crime: {
      crime_type: Random.crimeType(),
      incident_datetime: incident.toISOString(),
      report_datetime: reportTime.toISOString(),
      case_status: Random.item(STATUSES),
      description: `Crime incident in ${barangayName}`,
      visibility: (Math.random() < CONFIG.visibilityPublicRate ? 'public' : 'private') as Visibility,
      investigator: Random.item(CONFIG.investigators),
    },
  };
}

function generateHotspotRecords(hotspot: Hotspot): CrimeRecord[] {
  const radius = hotspot.density === 'HIGH' ? CONFIG.clustering.high : CONFIG.clustering.medium;
  const records: CrimeRecord[] = [];

  for (let i = 0; i < hotspot.crimeCount; i++) {
    const lat = hotspot.lat + (Math.random() - 0.5) * radius * 2;
    const lng = hotspot.lng + (Math.random() - 0.5) * radius * 2;
    records.push(generateCrimeRecord(lat, lng, hotspot.name, hotspot.barangay_id, hotspot.barangay));
  }

  return records;
}

function generateScatteredRecords(area: ScatteredArea): CrimeRecord[] {
  const records: CrimeRecord[] = [];

  for (let i = 0; i < area.count; i++) {
    const lat = Random.inRange(area.latRange.min, area.latRange.max);
    const lng = Random.inRange(area.lngRange.min, area.lngRange.max);
    const landmark = `${area.barangay} Street ${i + 1}`;
    records.push(generateCrimeRecord(lat, lng, landmark, area.barangay_id, area.barangay));
  }

  return records;
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function insertCrimeRecords(records: CrimeRecord[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const record of records) {
    try {
      // Insert location
      const { data: locationData, error: locationError } = await supabase
        .from('location')
        .insert(record.location)
        .select('id')
        .single();

      if (locationError) throw locationError;

      // Insert crime case
      const { error: crimeError } = await supabase
        .from('crime_case')
        .insert({
          ...record.crime,
          location_id: locationData.id,
        });

      if (crimeError) throw crimeError;
      success++;
    } catch (error) {
      failed++;
      Logger.error(`Insert failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { success, failed };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

interface PhaseResult {
  name: string;
  locations: number;
  targetCrimes: number;
  inserted: number;
  failed: number;
}

async function generateSampleData(): Promise<void> {
  const startTime = Date.now();
  const results: PhaseResult[] = [];

  Logger.header('MUNTINLUPA CITY CRIME DATA GENERATOR');
  Logger.info(`Database: ${SUPABASE_URL}`);
  Logger.info(`Date Range: ${CONFIG.dateRange.start.toDateString()} - ${CONFIG.dateRange.end.toDateString()}`);

  // ---- PHASE 1: High Density Hotspots ----
  Logger.section('PHASE 1: High Density Hotspots (7-10 crimes each)');

  let phase1Records: CrimeRecord[] = [];
  for (const hotspot of HIGH_DENSITY_HOTSPOTS) {
    phase1Records = phase1Records.concat(generateHotspotRecords(hotspot));
    Logger.info(`Generated ${hotspot.crimeCount} records for ${hotspot.name}`);
  }

  Logger.info(`Inserting ${phase1Records.length} high-density records...`);
  const phase1Result = await insertCrimeRecords(phase1Records);
  results.push({
    name: 'High Density',
    locations: HIGH_DENSITY_HOTSPOTS.length,
    targetCrimes: phase1Records.length,
    inserted: phase1Result.success,
    failed: phase1Result.failed,
  });
  Logger.success(`Phase 1 complete: ${phase1Result.success} inserted, ${phase1Result.failed} failed`);

  // ---- PHASE 2: Medium Density Zones ----
  Logger.section('PHASE 2: Medium Density Zones (3 crimes each)');

  let phase2Records: CrimeRecord[] = [];
  for (const zone of MEDIUM_DENSITY_ZONES) {
    phase2Records = phase2Records.concat(generateHotspotRecords(zone));
    Logger.info(`Generated ${zone.crimeCount} records for ${zone.name}`);
  }

  Logger.info(`Inserting ${phase2Records.length} medium-density records...`);
  const phase2Result = await insertCrimeRecords(phase2Records);
  results.push({
    name: 'Medium Density',
    locations: MEDIUM_DENSITY_ZONES.length,
    targetCrimes: phase2Records.length,
    inserted: phase2Result.success,
    failed: phase2Result.failed,
  });
  Logger.success(`Phase 2 complete: ${phase2Result.success} inserted, ${phase2Result.failed} failed`);

  // ---- PHASE 3: Scattered Areas ----
  Logger.section('PHASE 3: Scattered Low-Risk Areas (1 crime each)');

  let phase3Records: CrimeRecord[] = [];
  for (const area of SCATTERED_AREAS) {
    phase3Records = phase3Records.concat(generateScatteredRecords(area));
    Logger.info(`Generated ${area.count} records for ${area.barangay}`);
  }

  Logger.info(`Inserting ${phase3Records.length} scattered records...`);
  const phase3Result = await insertCrimeRecords(phase3Records);
  results.push({
    name: 'Scattered',
    locations: SCATTERED_AREAS.length,
    targetCrimes: phase3Records.length,
    inserted: phase3Result.success,
    failed: phase3Result.failed,
  });
  Logger.success(`Phase 3 complete: ${phase3Result.success} inserted, ${phase3Result.failed} failed`);

  // ---- SUMMARY ----
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

  Logger.header('GENERATION COMPLETE');

  console.log('\nResults by Phase:');
  Logger.table(results.map(r => ({
    Phase: r.name,
    Locations: r.locations,
    Target: r.targetCrimes,
    Inserted: r.inserted,
    Failed: r.failed,
  })));

  console.log('\nSummary:');
  Logger.info(`Total Inserted: ${totalInserted}`);
  Logger.info(`Total Failed:   ${totalFailed}`);
  Logger.info(`Duration:       ${elapsed}s`);

  console.log('\nDistribution:');
  Logger.info(`High Risk (7-10 crimes):  ${results[0].inserted} crimes across ${results[0].locations} locations`);
  Logger.info(`Medium Risk (3 crimes):   ${results[1].inserted} crimes across ${results[1].locations} locations`);
  Logger.info(`Low Risk (1 crime):       ${results[2].inserted} scattered incidents`);

  if (totalFailed > 0) {
    Logger.warn(`\n${totalFailed} records failed to insert. Check errors above.`);
  }

  console.log('\nNext Steps:');
  console.log('  1. npx tsx src/server/queries/sync-to-bigquery.ts');
  console.log('  2. Verify distribution in BigQuery');
  console.log('  3. Train ML model\n');
}

// ============================================================================
// RUN
// ============================================================================

if (require.main === module) {
  generateSampleData()
    .then(() => process.exit(0))
    .catch((error) => {
      Logger.error(`Fatal: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    });
}

export { generateSampleData };
