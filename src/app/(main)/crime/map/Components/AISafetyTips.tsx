"use client";

import {
  AlertCircle,
  Lightbulb,
  Clock,
  Sparkles,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import type {
  AISafetyAnalysis,
  RiskExplanation,
  SafetyTip,
} from "@/lib/gemini/gemini-schema";

interface AISafetyTipsProps {
  analysis: AISafetyAnalysis | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Severity badge colors
const SEVERITY_COLORS = {
  low: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-red-100 text-red-800 border-red-300",
};

// Priority badge colors
const PRIORITY_COLORS = {
  essential: "bg-red-50 text-red-700",
  recommended: "bg-blue-50 text-blue-700",
  optional: "bg-gray-50 text-gray-600",
};

function AILoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 animate-pulse text-purple-500" />
        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-purple-800">
          Analyzing crime patterns...
        </p>
        <p className="mt-1 text-xs text-purple-600">
          Generating personalized safety tips
        </p>
      </div>
    </div>
  );
}

function AIErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-orange-500" />
        <p className="text-sm font-medium text-orange-800">
          AI analysis unavailable
        </p>
      </div>
      <p className="text-xs text-orange-600">
        {error.message || "Using standard safety recommendations"}
      </p>
    </div>
  );
}

function RiskExplanationCard({
  explanation,
}: {
  explanation: RiskExplanation;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-800">
            {explanation.title}
          </h4>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[explanation.severity]}`}
        >
          {explanation.severity}
        </span>
      </div>
      <p className="ml-6 mt-1 text-xs text-gray-600">
        {explanation.description}
      </p>
    </div>
  );
}

function SafetyTipCard({ tip }: { tip: SafetyTip }) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-blue-50/50 p-3">
      <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-blue-900">{tip.tip}</p>
          <span
            className={`rounded px-1.5 py-0.5 text-xs ${PRIORITY_COLORS[tip.priority]}`}
          >
            {tip.priority}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-blue-700">{tip.context}</p>
      </div>
    </div>
  );
}

export default function AISafetyTips({
  analysis,
  isLoading,
  error,
}: AISafetyTipsProps) {
  if (isLoading) {
    return <AILoadingState />;
  }

  if (error) {
    return <AIErrorState error={error} />;
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-purple-900">
          AI Safety Analysis
        </h3>
      </div>

      {/* Overall Summary */}
      <p className="rounded-md bg-white/60 p-2 text-sm italic text-gray-700">
        &quot;{analysis.overallSummary}&quot;
      </p>

      {/* Risk Explanations */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
          Risk Analysis ({analysis.riskExplanations.length})
        </h4>
        <div className="space-y-2">
          {analysis.riskExplanations.map((explanation, idx) => (
            <RiskExplanationCard key={idx} explanation={explanation} />
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase text-purple-700">
          Safety Recommendations
        </h4>
        <div className="space-y-2">
          {analysis.safetyTips.map((tip, idx) => (
            <SafetyTipCard key={idx} tip={tip} />
          ))}
        </div>
      </div>

      {/* Time Patterns (if available) */}
      {analysis.timePatterns && analysis.timePatterns.length > 0 && (
        <div className="border-t border-purple-200 pt-3">
          <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
            <Clock className="h-3 w-3" />
            Time-Based Insights
          </h4>
          <div className="space-y-1">
            {analysis.timePatterns.map((pattern, idx) => (
              <div key={idx} className="text-xs text-gray-600">
                <span className="font-medium">{pattern.period}:</span>{" "}
                {pattern.advice}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-400">
        Generated at {new Date(analysis.generatedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
