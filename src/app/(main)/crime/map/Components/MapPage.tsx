"use client";

import MapContainer from "./MapContainer";
import {
  useCurrentUserProfile,
  isBarangayAdmin,
} from "@/hooks/user/useCurrentUserProfile";

export default function MapPage() {
  const { data: userProfile } = useCurrentUserProfile();

  const barangayId = isBarangayAdmin(userProfile?.role ?? null)
    ? (userProfile?.barangay ?? undefined)
    : undefined;

  return (
    <main className="pt-2 pl-11">
      <MapContainer />
    </main>
  );
}
