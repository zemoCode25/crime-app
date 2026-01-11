export type FacilityType =
  | 'hospital'
  | 'police'
  | 'fire_station'
  | 'clinic'
  | 'government';

export interface Facility {
  id: number;
  type: FacilityType;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  openingHours?: string;
  phone?: string;
  amenity?: string;
}

export interface FacilitiesResponse {
  success: boolean;
  data: Facility[];
  metadata: {
    count: number;
    lastUpdated: string;
    bounds: {
      south: number;
      west: number;
      north: number;
      east: number;
    };
  };
  error?: string;
}

// OSM element types from Overpass API
export interface OSMTags {
  name?: string;
  amenity?: string;
  office?: string;
  'addr:full'?: string;
  'addr:street'?: string;
  'addr:housenumber'?: string;
  'addr:city'?: string;
  opening_hours?: string;
  phone?: string;
  'contact:phone'?: string;
}

export interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: OSMTags;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OSMElement[];
}
