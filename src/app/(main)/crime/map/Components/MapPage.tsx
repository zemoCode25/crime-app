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
    ? userProfile?.barangay ?? undefined
    : undefined;

  const barangayName =
    barangayId !== undefined
      ? BARANGAY_OPTIONS.find((b) => b.id === barangayId)?.value
      : null;

  return (
    <main className="pt-2 pl-11">
      <h1 className="mb-2 text-2xl font-semibold">
        Map
        {barangayName && (
          <span className="ml-2 text-lg font-normal text-gray-500">
            ({barangayName})
          </span>
        )}
      </h1>
      <MapContainer />
    </main>
  );
}
