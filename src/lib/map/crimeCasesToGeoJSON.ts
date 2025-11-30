import type { Feature, FeatureCollection, Point } from "geojson";
import type { CrimeCaseMapRecord } from "@/types/crime-case";

export function crimeCasesToGeoJSON(
  cases: CrimeCaseMapRecord[],
): FeatureCollection<Point> {
  const features: Feature<Point>[] = cases
    .filter((c) => c.location && c.location.lat != null && c.location.long != null)
    .map((c) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        // GeoJSON expects [longitude, latitude]
        coordinates: [c.location!.long as number, c.location!.lat as number],
      },
      properties: {
        id: c.id,
        case_number: c.case_number,
        case_status: c.case_status,
        crime_type: c.crime_type,
        crime_location: c.location!.crime_location,
        landmark: c.location!.landmark,
        incident_datetime: c.incident_datetime,
      },
    }));

  return {
    type: "FeatureCollection",
    features,
  };
}

