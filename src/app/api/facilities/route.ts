import { NextResponse } from 'next/server';
import type {
  Facility,
  FacilityType,
  FacilitiesResponse,
  OSMElement,
  OverpassResponse,
} from '@/types/facilities';

// Muntinlupa City bounds
const MUNTINLUPA_BOUNDS = {
  south: 14.37,
  west: 121.03,
  north: 14.45,
  east: 121.07,
};

// Cache storage
let cachedData: FacilitiesResponse | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function isCacheValid(): boolean {
  return cachedData !== null && Date.now() - cacheTimestamp < CACHE_TTL;
}

// Build Overpass query for all facility types
function buildOverpassQuery(): string {
  const { south, west, north, east } = MUNTINLUPA_BOUNDS;
  const bbox = `${south},${west},${north},${east}`;

  return `
[out:json][timeout:30];
(
  // Hospitals
  node["amenity"="hospital"](${bbox});
  way["amenity"="hospital"](${bbox});

  // Police stations
  node["amenity"="police"](${bbox});
  way["amenity"="police"](${bbox});

  // Fire stations
  node["amenity"="fire_station"](${bbox});
  way["amenity"="fire_station"](${bbox});

  // Clinics and doctors
  node["amenity"="clinic"](${bbox});
  way["amenity"="clinic"](${bbox});
  node["amenity"="doctors"](${bbox});
  way["amenity"="doctors"](${bbox});

  // Government offices
  node["office"="government"](${bbox});
  way["office"="government"](${bbox});
  node["amenity"="townhall"](${bbox});
  way["amenity"="townhall"](${bbox});
);
out center;
`.trim();
}

// Map OSM amenity/office to facility type
function mapToFacilityType(amenity?: string, office?: string): FacilityType {
  if (amenity === 'hospital') return 'hospital';
  if (amenity === 'police') return 'police';
  if (amenity === 'fire_station') return 'fire_station';
  if (amenity === 'clinic' || amenity === 'doctors') return 'clinic';
  if (amenity === 'townhall' || office === 'government') return 'government';
  return 'government'; // Default fallback
}

// Build address from OSM tags
function buildAddress(tags?: OSMElement['tags']): string | undefined {
  if (!tags) return undefined;

  if (tags['addr:full']) {
    return tags['addr:full'];
  }

  const parts: string[] = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:city']) parts.push(tags['addr:city']);

  return parts.length > 0 ? parts.join(', ') : undefined;
}

// Transform OSM elements to Facility objects
function transformOSMToFacilities(elements: OSMElement[]): Facility[] {
  return elements
    .map((el): Facility | null => {
      // For ways, use center coordinates
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;

      // Skip if no coordinates
      if (lat === undefined || lng === undefined) {
        return null;
      }

      const tags = el.tags;
      const facilityType = mapToFacilityType(tags?.amenity, tags?.office);

      return {
        id: el.id,
        type: facilityType,
        name: tags?.name || `${facilityType.replace('_', ' ')} #${el.id}`,
        lat,
        lng,
        address: buildAddress(tags),
        openingHours: tags?.opening_hours,
        phone: tags?.phone || tags?.['contact:phone'],
        amenity: tags?.amenity,
      };
    })
    .filter((f): f is Facility => f !== null);
}

// Fetch data from Overpass API
async function fetchFromOverpass(): Promise<Facility[]> {
  const query = buildOverpassQuery();

  console.log('🏥 Fetching facilities from Overpass API...');

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  const data: OverpassResponse = await response.json();
  console.log(`🏥 Received ${data.elements.length} elements from Overpass`);

  const facilities = transformOSMToFacilities(data.elements);
  console.log(`🏥 Transformed to ${facilities.length} facilities`);

  return facilities;
}

export async function GET() {
  try {
    // Return cached data if valid
    if (isCacheValid() && cachedData) {
      console.log('🏥 Returning cached facility data');
      return NextResponse.json(cachedData);
    }

    // Fetch fresh data from Overpass
    const facilities = await fetchFromOverpass();

    // Update cache
    cachedData = {
      success: true,
      data: facilities,
      metadata: {
        count: facilities.length,
        lastUpdated: new Date().toISOString(),
        bounds: MUNTINLUPA_BOUNDS,
      },
    };
    cacheTimestamp = Date.now();

    return NextResponse.json(cachedData);
  } catch (error) {
    console.error('🏥 Error fetching facilities:', error);

    // Return stale cache if available
    if (cachedData) {
      console.log('🏥 Returning stale cache due to error');
      return NextResponse.json({
        ...cachedData,
        metadata: {
          ...cachedData.metadata,
          stale: true,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch facilities',
        metadata: {
          count: 0,
          lastUpdated: new Date().toISOString(),
          bounds: MUNTINLUPA_BOUNDS,
        },
      } satisfies FacilitiesResponse,
      { status: 500 }
    );
  }
}
