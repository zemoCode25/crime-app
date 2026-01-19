"use server";

import { createClient } from "@/server/supabase/server";
import { getCrimeReportsData, ReportFilter, ReportData } from "@/server/queries/reports";


export async function fetchReportDataAction(
  filter: ReportFilter
): Promise<{ data: ReportData | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: "Unauthorized" };
    }

    // specific role check
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role, barangay")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return { data: null, error: "Failed to fetch user profile" };
    }

    // Role Enforcement
    const role = userProfile.role;
    const userBarangay = userProfile.barangay;

    // If barangay_admin, enforce restrictions
    if (role === "barangay_admin") {
      // Must filter by their own barangay
      // If the incoming filter tries otherwise, overwrite it or error.
      // We will overwrite it to be safe.
      filter.barangay = userBarangay;
    } 
    // If mobile_user, likely shouldn't access this at all?
    if (role === "mobile_user") {
         return { data: null, error: "Unauthorized access for mobile users." };
    }
    
    // For main_admin / system_admin, they can pass whatever they want in filter.barangay
    // If they pass null, it means "All Barangays" (System Wide)

    return await getCrimeReportsData(filter);
  } catch (error: unknown) {
    console.error("Action error:", error);
    const message = error instanceof Error ? error.message : "Server action failed";
    return { data: null, error: message };
  }
}
