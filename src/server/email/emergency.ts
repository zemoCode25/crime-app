import { Resend } from "resend";
import { createServiceClient } from "@/server/supabase/service-client";
import { EmergencyNotificationEmail } from "@/components/utils/EmergencyNotificationEmail";

const IMAGE_BUCKET = "emergency-notification-images";
const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL ||
  "Munti Crime Map <no-reply@munti-crime-map.it.com>";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

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

async function listAllAuthEmails() {
  const supabase = createServiceClient();
  const emails = new Set<string>();
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const users = data?.users ?? [];
    for (const user of users) {
      if (user.email) {
        emails.add(user.email);
      }
    }

    if (users.length < perPage) {
      break;
    }

    page += 1;
  }

  return Array.from(emails);
}

function chunk<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

export interface EmailDispatchResult {
  jobId: number;
  status: "queued" | "sent" | "failed";
  sentCount: number;
  failedCount: number;
  error?: string | null;
}

async function createEmailJob(
  emergencyId: number,
  status: "queued" | "sending",
  scheduledAt?: string | null,
) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("email_jobs")
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

export async function dispatchEmergencyEmail(
  emergencyId: number,
): Promise<EmailDispatchResult> {
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
    const job = await createEmailJob(
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

  return sendEmergencyEmailNow(emergency.id);
}

export async function sendEmergencyEmailNow(
  emergencyId: number,
  existingJobId?: number,
): Promise<EmailDispatchResult> {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

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
    const job = await createEmailJob(emergency.id, "sending", null);
    jobId = job.id;
  } else {
    await supabase
      .from("email_jobs")
      .update({ status: "sending" })
      .eq("id", jobId);
  }

  const recipients = await listAllAuthEmails();

  if (recipients.length === 0) {
    await supabase
      .from("email_jobs")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        error: "No active email recipients",
      })
      .eq("id", jobId);

    return {
      jobId,
      status: "sent",
      sentCount: 0,
      failedCount: 0,
      error: "No active email recipients",
    };
  }

  const imageUrl = buildPublicImageUrl(emergency.image_key);
  const subject = emergency.subject ?? "Emergency Alert";
  const body = emergency.body ?? "";

  const batches = chunk(recipients, 50);
  let sentCount = 0;
  let failedCount = 0;
  let lastError: string | null = null;

  for (const batch of batches) {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: batch,
      subject,
      react: EmergencyNotificationEmail({
        subject,
        body,
        imageUrl,
      }),
    });

    if (error) {
      failedCount += batch.length;
      lastError = error.message || "Failed to send email batch";
    } else {
      sentCount += batch.length;
    }
  }

  const status = sentCount > 0 ? "sent" : "failed";

  await supabase
    .from("email_jobs")
    .update({
      status,
      sent_at: new Date().toISOString(),
      error: status === "failed" ? lastError : null,
    })
    .eq("id", jobId);

  return {
    jobId,
    status,
    sentCount,
    failedCount,
    error: status === "failed" ? lastError : null,
  };
}

export async function runDueEmailJobs(limit = 25) {
  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: jobs, error } = await supabase
    .from("email_jobs")
    .select("id, emergency_id, scheduled_at")
    .eq("status", "queued")
    .lte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  const results: EmailDispatchResult[] = [];

  for (const job of jobs ?? []) {
    const { data: claimed } = await supabase
      .from("email_jobs")
      .update({ status: "sending" })
      .eq("id", job.id)
      .eq("status", "queued")
      .select("id");

    if (!claimed || claimed.length === 0) {
      continue;
    }

    const result = await sendEmergencyEmailNow(job.emergency_id, job.id);
    results.push(result);
  }

  return results;
}
