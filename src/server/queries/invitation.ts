import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/server/supabase/database.types";
import { generateToken, hashToken } from "@/lib/utils";

export async function createInvitation(
  client: SupabaseClient<Database>,
  input: {
    email: string;
    role: Database["public"]["Enums"]["roles"];
    first_name: string;
    last_name: string;
    barangay?: number;
    created_by_id?: string;
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


export async function updateInvitation(
  client: SupabaseClient<Database>,
  id: number,
  input: {
    email?: string;
    role?: Database["public"]["Enums"]["roles"];
    first_name?: string;
    last_name?: string;
    barangay?: number;
    created_by_id?: string;
    expiresInHours?: number; // default 72h
    token?: string; // optional custom token (plain)
  }
) {
  const updates: Partial<TablesInsert<"invitation">> = {};

  if (input.email) updates.email = input.email;
  if (input.role) updates.role = input.role;
  if (input.first_name) updates.first_name = input.first_name;
  if (input.last_name) updates.last_name = input.last_name;
  if (input.barangay) updates.barangay = input.barangay;
  if (input.created_by_id) updates.created_by_id = input.created_by_id;

  if (input.expiresInHours) {
    const expiry = new Date(
      Date.now() + input.expiresInHours * 60 * 60 * 1000
    ).toISOString();
    updates.expiry_datetime = expiry;
  }

  if (input.token) {
    const tokenHash = hashToken(input.token);
    updates.token = tokenHash;
  }

  const { data, error } = await client
    .from("invitation")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function checkInvitationToken(
  client: SupabaseClient<Database>,
  token?: string
) {
  const trimmedToken = token?.trim();
  if (!trimmedToken) {
    return { valid: false, reason: "missing_token" as const };
  }

  const hashedToken = hashToken(trimmedToken);

  const { data, error } = await client
    .from("invitation")
    .select(
      "id,email,role,first_name,last_name,barangay,created_by_id,expiry_datetime,consumed_datetime,created_at"
    )
    .eq("token", hashedToken)
    .maybeSingle();

  if (error) {
    return { valid: false, reason: "db_error" as const, error };
  }

  if (!data) {
    return { valid: false, reason: "not_found" as const };
  }

  const normalizedEmail = (data.email ?? "").trim().toLowerCase();
  if (!normalizedEmail) {
    return { valid: false, reason: "invalid_email" as const };
  }

  if (data.consumed_datetime) {
    return { valid: false, reason: "consumed" as const };
  }

  const now = Date.now();
  const expiresAt = data.expiry_datetime ? new Date(data.expiry_datetime).getTime() : 0;
  if (!expiresAt || expiresAt <= now) {
    return { valid: false, reason: "expired" as const };
  }

  return {
    valid: true,
    invitation: {
      ...data,
      email: normalizedEmail,
    },
  };
}

export async function getActiveInvitationForEmail(
  client: SupabaseClient<Database>,
  email?: string,
) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return { valid: false, reason: "invalid_email" as const };
  }

  const nowIso = new Date().toISOString();

  const { data, error } = await client
    .from("invitation")
    .select(
      "id,email,role,first_name,last_name,barangay,created_by_id,expiry_datetime,consumed_datetime,created_at"
    )
    .eq("email", normalizedEmail)
    .is("consumed_datetime", null)
    .gt("expiry_datetime", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { valid: false, reason: "db_error" as const, error };
  }

  if (!data) {
    return { valid: false, reason: "not_found" as const };
  }

  return {
    valid: true,
    invitation: {
      ...data,
      email: normalizedEmail,
    },
  } as const;
}
