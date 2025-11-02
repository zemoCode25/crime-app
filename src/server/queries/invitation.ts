import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert, Enums } from "@/server/supabase/database.types";
import { generateToken, hashToken } from "@/lib/utils";

export async function createInvitation(
  client: SupabaseClient<Database>,
  input: {
    email: string;
    role: Database["public"]["Enums"]["roles"];
    first_name: string;
    last_name: string;
    barangay?: number;
    created_by_id?: number;
    expiresInHours?: number; // default 72h
    token?: string; // optional custom token (plain)
  }
) {
  const tokenPlain = input.token ?? generateToken();
  const tokenHash = hashToken(tokenPlain);
  const expiry = new Date(
    Date.now() + (input.expiresInHours ?? 72) * 60 * 60 * 1000
  ).toISOString();

  const row: TablesInsert<"invitation"> = {
    email: input.email,
    role: input.role,
    first_name: input.first_name,
    last_name: input.last_name,
    barangay: input.barangay ?? null,
    created_by_id: input.created_by_id ?? null,
    token: tokenHash, // store only the hash
    expiry_datetime: expiry,
    consumed_datetime: null,
  };

  const { data, error } = await client.from("invitation").insert([row]).select().single();

  // Return the plain token so you can send it in the email link
  return { data, error, token: tokenPlain };
}