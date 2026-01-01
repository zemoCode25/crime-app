import { getSafetyAnalysisModel } from "@/lib/gemini/client";
import type { SafetyAnalysisInput, AISafetyAnalysis } from "@/lib/gemini/gemini-schema";

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
1. Generate exactly 3 Risk Explanations analyzing why this area has its current risk level based on the crime types present
2. Generate exactly 3 Safety Tips with actionable advice specific to the crime types in this area
3. Consider local context (barangay patrols, tanod, local emergency numbers like 911 or local police)
4. Keep all responses concise and practical for everyday citizens
5. Focus on prevention and awareness, not fear-inducing language
6. If the area is low risk, still provide helpful general safety tips

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
