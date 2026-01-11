"use client";
import CrimeChart from "./CrimeChart";
import PieChartSection from "./PieChartSection";
import { CrimeBar } from "./CrimeBar";
import DateRangeSelectorControlled from "./DateRangeSelectorControlled";
import { DateRangeProvider } from "@/context/DateRangeProvider";
import {
  useCurrentUserProfile,
  isBarangayAdmin,
} from "@/hooks/user/useCurrentUserProfile";
import { BARANGAY_OPTIONS } from "@/constants/crime-case";

export default function AnalyticsPage() {
  const { data: userProfile } = useCurrentUserProfile();

  // Determine barangay filter based on user role
  const userBarangayId = isBarangayAdmin(userProfile?.role ?? null)
    ? userProfile?.barangay ?? undefined
    : undefined;

  // Get barangay name for display
  const barangayName =
    userBarangayId !== undefined
      ? BARANGAY_OPTIONS.find((b) => b.id === userBarangayId)?.value
      : null;

  return (
    <DateRangeProvider>
      <div className="mx-auto my-20 max-w-[70rem] 2xl:max-w-[80rem]">
        <div>
          <div>
            <h1 className="text-3xl font-semibold">
              Analytics
              {barangayName && (
                <span className="ml-2 text-xl font-normal text-gray-500">
                  ({barangayName})
                </span>
              )}
            </h1>
            <p className="text-sm text-neutral-600">
              Explore detailed insights and trends based on crime data.
            </p>
          </div>
          <DateRangeSelectorControlled />
        </div>
        <CrimeChart userBarangayId={userBarangayId} />
        <PieChartSection userBarangayId={userBarangayId} />
        <CrimeBar userBarangayId={userBarangayId} />
      </div>
    </DateRangeProvider>
  );
}
