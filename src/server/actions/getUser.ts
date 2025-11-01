import { createClient } from "@/server/supabase/server";

export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
