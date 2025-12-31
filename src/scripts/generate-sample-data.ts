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

type RiskLevel = 'HIGH' | 'MEDIUM_HIGH' | 'MEDIUM' | 'LOW_MEDIUM' | 'LOW';

interface Hotspot {
  name: string;
  barangay: string;
  barangay_id: number;
  lat: number;
  lng: number;
  crimeCount: number;
  density: RiskLevel;
}


const CONFIG = {
  dateRange: {
    start: new Date('2025-01-01'),
    end: new Date('2025-12-31'),
  },
  visibilityPublicRate: 0.85,
  reportDelayHours: { min: 0, max: 24 },
  batchSize: 10, // Insert records in batches for better performance
  // Max safe radius to stay within same 3-decimal grid cell (~111m cells)
  clustering: {
    HIGH: 0.0004,        // ~22m radius - stays within grid cell
    MEDIUM_HIGH: 0.0004, // ~22m radius
    MEDIUM: 0.00045,     // ~25m radius
    LOW_MEDIUM: 0.00045, // ~25m radius
    LOW: 0.00045,        // ~25m radius
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

// HIGH RISK: 8-10 crimes (5 locations = 45 crimes = 40.9%)
// Grid-aligned coordinates (exactly 3 decimals) to ensure crimes stay in same BigQuery grid cell
const HIGH_RISK_ZONES: Hotspot[] = [
  { name: 'Near New Bilibid Prison', barangay: 'Poblacion', barangay_id: 1, lat: 14.385, lng: 121.042, crimeCount: 10, density: 'HIGH' },
  { name: 'Poblacion Commercial Center', barangay: 'Poblacion', barangay_id: 1, lat: 14.383, lng: 121.043, crimeCount: 9, density: 'HIGH' },
  { name: 'Tunasan Market Area', barangay: 'Tunasan', barangay_id: 2, lat: 14.375, lng: 121.048, crimeCount: 9, density: 'HIGH' },
  { name: 'Putatan Main Road Junction', barangay: 'Putatan', barangay_id: 3, lat: 14.398, lng: 121.040, crimeCount: 9, density: 'HIGH' },
  { name: 'Bayanan Commercial District', barangay: 'Bayanan', barangay_id: 4, lat: 14.388, lng: 121.052, crimeCount: 8, density: 'HIGH' },
];

// MEDIUM-HIGH RISK: 5-7 crimes (5 locations = 30 crimes = 27.3%)
const MEDIUM_HIGH_RISK_ZONES: Hotspot[] = [
  { name: 'Poblacion Purok 3', barangay: 'Poblacion', barangay_id: 1, lat: 14.381, lng: 121.041, crimeCount: 6, density: 'MEDIUM_HIGH' },
  { name: 'Tunasan Highway Junction', barangay: 'Tunasan', barangay_id: 2, lat: 14.372, lng: 121.050, crimeCount: 6, density: 'MEDIUM_HIGH' },
  { name: 'Putatan East Residential', barangay: 'Putatan', barangay_id: 3, lat: 14.400, lng: 121.043, crimeCount: 6, density: 'MEDIUM_HIGH' },
  { name: 'Bayanan Purok 5', barangay: 'Bayanan', barangay_id: 4, lat: 14.390, lng: 121.054, crimeCount: 6, density: 'MEDIUM_HIGH' },
  { name: 'Sucat Town Center', barangay: 'Sucat', barangay_id: 9, lat: 14.418, lng: 121.046, crimeCount: 6, density: 'MEDIUM_HIGH' },
];

// MEDIUM RISK: 3-4 crimes (5 locations = 17 crimes = 15.5%)
const MEDIUM_RISK_ZONES: Hotspot[] = [
  { name: 'Sucat Residential Area', barangay: 'Sucat', barangay_id: 9, lat: 14.420, lng: 121.044, crimeCount: 4, density: 'MEDIUM' },
  { name: 'Alabang Commercial Zone', barangay: 'Alabang', barangay_id: 5, lat: 14.422, lng: 121.034, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Cupang Main Street', barangay: 'Cupang', barangay_id: 8, lat: 14.402, lng: 121.054, crimeCount: 3, density: 'MEDIUM' },
  { name: 'Putatan North Area', barangay: 'Putatan', barangay_id: 3, lat: 14.404, lng: 121.041, crimeCount: 4, density: 'MEDIUM' },
  { name: 'Bayanan West Side', barangay: 'Bayanan', barangay_id: 4, lat: 14.386, lng: 121.050, crimeCount: 3, density: 'MEDIUM' },
];

// LOW-MEDIUM RISK: 2 crimes (5 locations = 10 crimes = 9.1%)
const LOW_MEDIUM_RISK_ZONES: Hotspot[] = [
  { name: 'Alabang Hills', barangay: 'Alabang', barangay_id: 5, lat: 14.424, lng: 121.036, crimeCount: 2, density: 'LOW_MEDIUM' },
  { name: 'Sucat East', barangay: 'Sucat', barangay_id: 9, lat: 14.421, lng: 121.047, crimeCount: 2, density: 'LOW_MEDIUM' },
  { name: 'Cupang North', barangay: 'Cupang', barangay_id: 8, lat: 14.405, lng: 121.056, crimeCount: 2, density: 'LOW_MEDIUM' },
  { name: 'Buli Main Road', barangay: 'Buli', barangay_id: 7, lat: 14.382, lng: 121.059, crimeCount: 2, density: 'LOW_MEDIUM' },
  { name: 'Tunasan South', barangay: 'Tunasan', barangay_id: 2, lat: 14.371, lng: 121.049, crimeCount: 2, density: 'LOW_MEDIUM' },
];

// LOW RISK: 1 crime per cell (8 distinct grid cells = 8 crimes = 7.3%)
// Each coordinate is a unique grid cell to ensure 1 crime per cell
const LOW_RISK_ZONES: Hotspot[] = [
  { name: 'Ayala Alabang Village A', barangay: 'Ayala Alabang', barangay_id: 6, lat: 14.426, lng: 121.048, crimeCount: 1, density: 'LOW' },
  { name: 'Ayala Alabang Village B', barangay: 'Ayala Alabang', barangay_id: 6, lat: 14.428, lng: 121.050, crimeCount: 1, density: 'LOW' },
  { name: 'Ayala Alabang Village C', barangay: 'Ayala Alabang', barangay_id: 6, lat: 14.430, lng: 121.052, crimeCount: 1, density: 'LOW' },
  { name: 'Buli Residential', barangay: 'Buli', barangay_id: 7, lat: 14.378, lng: 121.058, crimeCount: 1, density: 'LOW' },
  { name: 'Buli South', barangay: 'Buli', barangay_id: 7, lat: 14.376, lng: 121.060, crimeCount: 1, density: 'LOW' },
  { name: 'Cupang Village', barangay: 'Cupang', barangay_id: 8, lat: 14.396, lng: 121.052, crimeCount: 1, density: 'LOW' },
  { name: 'Cupang East', barangay: 'Cupang', barangay_id: 8, lat: 14.398, lng: 121.058, crimeCount: 1, density: 'LOW' },
  { name: 'Poblacion Quiet Area', barangay: 'Poblacion', barangay_id: 1, lat: 14.387, lng: 121.044, crimeCount: 1, density: 'LOW' },
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
  const radius = CONFIG.clustering[hotspot.density];
  const records: CrimeRecord[] = [];

  for (let i = 0; i < hotspot.crimeCount; i++) {
    const lat = hotspot.lat + (Math.random() - 0.5) * radius * 2;
    const lng = hotspot.lng + (Math.random() - 0.5) * radius * 2;
    records.push(generateCrimeRecord(lat, lng, hotspot.name, hotspot.barangay_id, hotspot.barangay));
  }

  return records;
}


// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function clearExistingData(): Promise<void> {
  Logger.section('CLEARING EXISTING DATA');

  // Delete crime_case first (references location via FK)
  Logger.info('Deleting existing crime cases...');
  const { error: crimeCaseError } = await supabase
    .from('crime_case')
    .delete()
    .neq('id', 0);

  if (crimeCaseError) {
    throw new Error(`Failed to delete crime cases: ${crimeCaseError.message}`);
  }
  Logger.success('Deleted all crime cases');

  // Then delete locations
  Logger.info('Deleting existing locations...');
  const { error: locationError } = await supabase
    .from('location')
    .delete()
    .neq('id', 0);

  if (locationError) {
    throw new Error(`Failed to delete locations: ${locationError.message}`);
  }
  Logger.success('Deleted all locations');
}

function validateGridAlignment(zones: Hotspot[]): void {
  const usedCells = new Map<string, string>();

  for (const zone of zones) {
    // Round to 3 decimals as BigQuery does
    const gridLat = Math.round(zone.lat * 1000) / 1000;
    const gridLng = Math.round(zone.lng * 1000) / 1000;
    const cellId = `${gridLat},${gridLng}`;

    if (usedCells.has(cellId)) {
      throw new Error(
        `Duplicate grid cell detected: ${cellId}\n` +
        `  - "${usedCells.get(cellId)}" and "${zone.name}" share the same cell`
      );
    }
    usedCells.set(cellId, zone.name);

    // Warn if coordinates aren't exactly grid-aligned
    if (zone.lat !== gridLat || zone.lng !== gridLng) {
      Logger.warn(
        `Zone "${zone.name}" not grid-aligned: (${zone.lat}, ${zone.lng}) -> (${gridLat}, ${gridLng})`
      );
    }
  }

  Logger.success(`Validated ${usedCells.size} unique grid cells`);
}

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

  Logger.header('MUNTINLUPA CITY CRIME DATA GENERATOR (GRID-ALIGNED)');
  Logger.info(`Database: ${SUPABASE_URL}`);
  Logger.info(`Date Range: ${CONFIG.dateRange.start.toDateString()} - ${CONFIG.dateRange.end.toDateString()}`);

  // ---- STEP 0: Validate grid alignment ----
  Logger.section('VALIDATING GRID ALIGNMENT');
  const allZones = [
    ...HIGH_RISK_ZONES,
    ...MEDIUM_HIGH_RISK_ZONES,
    ...MEDIUM_RISK_ZONES,
    ...LOW_MEDIUM_RISK_ZONES,
    ...LOW_RISK_ZONES,
  ];
  validateGridAlignment(allZones);

  // ---- STEP 1: Clear existing data ----
  await clearExistingData();

  // ---- PHASE 1: High Risk (8-10 crimes each) ----
  Logger.section('PHASE 1: HIGH RISK (8-10 crimes each)');

  let phase1Records: CrimeRecord[] = [];
  for (const zone of HIGH_RISK_ZONES) {
    phase1Records = phase1Records.concat(generateHotspotRecords(zone));
    Logger.info(`Generated ${zone.crimeCount} records for ${zone.name}`);
  }

  Logger.info(`Inserting ${phase1Records.length} high-risk records...`);
  const phase1Result = await insertCrimeRecords(phase1Records);
  results.push({
    name: 'High Risk',
    locations: HIGH_RISK_ZONES.length,
    targetCrimes: phase1Records.length,
    inserted: phase1Result.success,
    failed: phase1Result.failed,
  });
  Logger.success(`Phase 1 complete: ${phase1Result.success} inserted, ${phase1Result.failed} failed`);

  // ---- PHASE 2: Medium-High Risk (5-7 crimes each) ----
  Logger.section('PHASE 2: MEDIUM-HIGH RISK (5-7 crimes each)');

  let phase2Records: CrimeRecord[] = [];
  for (const zone of MEDIUM_HIGH_RISK_ZONES) {
    phase2Records = phase2Records.concat(generateHotspotRecords(zone));
    Logger.info(`Generated ${zone.crimeCount} records for ${zone.name}`);
  }

  Logger.info(`Inserting ${phase2Records.length} medium-high risk records...`);
  const phase2Result = await insertCrimeRecords(phase2Records);
  results.push({
    name: 'Medium-High Risk',
    locations: MEDIUM_HIGH_RISK_ZONES.length,
    targetCrimes: phase2Records.length,
    inserted: phase2Result.success,
    failed: phase2Result.failed,
  });
  Logger.success(`Phase 2 complete: ${phase2Result.success} inserted, ${phase2Result.failed} failed`);

  // ---- PHASE 3: Medium Risk (3-4 crimes each) ----
  Logger.section('PHASE 3: MEDIUM RISK (3-4 crimes each)');

  let phase3Records: CrimeRecord[] = [];
  for (const zone of MEDIUM_RISK_ZONES) {
    phase3Records = phase3Records.concat(generateHotspotRecords(zone));
    Logger.info(`Generated ${zone.crimeCount} records for ${zone.name}`);
  }

  Logger.info(`Inserting ${phase3Records.length} medium risk records...`);
  const phase3Result = await insertCrimeRecords(phase3Records);
  results.push({
    name: 'Medium Risk',
    locations: MEDIUM_RISK_ZONES.length,
    targetCrimes: phase3Records.length,
    inserted: phase3Result.success,
    failed: phase3Result.failed,
  });
  Logger.success(`Phase 3 complete: ${phase3Result.success} inserted, ${phase3Result.failed} failed`);

  // ---- PHASE 4: Low-Medium Risk (2 crimes each) ----
  Logger.section('PHASE 4: LOW-MEDIUM RISK (2 crimes each)');

  let phase4Records: CrimeRecord[] = [];
  for (const zone of LOW_MEDIUM_RISK_ZONES) {
    phase4Records = phase4Records.concat(generateHotspotRecords(zone));
    Logger.info(`Generated ${zone.crimeCount} records for ${zone.name}`);
  }

  Logger.info(`Inserting ${phase4Records.length} low-medium risk records...`);
  const phase4Result = await insertCrimeRecords(phase4Records);
  results.push({
    name: 'Low-Medium Risk',
    locations: LOW_MEDIUM_RISK_ZONES.length,
    targetCrimes: phase4Records.length,
    inserted: phase4Result.success,
    failed: phase4Result.failed,
  });
  Logger.success(`Phase 4 complete: ${phase4Result.success} inserted, ${phase4Result.failed} failed`);

  // ---- PHASE 5: Low Risk (1 crime per grid cell) ----
  Logger.section('PHASE 5: LOW RISK (1 crime per cell)');

  let phase5Records: CrimeRecord[] = [];
  for (const zone of LOW_RISK_ZONES) {
    phase5Records = phase5Records.concat(generateHotspotRecords(zone));
    Logger.info(`Generated ${zone.crimeCount} records for ${zone.name}`);
  }

  Logger.info(`Inserting ${phase5Records.length} low risk records...`);
  const phase5Result = await insertCrimeRecords(phase5Records);
  results.push({
    name: 'Low Risk',
    locations: LOW_RISK_ZONES.length,
    targetCrimes: phase5Records.length,
    inserted: phase5Result.success,
    failed: phase5Result.failed,
  });
  Logger.success(`Phase 5 complete: ${phase5Result.success} inserted, ${phase5Result.failed} failed`);

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

  console.log('\n5-Level Distribution:');
  const pct = (n: number) => ((n / totalInserted) * 100).toFixed(1);
  Logger.info(`HIGH (8-10):        ${results[0].inserted} crimes (${pct(results[0].inserted)}%) - Target: 35-45%`);
  Logger.info(`MEDIUM-HIGH (5-7):  ${results[1].inserted} crimes (${pct(results[1].inserted)}%) - Target: 25-30%`);
  Logger.info(`MEDIUM (3-4):       ${results[2].inserted} crimes (${pct(results[2].inserted)}%) - Target: 15-20%`);
  Logger.info(`LOW-MEDIUM (2):     ${results[3].inserted} crimes (${pct(results[3].inserted)}%) - Target: 8-12%`);
  Logger.info(`LOW (1):            ${results[4].inserted} crimes (${pct(results[4].inserted)}%) - Target: 5-10%`);

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
