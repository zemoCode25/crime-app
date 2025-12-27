import { TypedSupabaseClient } from "@/types/supabase-client";

export interface EmergencyRecord {
  id: number;
  subject: string | null;
  body: string | null;
  schedule: string | null;
  created_at: string;
  user_id: string | null;
  sender_name: string | null;
}

export interface EmergencyRecordsParams {
  searchQuery?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedEmergencyRecords {
  data: EmergencyRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get paginated emergency records with sender information.
 * Supports filtering by subject, sorting by created_at, and pagination.
 */
export async function getEmergencyRecords(
  client: TypedSupabaseClient,
  params: EmergencyRecordsParams = {},
): Promise<PaginatedEmergencyRecords> {
  const { searchQuery, sortOrder = "desc", page = 1, pageSize = 5 } = params;

  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build base query for counting
  let countQuery = client
    .from("emergency")
    .select("id", { count: "exact", head: true });

  // Apply search filter to count query
  if (searchQuery && searchQuery.trim() !== "") {
    countQuery = countQuery.ilike("subject", `%${searchQuery}%`);
  }

  // Get total count
  const { count, error: countError } = await countQuery;

  if (countError) {
    throw countError;
  }

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Fetch emergency records with user info (paginated)
  let query = client
    .from("emergency")
    .select(`
      id,
      subject,
      body,
      schedule,
      created_at,
      user_id,
      users:user_id (
        first_name,
        last_name
      )
    `)
    .order("created_at", { ascending: sortOrder === "asc" })
    .range(from, to);

  // Apply search filter on subject
  if (searchQuery && searchQuery.trim() !== "") {
    query = query.ilike("subject", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Transform data to include sender name
  const records = (data ?? []).map((record) => {
    const user = record.users as { first_name: string | null; last_name: string | null } | null;
    const senderName = user
      ? [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unknown"
      : "Unknown";

    return {
      id: record.id,
      subject: record.subject,
      body: record.body,
      schedule: record.schedule,
      created_at: record.created_at,
      user_id: record.user_id,
      sender_name: senderName,
    };
  });

  return {
    data: records,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
