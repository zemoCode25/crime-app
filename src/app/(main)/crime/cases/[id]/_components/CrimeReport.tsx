"use client";

import { useEffect, useState } from "react";
import { useCrimeCase } from "@/hooks/crime-case/useCrimeCase";
import { useCrimeType } from "@/context/CrimeTypeProvider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { pdf } from "@react-pdf/renderer";
import { CrimeReportPDF } from "./CrimeReportPDF";
import useSupabaseBrowser from "@/server/supabase/client";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Card from "@/components/utils/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { STATUSES, BARANGAY_OPTIONS } from "@/constants/crime-case";
import type { CasePersonRecord } from "@/types/crime-case";
import {
  MapPin,
  User,
  Phone,
  FileText,
  Shield,
  Calendar,
  Clock,
  Info,
  AlertCircle,
  Briefcase,
  UserCircle2,
  CircleUser,
  Eye,
  Download,
  Edit,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import UpdateCrimeCase from "../../components/UpdateCrimeCase";
import DeleteModal from "@/components/utils/delete-modal";
import { Toaster } from "react-hot-toast";

type CrimeReportProps = {
  id: number;
};

const CRIME_CASE_IMAGE_BUCKET = "crime-case-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

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
      return "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900";
    case "complainant":
      return "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900";
    case "witness":
      return "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900";
    default:
      return "bg-gray-50 text-gray-900 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-800";
  }
}

export default function CrimeReport({ id }: CrimeReportProps) {
  const supabase = useSupabaseBrowser();
  const { data: crimeCase, isLoading, error } = useCrimeCase(id);
  const { crimeTypeConverter } = useCrimeType();
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageUrls, setImageUrls] = useState<
    { key: string; url: string }[]
  >([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);

  const imageKeys = crimeCase?.image_keys ?? [];
  const imageKeySignature = imageKeys.join("|");

  useEffect(() => {
    let isActive = true;

    const loadImages = async () => {
      if (!supabase || imageKeys.length === 0) {
        if (isActive) {
          setImageUrls([]);
          setImagesError(null);
          setIsLoadingImages(false);
        }
        return;
      }

      setIsLoadingImages(true);
      setImagesError(null);

      const { data, error } = await supabase.storage
        .from(CRIME_CASE_IMAGE_BUCKET)
        .createSignedUrls(imageKeys, SIGNED_URL_TTL_SECONDS);

      if (!isActive) return;

      if (error) {
        console.error("Failed to load crime case images:", error);
        setImageUrls([]);
        setImagesError("Images are unavailable right now.");
        setIsLoadingImages(false);
        return;
      }

      const urls =
        data
          ?.map((item, index) => ({
            key: imageKeys[index],
            url: item.signedUrl ?? "",
          }))
          .filter((item) => item.url.length > 0) ?? [];

      setImageUrls(urls);
      setIsLoadingImages(false);
    };

    void loadImages();

    return () => {
      isActive = false;
    };
  }, [supabase, imageKeySignature]);

  const handleDownloadPDF = async () => {
    if (!crimeCase) return;

    try {
      setIsDownloading(true);

      const crimeTypeLabel =
        crimeCase.crime_type != null
          ? crimeTypeConverter(crimeCase.crime_type)
          : "Unknown";

      // Generate PDF blob
      const blob = await pdf(
        <CrimeReportPDF
          crimeCase={crimeCase}
          crimeTypeLabel={crimeTypeLabel}
          getStatusLabel={getStatusLabel}
          getBarangayLabel={getBarangayLabel}
          formatDateTime={formatDateTime}
        />,
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `crime-report-${crimeCase.case_number || crimeCase.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <ScrollArea className="mt-14 h-[calc(100vh-4rem)] w-full bg-slate-50/50 dark:bg-slate-950/50">
        <Toaster />
        <div className="mx-auto max-w-7xl space-y-6 p-6">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-64 sm:w-96" />
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column Skeletons */}
            <div className="space-y-6 lg:col-span-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="py-4">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-md" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[80%]" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Column Skeletons */}
            <div className="space-y-6">
              <div className="sticky top-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
                {[1, 2].map((i) => (
                  <Card key={i} className="h-40">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Case
            </CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!crimeCase) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Not Found</CardTitle>
            <CardDescription>
              The requested crime case could not be found.
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

  const participants = (crimeCase.case_person ??
    []) as unknown as CasePersonRecord[];
  const location = crimeCase.location;

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full bg-slate-50/50 dark:bg-slate-950/50">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                Case Report
              </span>
              <span>•</span>
              <span className="tracking-wider uppercase">
                {crimeCase.case_number || `ID: ${crimeCase.id}`}
              </span>
            </div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              {crimeTypeLabel}
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant={getStatusVariant(crimeCase.case_status)}
                className="px-3 py-1 text-sm capitalize"
              >
                {getStatusLabel(crimeCase.case_status)}
              </Badge>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Reported: {formatDateTime(crimeCase.report_datetime)}
              </div>
              <div className="bg-muted-foreground/30 hidden h-1 w-1 rounded-full md:block" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Incident: {formatDateTime(crimeCase.incident_datetime)}
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                Visibility: {crimeCase.visibility}
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              className="cursor-pointer border shadow-none"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              <Download className="h-2 w-2" />
              <p>{isDownloading ? "Generating..." : "PDF"}</p>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="cursor-pointer border border-orange-600 bg-orange-100 text-orange-600 hover:bg-orange-200">
                  <Edit className="h-4 w-4" />
                  Update
                </Button>
              </DialogTrigger>
              <UpdateCrimeCase caseId={crimeCase.id} />
            </Dialog>
            <DeleteModal caseId={crimeCase.id} closeDropdown={() => {}} />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column (Main Details) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="text-primary h-5 w-5" />
                  Incident Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {crimeCase.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {imageKeys.length > 0 && (
              <Card className="py-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ImageIcon className="text-primary h-5 w-5" />
                    Case Images
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {imageKeys.length} image
                    {imageKeys.length === 1 ? "" : "s"} attached
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingImages && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {imageKeys.map((key) => (
                        <Skeleton
                          key={key}
                          className="h-40 w-full rounded-md"
                        />
                      ))}
                    </div>
                  )}
                  {!isLoadingImages && imagesError && (
                    <p className="text-muted-foreground text-sm">
                      {imagesError}
                    </p>
                  )}
                  {!isLoadingImages &&
                    !imagesError &&
                    (imageUrls.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {imageUrls.map((image) => (
                          <a
                            key={image.key}
                            href={image.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group overflow-hidden rounded-md border border-border/50 bg-muted/30"
                          >
                            <img
                              src={image.url}
                              alt="Crime case image"
                              className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Images are unavailable right now.
                      </p>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="text-primary h-5 w-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-medium uppercase">
                    Address / Landmark
                  </span>
                  <p className="font-medium">
                    {location?.crime_location ||
                      location?.landmark ||
                      "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-medium uppercase">
                    Barangay
                  </span>
                  <p className="font-medium">
                    {getBarangayLabel(location?.barangay)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-medium uppercase">
                    Coordinates
                  </span>
                  <p className="text-muted-foreground font-mono text-sm">
                    {location?.lat && location?.long
                      ? `${location.lat}, ${location.long}`
                      : "No coordinates"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-medium uppercase">
                    Map Pin
                  </span>
                  <p className="text-muted-foreground text-sm">
                    {location?.pin || "No pin"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes & Metadata */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="text-primary h-5 w-5" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase">
                    <UserCircle2 className="h-3.5 w-3.5" /> Investigator
                  </span>
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    <p className="font-medium">
                      {crimeCase.investigator || "Not assigned"}
                    </p>
                    {crimeCase.investigator_notes && (
                      <p className="text-muted-foreground border-border/50 mt-2 border-t pt-2 text-xs">
                        &quot;{crimeCase.investigator_notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase">
                    <Briefcase className="h-3.5 w-3.5" /> Responder
                  </span>
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    <p className="font-medium">
                      {crimeCase.responder || "Not recorded"}
                    </p>
                  </div>
                </div>

                {(crimeCase.remarks || crimeCase.follow_up) && (
                  <div className="col-span-full grid gap-4 sm:grid-cols-2">
                    {crimeCase.remarks && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs font-medium uppercase">
                          Remarks
                        </span>
                        <p className="text-muted-foreground text-sm">
                          {crimeCase.remarks}
                        </p>
                      </div>
                    )}
                    {crimeCase.follow_up && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs font-medium uppercase">
                          Follow-up
                        </span>
                        <p className="text-muted-foreground text-sm">
                          {crimeCase.follow_up}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (People) */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <CircleUser className="h-5 w-5" /> People Involved
                </h3>
                <Badge variant="outline" className="rounded-full">
                  {participants.length}
                </Badge>
              </div>

              {participants.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                    <User className="mb-2 h-8 w-8 opacity-20" />
                    <p className="text-sm">No people recorded</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {participants.map((person) => {
                    const profile = person.person_profile;
                    const fullName =
                      profile?.first_name || profile?.last_name
                        ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
                        : "Unnamed person";
                    const role = person.case_role || "unknown";

                    return (
                      <Card
                        key={person.id}
                        className={cn(
                          "overflow-hidden transition-all hover:shadow-md",
                          getRoleColor(role),
                        )}
                      >
                        <div className="p-4">
                          <div className="mb-3 flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 ring-1 ring-black/5 dark:bg-black/20 dark:ring-white/10">
                                <User className="h-5 w-5 opacity-70" />
                              </div>
                              <div>
                                <p className="leading-none font-semibold">
                                  {fullName}
                                </p>
                                <p className="mt-1 text-xs font-medium uppercase opacity-70">
                                  {role}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs opacity-90">
                            {profile?.contact_number && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 opacity-70" />
                                <span>{profile.contact_number}</span>
                              </div>
                            )}
                            {profile?.address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 opacity-70" />
                                <span className="line-clamp-2">
                                  {profile.address}
                                </span>
                              </div>
                            )}
                            {profile?.birth_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 opacity-70" />
                                <span>
                                  {new Date(
                                    profile.birth_date,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                            {profile?.sex && (
                              <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 opacity-70" />
                                <span className="capitalize">
                                  {profile.sex}
                                </span>
                              </div>
                            )}
                            {profile?.civil_status && (
                              <div className="flex items-center gap-2">
                                <Info className="h-3.5 w-3.5 opacity-70" />
                                <span className="capitalize">
                                  {profile.civil_status}
                                </span>
                              </div>
                            )}
                            {profile?.person_notified && (
                              <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 opacity-70" />
                                <span className="text-xs">
                                  <span className="font-medium">
                                    Person Notified:
                                  </span>{" "}
                                  {profile.person_notified}
                                </span>
                              </div>
                            )}
                            {profile?.related_contact && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 opacity-70" />
                                <span className="text-xs">
                                  <span className="font-medium">
                                    Related Contact:
                                  </span>{" "}
                                  {profile.related_contact}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Role specific details */}
                          {(person.suspect?.motive ||
                            person.suspect?.weapon_used ||
                            person.complainant?.narrative ||
                            person.witness?.testimony) && (
                            <div className="mt-3 border-t border-black/5 pt-3 dark:border-white/5">
                              {person.suspect && (
                                <div className="space-y-1">
                                  {person.suspect.motive && (
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Motive:
                                      </span>{" "}
                                      {person.suspect.motive}
                                    </p>
                                  )}
                                  {person.suspect.weapon_used && (
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Weapon:
                                      </span>{" "}
                                      {person.suspect.weapon_used}
                                    </p>
                                  )}
                                </div>
                              )}
                              {person.complainant?.narrative && (
                                <p className="line-clamp-3 text-xs italic">
                                  &quot;{person.complainant.narrative}&quot;
                                </p>
                              )}
                              {person.witness?.testimony && (
                                <p className="line-clamp-3 text-xs italic">
                                  &quot;{person.witness.testimony}&quot;
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
