// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../server/supabase/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// CONFIGURATION - MUNTINLUPA CITY HOTSPOTS
// ============================================================================

interface Hotspot {
  name: string;
  barangay: string;
  barangay_id: number;
  lat: number;
  lng: number;
  crimeCount: number;
  density: 'HIGH' | 'MEDIUM' | 'LOW';
}

// HIGH DENSITY HOTSPOTS (8-10 crimes per location)
const HIGH_DENSITY_HOTSPOTS: Hotspot[] = [
  {
    name: 'Near New Bilibid Prison',
    barangay: 'Poblacion',
    barangay_id: 1,
    lat: 14.3850,
    lng: 121.0420,
    crimeCount: 10,
    density: 'HIGH',
  },
  {
    name: 'Poblacion Commercial Center',
    barangay: 'Poblacion',
    barangay_id: 1,
    lat: 14.3832,
    lng: 121.0432,
    crimeCount: 8,
    density: 'HIGH',
  },
  {
    name: 'Tunasan Market Area',
    barangay: 'Tunasan',
    barangay_id: 2,
    lat: 14.3755,
    lng: 121.0485,
    crimeCount: 8,
    density: 'HIGH',
  },
  {
    name: 'Putatan Main Road',
    barangay: 'Putatan',
    barangay_id: 3,
    lat: 14.3975,
    lng: 121.0395,
    crimeCount: 7,
    density: 'HIGH',
  },
  {
    name: 'Bayanan Commercial District',
    barangay: 'Bayanan',
    barangay_id: 4,
    lat: 14.3880,
    lng: 121.0525,
    crimeCount: 7,
    density: 'HIGH',
  },
];

// MEDIUM DENSITY ZONES (3 crimes per location)
const MEDIUM_DENSITY_ZONES: Hotspot[] = [
  {
    name: 'Poblacion Residential Area',
    barangay: 'Poblacion',
    barangay_id: 1,
    lat: 14.3845,
    lng: 121.0415,
    crimeCount: 3,
    density: 'MEDIUM',
  },
  {
    name: 'Tunasan Highway Junction',
    barangay: 'Tunasan',
    barangay_id: 2,
    lat: 14.3725,
    lng: 121.0505,
    crimeCount: 3,
    density: 'MEDIUM',
  },
  {
    name: 'Putatan East Side',
    barangay: 'Putatan',
    barangay_id: 3,
    lat: 14.4000,
    lng: 121.0425,
    crimeCount: 3,
    density: 'MEDIUM',
  },
  {
    name: 'Bayanan Purok 5',
    barangay: 'Bayanan',
    barangay_id: 4,
    lat: 14.3895,
    lng: 121.0545,
    crimeCount: 3,
    density: 'MEDIUM',
  },
  {
    name: 'Sucat Town Center',
    barangay: 'Sucat',
    barangay_id: 9,
    lat: 14.4175,
    lng: 121.0455,
    crimeCount: 3,
    density: 'MEDIUM',
  },
  {
    name: 'Sucat Residential Zone',
    barangay: 'Sucat',
    barangay_id: 9,
    lat: 14.4195,
    lng: 121.0435,
    crimeCount: 3,
    density: 'MEDIUM',
  },
  {
    name: 'Alabang Commercial Zone',
    barangay: 'Alabang',
    barangay_id: 5,
    lat: 14.4225,
    lng: 121.0345,
    crimeCount: 3,
    density: 'MEDIUM',
  },
  {
    name: 'Cupang Main Street',
    barangay: 'Cupang',
    barangay_id: 8,
    lat: 14.4025,
    lng: 121.0545,
    crimeCount: 3,
    density: 'MEDIUM',
  },
  {
    name: 'Putatan North',
    barangay: 'Putatan',
    barangay_id: 3,
    lat: 14.4035,
    lng: 121.0405,
    crimeCount: 3,
    density: 'MEDIUM',
  },
  {
    name: 'Bayanan West',
    barangay: 'Bayanan',
    barangay_id: 4,
    lat: 14.3865,
    lng: 121.0495,
    crimeCount: 3,
    density: 'MEDIUM',
  },
];

// LOW DENSITY SCATTERED AREAS (1 crime per random location)
interface ScatteredArea {
  barangay: string;
  barangay_id: number;
  latRange: { min: number; max: number };
  lngRange: { min: number; max: number };
  count: number;
}

const SCATTERED_AREAS: ScatteredArea[] = [
  {
    barangay: 'Poblacion',
    barangay_id: 1,
    latRange: { min: 14.380, max: 14.390 },
    lngRange: { min: 121.040, max: 121.046 },
    count: 5,
  },
  {
    barangay: 'Tunasan',
    barangay_id: 2,
    latRange: { min: 14.370, max: 14.380 },
    lngRange: { min: 121.045, max: 121.055 },
    count: 5,
  },
  {
    barangay: 'Putatan',
    barangay_id: 3,
    latRange: { min: 14.390, max: 14.405 },
    lngRange: { min: 121.035, max: 121.045 },
    count: 5,
  },
  {
    barangay: 'Bayanan',
    barangay_id: 4,
    latRange: { min: 14.380, max: 14.395 },
    lngRange: { min: 121.048, max: 121.058 },
    count: 4,
  },
  {
    barangay: 'Sucat',
    barangay_id: 9,
    latRange: { min: 14.410, max: 14.425 },
    lngRange: { min: 121.040, max: 121.050 },
    count: 4,
  },
  {
    barangay: 'Alabang',
    barangay_id: 5,
    latRange: { min: 14.410, max: 14.430 },
    lngRange: { min: 121.030, max: 121.040 },
    count: 3,
  },
  {
    barangay: 'Cupang',
    barangay_id: 8,
    latRange: { min: 14.395, max: 14.410 },
    lngRange: { min: 121.050, max: 121.060 },
    count: 2,
  },
  {
    barangay: 'Buli',
    barangay_id: 7,
    latRange: { min: 14.375, max: 14.390 },
    lngRange: { min: 121.055, max: 121.065 },
    count: 1,
  },
  {
    barangay: 'Ayala Alabang',
    barangay_id: 6,
    latRange: { min: 14.420, max: 14.430 },
    lngRange: { min: 121.045, max: 121.060 },
    count: 1,
  },
];

const CRIME_TYPES = [
  { id: 1, name: 'Theft', likelihood: 0.30 },
  { id: 2, name: 'Physical Injury', likelihood: 0.20 },
  { id: 3, name: 'Domestic Violence', likelihood: 0.15 },
  { id: 4, name: 'Drug-related', likelihood: 0.15 },
  { id: 5, name: 'Vandalism', likelihood: 0.10 },
  { id: 6, name: 'Trespassing', likelihood: 0.05 },
  { id: 7, name: 'Others', likelihood: 0.05 },
] as const;

const STATUSES = ['open', 'under investigation', 'case settled', 'lupon', 'for record'] as const;

const HOUR_WEIGHTS = [
  { range: [0, 6], weight: 5 },    // Late night (low activity)
  { range: [6, 12], weight: 15 },  // Morning
  { range: [12, 14], weight: 5 },  // Noon
  { range: [14, 18], weight: 15 }, // Afternoon
  { range: [18, 22], weight: 40 }, // Evening peak (highest crime)
  { range: [22, 24], weight: 20 }, // Night
] as const;

const CONFIG = {
  dateRange: {
    start: new Date('2024-06-01'),
    end: new Date('2024-12-31'),
  },
  visibilityPublicRate: 0.85, // 85% public
  reportDelayHours: { min: 0, max: 24 },
  // TIGHT CLUSTERING: Keep crimes within same 110m grid cell
  highDensityRadius: 0.0004, // ~22m radius (±0.0002 deg offset keeps in same grid)
  mediumDensityRadius: 0.0006, // ~33m radius (±0.0003 deg offset)
  investigators: ['PO1 Santos', 'PO2 Reyes', 'PO1 Cruz', 'PO2 Dela Cruz'],
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function weightedRandomHour(): number {
  const totalWeight = HOUR_WEIGHTS.reduce((sum, hw) => sum + hw.weight, 0);
  let random = Math.random() * totalWeight;

  for (const hw of HOUR_WEIGHTS) {
    random -= hw.weight;
    if (random <= 0) {
      const [min, max] = hw.range;
      return min + Math.floor(Math.random() * (max - min));
    }
  }
  return 18; // Default to evening
}

function weightedRandomCrimeType(): number {
  const random = Math.random();
  let cumulative = 0;

  for (const ct of CRIME_TYPES) {
    cumulative += ct.likelihood;
    if (random <= cumulative) {
      return ct.id;
    }
  }
  return 1; // Default to theft
}

// ============================================================================
// CRIME DATA GENERATION
// ============================================================================

interface CrimeData {
  lat: number;
  lng: number;
  landmark: string;
  barangay_id: number;
  barangay_name: string;
  incident_datetime: Date;
  crime_type: number;
  case_status: typeof STATUSES[number];
}

// Note: case_number is now auto-generated by the database
// from the primary key ID and incident year in format: CASE-YYYY-NNNN

function generateHotspotCrimes(hotspot: Hotspot): CrimeData[] {
  const crimes: CrimeData[] = [];
  const radius = hotspot.density === 'HIGH' ? CONFIG.highDensityRadius : CONFIG.mediumDensityRadius;

  for (let i = 0; i < hotspot.crimeCount; i++) {
    const incident = randomDate(CONFIG.dateRange.start, CONFIG.dateRange.end);
    const hour = weightedRandomHour();
    incident.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    // TIGHT CLUSTERING: Very small offset to keep crimes in same grid cell
    // For HIGH density: ±0.0002 degrees = ±22m (stays within 110m grid)
    // For MEDIUM density: ±0.0003 degrees = ±33m (mostly same grid, some adjacent)
    const offsetLat = hotspot.lat + (Math.random() - 0.5) * radius * 2;
    const offsetLng = hotspot.lng + (Math.random() - 0.5) * radius * 2;

    crimes.push({
      lat: offsetLat,
      lng: offsetLng,
      landmark: hotspot.name,
      barangay_id: hotspot.barangay_id,
      barangay_name: hotspot.barangay,
      incident_datetime: incident,
      crime_type: weightedRandomCrimeType(),
      case_status: randomItem(STATUSES),
    });
  }

  return crimes;
}

function generateScatteredCrimes(area: ScatteredArea): CrimeData[] {
  const crimes: CrimeData[] = [];

  for (let i = 0; i < area.count; i++) {
    const incident = randomDate(CONFIG.dateRange.start, CONFIG.dateRange.end);
    const hour = weightedRandomHour();
    incident.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    // Fully random location within the barangay bounds
    const lat = randomInRange(area.latRange.min, area.latRange.max);
    const lng = randomInRange(area.lngRange.min, area.lngRange.max);

    crimes.push({
      lat,
      lng,
      landmark: `${area.barangay} Street ${i + 1}`,
      barangay_id: area.barangay_id,
      barangay_name: area.barangay,
      incident_datetime: incident,
      crime_type: weightedRandomCrimeType(),
      case_status: randomItem(STATUSES),
    });
  }

  return crimes;
}

// ============================================================================
// DATABASE INSERTION
// ============================================================================

async function insertCrimeRecord(crime: CrimeData): Promise<boolean> {
  try {
    // 1. Create location
    const { data: locationData, error: locationError } = await supabase
      .from('location')
      .insert({
        lat: crime.lat,
        long: crime.lng,
        crime_location: `${crime.landmark} vicinity`,
        landmark: crime.landmark,
        barangay: crime.barangay_id,
      })
      .select()
      .single();

    if (locationError) throw locationError;

    // 2. Create crime case
    const reportDelay = randomInRange(
      CONFIG.reportDelayHours.min,
      CONFIG.reportDelayHours.max
    ) * 3600000;

    const { error: crimeError } = await supabase
      .from('crime_case')
      .insert({
        // Note: case_number is auto-generated by database from primary key ID
        // Format: CASE-YYYY-NNNN (e.g., CASE-2024-0042)
        crime_type: crime.crime_type,
        incident_datetime: crime.incident_datetime.toISOString(),
        report_datetime: new Date(crime.incident_datetime.getTime() + reportDelay).toISOString(),
        location_id: locationData.id,
        case_status: crime.case_status,
        description: `Crime incident in ${crime.barangay_name}`,
        visibility: Math.random() < CONFIG.visibilityPublicRate ? 'public' : 'private',
        investigator: randomItem(CONFIG.investigators),
      });

    if (crimeError) throw crimeError;

    return true;
  } catch (error) {
    console.error(`   ❌ Error creating crime:`, error);
    return false;
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function generateMuntinlupaData() {
  console.log('🗺️  Generating Muntinlupa City with TIGHT HOTSPOTS...\n');
  console.log('🎯 Strategy: Minimize offsets to keep crimes in same 110m grid cell\n');

  let totalGenerated = 0;

  // 1. GENERATE HIGH CONCENTRATION HOTSPOTS
  console.log('🔥 Creating HIGH CONCENTRATION HOTSPOTS (7-10 crimes each)...');
  for (const hotspot of HIGH_DENSITY_HOTSPOTS) {
    console.log(`   📍 ${hotspot.name} (${hotspot.barangay}): ${hotspot.crimeCount} crimes`);

    const crimes = generateHotspotCrimes(hotspot);

    let successCount = 0;
    for (const crime of crimes) {
      const success = await insertCrimeRecord(crime);
      if (success) successCount++;
    }

    totalGenerated += successCount;
    console.log(`      ✅ Created ${successCount} crimes (tight cluster)`);
  }

  // 2. GENERATE MEDIUM CONCENTRATION ZONES
  console.log('\n🟡 Creating MEDIUM CONCENTRATION ZONES (3 crimes each)...');
  for (const zone of MEDIUM_DENSITY_ZONES) {
    console.log(`   📍 ${zone.name} (${zone.barangay}): ${zone.crimeCount} crimes`);

    const crimes = generateHotspotCrimes(zone);

    let successCount = 0;
    for (const crime of crimes) {
      const success = await insertCrimeRecord(crime);
      if (success) successCount++;
    }

    totalGenerated += successCount;
    console.log(`      ✅ Created ${successCount} crimes (moderate cluster)`);
  }

  // 3. GENERATE SCATTERED SINGLE CRIMES
  console.log('\n🟢 Creating SCATTERED SINGLE CRIMES (1 per location)...');
  for (const area of SCATTERED_AREAS) {
    console.log(`   📍 ${area.barangay}: ${area.count} scattered crimes`);

    const crimes = generateScatteredCrimes(area);

    let successCount = 0;
    for (const crime of crimes) {
      const success = await insertCrimeRecord(crime);
      if (success) successCount++;
    }

    totalGenerated += successCount;
    console.log(`      ✅ Created ${successCount} scattered crimes`);
  }

  // Summary
  console.log(`\n✅ Successfully generated ${totalGenerated} crimes across Muntinlupa City!`);

  // Distribution breakdown
  const highDensityTotal = HIGH_DENSITY_HOTSPOTS.reduce((sum, h) => sum + h.crimeCount, 0);
  const mediumDensityTotal = MEDIUM_DENSITY_ZONES.reduce((sum, h) => sum + h.crimeCount, 0);
  const scatteredTotal = SCATTERED_AREAS.reduce((sum, a) => sum + a.count, 0);
  const totalCrimes = highDensityTotal + mediumDensityTotal + scatteredTotal;

  console.log('\n📊 FINAL DISTRIBUTION (TIGHT CLUSTERING):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`HIGH RISK (7-10 crimes):    ${HIGH_DENSITY_HOTSPOTS.length} locations  = ${highDensityTotal} crimes`);
  console.log(`MEDIUM RISK (3 crimes):    ${MEDIUM_DENSITY_ZONES.length} locations  = ${mediumDensityTotal} crimes`);
  console.log(`LOW RISK (1 crime):        ${scatteredTotal} locations  = ${scatteredTotal} crimes`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nTOTAL: ${totalCrimes} crimes across ${HIGH_DENSITY_HOTSPOTS.length + MEDIUM_DENSITY_ZONES.length + scatteredTotal} unique locations`);

  console.log('\n📈 STATISTICS:');
  console.log(`   • Date Range: ${CONFIG.dateRange.start.toDateString()} to ${CONFIG.dateRange.end.toDateString()}`);
  console.log(`   • High Density Hotspots: ${HIGH_DENSITY_HOTSPOTS.length}`);
  console.log(`   • Medium Density Zones: ${MEDIUM_DENSITY_ZONES.length}`);
  console.log(`   • Scattered Crime Locations: ${scatteredTotal}`);

  console.log('\n💡 OFFSET STRATEGY (Grid-Aware):');
  console.log('   Hotspots: ±22m (keeps within same 110m grid cell)');
  console.log('   Medium: ±33m (mostly same cell, some adjacent)');
  console.log('   Scattered: Fully random (guaranteed unique)');
}

// ============================================================================
// RUN SCRIPT
// ============================================================================

if (require.main === module) {
  generateMuntinlupaData()
    .then(() => {
      console.log('\n🎉 Data generation complete!\n');
      console.log('📋 Next steps:');
      console.log('1. Run: npx tsx src/server/queries/sync-to-bigquery.ts');
      console.log('2. Verify distribution in BigQuery');
      console.log('3. Train ML model with threshold of 5+');
      console.log('4. Test predictions\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { generateMuntinlupaData };
