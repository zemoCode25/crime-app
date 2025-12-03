"use client";
import { SelectedLocation } from "@/types/map";
import { MapPinned, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CrimeCaseMapRecord } from "@/types/crime-case";
import { Badge } from "@/components/ui/badge";
import { useCrimeType } from "@/context/CrimeTypeProvider";
import Link from "next/link";

interface MapSettingProps {
  selectedLocation: SelectedLocation | null;
  onLocationChange: (location: SelectedLocation | null) => void;
  selectedCase: CrimeCaseMapRecord | null;
}

const LOCATION_HAZARD_CONFIG: Record<
  string,
  {
    label: string;
    icon: LucideIcon;
    colors: { bg: string; text: string; border: string };
  }
> = {
  low: {
    label: "Low Risk Area",
    icon: ShieldCheck,
    colors: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-900",
    },
  },
  medium: {
    label: "Medium Risk Area",
    icon: ShieldAlert,
    colors: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-900",
    },
  },
  high: {
    label: "High Risk Area",
    icon: ShieldX,
    colors: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-900",
    },
  },
};

function HazardWarning({ warningLevel }: { warningLevel: string }) {
  const Icon = LOCATION_HAZARD_CONFIG[warningLevel]?.icon;
  const colors = LOCATION_HAZARD_CONFIG[warningLevel]?.colors;

  if (!colors) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-md border ${colors.border} ${colors.bg} w-full justify-center py-2`}
    >
      {Icon && <Icon className={`${colors.text} h-5 w-5 flex-shrink-0`} />}
      <p className={`text-sm font-semibold ${colors.text}`}>
        {LOCATION_HAZARD_CONFIG[warningLevel].label}
      </p>
    </div>
  );
}

// function SelectedLocationCard({
//   selectedLocation,
// }: {
//   selectedLocation: SelectedLocation | null;
// }) {
//   if (!selectedLocation) return null;

//   return (
//     <div className="w-full rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm">
//       <p className="text-xs font-semibold tracking-wide text-orange-700 uppercase">
//         Focused map location
//       </p>
//       <p className="mt-1 text-sm text-orange-900">
//         {selectedLocation.address || "Location selected from map"}
//       </p>
//       <p className="mt-2 flex items-center gap-1 font-mono text-sm text-orange-700">
//         <MapPinned className="h-4 w-4 text-orange-600" />
//         {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
//       </p>
//     </div>
//   );
// }

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
}: MapSettingProps) {
  return (
    <div className="max-h-full w-full max-w-[450px] overflow-y-auto rounded-l-sm border border-gray-200 bg-white/95 p-4 pr-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        <HazardWarning warningLevel="medium" />
        <SelectedCaseCard
          selectedCase={selectedCase}
          selectedLocation={selectedLocation}
        />
      </div>
    </div>
  );
}
