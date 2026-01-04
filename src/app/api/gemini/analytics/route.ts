import { NextRequest, NextResponse } from "next/server";
import { analyzeCrimeAnalytics } from "@/server/queries/gemini";
import type {
  AnalyticsInput,
  CrimeAnalyticsAI,
} from "@/lib/gemini/analytics-schema";

// Response type for the API
interface AnalyticsResponse {
  success: boolean;
  analytics?: CrimeAnalyticsAI;
  error?: string;
  cached?: boolean;
}

// Simple in-memory cache for AI analytics responses
const responseCache = new Map<
  string,
  { analytics: CrimeAnalyticsAI; timestamp: number }
>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(input: AnalyticsInput): string {
  // Create cache key from filters and data signature
  const dataHash = input.dailyCounts
    .slice(0, 5)
    .map((d) => `${d.date}:${d.count}`)
    .join("|");
  return `${input.crimeType}|${input.barangay}|${input.status}|${input.dateRange.from}|${input.dateRange.to}|${dataHash}`;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AnalyticsResponse>> {
  try {
    const body = await request.json();
    const input = body as AnalyticsInput;

    // Validate required fields
    if (!input.dailyCounts || !input.dateRange) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: dailyCounts, dateRange",
        },
        { status: 400 }
      );
    }

    // Check if there's enough data
    if (input.dailyCounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No data available for analysis",
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(input);
    const cached = responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("Returning cached analytics AI");
      return NextResponse.json({
        success: true,
        analytics: cached.analytics,
        cached: true,
      });
    }

    console.log(
      `Generating AI analytics for ${input.crimeType} in ${input.barangay}`
    );

    // Generate AI analytics
    const analytics = await analyzeCrimeAnalytics(input);

    // Cache the result
    responseCache.set(cacheKey, {
      analytics,
      timestamp: Date.now(),
    });

    // Clean old cache entries periodically
    if (responseCache.size > 500) {
      const now = Date.now();
      for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          responseCache.delete(key);
        }
      }
    }

    console.log("Analytics AI generated successfully");

    return NextResponse.json({
      success: true,
      analytics,
      cached: false,
    });
  } catch (error) {
    console.error("Error generating analytics AI:", error);

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
