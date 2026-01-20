import { NextRequest, NextResponse } from "next/server";
import { dispatchEmergencyPush } from "@/server/push/dispatcher";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emergencyId = Number(body?.emergencyId);

    if (!emergencyId || Number.isNaN(emergencyId)) {
      return NextResponse.json(
        { success: false, error: "Emergency ID is required" },
        { status: 400 },
      );
    }

    const result = await dispatchEmergencyPush(emergencyId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Push dispatch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to dispatch push",
      },
      { status: 500 },
    );
  }
}
