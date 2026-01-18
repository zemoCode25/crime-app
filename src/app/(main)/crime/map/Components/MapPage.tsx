"use client";

import MapContainer from "./MapContainer";
import {
  useCurrentUserProfile,
  isBarangayAdmin,
} from "@/hooks/user/useCurrentUserProfile";
import { BARANGAY_OPTIONS } from "@/constants/crime-case";

export default function MapPage() {
  const { data: userProfile } = useCurrentUserProfile();

  const barangayId = isBarangayAdmin(userProfile?.role ?? null)
    ? (userProfile?.barangay ?? undefined)
    : undefined;

  const barangayName =
    barangayId !== undefined
      ? BARANGAY_OPTIONS.find((b) => b.id === barangayId)?.value
      : null;

  return (
    <main className="pt-2 pl-11">
      <MapContainer />
    </main>
  );
}
