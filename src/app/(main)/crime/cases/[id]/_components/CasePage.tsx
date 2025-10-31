"use client";

import { CrimeCaseById } from "@/server/queries/crime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  MapPin,
  Calendar,
  User,
  Clock,
  Shield,
  AlertCircle,
  Users,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface CasePageProps {
  crimeCase: CrimeCaseById;
}

export default function CasePage({ crimeCase }: CasePageProps) {
  const handleDownloadReport = () => {
    // Create a printable version
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "under_investigation":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "closed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "complainant":
        return "bg-blue-100 text-blue-800";
      case "suspect":
        return "bg-red-100 text-red-800";
      case "witness":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <FileText className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">
              Crime Case Report
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Case ID: {crimeCase?.id} | {crimeCase?.case_number || "N/A"}
          </p>
        </div>

        <Button onClick={handleDownloadReport} size="lg" className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Status Overview Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-primary h-5 w-5" />
              Case Status
            </CardTitle>
            <Badge
              variant="outline"
              className={`text-sm font-semibold ${getStatusColor(
                crimeCase?.case_status || "",
              )}`}
            >
              {crimeCase?.case_status?.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="text-muted-foreground mt-1 h-5 w-5" />
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">
                  Incident Date & Time
                </p>
                <p className="text-base font-semibold">
                  {crimeCase?.incident_datetime
                    ? format(
                        new Date(crimeCase.incident_datetime),
                        "PPP 'at' p",
                      )
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="text-muted-foreground mt-1 h-5 w-5" />
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">
                  Report Date & Time
                </p>
                <p className="text-base font-semibold">
                  {crimeCase?.report_datetime
                    ? format(new Date(crimeCase.report_datetime), "PPP 'at' p")
                    : "N/A"}
                </p>
              </div>
            </div>

            {crimeCase?.visibility && (
              <div className="flex items-start gap-3">
                <Eye className="text-muted-foreground mt-1 h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    Visibility
                  </p>
                  <Badge variant="secondary" className="capitalize">
                    {crimeCase.visibility}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Case Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-primary h-5 w-5" />
            Case Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">
                Crime Type
              </p>
              <p className="text-base font-semibold">
                {crimeCase?.crime_type || "Not specified"}
              </p>
            </div>

            {crimeCase?.investigator && (
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">
                  Investigator
                </p>
                <p className="text-base font-semibold">
                  {crimeCase.investigator}
                </p>
              </div>
            )}

            {crimeCase?.responder && (
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">
                  First Responder
                </p>
                <p className="text-base font-semibold">{crimeCase.responder}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Description
            </p>
            <p className="bg-muted rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {crimeCase?.description || "No description provided"}
            </p>
          </div>

          {crimeCase?.investigator_notes && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-2 text-sm font-medium">
                  Investigator Notes
                </p>
                <p className="bg-muted rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {crimeCase.investigator_notes}
                </p>
              </div>
            </>
          )}

          {crimeCase?.remarks && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-2 text-sm font-medium">
                  Remarks
                </p>
                <p className="bg-muted rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {crimeCase.remarks}
                </p>
              </div>
            </>
          )}

          {crimeCase?.follow_up && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-2 text-sm font-medium">
                  Follow-up Actions
                </p>
                <p className="bg-muted rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {crimeCase.follow_up}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="text-primary h-5 w-5" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">
                Address
              </p>
              <p className="text-base font-semibold">
                {crimeCase?.location?.crime_location || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">
                Barangay
              </p>
              <p className="text-base font-semibold capitalize">
                {crimeCase?.location?.barangay || "N/A"}
              </p>
            </div>

            {crimeCase?.location?.landmark && (
              <div className="md:col-span-2">
                <p className="text-muted-foreground mb-1 text-sm font-medium">
                  Landmark
                </p>
                <p className="text-base font-semibold">
                  {crimeCase.location.landmark}
                </p>
              </div>
            )}

            {crimeCase?.location?.lat && crimeCase?.location?.long && (
              <div className="md:col-span-2">
                <p className="text-muted-foreground mb-1 text-sm font-medium">
                  Coordinates
                </p>
                <p className="text-muted-foreground font-mono text-sm">
                  {crimeCase.location.lat.toFixed(6)},{" "}
                  {crimeCase.location.long.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Persons Involved Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-primary h-5 w-5" />
            Persons Involved ({crimeCase?.case_person?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {crimeCase?.case_person && crimeCase.case_person.length > 0 ? (
            crimeCase.case_person.map((casePerson, index) => {
              const profile = casePerson.person_profile as any;
              return (
                <div key={casePerson.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                          <User className="text-primary h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {profile?.first_name} {profile?.last_name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {profile?.birth_date
                              ? `Born: ${format(
                                  new Date(profile.birth_date),
                                  "PPP",
                                )}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`capitalize ${getRoleBadgeColor(
                          casePerson?.case_role || "",
                        )}`}
                      >
                        {casePerson?.case_role?.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="bg-muted grid gap-3 rounded-md p-4 md:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">
                          Sex
                        </p>
                        <p className="text-sm font-semibold capitalize">
                          {profile?.sex || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">
                          Civil Status
                        </p>
                        <p className="text-sm font-semibold capitalize">
                          {profile?.civil_status?.replace("_", " ") || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">
                          Contact
                        </p>
                        <p className="text-sm font-semibold">
                          {profile?.contact_number || "N/A"}
                        </p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-muted-foreground text-xs font-medium">
                          Address
                        </p>
                        <p className="text-sm font-semibold">
                          {profile?.address || "N/A"}
                        </p>
                      </div>
                      {profile?.person_notified && (
                        <div className="md:col-span-2">
                          <p className="text-muted-foreground text-xs font-medium">
                            Person Notified
                          </p>
                          <p className="text-sm font-semibold">
                            {profile.person_notified}
                          </p>
                        </div>
                      )}
                      {profile?.related_contact && (
                        <div>
                          <p className="text-muted-foreground text-xs font-medium">
                            Related Contact
                          </p>
                          <p className="text-sm font-semibold">
                            {profile.related_contact}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Role-specific information */}
                    {profile?.narrative && (
                      <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-blue-900">
                          Narrative
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-blue-800">
                          {profile.narrative}
                        </p>
                      </div>
                    )}

                    {profile?.testimony && (
                      <div className="rounded-md border-l-4 border-purple-500 bg-purple-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-purple-900">
                          Testimony
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-purple-800">
                          {profile.testimony}
                        </p>
                      </div>
                    )}

                    {(profile?.motive || profile?.weapon_used) && (
                      <div className="rounded-md border-l-4 border-red-500 bg-red-50 p-4">
                        <p className="mb-3 text-sm font-semibold text-red-900">
                          Suspect Information
                        </p>
                        <div className="space-y-2">
                          {profile?.motive && (
                            <div>
                              <p className="text-xs font-medium text-red-700">
                                Motive
                              </p>
                              <p className="text-sm whitespace-pre-wrap text-red-800">
                                {profile.motive}
                              </p>
                            </div>
                          )}
                          {profile?.weapon_used && (
                            <div>
                              <p className="text-xs font-medium text-red-700">
                                Weapon Used
                              </p>
                              <p className="text-sm text-red-800">
                                {profile.weapon_used}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Users className="mx-auto mb-2 h-12 w-12 opacity-20" />
              <p>No persons involved recorded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .container,
          .container * {
            visibility: visible;
          }
          .container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
