import type { Feature, FeatureCollection, Point } from 'geojson';
import type { Facility, FacilityType } from '@/types/facilities';

export interface FacilityFeatureProperties {
  id: number;
  type: FacilityType;
  name: string;
  address?: string;
  openingHours?: string;
  phone?: string;
  icon: string;
}

// Map facility types to Mapbox Maki icon names
const FACILITY_ICONS: Record<FacilityType, string> = {
  hospital: 'hospital',
  police: 'police',
  fire_station: 'fire-station',
  clinic: 'doctor',
  government: 'town-hall',
};

export function facilitiesToGeoJSON(
  facilities: Facility[]
): FeatureCollection<Point, FacilityFeatureProperties> {
  const features: Feature<Point, FacilityFeatureProperties>[] = facilities
    .filter((f) => f.lat != null && f.lng != null)
    .map((f) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [f.lng, f.lat], // GeoJSON: [longitude, latitude]
      },
      properties: {
        id: f.id,
        type: f.type,
        name: f.name,
        address: f.address,
        openingHours: f.openingHours,
        phone: f.phone,
        icon: FACILITY_ICONS[f.type] || 'marker',
      },
    }));

  return {
    type: 'FeatureCollection',
    features,
  };
}
