import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/server/supabase/service-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const expoPushToken = body?.expoPushToken as string | undefined;
    const deviceId = body?.deviceId as string | undefined;
    const platform = body?.platform as string | undefined;
    const fallbackUserId = body?.userId as string | undefined;

    if (!expoPushToken) {
      return NextResponse.json(
        { success: false, error: "expoPushToken is required" },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const supabase = createServiceClient();
    let userId = fallbackUserId ?? null;

    if (token) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (!userError && user) {
        userId = user.id;
      } else if (!fallbackUserId) {
        return NextResponse.json(
          { success: false, error: "Invalid auth token" },
          { status: 401 },
        );
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("push_tokens")
      .upsert(
        {
          user_id: userId,
          expo_push_token: expoPushToken,
          device_id: deviceId ?? null,
          platform: platform ?? null,
          is_active: true,
          last_seen_at: now,
          updated_at: now,
        },
        { onConflict: "expo_push_token" },
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to register token",
      },
      { status: 500 },
    );
  }
}
