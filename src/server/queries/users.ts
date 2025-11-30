import "server-only";

import { z } from "zod";

import { createServiceClient } from "@/server/supabase/service-client";
import type { Database } from "@/server/supabase/database.types";

type Role = Database["public"]["Enums"]["roles"];

export const listUsersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  barangay: z.number().int().nullable().optional(),
  role: z
    .enum(["main_admin", "system_admin", "barangay_admin"] as const)
    .nullable()
    .optional(),
  sortBy: z
    .enum(["first_name", "last_name", "role", "barangay", "created_at"] as const)
    .default("created_at"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ActiveUserRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: Role | null;
  barangay: number | null;
  contact_number: string | null;
  created_at: string | null;
  email: string;
  last_sign_in_at: string | null;
};

export type GetActiveUsersInput = z.infer<typeof listUsersSchema>;

function escapeIlike(value: string) {
  return value.replace(/[%_]/g, (match) => `\\${match}`);
}

export async function fetchActiveUsers(input: GetActiveUsersInput) {
  const { page, pageSize, search, barangay, role, sortBy, sortDir } = input;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const serviceClient = createServiceClient();
  let query = serviceClient
    .from("users")
    .select(
      "id, first_name, last_name, role, barangay, contact_number, created_at",
      {
        count: "exact",
      },
    );

  if (search?.trim()) {
    const sanitized = escapeIlike(search.trim());
    query = query.or(
      `first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%`,
    );
  }

  if (typeof barangay === "number") {
    query = query.eq("barangay", barangay);
  }

  if (role != null) {
    query = query.eq("role", role);
  }

  query = query.order(sortBy, {
    ascending: sortDir === "asc",
    nullsFirst: sortDir === "asc",
  });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error("Failed to fetch users");
  }

  const rows = (data ?? []) as Omit<ActiveUserRow, "email" | "last_sign_in_at">[];

  const metadataEntries = await Promise.all(
    rows.map(async (row) => {
      const { data: authData, error: authError } =
        await serviceClient.auth.admin.getUserById(row.id);
      if (authError || !authData?.user) {
        return [row.id, { email: "", last_sign_in_at: null }] as const;
      }
      return [
        row.id,
        {
          email: authData.user.email ?? "",
          last_sign_in_at: authData.user.last_sign_in_at ?? null,
        },
      ] as const;
    }),
  );

  const metadata = Object.fromEntries(metadataEntries);

  const enriched: ActiveUserRow[] = rows.map((row) => ({
    ...row,
    email: metadata[row.id]?.email ?? "",
    last_sign_in_at: metadata[row.id]?.last_sign_in_at ?? null,
  }));

  const total = count ?? enriched.length;

  return {
    rows: enriched,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  } as const;
}

// Lightweight helpers used by actions (reads only)
export async function getUserRole(userId: string) {
  const serviceClient = createServiceClient();
  const { data } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return (data?.role ?? null) as Role | null;
}

export type BasicUserProfile = {
  first_name: string | null;
  last_name: string | null;
  role: Role | null;
  barangay: number | null;
};

export async function getUserBasicProfile(
  userId: string,
): Promise<BasicUserProfile | null> {
  const serviceClient = createServiceClient();
  const { data } = await serviceClient
    .from("users")
    .select("first_name, last_name, role, barangay")
    .eq("id", userId)
    .single();
  if (!data) return null;
  return data as BasicUserProfile;
}

export type AuthUserMetadata = { email: string; last_sign_in_at: string | null };

export async function getAuthUserMetadata(
  userId: string,
): Promise<AuthUserMetadata | null> {
  const serviceClient = createServiceClient();
  const { data: authData, error } = await serviceClient.auth.admin.getUserById(
    userId,
  );
  if (error || !authData?.user) return null;
  return {
    email: authData.user.email ?? "",
    last_sign_in_at: authData.user.last_sign_in_at ?? null,
  };
}
