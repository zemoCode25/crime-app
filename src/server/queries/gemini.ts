import { getSafetyAnalysisModel, getAnalyticsModel } from "@/lib/gemini/client";
import type {
  SafetyAnalysisInput,
  AISafetyAnalysis,
} from "@/lib/gemini/gemini-schema";
import type {
  AnalyticsInput,
  CrimeAnalyticsAI,
} from "@/lib/gemini/analytics-schema";

/**
 * Build the analysis prompt from crime data
 */
function buildSafetyPrompt(input: SafetyAnalysisInput): string {
  const { riskLevel, crimeCount, crimeTypes, coordinates } = input;


  // Format crime type breakdown
  const crimeBreakdown =
    crimeTypes.length > 0
      ? crimeTypes
          .slice(0, 5)
          .map((c) => `- ${c.type}: ${c.count} incidents (${c.percentage}%)`)
          .join("\n")
      : "No specific crime type data available";

  // Map risk level to description
  const riskDescriptions: Record<string, string> = {
    HIGH: "Very High Risk - Exercise extreme caution",
    MEDIUM_HIGH: "Elevated Risk - Be vigilant",
    MEDIUM: "Moderate Risk - Stay aware",
    LOW_MEDIUM: "Low-Moderate Risk - Standard precautions advised",
    LOW: "Low Risk - Generally safe area",
  };

  return `You are a safety advisor analyzing crime data for a location in Muntinlupa City, Philippines.
Provide practical, culturally-appropriate safety advice based on the following data:

LOCATION: Coordinates (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}) in Muntinlupa City
RISK LEVEL: ${riskLevel} - ${riskDescriptions[riskLevel] || "Unknown"}
TOTAL CRIMES (300m radius): ${crimeCount} incidents

CRIME TYPE BREAKDOWN:
${crimeBreakdown}

INSTRUCTIONS:
1. You MUST use the exact crime types listed in the "CRIME TYPE BREAKDOWN" section. Do not invent crime types or use generic terms like "Unspecified Incidents".
2. If the breakdown shows specific crimes (e.g., "Theft", "Physical Injury"), your analysis MUST address them directly.
3. Generate exactly 3 Risk Explanations based on the MOST FREQUENT crimes listed above.
4. Generate exactly 3 Safety Tips with actionable advice specific to the crime types in this area.
5. Consider local context (barangay patrols, tanod, local emergency numbers like 911 or local police).
6. Keep all responses concise and practical for everyday citizens.

Prioritize tips based on the most common crime types in the area. Make recommendations specific to the types of crimes reported.

RESPONSE FORMAT (JSON):
{
  "riskExplanations": [
    { "title": "short title", "description": "1-2 sentence explanation", "severity": "low|medium|high" }
  ],
  "safetyTips": [
    { "tip": "actionable advice", "context": "why this is relevant", "priority": "essential|recommended|optional" }
  ],
  "timePatterns": [],
  "overallSummary": "1-2 sentence summary of overall safety situation"
}

Return ONLY valid JSON, no additional text.`;
}

/**
 * Analyze crime data and generate AI safety tips
 */
export async function analyzeCrimeData(
  input: SafetyAnalysisInput
): Promise<AISafetyAnalysis> {
  const model = getSafetyAnalysisModel();
  const prompt = buildSafetyPrompt(input);

  const result = await model.generateContent(prompt);

  const response = result.response;
  const text = response.text();

  // Clean up the response text (remove markdown code blocks if present)
  let jsonText = text.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith("```")) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  // Log raw response for debugging
  console.log("Raw Gemini response:", jsonText.substring(0, 500));

  // Parse the JSON response with error handling
  let analysis: Omit<AISafetyAnalysis, "generatedAt">;
  try {
    analysis = JSON.parse(jsonText);
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    console.error("Failed to parse JSON:", jsonText);

    // Return fallback data if JSON parsing fails
    throw new Error(
      `Failed to parse AI response. The model returned invalid JSON. Please try again.`
    );
  }

  // Validate the response structure
  if (!analysis.riskExplanations || !analysis.safetyTips || !analysis.overallSummary) {
    console.error("Invalid response structure:", analysis);
    throw new Error("AI response is missing required fields");
  }

  return {
    ...analysis,
    timePatterns: analysis.timePatterns || [],
    generatedAt: new Date().toISOString(),
  };
}

// ==================== ANALYTICS AI ====================

/**
 * Build the analytics prompt from crime data
 */
function buildAnalyticsPrompt(input: AnalyticsInput): string {
  const { dailyCounts, crimeType, barangay, status, dateRange } = input;

  // Calculate statistics
  const totalCrimes = dailyCounts.reduce((sum, day) => sum + day.count, 0);
  const avgPerDay = totalCrimes / dailyCounts.length;
  const maxDay = dailyCounts.reduce((max, day) =>
    day.count > max.count ? day : max
  );
  const minDay = dailyCounts.reduce((min, day) =>
    day.count < min.count ? day : min
  );

  // Format the data for the prompt
  const dataPoints = dailyCounts
    .map((d) => `${d.label}: ${d.count} cases`)
    .join("\n");

  return `You are a crime data analyst for Muntinlupa City, Philippines. Analyze the following crime statistics and provide 4 specific, data-driven insights.

DATASET OVERVIEW:
- Crime Type: ${crimeType}
- Location: ${barangay}
- Status Filter: ${status}
- Date Range: ${dateRange.from} to ${dateRange.to}
- Total Cases: ${totalCrimes}
- Average per Day: ${avgPerDay.toFixed(1)}
- Highest: ${maxDay.label} (${maxDay.count} cases)
- Lowest: ${minDay.label} (${minDay.count} cases)

DAILY BREAKDOWN:
${dataPoints}

INSTRUCTIONS:
1. Generate exactly 4 insights analyzing the data
2. Each insight must reference specific numbers from the data
3. Identify trends (upward/downward), peaks (highest days), anomalies (unusual patterns), or comparisons (day-to-day changes)
4. Be specific - mention actual dates, numbers, and percentages
5. Keep each insight to 1-2 sentences
6. Focus on actionable patterns that law enforcement or community can use

Examples of good insights:
- "Peak activity in February with 305 cases, 64% higher than January's 186 cases"
- "April shows lowest incidents (73 cases), suggesting seasonal patterns worth investigating"
- "Upward trend from April to June, with cases increasing by 41% over the quarter"

RESPONSE FORMAT (JSON):
{
  "insights": [
    { "insight": "specific insight with data", "type": "trend|peak|anomaly|comparison" }
  ],
  "summary": "1-sentence overview of the overall pattern"
}

Return ONLY valid JSON, no additional text.`;
}

/**
 * Analyze crime analytics data and generate AI insights
 */
export async function analyzeCrimeAnalytics(
  input: AnalyticsInput
): Promise<CrimeAnalyticsAI> {
  const model = getAnalyticsModel();
  const prompt = buildAnalyticsPrompt(input);

  const result = await model.generateContent(prompt);

  const response = result.response;
  const text = response.text();

  // Clean up the response text (remove markdown code blocks if present)
  let jsonText = text.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith("```")) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  console.log("Analytics AI response:", jsonText.substring(0, 300));

  // Parse the JSON response with error handling
  let analytics: Omit<CrimeAnalyticsAI, "generatedAt">;
  try {
    analytics = JSON.parse(jsonText);
  } catch (parseError) {
    console.error("Analytics JSON parse error:", parseError);
    console.error("Failed JSON:", jsonText);

    throw new Error(
      `Failed to parse analytics AI response. Please try again.`
    );
  }

  // Validate the response structure
  if (!analytics.insights || !analytics.summary) {
    console.error("Invalid analytics response structure:", analytics);
    throw new Error("Analytics AI response is missing required fields");
  }

  return {
    ...analytics,
    generatedAt: new Date().toISOString(),
  };
}
