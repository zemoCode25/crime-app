import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const IMAGE_BUCKET = "emergency-notification-images";
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_EXPO_CHUNK = 100;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function buildImageUrl(imageKey: string | null) {
  const baseUrl = Deno.env.get("SUPABASE_URL");
  if (!imageKey || !baseUrl) {
    return null;
  }
  return `${baseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/${imageKey}`;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function isExpoToken(token: string) {
  return token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken[");
}

type ExpoTicket = {
  status?: string;
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const supabaseUrl =
    Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
  const serviceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SERVICE_ROLE_KEY");
  const expoProjectId = Deno.env.get("EXPO_PROJECT_ID") ?? null;

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      {
        success: false,
        error: "Missing Supabase URL or service role key.",
      },
      500,
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON payload." }, 400);
  }

  const record = (payload as { record?: Record<string, unknown> }).record ?? payload;
  const emergencyId = Number(record?.id);
  if (!emergencyId || Number.isNaN(emergencyId)) {
    return jsonResponse({ success: false, error: "Missing emergency id." }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: emergency, error: emergencyError } = await supabase
    .from("emergency")
    .select("id, subject, body, schedule, image_key")
    .eq("id", emergencyId)
    .single();

  if (emergencyError || !emergency) {
    return jsonResponse(
      { success: false, error: emergencyError?.message ?? "Emergency not found." },
      500,
    );
  }

  if (emergency.schedule) {
    const scheduledAt = new Date(emergency.schedule);
    if (!Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() > Date.now()) {
      const { data: job, error: jobError } = await supabase
        .from("push_jobs")
        .insert({
          emergency_id: emergency.id,
          scheduled_at: scheduledAt.toISOString(),
          status: "queued",
        })
        .select()
        .single();

      if (jobError) {
        return jsonResponse(
          { success: false, error: jobError.message },
          500,
        );
      }

      return jsonResponse({
        success: true,
        status: "queued",
        jobId: job.id,
      });
    }
  }

  const { data: job, error: jobError } = await supabase
    .from("push_jobs")
    .insert({
      emergency_id: emergency.id,
      status: "sending",
    })
    .select()
    .single();

  if (jobError || !job) {
    return jsonResponse(
      { success: false, error: jobError?.message ?? "Failed to create job." },
      500,
    );
  }

  const { data: tokensData, error: tokensError } = await supabase
    .from("push_tokens")
    .select("expo_push_token")
    .eq("is_active", true);

  if (tokensError) {
    await supabase
      .from("push_jobs")
      .update({ status: "failed", error: tokensError.message })
      .eq("id", job.id);
    return jsonResponse({ success: false, error: tokensError.message }, 500);
  }

  const allTokens = (tokensData ?? [])
    .map((row) => row.expo_push_token)
    .filter(Boolean);

  const validTokens = allTokens.filter(isExpoToken);
  const invalidTokens = allTokens.filter((token) => !isExpoToken(token));

  if (invalidTokens.length > 0) {
    await supabase
      .from("push_tokens")
      .update({ is_active: false })
      .in("expo_push_token", invalidTokens);
  }

  if (validTokens.length === 0) {
    await supabase
      .from("push_jobs")
      .update({
        status: "sent",
        error: "No active push tokens",
        sent_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return jsonResponse({
      success: true,
      status: "sent",
      jobId: job.id,
      sentCount: 0,
      failedCount: 0,
      error: "No active push tokens",
    });
  }

  const imageUrl = buildImageUrl(emergency.image_key);
  const payloadBase = {
    title: emergency.subject ?? "Emergency Alert",
    body: emergency.body ?? "",
    sound: "default",
    data: {
      emergencyId: emergency.id,
      type: "emergency",
    },
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(expoProjectId ? { projectId: expoProjectId } : {}),
  };

  const messages = validTokens.map((token) => ({ to: token, ...payloadBase }));
  const chunks = chunk(messages, MAX_EXPO_CHUNK);
  const tickets: ExpoTicket[] = [];

  for (const chunkMessages of chunks) {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(Deno.env.get("EXPO_ACCESS_TOKEN")
          ? { Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}` }
          : {}),
      },
      body: JSON.stringify(chunkMessages),
    });

    const json = await res.json();
    if (Array.isArray(json?.data)) {
      tickets.push(...json.data);
    }
  }

  if (tickets.length > 0) {
    const logs = tickets.map((ticket, index) => ({
      push_job_id: job.id,
      emergency_id: emergency.id,
      expo_push_token: validTokens[index],
      ticket_id: ticket.id ?? null,
      status: ticket.status ?? null,
      error: ticket.details?.error ?? ticket.message ?? null,
    }));

    await supabase.from("push_delivery_logs").insert(logs);

    const toDisable = logs
      .filter((log) => log.error === "DeviceNotRegistered")
      .map((log) => log.expo_push_token)
      .filter(Boolean) as string[];

    if (toDisable.length > 0) {
      await supabase
        .from("push_tokens")
        .update({ is_active: false })
        .in("expo_push_token", toDisable);
    }
  }

  const sentCount = tickets.filter((ticket) => ticket.status === "ok").length;
  const failedCount = tickets.filter((ticket) => ticket.status === "error").length;
  const status = sentCount > 0 ? "sent" : "failed";
  const error = status === "failed" ? "All pushes failed" : null;

  await supabase
    .from("push_jobs")
    .update({
      status,
      error,
      sent_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  return jsonResponse({
    success: true,
    status,
    jobId: job.id,
    sentCount,
    failedCount,
    error,
  });
});
