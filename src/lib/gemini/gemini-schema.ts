import { SchemaType, type Schema } from "@google/generative-ai";

// ============================================
// TypeScript Interfaces
// ============================================

/** Individual risk explanation about surrounding crime patterns */
export interface RiskExplanation {
  title: string; // e.g., "High Theft Activity"
  description: string; // e.g., "This area has 45% theft incidents..."
  severity: "low" | "medium" | "high";
}

/** Individual safety tip with actionable advice */
export interface SafetyTip {
  tip: string; // e.g., "Keep valuables hidden and secure"
  context: string; // e.g., "Due to high theft rates in this area"
  priority: "essential" | "recommended" | "optional";
}

/** Time-based risk insight */
export interface TimePattern {
  period: string; // e.g., "Evening hours (6PM-10PM)"
  riskLevel: string; // e.g., "Higher risk"
  advice: string; // e.g., "Avoid walking alone during these hours"
}

/** Complete AI analysis response */
export interface AISafetyAnalysis {
  riskExplanations: RiskExplanation[];
  safetyTips: SafetyTip[];
  timePatterns: TimePattern[];
  overallSummary: string;
  generatedAt: string;
}

/** Input data for AI analysis */
export interface SafetyAnalysisInput {
  riskLevel: "HIGH" | "MEDIUM_HIGH" | "MEDIUM" | "LOW_MEDIUM" | "LOW";
  crimeCount: number;
  crimeTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

// ============================================
// Gemini Response Schema Definition
// ============================================

/**
 * Schema for Gemini's structured output
 * Uses the SDK's SchemaType enum for type definitions
 */
export const aiSafetyResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    riskExplanations: {
      type: SchemaType.ARRAY,
      description:
        "3 concise explanations analyzing crime patterns in the area",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: "Short title summarizing the risk factor (max 5 words)",
          },
          description: {
            type: SchemaType.STRING,
            description:
              "Brief explanation of the crime pattern (1-2 sentences)",
          },
          severity: {
            type: SchemaType.STRING,
            format: "enum" as const,
            enum: ["low", "medium", "high"],
            description: "Severity level of this specific risk factor",
          },
        },
        required: ["title", "description", "severity"],
      },
    },
    safetyTips: {
      type: SchemaType.ARRAY,
      description: "3 actionable safety recommendations",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          tip: {
            type: SchemaType.STRING,
            description: "Clear, actionable safety advice (1 sentence)",
          },
          context: {
            type: SchemaType.STRING,
            description: "Why this tip is relevant based on the crime data",
          },
          priority: {
            type: SchemaType.STRING,
            format: "enum" as const,
            enum: ["essential", "recommended", "optional"],
            description: "Priority level of following this tip",
          },
        },
        required: ["tip", "context", "priority"],
      },
    },
    timePatterns: {
      type: SchemaType.ARRAY,
      description: "Time-based risk patterns if time data is available",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          period: {
            type: SchemaType.STRING,
            description: "Time period description",
          },
          riskLevel: {
            type: SchemaType.STRING,
            description: "Risk level during this period",
          },
          advice: {
            type: SchemaType.STRING,
            description: "Specific advice for this time period",
          },
        },
        required: ["period", "riskLevel", "advice"],
      },
    },
    overallSummary: {
      type: SchemaType.STRING,
      description: "A 1-2 sentence summary of the overall safety situation",
    },
  },
  required: ["riskExplanations", "safetyTips", "overallSummary"],
};
