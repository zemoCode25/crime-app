"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/server/supabase/server";
import { getUser } from "@/server/actions/getUser";
import { getUserProfile, updateUserProfile } from "@/server/queries/profile";

export async function fetchProfile() {
  const supabase = await createClient();
  const authUser = await getUser();

  if (!authUser) {
    return { user: null, profile: null } as const;
  }

  const { data: profile, error } = await getUserProfile(supabase, authUser.id);
  if (error) {
    console.error("Failed to fetch user profile", error);
  }

  return { user: authUser, profile } as const;
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const authUser = await getUser();
  if (!authUser) {
    return { ok: false, error: "Not authenticated" } as const;
  }

  const first_name = (formData.get("first_name") as string | null)?.trim() || null;
  const last_name = (formData.get("last_name") as string | null)?.trim() || null;
  const contact_number = (formData.get("contact_number") as string | null)?.trim() || null;

  const { error: updateError } = await updateUserProfile(supabase, authUser.id, {
    first_name,
    last_name,
    contact_number,
  });

  if (updateError) {
    console.error("Failed to update user profile", updateError);
    return { ok: false, error: "Failed to update profile" } as const;
  }

  // Refresh any server components reading this data
  try {
    revalidatePath("/", "layout");
    revalidatePath("/settings");
  } catch {}

  return { ok: true } as const;
}
