import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { aiSafetyResponseSchema } from "./gemini-schema";
import { analyticsResponseSchema } from "./analytics-schema";

// Validate API key at module load time
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GOOGLE_GEMINI_API_KEY environment variable is not set");
}

// Initialize the Gemini client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Get a configured Gemini model for safety analysis
 * Uses gemini-2.0-flash-exp for fast, cost-effective responses
 */
export function getSafetyAnalysisModel(): GenerativeModel {
  if (!genAI) {
    throw new Error("Gemini API key is not configured");
  }

  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.3, // Lower temperature for consistent safety advice
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: aiSafetyResponseSchema,
    },
  });
}

/**
 * Get a configured Gemini model for analytics insights
 * Uses the same model but with analytics response schema
 */
export function getAnalyticsModel(): GenerativeModel {
  if (!genAI) {
    throw new Error("Gemini API key is not configured");
  }

  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.4, // Slightly higher for more creative insights
      topP: 0.85,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: analyticsResponseSchema,
    },
  });
}

export { genAI };
