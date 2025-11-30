"use client";

import { useCrimeCase } from "@/hooks/crime-case/useCrimeCase";
import { useCrimeType } from "@/context/CrimeTypeProvider";
import { Badge } from "@/components/ui/badge";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STATUSES, BARANGAY_OPTIONS } from "@/constants/crime-case";
import type { CasePersonRecord } from "@/types/crime-case";
import { MapPin, User, Phone, FileText, Shield } from "lucide-react";
import Card from "@/components/utils/Card";

type CrimeReportProps = {
  id: number;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Unknown";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusLabel(status: string | null | undefined) {
  if (!status) return "Unknown";
  const match = STATUSES.find((s) => s.value === status);
  return match ? match.label : status;
}

function getStatusVariant(
  status: string | null | undefined,
): "default" | "secondary" | "destructive" | "outline" {
  if (!status) return "outline";
  if (status === "open") return "destructive";
  if (status === "case settled") return "secondary";
  return "default";
}

function getBarangayLabel(barangayId: number | null | undefined) {
  if (!barangayId) return "Unknown";
  const match = BARANGAY_OPTIONS.find((b) => b.id === barangayId);
  return match ? match.value : `Barangay #${barangayId}`;
}

function getRoleColor(role: string | null | undefined) {
  switch (role) {
    case "suspect":
      return "bg-red-50 text-red-700 border-red-200";
    case "complainant":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "witness":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function CrimeReport({ id }: CrimeReportProps) {
  const { data: crimeCase, isLoading, error } = useCrimeCase(id);
  const { crimeTypeConverter } = useCrimeType();

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-16">
        <div className="bg-background flex items-center gap-3 rounded-lg border px-4 py-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="text-muted-foreground text-sm">
            Loading crime report...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card className="border-red-100 bg-red-50/80 text-red-900 dark:border-red-900 dark:bg-red-950/40">
          <CardHeader>
            <CardTitle>Unable to load crime report</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!crimeCase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Crime case not found</CardTitle>
            <CardDescription>
              We couldn&apos;t find details for this crime case. It may have
              been removed or is temporarily unavailable.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const crimeTypeLabel =
    crimeCase.crime_type != null
      ? crimeTypeConverter(crimeCase.crime_type)
      : "Unknown";

  const participants = (crimeCase.case_person ?? []) as CasePersonRecord[];
  const location = crimeCase.location;

  return (
    <ScrollArea className="mx-auto mt-15 h-[calc(100vh-5rem)] max-w-5xl px-4 py-6">
      {/* Hero header */}
      <section className="mb-6 rounded-2xl border-orange-200/70 bg-gradient-to-br from-orange-50 via-amber-50 to-white p-6 dark:border-orange-900/60 dark:from-orange-950/70 dark:via-zinc-950 dark:to-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-orange-700/80 uppercase dark:text-orange-300/80">
              Crime case report
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-orange-950 dark:text-orange-50">
              {crimeCase.case_number || `Case #${crimeCase.id}`}
            </h1>
            <p className="mt-1 text-xs text-orange-800/80 dark:text-orange-200/80">
              Created {formatDateTime(crimeCase.created_at)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge variant={getStatusVariant(crimeCase.case_status)}>
                <Shield className="h-3 w-3" />
                {getStatusLabel(crimeCase.case_status)}
              </Badge>
              <Badge variant="outline" className="bg-white/70">
                {crimeTypeLabel}
                {crimeCase.crime_type != null && (
                  <span className="text-muted-foreground ml-1 text-[10px]">
                    (ID {crimeCase.crime_type})
                  </span>
                )}
              </Badge>
            </div>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-orange-900/80 dark:bg-orange-950/60 dark:text-orange-100/80">
              Visibility: {crimeCase.visibility || "Unknown"}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-10 space-y-6">
        {/* 1. Crime division */}
        <Card className="py-6">
          <CardHeader className="mb-2 flex flex-col gap-0">
            <CardTitle>Crime details</CardTitle>
            <CardDescription>
              Core information about the incident and its handling.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex items-start gap-2">
              <FileText className="text-muted-foreground mt-0.5 h-3 w-3" />
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-line">
                  {crimeCase.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-xs md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  Incident datetime
                </p>
                <p className="mt-0.5 font-mono text-[11px]">
                  {formatDateTime(crimeCase.incident_datetime)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  Report datetime
                </p>
                <p className="mt-0.5 font-mono text-[11px]">
                  {formatDateTime(crimeCase.report_datetime)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-xs md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  Investigator
                </p>
                <p className="mt-0.5">
                  {crimeCase.investigator || "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  Responder
                </p>
                <p className="mt-0.5">
                  {crimeCase.responder || "Not recorded"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Person division */}
        <Card className="py-6">
          <CardHeader className="mb-2 flex flex-col gap-0">
            <CardTitle>People involved</CardTitle>
            <CardDescription>
              Complainants, suspects, and witnesses linked to this case.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {participants.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No people records are attached to this case yet.
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {participants.map((person) => {
                const profile = person.person_profile;
                const fullName =
                  profile?.first_name || profile?.last_name
                    ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
                    : "Unnamed person";

                const roleLabel = person.case_role
                  ? person.case_role.charAt(0).toUpperCase() +
                    person.case_role.slice(1)
                  : "Unknown";

                return (
                  <div
                    key={person.id}
                    className={`flex flex-col gap-3 rounded-lg border p-3 text-xs ${getRoleColor(person.case_role)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <User className="mt-0.5 h-4 w-4" />
                        <div>
                          <p className="text-sm leading-tight font-semibold">
                            {fullName}
                          </p>
                          <p className="text-[11px] tracking-wide uppercase">
                            {roleLabel}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-semibold tracking-wide uppercase">
                          Contact
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px]">
                          <Phone className="h-3 w-3" />
                          {profile?.contact_number || "Not provided"}
                        </p>
                        <p className="mt-0.5 text-[11px]">
                          {profile?.address || "Address not provided"}
                        </p>
                      </div>
                      <div className="grid gap-1 text-[11px]">
                        <div>
                          <span className="font-semibold">Sex:</span>{" "}
                          {profile?.sex || "Unknown"}
                        </div>
                        <div>
                          <span className="font-semibold">Civil status:</span>{" "}
                          {profile?.civil_status || "Unknown"}
                        </div>
                        <div>
                          <span className="font-semibold">Birth date:</span>{" "}
                          {formatDate(profile?.birth_date ?? null)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 border-t pt-2 text-[11px]">
                      {person.suspect && (
                        <>
                          <p>
                            <span className="font-semibold">Motive:</span>{" "}
                            {person.suspect.motive || "—"}
                          </p>
                          <p>
                            <span className="font-semibold">Weapon used:</span>{" "}
                            {person.suspect.weapon_used || "—"}
                          </p>
                        </>
                      )}
                      {person.complainant && (
                        <p>
                          <span className="font-semibold">
                            Complainant narrative:
                          </span>{" "}
                          {person.complainant.narrative || "—"}
                        </p>
                      )}
                      {person.witness && (
                        <p>
                          <span className="font-semibold">
                            Witness testimony:
                          </span>{" "}
                          {person.witness.testimony || "—"}
                        </p>
                      )}
                      {!person.suspect &&
                        !person.complainant &&
                        !person.witness && (
                          <p className="text-muted-foreground">
                            No role-specific records linked for this person.
                          </p>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 3. Location division */}
        <Card className="py-6">
          <CardHeader className="mb-2 flex flex-col gap-0">
            <CardTitle>Location</CardTitle>
            <CardDescription>
              Exact place of incident and geospatial information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {location ? (
              <>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-orange-600 dark:text-orange-300" />
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                      Crime location
                    </p>
                    <p className="mt-0.5 text-sm">
                      {location.crime_location || "Location not specified"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                      Barangay
                    </p>
                    <p className="mt-0.5">
                      {getBarangayLabel(location.barangay)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                      Landmark
                    </p>
                    <p className="mt-0.5">
                      {location.landmark || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                      Coordinates
                    </p>
                    <p className="mt-0.5 font-mono text-[11px]">
                      Lat {location.lat ?? "—"}, Long {location.long ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                      Map pin
                    </p>
                    <p className="mt-0.5 font-mono text-[11px]">
                      {location.pin ?? "No pin assigned"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                      Location record ID
                    </p>
                    <p className="mt-0.5 font-mono text-[11px]">
                      {location.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                      Location created at
                    </p>
                    <p className="mt-0.5 font-mono text-[11px]">
                      {formatDateTime(location.created_at)}
                    </p>
                  </div>
                </div>

                <div className="text-muted-foreground mt-2 grid gap-3 border-t pt-3 text-[11px] md:grid-cols-2">
                  <div>
                    <p className="font-semibold tracking-wide uppercase">
                      Crime location ID
                    </p>
                    <p className="mt-0.5 font-mono">
                      {crimeCase.location_id ?? "None"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold tracking-wide uppercase">
                      Crime ID
                    </p>
                    <p className="mt-0.5 font-mono">{crimeCase.id}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                No location record is linked to this crime case.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 4. Additional notes division */}
        <Card className="py-6">
          <CardHeader className="mb-2 flex flex-col gap-0">
            <CardTitle>Additional notes</CardTitle>
            <CardDescription>
              Internal notes, follow-up items, and system identifiers.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 text-sm md:grid-cols-3">
            <div className="md:col-span-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Investigator notes
              </p>
              <p className="mt-1 whitespace-pre-line">
                {crimeCase.investigator_notes ||
                  "No investigator notes recorded."}
              </p>
            </div>
            <div className="md:col-span-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Remarks
              </p>
              <p className="mt-1 whitespace-pre-line">
                {crimeCase.remarks || "No remarks added."}
              </p>
            </div>
            <div className="md:col-span-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Follow-up
              </p>
              <p className="mt-1 whitespace-pre-line">
                {crimeCase.follow_up || "No follow-up instructions recorded."}
              </p>
            </div>
          </CardContent>
          <CardContent className="text-muted-foreground border-t pt-4 text-[11px]">
            <p className="mb-1 text-xs font-semibold tracking-wide uppercase">
              System identifiers
            </p>
            <div className="grid gap-1 md:grid-cols-3">
              <p>
                <span className="font-semibold">User ID:</span>{" "}
                {crimeCase.user_id ?? "—"}
              </p>
              <p>
                <span className="font-semibold">Case number:</span>{" "}
                {crimeCase.case_number ?? "—"}
              </p>
              <p>
                <span className="font-semibold">Status (raw):</span>{" "}
                {crimeCase.case_status ?? "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </ScrollArea>
  );
}
