import { SchemaType, type Schema } from "@google/generative-ai";

// ============================================
// TypeScript Interfaces
// ============================================

/** Single AI-generated insight about distribution data */
export interface DistributionInsight {
  insight: string; // The insight text (1 sentence)
}

/** Complete AI distribution analysis response */
export interface DistributionAnalyticsAI {
  insights: DistributionInsight[]; // 3 insights about the distribution
  generatedAt: string;
}

/** Input data for barangay distribution AI */
export interface BarangayDistributionInput {
  distribution: {
    barangay: string;
    count: number;
    percentage: number;
  }[];
  totalCases: number;
  dateRange: {
    from: string; // ISO date string
    to: string; // ISO date string
  };
}

/** Input data for status distribution AI */
export interface StatusDistributionInput {
  distribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  totalCases: number;
  dateRange: {
    from: string; // ISO date string
    to: string; // ISO date string
  };
}

/** Input data for crime type distribution AI */
export interface CrimeTypeDistributionInput {
  distribution: {
    crimeType: string;
    count: number;
    percentage: number;
  }[];
  totalCases: number;
  dateRange: {
    from: string; // ISO date string
    to: string; // ISO date string
  };
}

// ============================================
// Gemini Response Schema Definition
// ============================================

export const distributionResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    insights: {
      type: SchemaType.ARRAY,
      description: "3 data-driven insights about the distribution",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          insight: {
            type: SchemaType.STRING,
            description: "Concise insight (1 sentence) with specific data about the distribution",
          },
        },
        required: ["insight"],
      },
    },
  },
  required: ["insights"],
};
