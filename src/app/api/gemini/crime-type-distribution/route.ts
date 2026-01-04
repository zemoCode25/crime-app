import { NextRequest, NextResponse } from "next/server";
import { analyzeCrimeTypeDistribution } from "@/server/queries/gemini";
import type {
  CrimeTypeDistributionInput,
  DistributionAnalyticsAI,
} from "@/lib/gemini/distribution-schema";

interface DistributionResponse {
  success: boolean;
  analytics?: DistributionAnalyticsAI;
  error?: string;
  cached?: boolean;
}

// Simple in-memory cache
const responseCache = new Map<
  string,
  { analytics: DistributionAnalyticsAI; timestamp: number }
>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(input: CrimeTypeDistributionInput): string {
  const dataHash = input.distribution
    .slice(0, 5)
    .map((d) => `${d.crimeType}:${d.count}`)
    .join("|");
  return `${input.dateRange.from}|${input.dateRange.to}|${dataHash}`;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<DistributionResponse>> {
  try {
    const body = await request.json();
    const input = body as CrimeTypeDistributionInput;

    // Validate required fields
    if (!input.distribution || !input.dateRange) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: distribution, dateRange",
        },
        { status: 400 }
      );
    }

    // Check if there's enough data
    if (input.distribution.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No distribution data available for analysis",
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(input);
    const cached = responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("Returning cached crime type distribution AI");
      return NextResponse.json({
        success: true,
        analytics: cached.analytics,
        cached: true,
      });
    }

    console.log(`Generating AI insights for crime type distribution`);

    // Generate AI analytics
    const analytics = await analyzeCrimeTypeDistribution(input);

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

    console.log("Crime type distribution AI generated successfully");

    return NextResponse.json({
      success: true,
      analytics,
      cached: false,
    });
  } catch (error) {
    console.error("Error generating crime type distribution AI:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "AI analysis failed",
      },
      { status: 500 }
    );
  }
}
