/**
 * Converts BigQuery heatmap predictions to GeoJSON format
 * for use with mapping libraries (Mapbox, Leaflet, etc.)
 */

export interface HeatmapPrediction {
  latitude: number;
  longitude: number;
  predicted_is_high_risk: boolean;
  risk_probability: number;
  historical_crime_count: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat] - GeoJSON standard
  };
  properties: {
    latitude: number;
    longitude: number;
    isHighRisk: boolean;
    riskProbability: number;
    historicalCrimeCount: number;
    riskLevel: 'high' | 'medium' | 'low';
    gridCell: string; // e.g., "14.385,121.042"
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Convert heatmap predictions to GeoJSON FeatureCollection
 */
export function predictionsToGeoJSON(
  predictions: HeatmapPrediction[]
): GeoJSONFeatureCollection {
  const features: GeoJSONFeature[] = predictions.map((prediction) => {
    // Determine risk level based on probability
    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    if (prediction.risk_probability >= 0.7) {
      riskLevel = 'high';
    } else if (prediction.risk_probability >= 0.4) {
      riskLevel = 'medium';
    }

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        // GeoJSON uses [longitude, latitude] order (opposite of typical lat/lng)
        coordinates: [prediction.longitude, prediction.latitude],
      },
      properties: {
        latitude: prediction.latitude,
        longitude: prediction.longitude,
        isHighRisk: prediction.predicted_is_high_risk,
        riskProbability: prediction.risk_probability,
        historicalCrimeCount: prediction.historical_crime_count,
        riskLevel,
        gridCell: `${prediction.latitude},${prediction.longitude}`,
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Filter predictions by risk level
 */
export function filterByRiskLevel(
  predictions: HeatmapPrediction[],
  minProbability: number = 0.5
): HeatmapPrediction[] {
  return predictions.filter((p) => p.risk_probability >= minProbability);
}

/**
 * Get top N highest risk locations
 */
export function getTopRiskLocations(
  predictions: HeatmapPrediction[],
  count: number = 10
): HeatmapPrediction[] {
  return [...predictions]
    .sort((a, b) => b.risk_probability - a.risk_probability)
    .slice(0, count);
}

/**
 * Group predictions by risk level
 */
export function groupByRiskLevel(predictions: HeatmapPrediction[]) {
  return {
    high: predictions.filter((p) => p.risk_probability >= 0.7),
    medium: predictions.filter((p) => p.risk_probability >= 0.4 && p.risk_probability < 0.7),
    low: predictions.filter((p) => p.risk_probability < 0.4),
  };
}
