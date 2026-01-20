import { NextResponse } from "next/server";
import { runDueEmailJobs } from "@/server/email/emergency";

export async function POST() {
  try {
    const results = await runDueEmailJobs();

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Email job runner error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run email jobs",
      },
      { status: 500 },
    );
  }
}
