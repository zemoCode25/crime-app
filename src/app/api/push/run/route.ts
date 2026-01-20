import { NextResponse } from "next/server";
import { runDuePushJobs } from "@/server/push/dispatcher";

export async function POST() {
  try {
    const results = await runDuePushJobs();

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Push job runner error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run jobs",
      },
      { status: 500 },
    );
  }
}
