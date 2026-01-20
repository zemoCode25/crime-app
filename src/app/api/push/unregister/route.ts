import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/server/supabase/service-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const expoPushToken = body?.expoPushToken as string | undefined;
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
      .update({
        is_active: false,
        updated_at: now,
      })
      .eq("user_id", userId)
      .eq("expo_push_token", expoPushToken);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push unregister error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to unregister token",
      },
      { status: 500 },
    );
  }
}
