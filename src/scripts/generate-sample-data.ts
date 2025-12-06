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
// CONFIGURATION - MUNTINLUPA CITY BARANGAYS
// ============================================================================

interface Barangay {
  name: string;
  id: number;
  latRange: { min: number; max: number };
  lngRange: { min: number; max: number };
  crimeCount: number;
  riskLevel: 'VERY LOW' | 'LOW' | 'MEDIUM' | 'MEDIUM-HIGH' | 'HIGH';
  hotspots: number;
}

const BARANGAYS: Barangay[] = [
  {
    name: 'Poblacion',
    id: 1,
    latRange: { min: 14.380, max: 14.390 },
    lngRange: { min: 121.040, max: 121.046 },
    crimeCount: 25,
    riskLevel: 'HIGH',
    hotspots: 3,
  },
  {
    name: 'Tunasan',
    id: 2,
    latRange: { min: 14.370, max: 14.380 },
    lngRange: { min: 121.045, max: 121.055 },
    crimeCount: 20,
    riskLevel: 'HIGH',
    hotspots: 2,
  },
  {
    name: 'Putatan',
    id: 3,
    latRange: { min: 14.390, max: 14.405 },
    lngRange: { min: 121.035, max: 121.045 },
    crimeCount: 15,
    riskLevel: 'MEDIUM-HIGH',
    hotspots: 2,
  },
  {
    name: 'Bayanan',
    id: 4,
    latRange: { min: 14.380, max: 14.395 },
    lngRange: { min: 121.048, max: 121.058 },
    crimeCount: 12,
    riskLevel: 'MEDIUM',
    hotspots: 1,
  },
  {
    name: 'Sucat',
    id: 9,
    latRange: { min: 14.410, max: 14.425 },
    lngRange: { min: 121.040, max: 121.050 },
    crimeCount: 10,
    riskLevel: 'MEDIUM',
    hotspots: 1,
  },
  {
    name: 'Alabang',
    id: 5,
    latRange: { min: 14.410, max: 14.430 },
    lngRange: { min: 121.030, max: 121.040 },
    crimeCount: 8,
    riskLevel: 'MEDIUM',
    hotspots: 1,
  },
  {
    name: 'Cupang',
    id: 8,
    latRange: { min: 14.395, max: 14.410 },
    lngRange: { min: 121.050, max: 121.060 },
    crimeCount: 5,
    riskLevel: 'LOW',
    hotspots: 0,
  },
  {
    name: 'Buli',
    id: 7,
    latRange: { min: 14.375, max: 14.390 },
    lngRange: { min: 121.055, max: 121.065 },
    crimeCount: 3,
    riskLevel: 'LOW',
    hotspots: 0,
  },
  {
    name: 'Ayala Alabang',
    id: 6,
    latRange: { min: 14.420, max: 14.430 },
    lngRange: { min: 121.045, max: 121.060 },
    crimeCount: 2,
    riskLevel: 'VERY LOW',
    hotspots: 0,
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
  hotspotRadius: 0.0015, // ~165m radius for hotspots
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
  case_number: string;
  case_status: typeof STATUSES[number];
}

function generateBarangayCrimes(barangay: Barangay, caseNumberStart: number): CrimeData[] {
  const crimes: CrimeData[] = [];
  let caseCounter = caseNumberStart;

  // Generate HOTSPOT crimes (60% of crimes in hotspot areas)
  if (barangay.hotspots > 0) {
    const crimesPerHotspot = Math.floor((barangay.crimeCount * 0.6) / barangay.hotspots);

    for (let h = 0; h < barangay.hotspots; h++) {
      // Create a hotspot location
      const hotspotLat = randomInRange(barangay.latRange.min, barangay.latRange.max);
      const hotspotLng = randomInRange(barangay.lngRange.min, barangay.lngRange.max);

      // Generate multiple crimes at this hotspot
      for (let i = 0; i < crimesPerHotspot; i++) {
        const incident = randomDate(CONFIG.dateRange.start, CONFIG.dateRange.end);
        const hour = weightedRandomHour();
        incident.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

        crimes.push({
          lat: hotspotLat + (Math.random() - 0.5) * CONFIG.hotspotRadius * 2,
          lng: hotspotLng + (Math.random() - 0.5) * CONFIG.hotspotRadius * 2,
          landmark: `${barangay.name} Hotspot ${h + 1}`,
          barangay_id: barangay.id,
          barangay_name: barangay.name,
          incident_datetime: incident,
          crime_type: weightedRandomCrimeType(),
          case_number: `MNT-2024-${String(caseCounter++).padStart(4, '0')}`,
          case_status: randomItem(STATUSES),
        });
      }
    }
  }

  // Generate SCATTERED crimes (remaining 40% in unique locations)
  const remainingCrimes = barangay.crimeCount - crimes.length;

  for (let i = 0; i < remainingCrimes; i++) {
    const incident = randomDate(CONFIG.dateRange.start, CONFIG.dateRange.end);
    const hour = weightedRandomHour();
    incident.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    crimes.push({
      lat: randomInRange(barangay.latRange.min, barangay.latRange.max),
      lng: randomInRange(barangay.lngRange.min, barangay.lngRange.max),
      landmark: `${barangay.name} Area ${i + 1}`,
      barangay_id: barangay.id,
      barangay_name: barangay.name,
      incident_datetime: incident,
      crime_type: weightedRandomCrimeType(),
      case_number: `MNT-2024-${String(caseCounter++).padStart(4, '0')}`,
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
        case_number: crime.case_number,
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
  console.log('🗺️  Generating Muntinlupa City-wide crime data...\n');

  let caseCounter = 1;
  let totalGenerated = 0;

  for (const barangay of BARANGAYS) {
    console.log(`📍 Generating ${barangay.crimeCount} crimes for Brgy. ${barangay.name} (${barangay.riskLevel})`);

    // Generate crimes for this barangay
    const crimes = generateBarangayCrimes(barangay, caseCounter);
    caseCounter += crimes.length;

    // Insert crimes into database
    let successCount = 0;
    for (const crime of crimes) {
      const success = await insertCrimeRecord(crime);
      if (success) successCount++;
    }

    totalGenerated += successCount;
    console.log(`   ✅ Generated ${successCount}/${crimes.length} crimes for ${barangay.name}`);
  }

  // Summary
  console.log(`\n✅ Successfully generated ${totalGenerated} crimes across Muntinlupa City!`);

  // Distribution visualization
  console.log('\n📊 DISTRIBUTION SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const totalCrimes = BARANGAYS.reduce((sum, b) => sum + b.crimeCount, 0);

  for (const barangay of BARANGAYS) {
    const percentage = ((barangay.crimeCount / totalCrimes) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(barangay.crimeCount / 2));
    console.log(`${barangay.name.padEnd(20)} ${bar} ${barangay.crimeCount} (${percentage}%)`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Additional stats
  console.log('\n📈 STATISTICS:');
  console.log(`   • Total Crimes: ${totalCrimes}`);
  console.log(`   • Date Range: ${CONFIG.dateRange.start.toDateString()} to ${CONFIG.dateRange.end.toDateString()}`);
  console.log(`   • High Risk Barangays: ${BARANGAYS.filter(b => b.riskLevel === 'HIGH').length}`);
  console.log(`   • Total Hotspots: ${BARANGAYS.reduce((sum, b) => sum + b.hotspots, 0)}`);
}

// ============================================================================
// RUN SCRIPT
// ============================================================================

if (require.main === module) {
  generateMuntinlupaData()
    .then(() => {
      console.log('\n🎉 Data generation complete!\n');
      console.log('Next steps:');
      console.log('1. Run: npx tsx src/server/queries/sync-to-bigquery.ts');
      console.log('2. Train BigQuery ML model in BigQuery Console');
      console.log('3. Test predictions on your dashboard\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { generateMuntinlupaData };
