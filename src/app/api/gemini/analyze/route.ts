import { NextRequest, NextResponse } from "next/server";
import { analyzeCrimeData } from "@/server/queries/gemini";
import type {
  SafetyAnalysisInput,
  AISafetyAnalysis,
} from "@/lib/gemini/gemini-schema";

// Response type for the API
interface AnalyzeResponse {
  success: boolean;
  analysis?: AISafetyAnalysis;
  error?: string;
  cached?: boolean;
}

// Simple in-memory cache for AI responses
// Key: coordinate grid + risk level, Value: { analysis, timestamp }
const responseCache = new Map<
  string,
  { analysis: AISafetyAnalysis; timestamp: number }
>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(input: SafetyAnalysisInput): string {
  // Round coordinates to ~100m grid for cache key
  const gridLat = Math.round(input.coordinates.lat * 1000) / 1000;
  const gridLng = Math.round(input.coordinates.lng * 1000) / 1000;
  const crimeHash = input.crimeTypes
    .slice(0, 3)
    .map((c) => `${c.type}:${c.count}`)
    .join("|");
  return `${gridLat},${gridLng}|${input.riskLevel}|${input.crimeCount}|${crimeHash}`;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = await request.json();
    const input = body as SafetyAnalysisInput;

    // Validate required fields
    if (!input.riskLevel || !input.coordinates) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: riskLevel, coordinates",
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(input);
    const cached = responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("Returning cached AI analysis");
      return NextResponse.json({
        success: true,
        analysis: cached.analysis,
        cached: true,
      });
    }

    console.log(
      `Generating AI safety analysis for risk level: ${input.riskLevel}`
    );

    // Generate AI analysis
    const analysis = await analyzeCrimeData(input);

    // Cache the result
    responseCache.set(cacheKey, {
      analysis,
      timestamp: Date.now(),
    });

    // Clean old cache entries periodically
    if (responseCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          responseCache.delete(key);
        }
      }
    }

    console.log("AI analysis generated successfully");

    return NextResponse.json({
      success: true,
      analysis,
      cached: false,
    });
  } catch (error) {
    console.error("Error generating AI analysis:", error);

    // Return graceful fallback for AI failures
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "AI analysis failed",
      },
      { status: 500 }
    );
  }
}
