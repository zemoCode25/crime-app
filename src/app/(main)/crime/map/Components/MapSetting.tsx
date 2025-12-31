"use client";
import { SelectedLocation } from "@/types/map";
import {
  MapPinned,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
  ShieldOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CrimeCaseMapRecord } from "@/types/crime-case";
import { Badge } from "@/components/ui/badge";
import { useCrimeType } from "@/context/CrimeTypeProvider";

export type RiskLevel =
  | "HIGH"
  | "MEDIUM_HIGH"
  | "MEDIUM"
  | "LOW_MEDIUM"
  | "LOW";

export interface CrimeTypeCount {
  type: string;
  count: number;
  percentage: number;
}

export interface RiskAssessmentData {
  riskLevel: RiskLevel;
  crimeCount: number;
  perimeter: {
    radius: number;
    crimeTypes: CrimeTypeCount[];
    totalCrimes: number;
    safetyTips: string[];
  };
}

interface MapSettingProps {
  selectedLocation: SelectedLocation | null;
  onLocationChange: (location: SelectedLocation | null) => void;
  selectedCase: CrimeCaseMapRecord | null;
  riskAssessment?: RiskAssessmentData | null;
  isLoadingRisk?: boolean;
  riskError?: Error | null;
}

const LOCATION_HAZARD_CONFIG: Record<
  RiskLevel,
  {
    label: string;
    icon: LucideIcon;
    colors: { bg: string; text: string; border: string };
  }
> = {
  LOW: {
    label: "Low Risk Area",
    icon: ShieldCheck,
    colors: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-500",
    },
  },
  LOW_MEDIUM: {
    label: "Low-Medium Risk Area",
    icon: Shield,
    colors: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-500",
    },
  },
  MEDIUM: {
    label: "Medium Risk Area",
    icon: ShieldAlert,
    colors: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-500",
    },
  },
  MEDIUM_HIGH: {
    label: "Medium-High Risk Area",
    icon: ShieldOff,
    colors: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-500",
    },
  },
  HIGH: {
    label: "High Risk Area",
    icon: ShieldX,
    colors: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-500",
    },
  },
};

function HazardWarning({ warningLevel }: { warningLevel: RiskLevel }) {
  const config = LOCATION_HAZARD_CONFIG[warningLevel];
  const Icon = config?.icon;
  const colors = config?.colors;

  if (!colors) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-md border ${colors.border} ${colors.bg} w-full justify-center py-2`}
    >
      {Icon && <Icon className={`${colors.text} h-5 w-5 flex-shrink-0`} />}
      <p className={`text-sm font-semibold ${colors.text}`}>{config.label}</p>
    </div>
  );
}

function RiskLoadingState() {
  return (
    <div className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-100 py-2">
      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      <p className="text-sm font-semibold text-gray-600">Assessing risk...</p>
    </div>
  );
}

function RiskErrorState({ error }: { error: Error }) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-md border border-red-300 bg-red-50 p-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm font-semibold text-red-700">
          Risk assessment failed
        </p>
      </div>
      <p className="text-xs text-red-600">{error.message}</p>
    </div>
  );
}

function PerimeterAnalysis({
  crimeTypes,
  totalCrimes,
  safetyTips,
  radius,
}: {
  crimeTypes: CrimeTypeCount[];
  totalCrimes: number;
  safetyTips: string[];
  radius: number;
}) {
  const hasCrimes = crimeTypes.length > 0;
  const hasTips = safetyTips.length > 0;

  if (!hasCrimes && !hasTips) return null;

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <p className="mb-3 text-xs font-semibold text-gray-700 uppercase">
        {radius}m Perimeter Analysis ({totalCrimes} {totalCrimes === 1 ? 'case' : 'cases'})
      </p>

      {/* Crime Type Breakdown */}
      {hasCrimes && (
        <div className="space-y-2">
          {crimeTypes.slice(0, 5).map((crime) => (
            <div key={crime.type} className="space-y-0.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{crime.type}</span>
                <span className="text-xs text-gray-500">
                  {crime.count} ({crime.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-orange-400 transition-all"
                  style={{ width: `${crime.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Tips */}
      {hasTips && (
        <div className={hasCrimes ? "mt-4 border-t border-gray-200 pt-3" : ""}>
          <p className="mb-2 text-xs font-semibold text-blue-700 uppercase">
            Safety Tips
          </p>
          <ul className="space-y-1">
            {safetyTips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-blue-800"
              >
                <span className="mt-0.5 text-blue-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CurrentLocationCard({
  selectedLocation,
}: {
  selectedLocation: SelectedLocation | null;
}) {
  if (!selectedLocation) return null;

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 p-3 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Current Location
      </p>
      <p className="mt-1 text-sm text-slate-800">
        {selectedLocation.address || "Location selected from map"}
      </p>
      <p className="mt-2 flex items-center gap-1 font-mono text-xs text-slate-600">
        <MapPinned className="h-3.5 w-3.5 text-slate-500" />
        {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
      </p>
    </div>
  );
}

function SelectedCaseCard({
  selectedCase,
  selectedLocation,
}: {
  selectedCase: CrimeCaseMapRecord | null;
  selectedLocation: SelectedLocation | null;
}) {
  const { crimeTypeConverter } = useCrimeType();

  if (!selectedCase) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/70 p-4 text-sm text-gray-600">
        Click on any red crime marker on the map to see detailed case
        information here.
      </div>
    );
  }

  const crimeTypeLabel =
    selectedCase.crime_type != null
      ? crimeTypeConverter(selectedCase.crime_type)
      : null;

  const formatDateWithoutSeconds = (
    value: string | Date | null | undefined,
  ) => {
    if (!value) return "Unknown";

    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "Unknown";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex w-full flex-col gap-2 overflow-y-scroll rounded-md border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="w-fit text-base font-semibold text-orange-800">
          {selectedCase?.case_number || `Case #${selectedCase?.id}`}
        </h1>
        <div className="flex gap-1">
          <Badge className="px-2 py-1">{crimeTypeLabel || "Unknown"}</Badge>
          <Badge className="px-2 py-1">
            {selectedCase?.case_status || "Unknown"}
          </Badge>
        </div>
        <p className="flex items-center gap-1 font-mono text-sm text-orange-700">
          <MapPinned className="h-4 w-4 text-orange-600" />
          {selectedLocation?.lat.toFixed(6)}, {selectedLocation?.lng.toFixed(6)}
        </p>
      </div>

      <div className="flex w-full gap-2 text-sm">
        <div className="w-full">
          <p className="text-sm font-medium text-orange-900">Incident date</p>
          <p className="mt-1 rounded-sm border border-orange-200 p-1 text-orange-800">
            {formatDateWithoutSeconds(selectedCase?.incident_datetime)}
          </p>
        </div>
        <div className="w-full">
          <p className="text-sm font-medium text-orange-900">Report date</p>
          <p className="mt-1 rounded-sm border border-orange-200 p-1 text-orange-800">
            {formatDateWithoutSeconds(selectedCase.report_datetime)}
          </p>
        </div>
      </div>
      {selectedCase.location && (
        <div className="flex w-full flex-col justify-between gap-1 rounded-md text-sm">
          <div className="flex w-full flex-col gap-0.5">
            <p className="font-medium text-orange-900">Incident location:</p>
            <p className="w-full rounded-sm border border-orange-200 px-2 py-1 text-orange-800">
              {selectedCase.location.crime_location || "Location not specified"}
            </p>
          </div>
          {selectedCase.location.landmark && (
            <div className="flex w-full flex-col gap-0.5">
              <p className="font-medium text-orange-900">Landmark:</p>
              <p className="w-full rounded-sm border border-orange-200 px-2 py-1 text-orange-800">
                {selectedCase.location.landmark}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MapSetting({
  selectedLocation,
  // onLocationChange, // kept for future use
  selectedCase,
  riskAssessment,
  isLoadingRisk,
  riskError,
}: MapSettingProps) {
  return (
    <div className="max-h-full w-full max-w-[450px] overflow-y-auto rounded-l-sm border border-gray-200 bg-white/95 p-4 pr-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        {/* Current Location */}
        <CurrentLocationCard selectedLocation={selectedLocation} />

        {/* Risk Level Display */}
        {isLoadingRisk ? (
          <RiskLoadingState />
        ) : riskError ? (
          <RiskErrorState error={riskError} />
        ) : riskAssessment ? (
          <HazardWarning warningLevel={riskAssessment.riskLevel} />
        ) : (
          <HazardWarning warningLevel="MEDIUM" />
        )}

        {/* Perimeter Analysis (Crime Breakdown + Safety Tips) */}
        {riskAssessment && (
          <PerimeterAnalysis
            crimeTypes={riskAssessment.perimeter.crimeTypes}
            totalCrimes={riskAssessment.perimeter.totalCrimes}
            safetyTips={riskAssessment.perimeter.safetyTips}
            radius={riskAssessment.perimeter.radius}
          />
        )}

        {/* Selected Case Card */}
        <SelectedCaseCard
          selectedCase={selectedCase}
          selectedLocation={selectedLocation}
        />
      </div>
    </div>
  );
}
