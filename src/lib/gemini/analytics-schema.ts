import { SchemaType, type Schema } from "@google/generative-ai";

// ============================================
// TypeScript Interfaces
// ============================================

/** Single AI-generated insight about the crime data */
export interface CrimeInsight {
  insight: string; // The insight text (1-2 sentences)
  type: "trend" | "peak" | "anomaly" | "comparison"; // Type of insight
}

/** Complete AI analytics response */
export interface CrimeAnalyticsAI {
  insights: CrimeInsight[]; // 4 insights about the data
  summary: string; // Overall summary of the crime trends
  generatedAt: string;
}

/** Input data for AI analytics */
export interface AnalyticsInput {
  dailyCounts: {
    date: string;
    count: number;
    label: string;
  }[];
  crimeType: string; // "All crime types" or specific type
  barangay: string; // "All barangays" or specific barangay
  status: string; // "All statuses" or specific status
  dateRange: {
    from: string; // ISO date string
    to: string; // ISO date string
  };
}

// ============================================
// Gemini Response Schema Definition
// ============================================

export const analyticsResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    insights: {
      type: SchemaType.ARRAY,
      description: "4 data-driven insights about the crime trends",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          insight: {
            type: SchemaType.STRING,
            description: "Concise insight (1-2 sentences) with specific data",
          },
          type: {
            type: SchemaType.STRING,
            format: "enum" as const,
            enum: ["trend", "peak", "anomaly", "comparison"],
            description: "Type of insight",
          },
        },
        required: ["insight", "type"],
      },
    },
    summary: {
      type: SchemaType.STRING,
      description: "1-sentence overall summary of crime trends in the period",
    },
  },
  required: ["insights", "summary"],
};
