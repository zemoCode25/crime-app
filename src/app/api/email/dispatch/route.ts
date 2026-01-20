import { NextRequest, NextResponse } from "next/server";
import { dispatchEmergencyEmail } from "@/server/email/emergency";

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

    const result = await dispatchEmergencyEmail(emergencyId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Email dispatch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to dispatch email",
      },
      { status: 500 },
    );
  }
}
