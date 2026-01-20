import { createServiceClient } from "@/server/supabase/service-client";
import { sendExpoPushNotifications } from "./expo";

const IMAGE_BUCKET = "emergency-notification-images";

function buildPublicImageUrl(imageKey: string | null) {
  if (!imageKey) {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/${imageKey}`;
}

export interface PushDispatchResult {
  jobId: number;
  status: "queued" | "sent" | "failed";
  sentCount: number;
  failedCount: number;
  error?: string | null;
}

async function createPushJob(
  emergencyId: number,
  status: "queued" | "sending",
  scheduledAt?: string | null,
) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("push_jobs")
    .insert({
      emergency_id: emergencyId,
      scheduled_at: scheduledAt ?? null,
      status,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function dispatchEmergencyPush(
  emergencyId: number,
): Promise<PushDispatchResult> {
  const supabase = createServiceClient();

  const { data: emergency, error: emergencyError } = await supabase
    .from("emergency")
    .select("id, subject, body, schedule, image_key")
    .eq("id", emergencyId)
    .single();

  if (emergencyError || !emergency) {
    throw emergencyError ?? new Error("Emergency notification not found");
  }

  const scheduledAt = emergency.schedule
    ? new Date(emergency.schedule)
    : null;

  if (scheduledAt && scheduledAt.getTime() > Date.now()) {
    const job = await createPushJob(
      emergency.id,
      "queued",
      scheduledAt.toISOString(),
    );
    return {
      jobId: job.id,
      status: "queued",
      sentCount: 0,
      failedCount: 0,
    };
  }

  return sendEmergencyPushNow(emergency.id);
}

export async function sendEmergencyPushNow(
  emergencyId: number,
  existingJobId?: number,
): Promise<PushDispatchResult> {
  const supabase = createServiceClient();

  const { data: emergency, error: emergencyError } = await supabase
    .from("emergency")
    .select("id, subject, body, schedule, image_key")
    .eq("id", emergencyId)
    .single();

  if (emergencyError || !emergency) {
    throw emergencyError ?? new Error("Emergency notification not found");
  }

  let jobId = existingJobId;
  if (!jobId) {
    const job = await createPushJob(emergency.id, "sending", null);
    jobId = job.id;
  } else {
    await supabase
      .from("push_jobs")
      .update({ status: "sending" })
      .eq("id", jobId);
  }

  const { data: tokensData, error: tokensError } = await supabase
    .from("push_tokens")
    .select("expo_push_token")
    .eq("is_active", true);

  if (tokensError) {
    await supabase
      .from("push_jobs")
      .update({
        status: "failed",
        error: tokensError.message,
      })
      .eq("id", jobId);

    throw tokensError;
  }

  const tokens = (tokensData ?? [])
    .map((row) => row.expo_push_token)
    .filter(Boolean);

  if (tokens.length === 0) {
    await supabase
      .from("push_jobs")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        error: "No active push tokens",
      })
      .eq("id", jobId);

    return {
      jobId,
      status: "sent",
      sentCount: 0,
      failedCount: 0,
      error: "No active push tokens",
    };
  }

  const imageUrl = buildPublicImageUrl(emergency.image_key);
  const payload = {
    title: emergency.subject ?? "Emergency Alert",
    body: emergency.body ?? "",
    data: {
      emergencyId: emergency.id,
      type: "emergency",
    },
    imageUrl,
  };

  const { tokens: validTokens, tickets, invalidTokens } =
    await sendExpoPushNotifications(tokens, payload);

  if (invalidTokens.length > 0) {
    await supabase
      .from("push_tokens")
      .update({ is_active: false })
      .in("expo_push_token", invalidTokens);
  }

  if (tickets.length > 0) {
    const logs = tickets.map((ticket, index) => ({
      push_job_id: jobId,
      emergency_id: emergency.id,
      expo_push_token: validTokens[index],
      ticket_id: "id" in ticket ? ticket.id ?? null : null,
      status: ticket.status ?? null,
      error: ticket.details?.error ?? null,
    }));

    await supabase.from("push_delivery_logs").insert(logs);
  }

  const sentCount = tickets.filter((ticket) => ticket.status === "ok").length;
  const failedCount = tickets.filter((ticket) => ticket.status === "error").length;
  const status = sentCount > 0 ? "sent" : "failed";
  const error = failedCount > 0 && sentCount === 0 ? "All pushes failed" : null;

  await supabase
    .from("push_jobs")
    .update({
      status,
      error,
      sent_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  return {
    jobId,
    status,
    sentCount,
    failedCount,
    error,
  };
}

export async function runDuePushJobs(limit = 25) {
  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: jobs, error } = await supabase
    .from("push_jobs")
    .select("id, emergency_id, scheduled_at")
    .eq("status", "queued")
    .lte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  const results: PushDispatchResult[] = [];

  for (const job of jobs ?? []) {
    const { data: claimed } = await supabase
      .from("push_jobs")
      .update({ status: "sending" })
      .eq("id", job.id)
      .eq("status", "queued")
      .select("id");

    if (!claimed || claimed.length === 0) {
      continue;
    }

    const result = await sendEmergencyPushNow(job.emergency_id, job.id);
    results.push(result);
  }

  return results;
}
